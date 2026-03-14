# GMC Academy Backend

Backend NestJS para la plataforma e-learning de Autoescuela GMC.

## Stack

- NestJS 11
- PostgreSQL
- TypeORM
- JWT (access + refresh)
- Arquitectura hexagonal por modulo
- Generacion PDF con `pdfkit`
- Storage de certificados en Cloudinary

## Modulos

- `auth`
- `users`
- `materials`
- `exams`
- `attempts`
- `certificates`
- `admin`

## Variables de entorno

Usar `.env.example` como base.

Claves principales:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `DB_SSL`, `DB_SSL_REJECT_UNAUTHORIZED`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`
- `CERTIFICATE_PDF_URL_TTL_SECONDS` (opcional; duracion en segundos de la URL firmada del certificado)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- `BCRYPT_ROUNDS`

## Arranque local

1. Instalar dependencias:

```bash
pnpm install
```

2. Configurar `.env`.

3. Ejecutar migraciones:

```bash
pnpm migration:run
```

4. Cargar seed:

```bash
pnpm seed
```

5. Levantar API:

```bash
pnpm start:dev
```

Base URL:

- `http://localhost:3000/api/v1`

## Credenciales seed

- `admin@gmc.com`
- `student@gmc.com`
- password: valor de `SEED_DEFAULT_PASSWORD` (minimo 6 caracteres)

## Endpoints v1

Auth y perfil:

- `POST /auth/login`
- `POST /auth/login` y `POST /auth/refresh` devuelven `user.mustChangePassword` para indicar si el alumno debe actualizar su clave
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /me`
- `GET /me` devuelve `mustChangePassword`
- `PATCH /me/password` (student; body `{ currentPassword, newPassword }`, actualiza la clave, limpia `mustChangePassword` e invalida el refresh token actual)
- `GET /me/progress` (student; resumen de progreso)

Materials:

- `GET /materials`
- `GET /materials` devuelve toda la biblioteca para admin; para student devuelve solo materiales asignados y publicados, ordenados por `position` ascendente de la asignacion
- `GET /materials/categories`
- `GET /materials/categories/:id`
- `GET /materials` devuelve `links[]` con `id`, `sourceType`, `url`, `label`, `position`
- `PATCH /materials/:id/view` (student; `{ viewed: boolean }`, marca o desmarca el visto del material propio si esta asignado y publicado)
- `DELETE /materials/:id/view/:studentId` (admin; resetea el visto de un material para un alumno)
- `POST /materials` (admin; cada link requiere `sourceType`, `url`, `label`, `position?`)
- `PATCH /materials/:id` (admin; mismo contrato de links que create)
- `DELETE /materials/:id` (admin)
- `POST /materials/categories` (admin; body `{ key, name }`, con `key` unica en lowercase)
- `PATCH /materials/categories/:id` (admin; body parcial `{ key?, name? }`, mantiene unicidad de `key`)
- `DELETE /materials/categories/:id` (admin; falla con `400` si la categoria tiene materiales asociados)
- `PATCH /materials/:id/access/:studentId` (admin)

Exams:

- `GET /exams` (student: activos, admin: todos)
- `GET /exams/active`
- `GET /exams/active` mantiene el contrato student sin exponer `isCorrect`
- `GET /exams/:id` (admin)
- `POST /exams` (admin)
- `PATCH /exams/:id` (admin)
- `DELETE /exams/:id` (admin)
- `POST /exams/:id/submit` (student)
- Cada envio de examen guarda `answers_json` y un snapshot `review_json` para revisar intentos aunque el examen cambie despues

Attempts:

- `GET /attempts/me` (student)
- `GET /attempts/me/:id` (student; devuelve el detalle del intento con preguntas, opciones, respuesta elegida y respuesta correcta)

Certificates:

- `GET /certificates/me/latest` (student; devuelve `code`, `studentName`, `score`, `issuedAt`, `pdfUrl`, y opcionalmente `examTitle`; si existe PDF, `pdfUrl` es una URL firmada temporal)
- `POST /certificates/me/latest/generate-pdf` (student; requiere todos los materiales vistos y examen aprobado; genera un certificado GMC institucional en PDF y devuelve una URL firmada temporal)
- Si un alumno ya tiene certificado y vuelve a aprobar en un reintento, se reutiliza el certificado existente; no se emite uno nuevo

Admin:

- `GET /admin/exam` (admin; devuelve `id`, `title`, `description`, `passScore`, `updatedAt`, `updatedByName` y `questions[]` con `options[]` incluyendo `isCorrect`)
- `PATCH /admin/exam` (admin; body `{ title, description, passScore, questions }`, donde cada pregunta usa `id?`, `text`, `position` y `options[{ id?, label, isCorrect }]`; omisiones eliminan preguntas/opciones)
- `PATCH /admin/exam` valida `passScore` entre 1 y 100, al menos 2 opciones por pregunta y exactamente 1 correcta por pregunta
- `POST /admin/students` (admin; body `{ fullName, email, phone? }`; crea siempre rol `student`, normaliza email a lowercase, valida unicidad y devuelve `temporaryPassword` + `mustChangePassword`)
- `GET /admin/students`
- `GET /admin/students` acepta `page`, `pageSize`, `search`, `status` (`all|approved|pending`) y `attemptState` (`all|with-attempt|without-attempt`), y devuelve `{ items, meta }`
- `GET /admin/students/:id` (admin; devuelve contacto, `profilePhotoUrl`, `note`, progreso agregado y estadisticas de intentos del alumno)
- `PATCH /admin/students/:id/note` (admin; body `{ content }`, crea o actualiza la nota interna del alumno y devuelve `{ content, updatedAt, updatedByName }`)
- `GET /admin/students/:id/materials-progress` (admin; devuelve los materiales asignados ordenados por `position` con `viewed`, `viewedAt`, `linksCount` y categoria)
- `GET /admin/students/:id/attempts` (admin; lista `{ id, examId, examTitle, score, passed, createdAt }` ordenada del mas reciente al mas antiguo)
- `GET /admin/students/:id/attempts/:attemptId` (admin; devuelve el snapshot detallado del intento con preguntas, opciones, respuesta elegida y respuesta correcta)
- `GET /admin/students/:id/material-assignments` (admin; devuelve `[{ materialId, position }]`)
- `PATCH /admin/students/:id/material-assignments` (admin; reemplazo total, body `{ assignments: [{ materialId, position }] }`)
- `GET /admin/stats` (devuelve `totalStudents`, `approvedStudents`, `approvalRate`, `averageScore`)
- `GET /admin/performance` (devuelve agregados `overall`, `byExam`, `byStudent`)

## Documentacion API

Swagger UI disponible en:

- `http://localhost:3000/api/docs`

Incluye todos los endpoints con schemas de request/response y soporte para autenticacion Bearer JWT.

## Notas tecnicas

- Prefijo global: `/api`
- Versionado URI: `/v1`
- Validacion global con `ValidationPipe`
- Guards: `JwtAuthGuard` + `RolesGuard`
- Los alumnos creados por admin se persisten con rol `student`, contraseña temporal generada por backend y `must_change_password = true`; aparecen automaticamente en `GET /admin/students`
- Las asignaciones por alumno se guardan en `student_material_assignments`; el historial de visto se conserva en `student_material_access`
- Las notas internas del admin por alumno se guardan en `student_admin_notes` y `GET /admin/students/:id` devuelve `note` o `null` si todavia no existe
- La configuracion editable del examen activo vive en `GET/PATCH /admin/exam`; el backend guarda `updated_at` y `updated_by`, y aplica el diff de preguntas/opciones por `id` dentro de una transaccion
- `GET /me/progress` cuenta solo materiales asignados y publicados al alumno
- Migraciones:
  - `src/database/migrations/1768650000000-InitSchema.ts`
  - `src/database/migrations/1768651000000-ExpandAcademySchema.ts`
  - `src/database/migrations/1768652000000-AddMaterialViewedAt.ts`
  - `src/database/migrations/1768653000000-AddUserProfilePhoto.ts`
  - `src/database/migrations/1768654000000-AddMaterialLinkLabel.ts`
  - `src/database/migrations/1768655000000-AddExamAttemptReviewSnapshot.ts`
  - `src/database/migrations/1773459318355-AddStudentMaterialAssignments.ts`
  - `src/database/migrations/1773500000000-AddStudentAdminNotes.ts`
  - `src/database/migrations/1773600000000-TrackExamConfigUpdates.ts`
  - `src/database/migrations/1773700000000-AddMustChangePassword.ts`
