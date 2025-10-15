# AuthSvc — Servicio de Autenticación
**Fecha:** 2025-10-15

## Propósito
Autenticación y autorización mediante JWT (access y refresh), gestión de usuarios y validación de credenciales.

## Endpoints principales
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/auth/login` | Autentica al usuario y retorna JWT. |
| POST | `/api/v1/auth/refresh` | Renueva el access token usando refresh token. |
| POST | `/api/v1/auth/register` | Registra un usuario (opcional). |
| GET  | `/api/v1/auth/me` | Datos del usuario autenticado. |
| POST | `/api/v1/auth/logout` | Invalida el refresh token. |

### Request Body (JSON con comentarios)
**POST `/api/v1/auth/login`**
```jsonc
{
  "email": "usuario@dominio.com", // correo del usuario
  "password": "P@ssw0rd!"         // contraseña
}
```

**POST `/api/v1/auth/refresh`**
```jsonc
{
  "refreshToken": "eyJhbGciOi..." // token vigente
}
```

**POST `/api/v1/auth/register`**
```jsonc
{
  "name": "Nombre Apellido", // nombre
  "email": "nuevo@dominio.com", // correo único
  "password": "P@ssw0rd!",      // contraseña
  "role": "user"                // user|admin
}
```

### Respuestas (ejemplos)
```jsonc
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "expiresIn": 900,
  "tokenType": "Bearer",
  "user": {"id": 1, "name": "Nombre", "email": "usuario@dominio.com", "role": "user"}
}
```

## Configuración
- `JWT:Issuer`, `JWT:Audience`, `JWT:Key`
- `ConnectionStrings:Default`
- Política de contraseñas, bloqueo por intentos fallidos

## Seguridad
Hash de contraseñas (bcrypt/PBKDF2), validación de claims y expiración.
