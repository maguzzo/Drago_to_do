// ═══════════════════════════════════════════════════════
//  🐉 DRAGON TO DO LIST — Google Apps Script v2
//  Servidor seguro HMAC-SHA256 + Google Calendar
// ═══════════════════════════════════════════════════════
//
//  CONFIGURACIÓN: solo cambiar estas dos líneas
//
const SECRET_KEY  = "REEMPLAZAR_CON_TU_CLAVE";   // ← misma clave que en la app
const SHEET_NAME  = "DragonToDo";                 // ← no cambiar
const CALENDAR_ID = "martinaleguzzo@gmail.com";   // ← tu Gmail
//
// ═══════════════════════════════════════════════════════
 
const TOLERANCE_MS = 60000; // 60 segundos
 
// ── PUNTO DE ENTRADA POST ────────────────────────────────
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
 
    if (!payload.ts || !payload.sig || !payload.action) {
      return respond({ error: "Petición incompleta" });
    }
 
    // Verificar timestamp
    if (Math.abs(Date.now() - Number(payload.ts)) > TOLERANCE_MS) {
      return respond({ error: "Petición expirada" });
    }
 
    // Construir mensaje HMAC
    // "save" incluye checksum de los datos; "load" y "calEvent" usan solo action|ts
    let msg = payload.action + "|" + payload.ts;
    if (payload.action === "save" && payload.checksum) {
      msg += "|" + payload.checksum;
    }
 
    // Verificar firma
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
 
    return respond({ error: "Acción desconocida" });
 
  } catch (err) {
    return respond({ error: err.toString() });
  }
}

// ── GET — verificar que el script está vivo ───────────────
function doGet(e) {
  return respond({ status: "🐉 Dragon Server activo v2", ts: new Date().toISOString() });
}

// ═══════════════════════════════════════════════════════
//  GOOGLE SHEETS
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
//  GOOGLE CALENDAR
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
      // If updateCalEvent created a new event (old one not found), return new ID
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
      // Evento multi-día (ej: viaje de jueves a sábado)
      const start = new Date(data.date + "T12:00:00");
      const end   = new Date(data.dateEnd + "T12:00:00");
      end.setDate(end.getDate() + 1); // Google Cal end date is exclusive
      event = cal.createAllDayEvent(title, start, end, { description: desc, location: loc });
    } else if (data.time) {
      // Reunión con horario específico — un solo día
      const start = new Date(data.date + "T" + data.time + ":00");
      const end   = new Date(start.getTime() + 60 * 60 * 1000); // 1 hora por defecto
      event = cal.createEvent(title, start, end, { description: desc, location: loc });
    } else {
      // Reunión todo el día — un solo día
      const date = new Date(data.date + "T12:00:00");
      event = cal.createAllDayEvent(title, date, { description: desc, location: loc });
    }
  } else if (data.type === "task" && data.due) {
    // Tarea deadline — evento todo el día
    const title = "🐉 ⚑ " + data.title + " [" + data.area + "]";
    const date  = new Date(data.due + "T12:00:00");
    event = cal.createAllDayEvent(title, date, {
      description: (data.note || "") + "\n\n— Dragon To Do List"
    });
  }
  // Add alarm/reminder if specified
  if (event && data.alarm && parseInt(data.alarm) > 0) {
    event.addPopupReminder(parseInt(data.alarm));
  }
  return event ? event.getId() : null;
}

function updateCalEvent(gcalEventId, data) {
  const event = CalendarApp.getEventById(gcalEventId);
  if (!event) {
    // Evento no encontrado (fue borrado manualmente o es un ID viejo)
    // Crear uno nuevo y devolver el nuevo ID para evitar duplicados
    Logger.log("updateCalEvent: evento no encontrado, creando nuevo para: " + data.title);
    return createCalEvent(data);
  }
  if (data.type === "meeting") {
    const newTitle = (data.completed ? "✅ " : "📅 ") + data.title + " [" + data.area + "]";
    event.setTitle(newTitle);
    event.setDescription(buildDescription(data));
    if (data.place) event.setLocation(data.place);
    // Update reminder
    event.removeAllReminders();
    if (data.alarm && parseInt(data.alarm) > 0) {
      event.addPopupReminder(parseInt(data.alarm));
    }
    // Actualizar fecha/hora si cambió
    if (data.date && data.dateEnd) {
      const start = new Date(data.date + "T12:00:00");
      const end   = new Date(data.dateEnd + "T12:00:00");
      end.setDate(end.getDate() + 1);
      if (typeof event.setAllDayDates === "function") {
        event.setAllDayDates(start, end);
      } else {
        event.deleteEvent();
        return createCalEvent(data);
      }
    } else if (data.date && data.time) {
      const start = new Date(data.date + "T" + data.time + ":00");
      const end   = new Date(start.getTime() + 60 * 60 * 1000);
      event.setTime(start, end);
    } else if (data.date) {
      const date = new Date(data.date + "T12:00:00");
      if (typeof event.setAllDayDate === "function") {
        event.setAllDayDate(date);
      } else {
        const end  = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        event.setTime(date, end);
      }
    }
  } else if (data.type === "task") {
    const newTitle = (data.completed ? "✅ 🐉 " : "🐉 ⚑ ") + data.title + " [" + data.area + "]";
    event.setTitle(newTitle);
    event.setDescription((data.note || "") + "\n\n— Dragon To Do List");
    if (data.due) {
      const date = new Date(data.due + "T12:00:00");
      const end  = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      event.setTime(date, end);
    }
    // Update reminder
    event.removeAllReminders();
    if (data.alarm && parseInt(data.alarm) > 0) {
      event.addPopupReminder(parseInt(data.alarm));
    }
  }
}

function deleteCalEvent(gcalEventId) {
  try {
    const event = CalendarApp.getEventById(gcalEventId);
    if (event) event.deleteEvent();
  } catch (err) {
    Logger.log("deleteCalEvent: " + err); // Silencioso — puede que ya no exista
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
//  SEGURIDAD
// ═══════════════════════════════════════════════════════
function hmac(message) {
  const raw = Utilities.computeHmacSha256Signature(message, SECRET_KEY, Utilities.Charset.UTF_8);
  return Utilities.base64Encode(raw);
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index++) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
