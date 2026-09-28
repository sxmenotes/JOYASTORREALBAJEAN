# Torrealba Joyas - Plataforma Web Oficial

Plataforma web *premium* de alta joyería, orfebrería y argollas de matrimonio para la marca **Torrealba Joyas**.

## Estructura del Proyecto (v1.1.0)

El proyecto utiliza una arquitectura moderna basada en **Vite** y **Tailwind CSS compilado** para lograr máximo rendimiento y puntuación perfecta en Core Web Vitals:

```
/
├── index.html                   # Landing page principal (fuente Vite)
├── catalogo.html                # Catálogo de argollas y anillos (fuente Vite)
├── orfebreria.html              # Información sobre talleres y academia
├── galeria.html                 # Galería interactiva (Fotos y Videos)
├── quien-soy.html               # Biografía e historia del orfebre
├── contacto.html                # Formulario dinámico de cotizaciones y visitas
├── vite.config.js               # Configuración multi-página de Vite
├── tailwind.config.cjs          # Tokens de diseño, tipografías y plugins
├── postcss.config.cjs           # Procesamiento de Tailwind CSS
├── vercel.json                  # Configuración de despliegue en Vercel (dist/)
├── package.json                 # Dependencias y scripts de build
├── README.md                    # Documentación técnica
├── LICENSE                      # Licencia y derechos de propiedad
├── /src
│   ├── main.js                  # Entrypoint de JS y orquestación
│   ├── main.css                 # CSS principal + @font-face locales
│   └── galeria.js               # Lógica dinámica del mosaico de galería
├── /public                      # Archivos estáticos y multimedia optimizada
│   ├── /assets                  # Logos, banners y videos transcodificados
│   │   ├── /fonts               # Tipografías self-hosted (Bodoni Moda, Inter, etc.)
│   │   ├── /videos-optimized    # Videos en WebM/MP4 con posters
│   │   └── /optimized           # Imágenes en WebP/AVIF
│   ├── /anillos_compromiso_torrealba_imagenes
│   ├── /argollas_torrealba_imagenes
│   ├── gallery-images.json      # Catálogo de fotos para galería
│   └── gallery-videos.json      # Catálogo de videos para galería
├── /scripts                     # Herramientas de optimización y descarga de fuentes
├── /dist                        # Build optimizado para producción (ignorado en Git)
└── /respaldo-sitio-antiguo      # Archivo histórico de la versión previa (ignorado en Git)
```

---

## Historial de Cambios y Mejoras (Changelog)

### v1.1.0 - Modernización de Arquitectura, Rendimiento Extremo y Self-Hosting (27 de Septiembre de 2026)
- **Compilación Nativa con Vite y PostCSS**: Se erradicó completamente la dependencia en tiempo de ejecución del script CDN de Tailwind CSS (`cdn.tailwindcss.com`). El CSS ahora se purga y compila por completo en tiempo de construcción, reduciendo a cero el tiempo de bloqueo del hilo principal (*Total Blocking Time*).
- **Self-Hosting Total de Fuentes Web (WOFF2)**: Sustitución de Google Fonts CDN por fuentes autoalojadas localmente en WOFF2 de última generación:
  - *Bodoni Moda* (Normal e Itálica con pesos variables 400–900).
  - *Inter* (Pesos 300, 400, 500, 600 y variable).
  - *Playfair Display* (400–900).
  - *Great Vibes* (400).
  - *Material Symbols Outlined* (Fuente variable de iconos).
- **Soporte Completo de Acentos y Caracteres en Español**: Descarga directa de los subconjuntos oficiales *Latin* y *Latin-Extended* de Google Fonts para garantizar que todas las letras acentuadas (`á, é, í, ó, ú, ñ, ¡, ¿`) conserven al 100% las serifas e inclinación itálica auténticas de Bodoni Moda (resolviendo desalineaciones en títulos como *"Galería interactiva"* y *"Quién Soy"*).
- **Transcodificación y Optimización de Video**: Conversión de videos verticales pesados a formatos comprimidos **WebM** y **MP4** con *posters* estáticos en JPEG para renderizado instantáneo, reduciendo el consumo de datos móviles en más de un 70%.
- **Formulación y Plugins de UI**: Integración y configuración oficial de `@tailwindcss/forms` y `@tailwindcss/container-queries`.
- **Despliegue Automatizado para Vercel y Producción**: Configuración de `vercel.json` con `outputDirectory: "dist"` y `buildCommand: "npm run build"`, preservando intactas todas las redirecciones permanentes previas.
- **Resguardo de la Versión Antigua**: Todo el código de la versión previa fue organizado y preservado en la carpeta `respaldo-sitio-antiguo/`, quedando automáticamente excluida del control de versiones en `.gitignore`.

### v1.0.4 - Mejoras en Formularios de Contacto (03 de Septiembre de 2026)
- **Segmentación Geográfica**: Integración dinámica de campos de selección para Región y Ciudad (346 comunas de Chile) en todos los formularios (`contacto.html`, `catalogo.html`, `orfebreria.html`).
- **Base de Datos Local**: Creación de `js/regions.js` para administrar los datos estructurados geográficos de Chile.
- **WhatsApp Dinámico**: Inyección de los datos de ubicación seleccionados (Ciudad y Región) directamente en el cuerpo del mensaje de WhatsApp generado, optimizando el filtro de cotizaciones.

### v1.0.3 - Optimización de Rendimiento, Interfaz y SEO (27 de Agosto de 2026)
- **División de Galería**: Se implementó un sistema de pestañas en `galeria.html` para separar Fotos y Videos. Esto reduce significativamente la carga inicial del DOM y mejora la experiencia de navegación del usuario.
- **Refinamiento de Schema Local**: Se actualizó el JSON-LD en `index.html` de `JewelryStore` a `LocalBusiness`, integrando palabras clave de SEO local (Talca, Curicó, Región del Maule) y enfatizando el concepto de "Joyería de autor".
- **Corrección de FOUT**: Se solucionó el "Flash of Unstyled Text" en los íconos de Material Symbols cambiando su estrategia de carga a `display=block`, evitando que la palabra "menu" se lea distorsionada en móviles durante el renderizado inicial.
- **Favicon de Autor**: Se aisló el isologo dorado del logotipo principal para generar un nuevo `favicon.png` e `.ico` optimizado.
- **Analíticas de Rendimiento**: Integración nativa del script de Vercel Speed Insights en todas las páginas para monitorear métricas y estadísticas de Core Web Vitals en producción.

### v1.0.2 - Actualización de Arquitectura y SEO Técnico (26 de Agosto de 2026)
- **Optimización On-Page y Metadatos**: Se personalizaron los metadatos (`<title>`, `<meta name="description">`) en todas las páginas para evitar contenido duplicado y atacar palabras clave específicas por servicio (argollas, talleres, catálogo). Se añadieron etiquetas `canonical`.
- **Estructura de Datos (Schema.org)**: Inyección de JSON-LD (`JewelryStore`) en la página principal para enriquecer los resultados de búsqueda de Google con información de ubicación (Talca, Maule), teléfono y redes sociales.
- **Consolidación de SEO Local y NAP**: Reestructuración del `footer` en todo el sitio para incluir un bloque dedicado de contacto y ubicación, y otro de redes sociales, asegurando la consistencia NAP (Name, Address, Phone) requerida por los motores de búsqueda.
- **Rendimiento de Imágenes**: Implementación de `loading="lazy"` en imágenes secundarias y revisión de atributos `alt` para mejorar la accesibilidad y Core Web Vitals.
- **Indexación y Rastreo**: Creación y configuración de archivos raíz `robots.txt` y `sitemap.xml` para acelerar la correcta indexación de todo el sitio.

### v1.0.1 - Actualización de Correcciones Menores (26 de Agosto de 2026)
- **Ajustes de UI en Catálogos**: Los contenedores de las fotografías de los anillos adoptan una relación de aspecto apaisada para maximizar el área de visualización de producto.
- **Formulario de Contacto**: Refinamiento en categorías de Talleres y Consultas para un flujo de captura de prospectos más limpio.

---

## Tecnologías Utilizadas

- **Core**: HTML5 semántico multi-página.
- **Bundler y Servidor de Desarrollo**: [Vite](https://vitejs.dev/) (build de producción en `dist/`).
- **Estilos**: Tailwind CSS compilado localmente con [PostCSS](https://postcss.org/), plugins `@tailwindcss/forms` y `@tailwindcss/container-queries`.
- **Tipografías**: Self-hosted WOFF2 (*Bodoni Moda*, *Inter*, *Playfair Display*, *Great Vibes* y *Material Symbols Outlined*).
- **Interactividad**: Vanilla JavaScript Moderno (ES6+) con `IntersectionObserver` para carga diferida de imágenes y videos.
- **Alojamiento y Despliegue**: Preparado para [Vercel](https://vercel.com/) y [GitHub Pages].

---

## Comandos del Proyecto

Para trabajar localmente en el proyecto:

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en vivo (HMR)
npm run dev

# Compilar para producción (genera la carpeta dist/)
npm run build

# Previsualizar el bundle de producción localmente
npm run preview
```

---

## Propiedad Intelectual y Licencia

- **Código y Arquitectura**: Desarrollado y estructurado por Samuel Valenzuela Díaz.
- **Identidad Visual**: El logotipo, tipografías asociadas, fotografías, videos, y la marca "Torrealba Joyas" pertenecen en su totalidad a Jean Torrealba (y su entidad comercial).
- **Uso**: Derechos estrictamente reservados. Prohibida la replicación del diseño o uso comercial no autorizado de esta base de código por parte de terceros. Consultar el archivo `LICENSE` para los términos detallados.
