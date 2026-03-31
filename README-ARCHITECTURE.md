# Frontend Architecture Notes

## Objetivo

Mantener una base limpia para el panel de preguntas en tiempo real y reducir duplicacion de logica.

## Estructura recomendada

- `src/config`: configuracion global de entorno.
- `src/services`: acceso a API y socket.
- `src/utils`: helpers puros y formateadores.
- `src/components`: componentes UI reutilizables.
- `src/pages`: composicion por ruta.

## Convenciones actuales

- Base API: `src/config/api.js` usando `VITE_API_BASE_URL` con fallback local.
- Cliente HTTP: `src/services/apiClient.js` centraliza parseo de errores y JSON.
- Endpoints por dominio:
  - `src/services/questionsApi.js`
  - `src/services/categoriesApi.js`
- Socket unico compartido: `src/services/socket.js`.
- Helpers de UI: `src/utils/formatters.js`.

## Componentes reutilizables admin

- `src/components/CreateQuestionModal.jsx`: creacion de pregunta.
- `src/components/ModeratorResponseModal.jsx`: alta/edicion/eliminacion de respuesta de moderador.
- `src/components/CategoryTabs.jsx`: filtros por tabs (fijos + categorias + sin clasificar).

## Reglas practicas para nuevos cambios

1. No usar `fetch` directo en paginas si ya existe servicio.
2. Si un bloque UI se repite en dos o mas paginas, moverlo a `src/components`.
3. Mantener handlers asincronos con mensajes de error consistentes en espanol.
4. Evitar `setState` sincronico en `useEffect`; preferir handlers de eventos o logica controlada.
5. Reusar formatter helpers antes de crear nuevas funciones utilitarias.

## Flujo de validacion

1. `npm run lint`
2. `npm run build`
3. Revisar rutas admin principales:
   - `/admin/dashboard`
   - `/admin/questions-answers`
   - `/admin/history`
