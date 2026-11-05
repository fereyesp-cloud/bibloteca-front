# Biblioteca Front

Aplicación web en Angular para la gestión de libros de una biblioteca. Consume el microservicio librerias (Spring Boot + Oracle Cloud) desarrollado en la Actividad Formativa 1, mediante sus endpoints CRUD.

Asignatura: Desarrollo FullStack III – DUOC UC Actividad: Formativa 2 – Aplicando un patrón de diseño a nuestro desarrollo Autor: Fernando Reyes Pereira

# Arquitectura
┌────────────────────┐   HTTP/JSON   ┌──────────────────────┐   JDBC + Wallet   ┌──────────────────┐
│  Angular (4200)    │ ────────────▶ │  Spring Boot (8080)  │ ────────────────▶ │  Oracle Cloud    │
│  biblioteca-front  │ ◀──────────── │  microservicio       │ ◀──────────────── │  Autonomous DB   │
└────────────────────┘               │  librerias           │                   └──────────────────┘
                                     └──────────────────────┘

El frontend no accede nunca a la base de datos: toda la información pasa por el microservicio.

Patrón de diseño: MVC con capa de servicio

La aplicación se organiza siguiendo el patrón Modelo – Vista – Controlador, con una capa de servicio que encapsula la comunicación con el backend. Cada capa tiene una única responsabilidad:

Capa	Archivo(s)	Responsabilidad
Modelo	models/libro.model.ts	Define la forma de un libro, con los mismos atributos que la entidad del microservicio.
Vista	components/*/*.html	Presenta la información al usuario (tabla, ficha y formulario).
Controlador	components/*/*.ts	Responde a las acciones del usuario y coordina la vista con el servicio.
Servicio	services/libro.service.ts	Único punto de comunicación con el microservicio. Ningún componente conoce la URL del backend.
Patrones complementarios
Singleton: LibroService se declara con providedIn: 'root', por lo que existe una sola instancia compartida por toda la aplicación.
Inyección de dependencias: los componentes obtienen el servicio con inject(LibroService), sin crearlo manualmente (equivalente a la inyección por constructor de Spring).
Configuración externa: la URL del microservicio está en src/environments/environment.ts, no escrita en el código. Si el backend cambia de dirección, solo se modifica ese archivo.
Arquetipo y estructura del proyecto

# El proyecto parte del arquetipo generado por el Angular CLI (ng new), organizado por capas:

src/
├── environments/
│   ├── environment.ts               → URL del microservicio
│   └── environment.development.ts
└── app/
    ├── models/
    │   └── libro.model.ts           → Modelo
    ├── services/
    │   └── libro.service.ts         → Servicio (HttpClient)
    ├── components/
    │   ├── libro-lista/             → Listado + eliminar
    │   ├── libro-detalle/           → Detalle de un libro
    │   └── libro-form/              → Crear y editar
    ├── app.routes.ts                → Rutas de la aplicación
    ├── app.config.ts                → Providers (Router, HttpClient)
    └── app.html                     → Layout principal (<router-outlet />)
Modelo
typescript
export interface Libro {
  id?: number;            // opcional: lo asigna la secuencia de Oracle al crear
  titulo: string;
  autor: string;
  anioPublicacion: number;
  genero: string;
}
# Funcionalidades y endpoints

Cada pantalla utiliza un método de LibroService, que a su vez llama a un endpoint del microservicio:

Operación	Pantalla (ruta Angular)	Método del servicio	Endpoint del microservicio
Listar todos	/libros	listar()	GET /api/libros
Ver por ID	/libros/:id	obtener(id)	GET /api/libros/{id}
Crear	/libros/nuevo	crear(libro)	POST /api/libros
Actualizar	/libros/editar/:id	actualizar(id, libro)	PUT /api/libros/{id}
Eliminar	Botón en /libros	eliminar(id)	DELETE /api/libros/{id}
Detalles de implementación
Formulario reutilizable: libro-form sirve para crear y editar. Si la ruta incluye un id, carga el libro y ejecuta un PUT; si no, ejecuta un POST.
Validaciones: el formulario usa Reactive Forms. Todos los campos son obligatorios y el año debe estar entre 0 y 2100. Los mensajes se muestran al tocar el campo o al intentar guardar.
Manejo de errores: si el microservicio no responde o un libro no existe (404), la aplicación muestra un mensaje en pantalla en lugar de fallar.
Confirmación al eliminar: se solicita confirmación antes de borrar un libro.
Requisitos
Node.js 22 o superior
npm 11 o superior
Angular CLI (npm install -g @angular/cli)
El microservicio librerias en ejecución en http://localhost:8080
Ejecución
1. Levantar el microservicio

# En la carpeta del proyecto librerias, definir la contraseña de la base de datos y ejecutar:

powershell
$env:DB_PASSWORD_LIBRERIAS='<contraseña>'
.\mvnw spring-boot:run

Verificar que responda en http://localhost:8080/api/libros.

2. Levantar el frontend
powershell
npm install
ng serve

Abrir http://localhost:4200 en el navegador.

# Configuración de la URL del backend

Si el microservicio se ejecuta en otra dirección, modificar src/environments/environment.ts y environment.development.ts:

typescript
export const environment = {
  apiUrl: 'http://localhost:8080/api/libros'
};

# Notas
El microservicio incluye @CrossOrigin(origins = "*") en su controlador para permitir las peticiones desde localhost:4200 (CORS).
Para esta actividad se agregó al microservicio el endpoint GET /api/libros (listar todos), que no existía en la Actividad Formativa 1.