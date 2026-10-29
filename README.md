# Brújula · Notas de ESO en Andalucía

**Web:** https://jgleal.github.io/brujula-eso-andalucia/

Web estática gratuita para 1.º–4.º ESO: notas por criterio, competencias, radar de mejora, simulador y cuadernos separados por curso académico. Datos exclusivamente en localStorage. Sin servidor de aplicación, cuentas ni base de datos remota.

## Uso local

Requiere Python 3 para servir archivos y Node.js 22+ para las pruebas:

```sh
python3 -m http.server 4173 --directory dist
node test-engine.mjs
node test-notebooks.mjs
```

Abre http://localhost:4173. El catálogo carga mediante fetch: no abras index.html con file://.

## Publicar en GitHub Pages sin dominio propio

1. Crea un repositorio y sube el contenido del paquete, incluida `.github/workflows/pages.yml`, a la rama `main`.
2. En **Settings → Pages → Build and deployment → Source**, selecciona **GitHub Actions**.
3. Ejecuta el workflow «Publicar Brújula en GitHub Pages» o haz un push a `main`.
4. El workflow comprueba los cálculos y cuadernos, toma la URL real de Pages y prepara canonical, Open Graph, JSON-LD, sitemap y robots antes de publicar `dist/`.

Funciona tanto en `https://usuario.github.io/` como en `https://usuario.github.io/repositorio/`. Los recursos son relativos. No requiere CNAME ni dominio propio.

Para otro alojamiento HTTPS:

```sh
node scripts/configure-site.mjs https://usuario.github.io/repositorio/
```

Publica el contenido de `dist/`. La URL indicada debe ser la definitiva, incluida la ruta. Si mantienes dos copias públicas, elige una preferida y configura sus canonical de forma consistente. GitHub Pages de proyecto no sirve el `robots.txt` del proyecto en la raíz del dominio; puedes enviar su sitemap directamente a Search Console con una propiedad de prefijo de URL. La configuración técnica no garantiza indexación ni posiciones.

Al mudarte de dirección, exporta los cuadernos desde Ajustes e impórtalos en la nueva web: localStorage está ligado al origen. El paquete de código no contiene notas personales.

Documentación: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Fuentes y límites

`dist/fuentes.html` explica y enlaza BOJA 2023, texto consolidado 2026, BOE y PEC del Néstor Almendros (12/11/2025). Cada materia enlaza a su PDF. El catálogo autonómico no garantiza la oferta de un centro. Francés es una referencia adaptada de Lengua Extranjera; MLCT, proyectos, Religión y materias propias requieren concreción docente.

El modelo inicial promedia criterios dentro de competencias y luego competencias. Los valores pendientes se excluyen provisionalmente. Cada criterio admite varias notas con fecha y actividad opcionales. Su estimación es la media de las entradas; la vista Curso reúne las de las tres evaluaciones y da prioridad a las valoraciones finales confirmadas, sin borrar el historial. Esta media de entradas es un supuesto de Brújula que debe contrastarse con el docente. No calcula promoción, no sustituye la evaluación docente ni inventa notas de instrumentos. ATEDU no se califica. Religión se excluye por defecto de la media global de comparación.

## Estructura y datos

- `dist/app.js`: interfaz y almacenamiento; `notebooks.js`: validación, selección y separación de cuadernos; `engine.js`: cálculo.
- `dist/curriculum.json`: catálogo por curso con códigos, competencias y páginas de origen.
- `test-engine.mjs`, `test-notebooks.mjs`: cálculo, ceros/pendientes, periodos, objetivos, importación, migración y aislamiento.
- `scripts/extract-*.py`: scripts de extracción documental usados durante la preparación. Requieren PyMuPDF y los dos PDF oficiales en las rutas indicadas en cada script; no forman parte del despliegue.
- `dist/assets/`: favicon, iconos 180/192/512 y piezas sociales 1200×630, 1080×1080 y 1080×1920, con SVG editables.
- `scripts/create-assets.cjs`: generador gráfico original, requiere sharp y adaptar su ruta de salida local si se reutiliza.

Exportación JSON v3 incluye todos los cuadernos y criterios personalizados. La importación valida cursos, códigos, notas y tamaño; confirma el reemplazo. Se admiten copias v1 y v2; las notas existentes se convierten en entradas individuales sin perder ceros. El borrado de notas afecta solo al cuaderno activo. No hay sincronización entre dispositivos ni funcionamiento offline garantizado. Las tipografías se sirven localmente (licencias OFL en assets/fonts). La pantalla de inicio usa CSS integrado y permanece visible hasta que están listos los estilos y el cuaderno. No se envían calificaciones.

## Contenido y búsquedas

La portada presenta la calculadora de notas por criterios de ESO en Andalucía. La guía estática `calcular-nota-final-eso-andalucia.html` responde a cómo calcular la nota final, diferencias entre media de criterios y competencias, notas acumuladas por evaluación, varias valoraciones de un criterio y objetivos para aprobar o subir la media. Incluye ejemplos, preguntas frecuentes y fuentes, sin duplicar páginas por curso ni prometer una nota oficial. El contenido está enlazado desde la interfaz y disponible sin JavaScript.

`node test-seo.mjs` comprueba títulos y descripciones únicos, canonical, Open Graph, sitemap, JSON-LD y enlaces locales. El workflow ejecuta la comprobación después de configurar la URL de Pages. No se añade meta keywords ni marcado de valoraciones ficticias.

Para medir consultas e indexación, el propietario puede verificar en Google Search Console la propiedad de prefijo `https://jgleal.github.io/brujula-eso-andalucia/` y enviar `sitemap.xml`. La web no incluye analítica ni necesita añadirla para usar Search Console. La publicación no garantiza indexación ni posiciones.
