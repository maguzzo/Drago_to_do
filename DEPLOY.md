# 🐉 Dragon To Do List — Guía de Deployment

## Visión General

Este proyecto tiene **3 partes** para deployar:
1. **Backend**: Google Apps Script (servidor seguro)
2. **Frontend**: dragon-todo.html (app web)
3. **Hosting**: GitHub Pages o Netlify

---

## 📝 Parte 1: Google Apps Script (Backend)

### Paso 1.1: Crear proyecto en Google Apps Script

1. Abre: https://script.google.com/
2. Click en **"Nuevo proyecto"**
3. Dale un nombre: `Dragon To Do Backend`
4. Borra todo el código por defecto

### Paso 1.2: Copiar código del backend

1. Abre el archivo `dragon-server.gs` de tu proyecto local
2. Copia TODO el contenido
3. Pégalo en el editor de Google Apps Script
4. Click en **"Guardar"** (Ctrl+S)

### Paso 1.3: Configurar variables

En Google Apps Script, busca las líneas 8-10 y actualiza:

```javascript
const SECRET_KEY  = "REEMPLAZAR_CON_TU_CLAVE";   // ← Invéntate una clave segura
const SHEET_NAME  = "DragonToDo";                 // ← Dejar igual
const CALENDAR_ID = "tu-email@gmail.com";         // ← Tu Gmail (ej: martin@gmail.com)
```

**⚠️ IMPORTANTE**: La `SECRET_KEY` que uses aquí **DEBE SER LA MISMA** que luego configurarás en el frontend.

### Paso 1.4: Deployar como Web App

1. Click en el botón **"Deploy"** (arriba a la derecha, ícono triangular)
2. Click en **"New deployment"** (ícono + a la izquierda)
3. En **Type**, abre el dropdown y selecciona **"Web app"**
4. En **Execute as**, deja tu cuenta
5. En **Who has access**, selecciona **"Anyone"**
6. Click en **"Deploy"**
7. VS Code te pedirá autorización → **Autoriza**
8. Verás una **URL** como esta:
   ```
   https://script.google.com/macros/d/[ID-LARGUISIMO]/usercontent
   ```

**Copia y guarda esa URL** — la necesitarás en el paso siguiente.

---

## 🌐 Parte 2: Configurar Frontend

### Paso 2.1: Abrir la app

1. Abre `dragon-todo.html` en un navegador web
2. Si es local: `file:///C:/MAG/Dragon_to_do/dragon-todo.html`

### Paso 2.2: Configurar conexión con backend

1. Abre el **menú ☰** (esquina superior izquierda)
2. Click en **"🔗 Google Drive"**
3. Completa estos dos campos:
   - **Script URL**: Pega la URL que copiaste en Paso 1.4
   - **Secret Key**: La misma clave que pusiste en `SECRET_KEY` del Apps Script

4. Click en **"Guardar"**
5. Deberías ver: ✅ **"Guardado correctamente"**

**Prueba la conexión:**
- Crea una tarea/reunión
- Deberías ver un indicador de sincronización en la barra superior
- Los datos deben guardarse en Google Sheets (detrás del Apps Script)

---

## 🚀 Parte 3: Hostear en Línea

### Opción A: GitHub Pages (Recomendado - Gratis)

1. En GitHub, abre tu repositorio: https://github.com/maguzzo/Drago_to_do
2. Click en **Settings** (engranaje, arriba a la derecha)
3. En el menú izquierdo, click en **"Pages"**
4. En **Source**:
   - Branch: **main**
   - Folder: **/ (root)**
5. Click en **"Save"**
6. GitHub generará una URL como:
   ```
   https://maguzzo.github.io/Drago_to_do/dragon-todo.html
   ```
7. **¡Espera 2-3 minutos** mientras GitHub build el sitio
8. Tu app estará en línea 🎉

**Luego** deberás:
1. Abrir esa URL en un navegador
2. Configurar nuevamente la Script URL y Secret Key (igual que en Paso 2.2)
3. ¡Listo! Tu app estará disponible en línea

---

### Opción B: Netlify (Alternativa)

1. Abre https://app.netlify.com
2. Click en **"Add new site"** → **"Deploy manually"**
3. Arrastra tu carpeta `Dragon_to_do` completa al área punteada
4. Netlify automáticamente deployea
5. Te dará una URL como: `https://[random-name].netlify.app`
6. Abre esa URL y configura igual que Paso 2.2

---

## 🔐 Checklist de Seguridad

- [ ] `SECRET_KEY` es única y segura (ej: genera con password manager)
- [ ] `CALENDAR_ID` está actualizado con tu Gmail correcto
- [ ] El Deploy de Google Apps Script tiene **"Who has access: Anyone"**
- [ ] HTTPS está activo (GitHub Pages y Netlify incluyen HTTPS automáticamente)

---

## 🧪 Testing

Después de deployar:

1. **Crear una tarea**:
   - Abre la app
   - Click en el botón rojo "+" (FAB)
   - Crea una tarea con título y área
   - Deberías ver ✅ en la barra de sincronización

2. **Verificar Google Calendar**:
   - Abre tu Google Calendar (https://calendar.google.com)
   - Deberías ver la tarea creada como evento

3. **Verificar Google Sheets**:
   - Abre Google Sheets
   - Busca una hoja llamada "DragonToDo"
   - Allí están tus datos almacenados

4. **Probar desde otro dispositivo**:
   - Abre la URL pública en tu celular
   - Configura la Script URL y Secret Key
   - Los datos deben sincronizarse entre dispositivos

---

## 🐛 Troubleshooting

### "Petición incompleta" o "Firma inválida"
- Verifica que la `SECRET_KEY` en Google Apps Script sea **exactamente igual** a la que configuraste en el frontend

### "Script URL no configurado"
- Asegúrate de haber guardado los valores en Paso 2.2
- Recarga la página

### Los datos no aparecen en Google Calendar
- Verifica que el `CALENDAR_ID` sea tu Gmail correcto
- Comprueba que autorizaste los permisos cuando deployaste

### "404 - Página no encontrada" en GitHub Pages
- Espera 5 minutos después de cambiar los Settings
- Recarga con Ctrl+Shift+R (forzar caché)

---

## 📈 Próximas Mejoras

- [ ] Agregar CI/CD automático (GitHub Actions)
- [ ] Implementar Progressive Web App (PWA) para offline
- [ ] Agregar autenticación con Google Sign-In
- [ ] Encriptar datos en localStorage
- [ ] Agregar temas (dark mode)

---

**¿Dudas durante el deployment?** Revisa esta guía o consulta los comentarios en el código.

**¡Happy organizing! 🐉**
