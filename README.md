# Dragon To Do List

Aplicacion web de productividad personal con tablero Kanban, gestion de reuniones, sincronizacion con Google Sheets y Google Calendar, y asistente IA embebido.

## Archivos principales

- `dragon-todo.html`: frontend completo de la aplicacion.
- `dragon-server.gs`: backend en Google Apps Script para sincronizacion y Calendar.

## Estructura

- `dragon-todo.html`
- `dragon-server.gs`
- `Dragon_ToDo_List_Documentacion_Tecnica.docx`
- `Dragon_ToDo_List_Documentacion_Tecnica_2.docx`
- `Dragon_ToDo_List_Anexos_Codigo.docx`

## Publicacion

1. Desplegar `dragon-server.gs` en Google Apps Script como Web App.
2. Configurar la URL del script y la clave HMAC en la app.
3. Publicar `dragon-todo.html` en un hosting estatico, por ejemplo Netlify o GitHub Pages.

## Estado actual

El proyecto fue reconstruido a partir de la documentacion tecnica y ajustado para corregir problemas reales en sincronizacion, archivado mensual y compatibilidad con Google Calendar.