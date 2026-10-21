# Gestor de Productos

## Autores

- Jhon Edwin Olivera Duarte
- Yaritxa Duarte Urueña
- Juan Andres Bejarano Garzón
- Ana Maria Tique Manrique
- Janner Torres Carvajal

Universidad de Ibagué, Programa de Ingeniería de Sistemas, Infraestructura y Seguridad Computacional, Proyecto 03.

API REST en Spring Boot (Java 25) para la gestión de productos, con autenticación y autorización mediante JWT, roles de usuario, documentación OpenAPI/Swagger, validaciones con Bean Validation y manejo global de errores.

Proyecto 03 — Infraestructura y Seguridad Computacional.

## Arquitectura (3 servicios)

```
                    ┌─────────────────────┐
                    │      Adminer        │
                    │   (puerto 8081)     │
                    └──────────┬───────────┘
                               │
┌──────────────┐    JDBC       │
│     api      │◄──────────────┤
│ (puerto 8080)│               │
│  Spring Boot │               ▼
│   + JWT      │        ┌─────────────┐
└──────┬───────┘        │     db      │
       │   JDBC         │   MySQL 8.4 │
       └───────────────►│             │
                         └─────────────┘

   Red interna: gestor-net
   Volúmenes:  mysql-data (datos de MySQL)
               api-logs   (logs de la API)
```

- **db**: MySQL 8.4, almacena los datos de la aplicación.
- **api**: API Spring Boot con seguridad JWT, expone la documentación Swagger/OpenAPI.
- **adminer**: cliente web para administrar la base de datos MySQL.

## Requisitos

- [Docker](https://www.docker.com/) y Docker Compose (incluido en Docker Desktop).
- Git.

## Cómo levantar el proyecto

1. Clona el repositorio y entra a la carpeta del proyecto.
2. Copia el archivo de variables de entorno de ejemplo:

   ```bash
   cp .env.example .env
   ```

3. Edita `.env` y completa tus valores (usuario de Docker Hub, contraseña de base de datos y un `JWT_SECRET` de más de 32 caracteres).
4. Levanta los servicios:

   ```bash
   docker compose up --build
   ```

5. Espera a que la base de datos esté saludable (`healthy`) y a que la API inicie.

### Variables de entorno (`.env`)

| Variable        | Descripción                                               |
|-----------------|-------------------------------------------------------------|
| `DOCKERHUB_USER`| Usuario de Docker Hub, usado para etiquetar la imagen de la API. |
| `DB_PASSWORD`   | Contraseña del usuario root de MySQL.                      |
| `JWT_SECRET`    | Clave secreta para firmar los tokens JWT (mínimo 32 caracteres). |

> El archivo `.env` nunca debe subirse al repositorio (ya está excluido en `.gitignore`).

## Puertos

| Servicio | Puerto host | Descripción              |
|----------|-------------|---------------------------|
| api      | `8080`      | API REST + Swagger UI      |
| adminer  | `8081`      | Administración de la BD    |

- Documentación interactiva (Swagger UI): http://localhost:8080/swagger-ui.html
- Adminer: http://localhost:8081 (servidor: `db`, usuario: `root`, contraseña: la definida en `DB_PASSWORD`)

## Volúmenes

| Volumen      | Uso                                      |
|--------------|-------------------------------------------|
| `mysql-data` | Persistencia de los datos de MySQL        |
| `api-logs`   | Logs generados por la aplicación (`/app/logs`) |

## Red

Todos los servicios se comunican a través de la red bridge `gestor-net`, definida en `docker-compose.yml`.

## Despliegue con imagen de Docker Hub

Para levantar el proyecto usando la imagen ya publicada en Docker Hub (en lugar de compilarla localmente), usa el archivo `docker-compose.entrega.yml`:

```bash
docker compose -f docker-compose.entrega.yml up
```

Enlace de la imagen en Docker Hub: https://hub.docker.com/r/jhonolivera/gestor-productos

```bash
docker pull jhonolivera/gestor-productos:1.0
```

## Autoría

Jhon Olivera — jhon.olivera@estudiantesunibague.edu.co
