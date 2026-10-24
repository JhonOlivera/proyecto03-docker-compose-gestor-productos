# Frontend — Gestor de productos

Aplicación web para administrar un catálogo de productos. Está construida con
React y Vite, y se comunica con la API REST del proyecto para autenticar
usuarios y consultar y mantener el inventario.

## Requisitos

- Node.js 20.19+ o 22.12+.
- npm.
- La API del proyecto disponible en `http://localhost:8080` (o la URL que se
  configure para el frontend).

## Desarrollo local

Desde esta carpeta, instala las dependencias e inicia el servidor de desarrollo:

```bash
npm install
npm run dev
```

Vite mostrará en la terminal la dirección local; normalmente es
`http://localhost:5173`.

Para generar y previsualizar la versión de producción:

```bash
npm run build
npm run preview
```

Para ejecutar ESLint:

```bash
npm run lint
```

## Configuración

Vite lee estas variables al iniciar el servidor o durante la compilación. Para
desarrollo local, puedes definirlas en un archivo `.env.local` dentro de
`frontend/`:

| Variable | Valor predeterminado | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8080` | URL base de la API. |
| `VITE_PRODUCTS_ENDPOINT` | `/api/productos` | Ruta de la API para las operaciones de productos. |

Ejemplo:

```dotenv
VITE_API_URL=http://localhost:8080
VITE_PRODUCTS_ENDPOINT=/api/productos
```

Los cambios en las variables requieren reiniciar Vite. Al compilar para
producción, estas variables quedan incorporadas en los archivos estáticos; no
incluyas secretos en ellas.

## Funcionalidades

- Registro e inicio de sesión.
- Consulta y búsqueda de productos por nombre o descripción.
- Creación, edición y eliminación de productos.
- Resumen del inventario: unidades, valor total y productos con cinco o menos
  unidades.
- El token de sesión se conserva en `sessionStorage` y se envía a la API como
  token Bearer.

La aplicación espera que las respuestas de autenticación incluyan un campo
`token`. El listado de productos puede recibirse como un arreglo o dentro de las
propiedades `content`, `data` o `productos`.

## API utilizada

| Operación | Método y ruta |
| --- | --- |
| Iniciar sesión | `POST /api/auth/login` |
| Registrar usuario | `POST /api/auth/register` |
| Listar productos | `GET ${VITE_PRODUCTS_ENDPOINT}` |
| Crear producto | `POST ${VITE_PRODUCTS_ENDPOINT}` |
| Actualizar producto | `PUT ${VITE_PRODUCTS_ENDPOINT}/{id}` |
| Eliminar producto | `DELETE ${VITE_PRODUCTS_ENDPOINT}/{id}` |

El frontend envía los datos de autenticación como JSON con `email` y
`password`. Para crear o actualizar, envía un producto con `nombre`,
`descripcion`, `precio` y `stock`. La API debe permitir solicitudes CORS desde
el origen donde se sirve el frontend.

## Ejecutar frontend y backend con Docker Compose

En Windows, abre PowerShell en la raíz del repositorio. Asegúrate de haber
configurado allí el archivo `.env` del proyecto con `DB_PASSWORD`,
`JWT_SECRET` y `DOCKERHUB_USER` (consulta el README principal). Para traer los
cambios y reconstruir las imágenes desde cero:

```powershell
git pull
docker compose down
docker compose build --no-cache
docker compose up
```

`docker compose up` deja los servicios ejecutándose en esa terminal. Para
iniciarlos en segundo plano, usa `docker compose up -d`.

El frontend queda disponible en `http://localhost:5173` y la API en
`http://localhost:8080`. La configuración del frontend para Docker Compose se
define en el `docker-compose.yml` de la raíz mediante los argumentos de
construcción `VITE_API_URL` y `VITE_PRODUCTS_ENDPOINT`; después de modificarlos,
reconstruye la imagen del frontend.

### Archivo de entorno para desarrollo local

Si también vas a ejecutar Vite directamente en tu máquina, crea el archivo
`frontend/.env` desde el ejemplo usando PowerShell:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Este archivo es para el servidor local de Vite. No es necesario para la
ejecución con Docker Compose: `frontend/.dockerignore` excluye `.env` del
contexto de construcción y Compose proporciona la configuración de la imagen.

## Tecnologías

- React 19
- Vite 8
- Lucide React
