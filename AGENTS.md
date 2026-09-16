# Reglas Permanentes (SmartClose TC)

- Inspecciona el proyecto y Git antes de modificar archivos.
- No ejecutar comandos destructivos (DROP, DELETE masivo) sin autorización.
- No borrar código, datos o migraciones sin autorización.
- No avanzar a fases que no han sido solicitadas.
- No usar datos reales en pruebas.
- Nunca almacenar SSN, datos bancarios, credenciales o información innecesaria de clientes.
- Todo dato de negocio debe pertenecer a una organización (Tenant isolation).
- No colocar claves administrativas de Supabase (service_role) en el navegador.
- No crear páginas interminables; dividir la interfaz por módulos o tabs.
- No duplicar componentes o funciones (DRY).
- No asumir términos legales del contrato.
- El sistema puede sugerir fechas, pero el usuario debe confirmarlas.
- Una extensión o cambio de fecha nunca debe borrar la fecha original (mantener log de auditoría).
- Los correos no se enviarán automáticamente; solo se generarán borradores.
- Crear un commit después de cada fase estable.
- Ejecutar TypeScript (`tsc`), lint (`eslint`), build (`next build`) y pruebas después de cada fase.
- Verificar la interfaz visualmente a 360, 390, 768 y 1280 px.
- No considerar una fase terminada si existen errores de consola.
- La zona horaria obligatoria para fechas es `America/New_York`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
