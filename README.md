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

### v1.0.3 - Optimización de Rendimiento, Interfaz y SEO (27 de Agosto de 2026)
- **División de Galería**: Se implementó un sistema de pestañas en `galeria.html` para separar Fotos y Videos. Esto reduce significativamente la carga inicial del DOM y mejora la experiencia de navegación del usuario.
- **Refinamiento de Schema Local**: Se actualizó el JSON-LD en `index.html` de `JewelryStore` a `LocalBusiness`, integrando palabras clave de SEO local (Talca, Curicó, Región del Maule) y enfatizando el concepto de "Joyería de autor".
- **Corrección de FOUT**: Se solucionó el "Flash of Unstyled Text" en los íconos de Material Symbols cambiando su estrategia de carga a `display=block`, evitando que la palabra "menu" se lea distorsionada en móviles durante el renderizado inicial.
- **Favicon de Autor**: Se aisló el isologo dorado del logotipo principal para generar un nuevo `favicon.png` e `.ico` optimizado.

### v1.0.2 - Actualización de Arquitectura y SEO Técnico (26 de Agosto de 2026)
- **Optimización On-Page y Metadatos**: Se personalizaron los metadatos (`<title>`, `<meta name="description">`) en todas las páginas para evitar contenido duplicado y atacar palabras clave específicas por servicio (argollas, talleres, catálogo). Se añadieron etiquetas `canonical`.
- **Estructura de Datos (Schema.org)**: Inyección de JSON-LD (`JewelryStore`) en la página principal para enriquecer los resultados de búsqueda de Google con información de ubicación (Talca, Maule), teléfono y redes sociales.
- **Consolidación de SEO Local y NAP**: Reestructuración del `footer` en todo el sitio para incluir un bloque dedicado de contacto y ubicación, y otro de redes sociales, asegurando la consistencia NAP (Name, Address, Phone) requerida por los motores de búsqueda.
- **Rendimiento de Imágenes**: Implementación de `loading="lazy"` en imágenes secundarias y revisión de atributos `alt` para mejorar la accesibilidad y Core Web Vitals.
- **Indexación y Rastreo**: Creación y configuración de archivos raíz `robots.txt` y `sitemap.xml` para acelerar la correcta indexación de todo el sitio.

### v1.0.1 - Actualización de Correcciones Menores (26 de Agosto de 2026)
- **Ajustes de UI en Catálogos**: Los contenedores de las fotografías de los anillos ahora adoptan una forma rectangular apaisada (más anchos que altos), optimizando y aumentando el espacio de visualización sin distorsionar las proporciones.
- **Formulario de Contacto**: Se refinaron las opciones "Talleres" y "Otras consultas", ocultando la fecha de matrimonio (por ser innecesaria) y ajustando la etiqueta a "Nombre del/los interesado/s" para mayor claridad.

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
