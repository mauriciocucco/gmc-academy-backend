# GMC Academy Backend

Backend NestJS para la plataforma e-learning de Autoescuela GMC.

## Stack

- NestJS 11
- PostgreSQL
- TypeORM
- JWT (access + refresh)
- Arquitectura hexagonal por módulo

## Módulos MVP

- `auth`
- `users`
- `materials`
- `exams`
- `attempts`
- `certificates`
- `admin`

## Estructura (hexagonal)

Cada módulo sigue:

- `domain`: puertos/modelos
- `application`: casos de uso + DTOs
- `infrastructure`: adaptadores TypeORM/JWT/bcrypt
- `presentation`: controllers REST

## Variables de entorno

Usar `.env.example` como base.

Variables clave:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- `BCRYPT_ROUNDS`

## Arranque local

1. Instalar dependencias:

```bash
pnpm install
```

2. Crear base de datos PostgreSQL y configurar `.env`.

3. Correr migraciones:

```bash
pnpm migration:run
```

4. Cargar seed inicial:

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
- password: valor de `SEED_DEFAULT_PASSWORD` (default `ChangeMe123!`)

## Endpoints v1

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /me`
- `GET /materials`
- `POST /materials` (admin)
- `PATCH /materials/:id` (admin)
- `DELETE /materials/:id` (admin)
- `GET /exams/active`
- `POST /exams/:id/submit` (student)
- `GET /attempts/me` (student)
- `GET /certificates/me/latest` (student)
- `GET /admin/students` (admin)
- `GET /admin/stats` (admin)

## Notas

- Prefijo global: `/api`
- Versionado URI: `/v1`
- Validación global con `ValidationPipe`
- Guards: `JwtAuthGuard` + `RolesGuard`
- Migración inicial: `src/database/migrations/1768650000000-InitSchema.ts`
