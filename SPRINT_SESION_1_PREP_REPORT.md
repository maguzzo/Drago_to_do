# 🐉 Sprint Sesión 1 — Reporte de Preparación
**Fecha:** 21 de Junio 2026  
**Branch:** `feature/vista-hoy-captura-rapida`  
**Estado:** ✅ LISTO PARA CLAUDE

---

## 1. Estado del Repositorio

```
✅ Git branch creada: feature/vista-hoy-captura-rapida
✅ Cambios en staging (sin commit):
   - dragon-todo.html (modificado)
   - dragon-server.gs (modificado)
```

**Archivos no trackeados (no interferirán):**
- `Dragon_ToDo_Resumen_Tecnico_v2.1.docx`
- `_tmp_resumen.txt`
- `_tmp_script_check.js`
- `keys/`

---

## 2. Métricas del Archivo

```
Total de líneas: 2721
Tamaño: 146066 bytes
Funciones JS detectadas: 118
```

**Validación de versión v2.1:** ✅ CONFIRMADA

| Función | Ocurrencias | Estado |
|---------|------------|--------|
| `buildStSection` | 3 | ✅ OK |
| `bulkSyncCalendar` | 2 | ✅ OK |
| `checkMeetingOverlap` | 7 | ✅ OK |
| `expandedSts` | 14 | ✅ OK |
| **Total** | **26** | **✅ v2.1 CORRECTA** |

---

## 3. Sintaxis JS Validada

```
✅ JS OK
✅ Funciones detectadas: 118
✅ Sin errores de parsing
✅ Código compilable
```

---

## 4. Secciones Extraídas para Claude

### 4.1 Variables CSS (primeras 50 líneas de `<style>`)

```css
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F5F4F2;--bg2:#FFF;--bg3:#FAF9F7;--bg4:#F0EDE8;
  --border:#E4DFD8;--border2:#CFC8BF;
  --text:#1C1917;--muted:#78716C;--muted2:#A8A29E;
  --red:#B91C1C;--red2:#991B1B;--redl:#FEF2F2;
  --gold:#92400E;--goldl:#FEF3C7;
  --green:#166534;--greenl:#DCFCE7;
  --blue:#1D4ED8;--bluel:#DBEAFE;
  --purple:#6D28D9;--purplel:#EDE9FE;
  --shadow:0 1px 4px rgba(28,25,23,.08);--shadow2:0 4px 20px rgba(28,25,23,.14);
  --fh:'Syne',sans-serif;--fm:'IBM Plex Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--fh);min-height:100vh}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}

/* HEADER */
#header{background:#fff;border-bottom:2px solid var(--border);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;box-shadow:var(--shadow);gap:8px;flex-wrap:wrap}
#hlogo{display:flex;align-items:center;gap:9px}
#hdragon{font-size:26px;filter:drop-shadow(0 2px 4px rgba(185,28,28,.3))}
#hinfo h1{font-size:14px;font-weight:800;letter-spacing:-.02em}
#hinfo h1 span{color:var(--red)}
#hinfo .sub{color:var(--muted2);font-family:var(--fm);font-size:8.5px;margin-top:2px}
#hbtns{display:flex;gap:5px;flex-wrap:wrap;align-items:center}
.hbtn{border:1px solid var(--border);background:#fff;color:var(--muted);padding:5px 9px;border-radius:6px;font-family:var(--fm);font-size:9.5px;cursor:pointer;transition:all .15s;white-space:nowrap}
.hbtn:hover{border-color:var(--red);color:var(--red);background:var(--redl)}
.hbtn.on{background:var(--greenl);border-color:#86EFAC;color:var(--green)}
.hbtn.areas-btn{border-color:var(--red);color:var(--red);background:var(--redl);font-weight:700}
.hbtn.drive-btn{border-color:#0F9D58;color:#0F9D58;background:#F0FFF4}
.btn-add{background:var(--red);color:#fff;border:none;padding:7px 13px;border-radius:7px;font-family:var(--fh);font-size:11px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(185,28,28,.28);transition:all .15s}
.btn-add:hover{background:var(--red2);transform:translateY(-1px)}
.btn-meeting{background:var(--purple);color:#fff;border:none;padding:7px 13px;border-radius:7px;font-family:var(--fh);font-size:11px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(109,40,217,.28);transition:all .15s}
.btn-meeting:hover{background:#5B21B6;transform:translateY(-1px)}

/* SYNC BAR */
#sync-bar{width:100%;padding:4px 16px;font-family:var(--fm);font-size:10px;display:flex;align-items:center;gap:6px;background:#fff;border-bottom:1px solid var(--border);transition:all .3s}
#sync-bar.saving{background:#FFFBEB;border-color:#FDE68A}
#sync-bar.saved{background:#F0FFF4;border-color:#86EFAC}
#sync-bar.error{background:#FFF1F2;border-color:#FECDD3}
#sync-bar.offline,#sync-bar.hidden{background:var(--bg3)}
```

### 4.2 HTML de `<div id="tabs">`

```html
<!-- TABS -->
<div id="tabs">
  <div class="tab active" id="tab-ALL"      onclick="setTab('ALL')">🗂 TODO <span class="tc" id="tc-ALL"></span></div>
  <div class="tab" id="tab-UNSJ"     onclick="setTab('UNSJ')">🔬 UNSJ <span class="tc" id="tc-UNSJ"></span></div>
  <div class="tab" id="tab-Scouts"   onclick="setTab('Scouts')">🏕️ Scouts <span class="tc" id="tc-Scouts"></span></div>
  <div class="tab" id="tab-Personal" onclick="setTab('Personal')">🏠 Personal <span class="tc" id="tc-Personal"></span></div>
  <div class="tab" id="tab-Empresas" onclick="setTab('Empresas')">🏢 Empresas <span class="tc" id="tc-Empresas"></span></div>
</div>
```

### 4.3 HTML del botón FAB (`#fab`)

```html
<!-- BIAN FAB -->
<button id="fab" onclick="toggleChat()" title="Bian">🐉</button>
<div id="chat-panel">
  <div id="ch-head">
    <div id="ch-dragon">🐉</div>
    <div id="ch-name"><strong>Bian</strong><span>Guardián · Dragón del Tulum</span></div>
    <div class="ch-hbtns">
      <button class="ch-hbtn" onclick="askReport()">📊 Informe</button>
      <button id="ch-close" onclick="toggleChat()">✕</button>
    </div>
  </div>
  <div id="apirow">
    <p>🔑</p>
    <input type="password" id="apikey" placeholder="API key Anthropic (sk-ant-...)" autocomplete="off" autocorrect="off" autocapitalize="off">
    <button id="apisave" onclick="saveKey()">Guardar</button>
  </div>
  <div id="ch-msgs"><div class="cm sys">🐉 Saludos, Martín. Ingresá tu API key para activarme.</div></div>
  <div id="ch-inp-row">
    <input type="text" id="ch-inp" placeholder="Escribí a Bian..." autocomplete="off" autocorrect="off" autocapitalize="off" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat();}">
    <button id="mic-btn" onclick="toggleMic()" title="Micrófono">🎤</button>
    <button id="ch-send" onclick="sendChat()">🐉</button>
  </div>
</div>
```

### 4.4 HTML del `<div id="header">`

```html
<!-- HEADER -->
<div id="header">
  <div id="hlogo">
    <div id="hdragon">🐉</div>
    <div id="hinfo">
      <h1>DRAGON <span>TO DO LIST</span></h1>
      <div class="sub">Bian · Asistente · Martín</div>
    </div>
  </div>
  <div id="hbtns">
    <div id="menu-wrap">
      <button class="hbtn menu-btn" id="menu-btn" onclick="toggleMenu(event)">⚙️ Menú ▾</button>
      <div id="menu-dropdown">
        <button class="menu-item" id="drive-menu-item" onclick="openDriveModal();closeMenu()">🔗 Drive <span id="drive-status-dot"></span></button>
        <button class="menu-item" onclick="openAreasModal();closeMenu()">🗂️ Áreas</button>
        <button class="menu-item" id="notif-menu-item" onclick="toggleNotif();closeMenu()">🔔 Notificaciones</button>
        <div class="menu-divider"></div>
        <button class="menu-item" onclick="testCalConnection();closeMenu()">🧪 Probar conexión Calendar</button>
        <button class="menu-item" onclick="bulkSyncCalendar();closeMenu()">🔄 Sincronizar con Calendar</button>
        <button class="menu-item" id="cal-log-btn" onclick="showCalLog();closeMenu()" style="display:none;color:var(--red)">⚠️ Ver errores Calendar</button>
        <div class="menu-divider"></div>
        <button class="menu-item" onclick="exportData();closeMenu()">📤 Exportar datos</button>
        <button class="menu-item" onclick="document.getElementById('imp-inp').click();closeMenu()">📥 Importar datos</button>
        <button class="menu-item" onclick="exportICS();closeMenu()">📅 Exportar .ics</button>
        <div class="menu-divider"></div>
        <button class="menu-item" onclick="exportConfig();closeMenu()">💾 Guardar claves</button>
        <button class="menu-item" onclick="document.getElementById('cfg-inp').click();closeMenu()">🔓 Cargar claves</button>
        <input type="file" id="cfg-inp" accept=".json" style="display:none" onchange="importConfig(event)">
        <div class="menu-divider"></div>
        <button class="menu-item" onclick="openHelp();closeMenu()">📖 Manual de ayuda</button>
      </div>
    </div>
    <div id="cal-wrap">
      <button class="btn-calendar" onclick="window.open('https://calendar.google.com','_blank')">📆 Calendar</button>
    </div>
    <div id="cal-progress-bar" style="display:none"></div>
    <button class="btn-meeting" onclick="openMeetingModal()">+ REUNIÓN</button>
    <button class="btn-add" onclick="openAdd()">+ TAREA</button>
    <input type="file" id="imp-inp" accept=".json" style="display:none" onchange="importData(event)">
  </div>
</div>
```

### 4.5 Función `setTab(t)`

```javascript
function setTab(t){
  tab=t;
  document.querySelectorAll(".tab").forEach(el=>el.classList.remove("active"));
  document.getElementById("tab-"+t).classList.add("active");
  render();
}
```

### 4.6 Función `render()`

```javascript
function render(){
  if(tab==="stats"){renderStats();return;}
  renderMeetings();

  const vis=tab==="ALL"
    ?cards.filter(c=>!["done","cancelled","trash","archived"].includes(c.col)&&c.type!=="meeting")
    :cards.filter(c=>!["done","cancelled","trash","archived"].includes(c.col)&&c.type!=="meeting"&&getCat(c.area)===tab);

  ["urgent","active","pending"].forEach(col=>{
    const list=vis.filter(c=>c.col===col).sort((a,b)=>{
      const ad=a.due||a.date||null;
      const bd=b.due||b.date||null;
      if(!ad&&!bd)return 0;   // ambas sin fecha → orden de carga
      if(!ad)return 1;         // sin fecha → al fondo
      if(!bd)return -1;        // con fecha → arriba
      return new Date(ad)-new Date(bd); // más próxima primero
    });
    document.getElementById("cc-"+col).textContent=list.length;
    document.getElementById("cc-"+col+"-list").innerHTML=list.map(cardHtml).join("");
  });

  const board=document.getElementById("board");
  board.querySelectorAll(".empty-board").forEach(e=>e.remove());
  if(vis.length===0){
    const div=document.createElement("div");div.className="empty-board";
    div.innerHTML=`<div class="big">🐉</div><p>Sin tareas aquí.<br>Tocá <strong>+ TAREA</strong> para empezar.</p>`;
    board.appendChild(div);
  }

  const alive=cards.filter(c=>!["done","cancelled","trash","archived"].includes(c.col)&&c.type!=="meeting");
  document.getElementById("tc-ALL").textContent=alive.length;
  ["UNSJ","Scouts","Personal","Empresas"].forEach(k=>{
    const el=document.getElementById("tc-"+k);
    if(el)el.textContent=alive.filter(c=>getCat(c.area)===k).length;
  });

  updateHistBadges();
}
```

---

## 5. Ubicaciones Clave (líneas para referencia)

| Elemento | Línea Aprox. | Estado |
|----------|-------------|--------|
| Estilos CSS `:root` | 11–22 | ✅ |
| `#header` | 476–532 | ✅ |
| `#tabs` | 534–541 | ✅ |
| `#fab` y chat panel | 823–860 | ✅ |
| `function setTab()` | 1515–1522 | ✅ |
| `function render()` | 1590–1630 | ✅ |

---

## 6. Checklist para Claude

- [x] Rama creada y checkeada
- [x] Archivo v2.1 validado
- [x] Sintaxis JS OK
- [x] Variables CSS disponibles
- [x] Funciones key disponibles
- [x] Estructura HTML clara
- [x] Estado: **LISTO PARA TRABAJO**

---

## 7. Indicaciones para Claude

**Tarea:** Implementar Vista Hoy + Captura Rápida

### 7.1 Vista Hoy
- Agregar tab `"HOY"` en `#tabs` (después de `ALL`, antes de categorías)
- Lógica: mostrar solo tareas vencidas hoy + reuniones hoy + urgentes de hoy
- Ordenar por: hora de reunión → tareas sin hora → urgentes
- Reutilizar render() con un nuevo valor de `tab==="HOY"`

### 7.2 Captura Rápida
- Input flotante (anexo al FAB o reemplaza FAB temporalmente)
- Entrada natural: "martes reunión con X" → parsear y crear
- Solo obligatorio: título + área
- Botón directo: sin modal, sin formulario complejo

### 7.3 Restricciones
- No tocar backend (dragon-server.gs)
- No agregar estilos globales, reutilizar variables CSS
- Mantener localStorage.setItem(CK, ...) para persistencia
- Test en PC y móvil

---

**Generado por:** Martín's Prep Agent  
**Fecha:** 2026-06-21  
**Status:** ✅ Listo para pasar a Claude
