# Cómo replicar Dragon To Do

Guía para que un Claude (Claude Code + Claude in Chrome) arme, junto a su usuario, un tablero personal como el de Martín Guzzo:
https://maguzzo.github.io/Drago_to_do/dragon-todo.html

**¿Es factible?** Sí. Son tres piezas simples (un HTML, un Apps Script y una hoja de Google) y no hay servidor propio ni costo de hosting. Claude escribe todo el código. **La persona** tiene que hacer los pasos de su cuenta de Google y de GitHub: crear la hoja, autorizar permisos, publicar el Web App y activar Pages. Una primera versión funcional (tablero + guardado en Sheets) sale en una sesión; Calendar, recurrencias y estadísticas, en una o dos más.

---

## 1. Qué hace

- Tablero Kanban con columnas **Urgente / En curso / Pendiente** y vistas de Completadas, Canceladas, Papelera e Historial.
- **Tareas** con fecha límite, nota, área y **etapas** (subtareas con avance, por ejemplo 2/5 = 40%).
- **Reuniones** con fecha, hora, lugar, participantes y agenda, en un panel de "Próximas reuniones".
- **Recurrencias** (semanal por día, mensual, etc.): al completar, se genera la próxima.
- **Vista HOY** y **captura rápida**.
- **Estadísticas** mensuales: cargadas, completadas y canceladas. Cierre de mes con archivo.
- **Sincronización con Google Calendar**: cada ítem con fecha crea su evento y guarda el `gcalEventId`.
- **Áreas** con color, emoji y categoría (trabajo, personal, etc.).
- Asistente IA opcional (API de Anthropic, con la key guardada solo en el navegador del usuario).

## 2. Arquitectura

```
Navegador (GitHub Pages)          Google Apps Script (Web App)        Google
index.html  ── POST firmado ──▶   doPost: load / save / calEvent  ──▶  Sheet (celda A1 = JSON)
localStorage (caché)              doGet: "Dragon Server activo v2"     Calendar
```

- **Frontend:** un solo archivo HTML con CSS y JS vanilla, sin build ni frameworks, publicado en GitHub Pages.
- **Datos:** todo el estado es **un JSON** `{v, date, cards, areas, history}` en la celda A1 de una hoja. La B1 guarda la fecha del último guardado. En el navegador hay una copia en `localStorage`.
- **Backend:** Apps Script publicado como **Web App**: "Ejecutar como: yo", "Acceso: cualquier usuario".
- **Seguridad:** como el Web App es público, cada pedido va firmado con **HMAC-SHA256** usando una clave compartida:
  - `load`: se firma `"load|" + ts`
  - `save`: se firma `"save|" + ts + "|" + checksum`, donde `checksum = HMAC(JSON.stringify(data))`
  - `calEvent`: se firma `"calEvent|" + ts` (sin checksum)
  - El servidor rechaza pedidos con `ts` de más de 60 s de diferencia y compara firmas en tiempo constante.

## 3. Modelo de datos

```js
// Tarea
{ id, type:"task", title, area, note, due:"YYYY-MM-DD",
  col:"urgent|active|pending|done|cancelled|trash|archived",
  subtasks:[{id, title, done, due}], recurrence:null|{type:"monthly"|...},
  alarm:1440, gcalEventId:null, createdAt, completedAt? }

// Reunión
{ id, type:"meeting", title, area, date:"YYYY-MM-DD", dateEnd:null, time:"HH:MM",
  place, participants, agenda,
  col:"upcoming|done|cancelled|trash|archived",
  recurrence, alarm, gcalEventId, createdAt, resultNote? }
```

- `id` = `Date.now()` + un número aleatorio.
- Zona horaria fija (por ejemplo `America/Argentina/San_Juan`) en el script y en el `appsscript.json`.
- Las **reuniones visibles** son las que tienen `col:"upcoming"`. Con `"pending"` no aparecen.
- **Cancelar** (causa externa, cuenta en estadísticas) y **borrar** (papelera 7 días, no cuenta) son cosas distintas.

## 4. Plan de construcción sugerido

1. **Hoja y script:** la persona crea una Google Sheet. Desde *Extensiones → Apps Script* se pega el servidor.
2. **Clave secreta en Script Properties**, nunca en el código: `PropertiesService.getScriptProperties().getProperty("SECRET_KEY")`. Se genera una clave larga al azar y se carga a mano en *Configuración del proyecto → Propiedades del script*.
3. **Servidor** con `doGet` (healthcheck), `doPost` (verificación HMAC + `load`/`save`/`calEvent`) y funciones de Calendar (`create`/`update`/`delete` por `gcalEventId`).
4. **Autorizar** ejecutando una vez a mano una función que use `CalendarApp` y `SpreadsheetApp` para aceptar los permisos.
5. **Publicar como Web App** y guardar el **ID del deployment**. Para actualizar, usar siempre `clasp push` + `clasp deploy --deploymentId <ese ID>`. Un deployment nuevo cambia la URL y la app deja de conectar.
6. **Frontend:** `index.html` con el tablero, los modales de tarea y reunión, la sincronización (guardado con *debounce* de ~1,5 s después de cada cambio) y un menú de configuración donde se pegan la URL del Web App y la clave. Todo eso queda en `localStorage`, nunca en el repo.
7. **GitHub Pages:** subir solo el HTML y activar Pages.
8. **Calendar:** al guardar una tarea o reunión con fecha, crear o actualizar su evento. Al completarla o borrarla, borrar el evento. Agregar un botón "Sincronizar todo" para reparar.

## 4b. Si arrancás desde el código de Martín

El repo es público: https://github.com/maguzzo/Drago_to_do (`dragon-todo.html` + `dragon-server.gs` + `appsscript.json`). Conviene copiarlo a un **repo nuevo propio** (no un fork que siga vinculado) y cambiar esto antes de nada:

- `dragon-todo.html` → `KNOWN_GOOD_DRIVE_URLS`: tiene la URL del Web App de Martín. Reemplazarla por la tuya o dejar la lista vacía.
- `dragon-todo.html` → las **áreas** por defecto son las de Martín. Cambiarlas por las propias.
- `dragon-server.gs` → `CALENDAR_ID` y `autorizarCalendar()`: tienen el Gmail de Martín. Poner el tuyo.
- `.clasp.json` → `scriptId` de **tu** proyecto de Apps Script. Si no, clasp intenta subir al de Martín y falla por permisos.
- La `SECRET_KEY` ya se lee de **Script Properties**: generá una propia y cargala ahí y en la app. Nunca la escribas en el código.
- `appsscript.json` ya trae la sección `webapp` (`ANYONE_ANONYMOUS` / `USER_DEPLOYING`). Sin ella, `clasp deploy` deja el Web App sin servir (`/exec` responde "No se pudo abrir el archivo"). En clasp 3, si cambia el manifest, el push necesita `--force`.
- No subas `.docx`, backups ni configs exportadas.

## 5. Reglas que conviene respetar (aprendidas a los golpes)

- **No poner secretos en el repo.** Ni la clave HMAC, ni API keys, ni URLs de deployment. Desde el día 1, sumar `.gitignore` para backups, configs exportadas y carpetas de datos.
- **`.claspignore`** para que clasp no suba el HTML ni los `.md` al proyecto de Apps Script. Si se suben, falla con `document is not defined`.
- **Antes de publicar el HTML**, extraer el `<script>` y correr `node --check`. Un salto de línea literal dentro de un string rompió toda la UI una vez.
- **"Importar backup" reemplaza todo.** Para sumar ítems desde afuera, agregarlos a lo que hay. Nunca importar un backup viejo.
- **El último que guarda gana.** Una pestaña vieja puede pisar lo guardado. Hay que recargar antes de editar. Mejora recomendada: guardar un número de versión en la hoja y rechazar un `save` que venga con una versión anterior.
- **Si se agregan tarjetas por fuera de la UI** (por ejemplo con JS desde Claude in Chrome), hay que crear también sus eventos de Calendar. Si no, no aparecen en el calendario.
- Para completar una tarea por fuera de la UI, llamar a la misma función que el botón ✓. Así se respetan Calendar y la recurrencia.

## 6. Flujo "Inbox" con Claude (opcional, pero es lo más útil)

1. Claude lee las fuentes acordadas: Gmail (conector), WhatsApp Web **solo lectura** sobre una **lista blanca de chats**, y el webmail.
2. Extrae solo lo accionable: tareas de la persona, reuniones con fecha y hora, y plazos. Resuelve fechas relativas con la fecha real y marca **PREGUNTAR** lo ambiguo.
3. Arma una tabla de propuestas (origen, resumen, ítem, área, fecha, confianza) y la persona la revisa.
4. Con el OK, abre la app, **comprueba que lo cargado coincida con lo que hay en la hoja**, agrega solo las tarjetas nuevas, crea sus eventos de Calendar y verifica releyendo la hoja.

Para WhatsApp Web: leer texto (no capturas), un batch por chat, sacar las URLs antes de devolver el texto y nunca presionar Enter fuera del buscador.

## 7. Idea para un curso con alumnos (por ejemplo Fibra Óptica)

- Un área "Curso FO" con una tarjeta mensual recurrente por cuota y etapas: *factura enviada → comprobante recibido → guardado en Drive → planilla marcada*.
- Reuniones para clases, exámenes y recuperatorios, con recordatorio automático en Calendar.
- El flujo Inbox puede proponer esas tarjetas a partir de los chats de alumnos.
