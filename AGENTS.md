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
```

## Documentación API

Swagger UI en `http://localhost:3000/api/docs` (requiere que el servidor esté corriendo).

## Lo que NO se debe hacer

- No importar entidades TypeORM (`*.typeorm-entity.ts`) desde capas de dominio o aplicación.
- No poner lógica de negocio en controllers; solo delegar al use-case correspondiente.
- No omitir `@ApiProperty` en DTOs nuevos.
- No crear migraciones manualmente; generarlas con TypeORM CLI si corresponde.
- No usar `any` salvo casos justificados.
