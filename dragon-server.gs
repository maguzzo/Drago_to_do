// ═══════════════════════════════════════════════════════
//  🐉 DRAGON TO DO LIST — Google Apps Script v2.1
//  Servidor seguro HMAC-SHA256 + Google Calendar + Sheets
// ═══════════════════════════════════════════════════════
//
//  CONFIGURACIÓN: solo cambiar estas líneas
//
const SECRET_KEY  = "b0575643-2a8e-4d78-99fc-414f4c7945f2";  // ← misma clave que en la app
const SHEET_NAME  = "DragonToDo";               // ← no cambiar
const CALENDAR_ID = "martinaleguzzo@gmail.com"; // ← tu Gmail
//
// ═══════════════════════════════════════════════════════

const TOLERANCE_MS = 60000; // 60 segundos de tolerancia en timestamp

// ── PUNTO DE ENTRADA POST ────────────────────────────────
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    if (!payload.ts || !payload.sig || !payload.action) {
      return respond({ error: "Petición incompleta" });
    }

    // Verificar timestamp (evita replay attacks)
    if (Math.abs(Date.now() - Number(payload.ts)) > TOLERANCE_MS) {
      return respond({ error: "Petición expirada" });
    }

    // Construir mensaje HMAC
    // "save" incluye checksum de los datos
    // "load" y "calEvent" usan solo action|ts (sin checksum)
    let msg = payload.action + "|" + payload.ts;
    if (payload.action === "save" && payload.checksum) {
      msg += "|" + payload.checksum;
    }

    // Verificar firma HMAC-SHA256
    if (!safeEqual(hmac(msg), payload.sig)) {
      return respond({ error: "Firma inválida" });
    }

    // ── ACCIONES ──────────────────────────────────────────
    if (payload.action === "load") {
      return respond({ ok: true, data: loadData() });
    }

    if (payload.action === "save") {
      saveData(payload.data);
      return respond({ ok: true, ts: new Date().toISOString() });
    }

    if (payload.action === "calEvent") {
      const data = payload.data || {};
      const result = handleCalEvent(data);
      return respond({ ok: true, ...result });
    }

    return respond({ error: "Acción desconocida: " + payload.action });

  } catch (err) {
    Logger.log("doPost error: " + err);
    return respond({ error: err.toString() });
  }
}

// ── GET — ping para verificar que el script está vivo ────
function doGet(e) {
  return respond({
    status: "🐉 Dragon Server activo v2",
    ts: new Date().toISOString()
  });
}

// ═══════════════════════════════════════════════════════
//  GOOGLE SHEETS — Almacenamiento de datos
// ═══════════════════════════════════════════════════════
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange("A1").setValue("{}");
    sheet.getRange("B1").setValue("sin datos aún");
  }
  return sheet;
}

function saveData(data) {
  const sheet = getSheet();
  sheet.getRange("A1").setValue(JSON.stringify(data));
  sheet.getRange("B1").setValue("Último guardado: " + new Date().toLocaleString("es-AR"));
}

function loadData() {
  const sheet = getSheet();
  const val = sheet.getRange("A1").getValue();
  if (!val || val === "" || val === "{}") return null;
  try   { return JSON.parse(val); }
  catch { return null; }
}

// ═══════════════════════════════════════════════════════
//  GOOGLE CALENDAR — Gestión de eventos
// ═══════════════════════════════════════════════════════
function handleCalEvent(data) {
  if (!data || !data.op) return { error: "op requerido" };
  try {
    if (data.op === "delete") {
      if (data.gcalEventId) deleteCalEvent(data.gcalEventId);
      return { deleted: true };
    }
    if (data.op === "update" && data.gcalEventId) {
      const newId = updateCalEvent(data.gcalEventId, data);
      // Si updateCalEvent recreó el evento (el original no existía), devuelve nuevo ID
      return { gcalEventId: newId || data.gcalEventId };
    }
    if (data.op === "create") {
      const eventId = createCalEvent(data);
      return eventId ? { gcalEventId: eventId } : { error: "No se pudo crear el evento" };
    }
    return { error: "op desconocido: " + data.op };
  } catch (err) {
    Logger.log("handleCalEvent error: " + err);
    return { error: err.toString() };
  }
}

function createCalEvent(data) {
  const cal = CalendarApp.getCalendarById(CALENDAR_ID) || CalendarApp.getDefaultCalendar();
  let event;

  if (data.type === "meeting" && data.date) {
    const title = "📅 " + data.title + " [" + data.area + "]";
    const desc  = buildDescription(data);
    const loc   = data.place || "";

    if (data.dateEnd) {
      // Evento multi-día (ej: viaje jueves → sábado)
      const start = new Date(data.date + "T12:00:00");
      const end   = new Date(data.dateEnd + "T12:00:00");
      end.setDate(end.getDate() + 1); // Google Cal: end date es exclusiva
      event = cal.createAllDayEvent(title, start, end, { description: desc, location: loc });

    } else if (data.time) {
      // Reunión con hora específica — evento timed de 1 hora
      const start = new Date(data.date + "T" + data.time + ":00");
      const end   = new Date(start.getTime() + 60 * 60 * 1000);
      event = cal.createEvent(title, start, end, { description: desc, location: loc });

    } else {
      // Reunión sin hora — evento all-day
      const date = new Date(data.date + "T12:00:00");
      event = cal.createAllDayEvent(title, date, { description: desc, location: loc });
    }

  } else if (data.type === "task" && data.due) {
    // Tarea con deadline — evento all-day
    const title = "🐉 ⚑ " + data.title + " [" + data.area + "]";
    const date  = new Date(data.due + "T12:00:00");
    event = cal.createAllDayEvent(title, date, {
      description: (data.note || "") + "\n\n— Dragon To Do List"
    });
  }

  // Agregar alarma popup si está configurada
  if (event && data.alarm && parseInt(data.alarm) > 0) {
    event.addPopupReminder(parseInt(data.alarm));
  }

  return event ? event.getId() : null;
}

function updateCalEvent(gcalEventId, data) {
  const event = CalendarApp.getEventById(gcalEventId);

  if (!event) {
    // Evento no encontrado — fue borrado manualmente o el ID es de otra versión
    // Crear uno nuevo para evitar duplicados futuros
    Logger.log("updateCalEvent: evento no encontrado, recreando: " + data.title);
    return createCalEvent(data);
  }

  if (data.type === "meeting") {
    const prefix = data.completed ? "✅ " : "📅 ";
    event.setTitle(prefix + data.title + " [" + data.area + "]");
    event.setDescription(buildDescription(data));
    if (data.place) event.setLocation(data.place);

    // Actualizar alarma
    event.removeAllReminders();
    if (data.alarm && parseInt(data.alarm) > 0) {
      event.addPopupReminder(parseInt(data.alarm));
    }

    // Actualizar fechas
    if (data.dateEnd) {
      // Multi-día
      const start = new Date(data.date + "T12:00:00");
      const end   = new Date(data.dateEnd + "T12:00:00");
      end.setDate(end.getDate() + 1);
      try {
        event.setAllDayDates(start, end);
      } catch (e) {
        // Fallback: si setAllDayDates no está disponible, recrear
        event.deleteEvent();
        return createCalEvent(data);
      }
    } else if (data.date && data.time) {
      // Timed
      const start = new Date(data.date + "T" + data.time + ":00");
      const end   = new Date(start.getTime() + 60 * 60 * 1000);
      event.setTime(start, end);
    } else if (data.date) {
      // All-day un día
      const date = new Date(data.date + "T12:00:00");
      try {
        event.setAllDayDate(date);
      } catch (e) {
        const end = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        event.setTime(date, end);
      }
    }

  } else if (data.type === "task") {
    const prefix = data.completed ? "✅ 🐉 " : "🐉 ⚑ ";
    event.setTitle(prefix + data.title + " [" + data.area + "]");
    event.setDescription((data.note || "") + "\n\n— Dragon To Do List");

    // Actualizar fecha del deadline (all-day)
    if (data.due) {
      const date = new Date(data.due + "T12:00:00");
      try {
        event.setAllDayDate(date); // FIX: mantener como all-day
      } catch (e) {
        // Fallback para compatibilidad
        const end = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        event.setTime(date, end);
      }
    }

    // Actualizar alarma
    event.removeAllReminders();
    if (data.alarm && parseInt(data.alarm) > 0) {
      event.addPopupReminder(parseInt(data.alarm));
    }
  }
  // Retorno implícito undefined → handleCalEvent usa data.gcalEventId como fallback
}

function deleteCalEvent(gcalEventId) {
  try {
    const event = CalendarApp.getEventById(gcalEventId);
    if (event) event.deleteEvent();
  } catch (err) {
    Logger.log("deleteCalEvent (ignorado): " + err);
    // Silencioso — el evento puede haber sido eliminado manualmente
  }
}

function buildDescription(data) {
  let desc = "";
  if (data.participants) desc += "👥 Participantes: " + data.participants + "\n";
  if (data.place)        desc += "📍 Lugar: " + data.place + "\n";
  if (data.agenda)       desc += "\n📋 Agenda:\n" + data.agenda + "\n";
  if (data.note)         desc += "\n📝 Notas: " + data.note + "\n";
  if (data.resultNote)   desc += "\n✅ Resultado: " + data.resultNote + "\n";
  desc += "\n— Dragon To Do List";
  return desc;
}

// ═══════════════════════════════════════════════════════
//  SEGURIDAD — HMAC-SHA256
// ═══════════════════════════════════════════════════════
function hmac(message) {
  const raw = Utilities.computeHmacSha256Signature(
    message,
    SECRET_KEY,
    Utilities.Charset.UTF_8
  );
  return Utilities.base64Encode(raw);
}

// Comparación en tiempo constante (evita timing attacks)
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
