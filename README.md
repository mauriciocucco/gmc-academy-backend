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
- password: valor de `SEED_DEFAULT_PASSWORD` (mínimo 6 caracteres)

## Endpoints v1

Auth y perfil:

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /me`
- `GET /me/progress` (student — resumen de progreso)

Materials:

- `GET /materials`
- `GET /materials/categories`
- `PATCH /materials/:id/view` (student — `{ viewed: boolean }`, marca o desmarca el visto del material propio)
- `DELETE /materials/:id/view/:studentId` (admin — resetea el visto de un material para un alumno)
- `POST /materials` (admin)
- `PATCH /materials/:id` (admin)
- `DELETE /materials/:id` (admin)
- `POST /materials/categories` (admin)
- `PATCH /materials/:id/access/:studentId` (admin)

Exams:

- `GET /exams` (student: activos, admin: todos)
- `GET /exams/active`
- `GET /exams/:id` (admin)
- `POST /exams` (admin)
- `PATCH /exams/:id` (admin)
- `DELETE /exams/:id` (admin)
- `POST /exams/:id/submit` (student)

Attempts:

- `GET /attempts/me` (student)

Certificates:

- `GET /certificates/me/latest` (student)
- `POST /certificates/me/latest/generate-pdf` (student — requiere todos los materiales vistos y examen aprobado)

Admin:

- `GET /admin/students`
- `GET /admin/stats`
- `GET /admin/performance`

## Documentacion API

Swagger UI disponible en:

- `http://localhost:3000/api/docs`

Incluye todos los endpoints con schemas de request/response y soporte para autenticacion Bearer JWT.

## Notas tecnicas

- Prefijo global: `/api`
- Versionado URI: `/v1`
- Validacion global con `ValidationPipe`
- Guards: `JwtAuthGuard` + `RolesGuard`
- Migraciones:
  - `src/database/migrations/1768650000000-InitSchema.ts`
  - `src/database/migrations/1768651000000-ExpandAcademySchema.ts`
  - `src/database/migrations/1768652000000-AddMaterialViewedAt.ts`
