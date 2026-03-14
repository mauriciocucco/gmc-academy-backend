# AGENTS.md — GMC Academy Backend

Instrucciones para agentes de IA (OpenAI Codex, etc.) que trabajen en este repositorio.

## Descripción del proyecto

Backend NestJS para la plataforma e-learning de Autoescuela GMC. Expone una API REST versionada (`/api/v1`) para autenticación, materiales de estudio, exámenes, intentos y certificados.

## Stack

- **Framework:** NestJS 11 (TypeScript)
- **ORM:** TypeORM con PostgreSQL
- **Auth:** JWT (access + refresh tokens)
- **Storage:** Cloudinary (PDFs de certificados)
- **Generación PDF:** pdfkit
- **Package manager:** pnpm

## Arquitectura

Hexagonal por módulo. Cada módulo en `src/modules/<nombre>/` sigue esta estructura:

```
<modulo>/
  application/
    dto/          # DTOs de entrada/salida con class-validator y @ApiProperty
    use-cases/    # Un use-case por archivo, lógica de negocio
  domain/
    ports/        # Interfaces de repositorios (abstracciones)
    *.ts          # Entidades de dominio si aplica
  infrastructure/
    persistence/  # Implementaciones TypeORM de los repositorios
    ...           # Otras implementaciones (pdf, storage, security)
  presentation/
    http/         # Controllers NestJS
  <nombre>.module.ts
```

La capa de dominio no debe importar nada de NestJS ni TypeORM (solo salvo `@Injectable`, `@Inject`).

## Módulos

| Módulo       | Ruta base              | Roles           |
| ------------ | ---------------------- | --------------- |
| auth         | `/api/v1/auth`         | público         |
| users        | `/api/v1/me`           | autenticado     |
| materials    | `/api/v1/materials`    | admin / student |
| exams        | `/api/v1/exams`        | admin / student |
| attempts     | `/api/v1/attempts`     | student         |
| certificates | `/api/v1/certificates` | student         |
| admin        | `/api/v1/admin`        | admin           |

## Convenciones de código

- **DTOs:** usar `class-validator` para validación y `@ApiProperty` / `@ApiPropertyOptional` de `@nestjs/swagger` en todos los campos.
- **Use-cases:** clase con un solo método `execute(...)`. Inyectar dependencias por símbolo (`@Inject(TOKEN)`).
- **Repositorios:** definir interfaz en `domain/ports/` con un símbolo exportado (`export const TOKEN = Symbol('TOKEN')`). Implementar en `infrastructure/persistence/`.
- **Guards:** `JwtAuthGuard` para autenticación, `RolesGuard` + `@Roles(UserRole.X)` para autorización.
- **Enums:** `UserRole` (`admin` | `student`), `MaterialLinkSource` (`drive` | `youtube` | `other`).
- **Respuestas:** no lanzar excepciones de dominio genéricas; usar `NotFoundException`, `BadRequestException`, etc. de `@nestjs/common`.
- **Nombres de archivo:** `*.use-case.ts`, `*.controller.ts`, `*.module.ts`, `*.dto.ts`, `*.typeorm-entity.ts`, `*.port.ts`.
- **Tests:** AAA (Arrange-Act-Assert), un archivo `*.spec.ts` por use-case.

## Comandos importantes

```bash
# Instalar dependencias
pnpm install

# Desarrollo con watch
pnpm start:dev

# Build
pnpm build

# Migraciones
pnpm migration:run
pnpm migration:revert

# Seed inicial
pnpm seed

# Atajo: migrar + seed
pnpm db:setup

# Tests
pnpm test
pnpm test:cov
pnpm test:e2e
```

## Variables de entorno

Ver `.env.example`. Clave mínima para correr localmente:

```
DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN
BCRYPT_ROUNDS
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
CERTIFICATE_PDF_URL_TTL_SECONDS (opcional; default 900)
```

## Documentación API

Swagger UI en `http://localhost:3000/api/docs` (requiere que el servidor esté corriendo).

## Seguimiento de progreso del estudiante

El sistema rastrea el avance del estudiante a través de tres señales:

1. **Asignaciones + materiales vistos** — `student_material_assignments` guarda `student_id`, `material_id`, `position`, `created_at`, `updated_at`; define que ve cada alumno y en que orden. `GET /api/v1/admin/students/:id/material-assignments` devuelve `[{ materialId, position }]`; `PATCH /api/v1/admin/students/:id/material-assignments` reemplaza la asignacion total del alumno. `GET /api/v1/materials` devuelve biblioteca completa para admin, y para student solo materiales asignados y `published`, ordenados por `position ASC`. `PATCH /api/v1/materials/:id/view` (student, body `{ viewed: boolean }`) registra `viewed_at` en `student_material_access` solo si el material esta asignado y publicado; `viewed: true` conserva la primera apertura con `COALESCE`, `viewed: false` la resetea. Si se bloquea un material, no se borra el historial de visto. Para resetear el visto de un alumno: `DELETE /api/v1/materials/:id/view/:studentId` (admin).
2. **Examen aprobado** — columna `passed` en `exam_attempts`.
3. **Certificado emitido** — existencia de registro en `certificates` para el estudiante.

4. **Vista admin del alumno** â€” `POST /api/v1/admin/students` crea usuarios siempre con rol `student`, email normalizado a lowercase, password temporal generado por backend y `mustChangePassword = true`, y el nuevo alumno queda visible en `GET /api/v1/admin/students`; `GET /api/v1/admin/students` soporta paginacion real (`page`, `pageSize`) y filtros `search`, `status`, `attemptState`, devolviendo `{ items, meta }`; `GET /api/v1/admin/students/:id` agrega contacto, `profilePhotoUrl`, `note`, progreso y metricas de intentos; `PATCH /api/v1/admin/students/:id/note` crea o actualiza la nota interna del alumno en `student_admin_notes`; `GET /api/v1/admin/students/:id/materials-progress` lista los materiales asignados en orden con `viewed`, `viewedAt`, `linksCount` y categoria; `GET /api/v1/admin/students/:id/attempts` lista intentos; `GET /api/v1/admin/students/:id/attempts/:attemptId` expone el snapshot historico de revision para admin, igual que el alumno.

`GET /api/v1/me/progress` (student) devuelve:

```json
{
  "materialsTotal": 5,
  "materialsViewed": 3,
  "examPassed": false,
  "certificateIssued": false
}
```

`materialsTotal` y `materialsViewed` cuentan solo materiales asignados y `published` del alumno. `POST /api/v1/certificates/me/latest/generate-pdf` lanza `403 ForbiddenException` si `materialsViewed < materialsTotal` o `examPassed === false`.

**Puerto:** `ProgressRepositoryPort` en `src/modules/users/domain/ports/progress-repository.port.ts`. Implementación: `TypeOrmProgressRepository`. Usado tanto en `UsersModule` como en `CertificatesModule` (instancia independiente por módulo).

## Mantenimiento de documentación

Ante cualquier cambio en el código, actualizar la documentación afectada **en el mismo commit**:

- **AGENTS.md** — si cambia arquitectura, convenciones, endpoints relevantes o comportamiento de negocio.
- **README.md** — si cambia la lista de endpoints, comandos, variables de entorno o instrucciones de arranque.
- **Swagger** — siempre: añadir/actualizar `@ApiProperty`, `@ApiOperation` y `@ApiResponse` en DTOs y controllers afectados.

Este archivo (`AGENTS.md`) tiene un **límite de 200 líneas**. Si una sección crece, resumirla o extraerla a `docs/`.

## Lo que NO se debe hacer

- No importar entidades TypeORM (`*.typeorm-entity.ts`) desde capas de dominio o aplicación.
- No poner lógica de negocio en controllers; solo delegar al use-case correspondiente.
- No omitir `@ApiProperty` en DTOs nuevos.
- No crear migraciones manualmente; generarlas con TypeORM CLI si corresponde.
- No usar `any` salvo casos justificados.
- No sobreescribir `viewed_at` si ya tiene valor; usar `COALESCE` para preservar la primera apertura.

## Contratos visibles

- `GET /api/v1/materials` devuelve `links[]` con `id`, `sourceType`, `url`, `label`, `position`. `POST/PATCH /api/v1/materials` requieren `label` persistido por link. Para student, la lista sale ordenada por la asignacion `position` del alumno.
- `POST /api/v1/admin/students` recibe `{ fullName, email, phone? }`, crea siempre rol `student`, valida email unico, normaliza email a lowercase y responde `{ id, fullName, email, phone, temporaryPassword, mustChangePassword }`; `temporaryPassword` solo se expone en la creacion.
- `GET /api/v1/admin/students` devuelve `{ items, meta }`; `search` matchea `fullName`/`email`, `status` usa `approved` del ultimo intento y `attemptState` usa existencia real de intento.
- `GET /api/v1/admin/students/:id` devuelve `id`, `fullName`, `email`, `phone`, `profilePhotoUrl`, `approved`, `lastAttemptScore`, `note`, `progress` y `stats`; `note` devuelve `{ content, updatedAt, updatedByName }` o `null`; `approved` refleja el ultimo intento y `progress.examPassed` refleja si el alumno aprobo al menos un examen.
- `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh` y `GET /api/v1/me` incluyen `mustChangePassword` dentro del usuario autenticado. `PATCH /api/v1/me/password` recibe `{ currentPassword, newPassword }`, limpia `mustChangePassword` y borra el `refresh_token_hash` previo.
- `GET /api/v1/admin/students/:id/attempts` devuelve `[{ id, examId, examTitle, score, passed, createdAt }]`; `GET /api/v1/admin/students/:id/attempts/:attemptId` devuelve el detalle historico del intento con `correctAnswers`, `totalQuestions` y `questions[]`.
- `GET /api/v1/admin/students/:id/material-assignments` devuelve `[{ materialId: string, position: number }]`; `PATCH /api/v1/admin/students/:id/material-assignments` hace reemplazo total y preserva historial previo de `viewed_at`.
- `PATCH /api/v1/admin/students/:id/note` recibe `{ content: string }` y devuelve la nota persistida con `updatedAt` y `updatedByName`.
- `GET /api/v1/admin/students/:id/materials-progress` devuelve `[{ materialId, title, description, category, position, viewed, viewedAt, linksCount }]` para los materiales asignados del alumno, ordenados por `position`.
- `GET /api/v1/admin/exam` devuelve el examen activo editable con `id`, `title`, `description`, `passScore`, `updatedAt`, `updatedByName` y `questions[{ id, text, position, options[{ id, label, isCorrect }] }]`; `PATCH /api/v1/admin/exam` recibe el mismo shape sin `updated*`, trata `id` presente como update, crea lo que no tiene `id`, elimina lo omitido dentro de una transaccion y valida `passScore` entre 1 y 100, minimo 2 opciones y exactamente 1 correcta por pregunta.
- `GET /api/v1/certificates/me/latest` devuelve `code`, `studentName`, `score`, `issuedAt`, `pdfUrl` y puede incluir `examTitle`. Si existe PDF, `pdfUrl` es una URL firmada temporal generada por backend.
- `POST /api/v1/certificates/me/latest/generate-pdf` genera un certificado PDF institucional GMC en A4 apaisado, con codigo de validacion, calificacion y datos del examen.
- Si un alumno ya posee certificado y vuelve a aprobar un reintento, el backend reutiliza el certificado existente y no crea uno nuevo.
- `GET /api/v1/admin/stats` devuelve `totalStudents`, `approvedStudents`, `approvalRate`, `averageScore`, con `approvalRate = approvedStudents / totalStudents * 100`.
- `GET /api/v1/admin/performance` mantiene el contrato agregado `overall`, `byExam`, `byStudent`; no mover esos calculos al frontend.
- `POST /api/v1/exams/:id/submit` guarda el envio del alumno en `answers_json` y un snapshot de revision en `review_json`. `GET /api/v1/attempts/me/:id` devuelve ese snapshot para revisar cualquier intento, incluso si luego hay reintentos o cambios en el examen.
- `GET /api/v1/exams/active` sigue siendo solo para student y nunca expone `isCorrect`; el snapshot historico de intentos se conserva en `review_json` aunque el admin edite la configuracion del examen activo.
