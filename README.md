# Torrealba Joyas - Plataforma Web Oficial

Plataforma web *premium* de alta joyería, orfebrería y argollas de matrimonio para la marca **Torrealba Joyas**.

## Estructura de Producción (Archivos de Carga)

Los siguientes archivos conforman el núcleo de la aplicación web que debe ser desplegada en el servidor de producción (GitHub Pages, Vercel, Hostinger, etc.):

```
/
├── index.html               # Landing page principal
├── catalogo.html            # Catálogo de argollas de matrimonio
├── orfebreria.html          # Información sobre servicios de orfebrería y talleres
├── galeria.html             # Galería interactiva (Mosaico)
├── quien-soy.html           # Biografía e historia del orfebre
├── contacto.html            # Información de contacto y ubicación
├── README.md                # Documentación técnica
├── LICENSE                  # Licencia y derechos de propiedad
├── /js
│   ├── main.js              # Interacciones, Lightbox, True Lazy Loading y UX
│   └── gallery_data.js      # Base de datos JSON con el inventario de la galería
├── /assets                  # Multimedia optimizada (imágenes webp/jpg y videos mp4)
│   └── /gallery             # Fotos y videos renderizados en la galería dinámica
```
*(Nota: Las carpetas de archivos crudos como `VIDEOS` o `SAMI fotos...` son solo para almacenamiento local del desarrollador y no son necesarias para la carga de la página web).*

## Historial de Cambios y Mejoras (Changelog)

El sitio ha pasado por una rigurosa arquitectura y optimización de rendimiento:

- **Rediseño Premium de Landing Page**: Implementación de tarjetas estilo *bento box* con fondos de video responsivos para redirigir a las distintas páginas, mejorando la inmersión del usuario.
- **True Lazy Loading y Rendimiento Móvil**: Se construyó un sistema nativo mediante `IntersectionObserver` que detiene la carga simultánea de multimedia. Los videos y fotos solo consumen red en el momento exacto en que entran al campo visual, erradicando cuellos de botella en redes móviles.
- **Compresión de Archivos**: Los archivos de video y fotografía en `/assets` han sido sometidos a compresión agresiva sin pérdida perceptible, reduciendo el peso global del repositorio en más de un 80% para lograr cargas instantáneas.
- **SEO & Open Graph**: Inyección de metadatos `<meta>` en todas las páginas, para garantizar un aspecto elegante y estructurado al compartir enlaces en redes sociales (WhatsApp, Instagram).
- **Consolidación de Contacto**: Botones flotantes y enlaces integrados con la API de WhatsApp apuntando unificadamente al número oficial (+56950082045).
- **Mosaico Algorítmico**: La Galería interactiva auto-ajusta las fotografías mediante reglas de CSS Grid para generar un muro visual dinámico.

## Tecnologías Utilizadas

- **Core**: HTML5 semántico.
- **Diseño**: Tailwind CSS (integrado vía CDN con configuración extendida). Tipografías de Google Fonts (*Bodoni Moda* y *Inter*).
- **Interactividad**: Vanilla JavaScript Moderno (ES6+), haciendo uso intensivo de la API `IntersectionObserver` para animaciones y rendimiento de red, además del manejo del DOM.
- **Iconografía**: Google Material Symbols.

## Propiedad Intelectual y Licencia

- **Código y Arquitectura**: Desarrollado y estructurado por Samuel Valenzuela Díaz.
- **Identidad Visual**: El logotipo, tipografías asociadas, fotografías, videos, y la marca "Torrealba Joyas" pertenecen en su totalidad a Jean Torrealba (y su entidad comercial).
- **Uso**: Derechos estrictamente reservados. Prohibida la replicación del diseño o uso comercial no autorizado de esta base de código por parte de terceros. Consultar el archivo `LICENSE` para los términos detallados.
