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
               db-backups (copias de seguridad de la BD)
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
| `db-backups` | Copias de seguridad de la base de datos (`/backups`) |

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

## Repositorio en GitHub

https://github.com/JhonOlivera/proyecto03-docker-compose-gestor-productos

## Autoría

Jhon Olivera — jhon.olivera@estudiantesunibague.edu.co
Yaritxa Duarte Urueña- yaritxa.duarte@estudiantesunibague.edu.co
Ana Maria Tique Manrique- ana.tique1@estudiantesunibague..edu.co
Juan Andres Bejarano Garzón- juan.bejarano1@estudiantesunibague.edu.co
Janner Stiven Torres Carvajal-janner.torres@estudiantesunibague.edu.co

## Guía de despliegue paso a paso (para probar el proyecto)

Esta guía explica cómo clonar, levantar y probar el proyecto desde cero en Windows usando PowerShell.

### 1. Requisitos

- Docker Desktop instalado y en ejecución (en Windows, con WSL2 activo).
- Git instalado.

### 2. Clonar el repositorio

```powershell
git clone https://github.com/JhonOlivera/proyecto03-docker-compose-gestor-productos.git
cd proyecto03-docker-compose-gestor-productos
```

### 3. Crear el archivo de variables de entorno

```powershell
Copy-Item .env.example .env
```

Edita el archivo `.env` y completa:

- `DB_PASSWORD`: cualquier contraseña.
- `JWT_SECRET`: una cadena de al menos 32 caracteres.
- `DOCKERHUB_USER`: debe quedar como `jhonolivera`.

> El archivo `.env` contiene información sensible y **no se sube a GitHub** (está excluido en `.gitignore`).

### 4. Levantar los servicios

Hay dos opciones:

- **Opción A (rápida)** — descarga la imagen ya publicada en Docker Hub:

  ```powershell
  docker compose -f docker-compose.entrega.yml up -d
  ```

- **Opción B (construye la imagen localmente)** — tarda más porque compila el proyecto:

  ```powershell
  docker compose up -d --build
  ```

### 5. Verificar que todo esté arriba

```powershell
docker compose ps
```

Debe mostrar `db` en estado `healthy`, y `api` y `adminer` en estado `Up`.

### 6. Probar la API con Swagger

Abre http://localhost:8080/swagger-ui/index.html

Desde `auth-controller`, registra un usuario y luego inicia sesión (login) con ese mismo usuario.

### 7. Entrar a Adminer

Abre http://localhost:8081 e inicia sesión con:

- Sistema: `MySQL`
- Servidor: `db`
- Usuario: `root`
- Contraseña: la definida en `DB_PASSWORD` en el `.env`
- Base de datos: `tienda2`

### 8. Dar rol ADMIN al usuario

En Adminer, abre la tabla `usuario` y edita el campo `rol` del usuario que registraste, cambiándolo a `ADMIN`.

Vuelve a Swagger y vuelve a hacer login con ese usuario para obtener un token actualizado. Copia el token.

### 9. Autorizar y probar endpoints protegidos

En Swagger, haz clic en el botón **Authorize** y pega el token copiado.

Con el usuario ya como ADMIN, crea una categoría, una marca y un producto (`POST /api/productos` requiere rol ADMIN) y luego consulta los productos con `GET /api/productos`.

### 10. Probar la persistencia de los volúmenes

```powershell
docker compose down
docker compose up -d
```

Verifica en Swagger (`GET /api/productos`) que el producto creado sigue existiendo.

> `docker compose down -v` sí borra los datos, porque elimina los volúmenes.

### 11. Probar el volumen de respaldos

```powershell
docker compose exec db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" tienda2 > /backups/tienda2.sql'
docker compose exec db ls -l /backups
```

### 12. Apagar el proyecto

```powershell
docker compose down
```

### 13. Problemas comunes

- **Puerto 8080 u 8081 ocupado**: cambia el puerto de la izquierda en la sección `ports` del archivo `docker-compose.yml` (por ejemplo, `"8090:8080"`).
- **Docker Desktop apagado**: ábrelo y espera a que esté completamente iniciado antes de ejecutar `docker compose`.
- **Adminer no conecta**: verifica que la contraseña usada en Adminer sea exactamente la misma que `DB_PASSWORD` en el `.env`.

