# GMC Academy Backend Design (Hexagonal)

Fecha: 2026-02-17

## Objetivo de la iteración

Implementar un backend NestJS para el MVP e-learning con PostgreSQL + TypeORM, cubriendo autenticación por roles (`admin`, `student`), materiales, examen, intentos, certificados y panel admin.

## Enfoque de arquitectura

Se aplicó arquitectura hexagonal por módulo:

- `domain`: contratos (puertos) y modelos de negocio.
- `application`: casos de uso y DTOs de entrada/salida.
- `infrastructure`: adaptadores concretos (TypeORM, JWT, bcrypt, queries).
- `presentation`: controllers HTTP.

Cada caso de uso depende de puertos (`Symbol` tokens) y no de implementaciones concretas.

## Modelo de datos

Tablas MVP:

- `users`
- `materials`
- `exams`
- `exam_questions`
- `exam_attempts`
- `certificates`

Se agregaron índices de FK y de lectura frecuente (materiales publicados, examen activo, intentos por alumno y fecha, certificado por alumno).

## API v1 incluida

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/me`
- `GET /api/v1/materials`
- `POST /api/v1/materials` (admin)
- `PATCH /api/v1/materials/:id` (admin)
- `DELETE /api/v1/materials/:id` (admin)
- `GET /api/v1/exams/active`
- `POST /api/v1/exams/:id/submit` (student)
- `GET /api/v1/attempts/me` (student)
- `GET /api/v1/certificates/me/latest` (student)
- `GET /api/v1/admin/students` (admin)
- `GET /api/v1/admin/stats` (admin)

## Seguridad base

- JWT access + refresh
- refresh token hasheado en DB
- guardas `JwtAuthGuard` y `RolesGuard`
- validación global (`ValidationPipe`, whitelist/transform/forbid unknown)
- throttling global

## Operación

- Migración inicial en `src/database/migrations/1768650000000-InitSchema.ts`
- Seed en `src/database/seeds/seed.ts`
