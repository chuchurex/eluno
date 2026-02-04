# Generación Automática de Imágenes - El Uno

> **Objetivo**: Generar todas las imágenes (OG + portadas MP3) de forma automática usando Puppeteer

---

## Estructura de Archivos a Crear

```
/scripts/
  generate-covers.js      # Script principal de generación
  cover-generator.html    # HTML con el componente de renderizado
/assets/covers/
  og/
    og-image-es.png
    og-image-en.png
    og-image-pt.png
  mp3/
    cover-complete-es.png
    cover-01-es.png
    cover-02-es.png
    ... (hasta cover-16-es.png)
```

---

## Paso 1: Instalar Dependencias

```bash
npm install puppeteer
```

---

## Paso 2: Crear el HTML de Renderizado

Crear archivo `scripts/cover-generator.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Cover Generator</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; }
    
    .cover {
      font-family: 'Cormorant Garamond', Georgia, serif;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: radial-gradient(ellipse at 30% 20%, #1a1a2e 0%, #0d0d1a 50%, #050508 100%);
    }
    
    /* Nebulosa */
    .nebula-1 {
      position: absolute;
      top: 10%;
      right: 10%;
      width: 60%;
      height: 60%;
      background: radial-gradient(ellipse, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
      filter: blur(40px);
      pointer-events: none;
    }
    .nebula-2 {
      position: absolute;
      bottom: 20%;
      left: 5%;
      width: 40%;
      height: 40%;
      background: radial-gradient(ellipse, rgba(168, 85, 247, 0.06) 0%, transparent 70%);
      filter: blur(50px);
      pointer-events: none;
    }
    
    /* Geometría sagrada */
    .sacred-geometry {
      position: absolute;
      width: 80%;
      height: 80%;
      opacity: 0.12;
      pointer-events: none;
    }
    
    /* Estrellas */
    .star {
      position: absolute;
      background: white;
      border-radius: 50%;
      pointer-events: none;
    }
    
    /* Contenido */
    .content {
      position: relative;
      z-index: 10;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    
    .title {
      font-weight: 400;
      color: #c9a227;
      letter-spacing: 0.05em;
      text-shadow: 0 0 60px rgba(201, 162, 39, 0.4), 0 4px 20px rgba(0,0,0,0.5);
    }
    
    .subtitle {
      color: rgba(255, 255, 255, 0.75);
      font-weight: 300;
      letter-spacing: 0.1em;
    }
    
    .chapter-label {
      color: rgba(201, 162, 39, 0.8);
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    
    .chapter-title {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 400;
      letter-spacing: 0.02em;
      line-height: 1.3;
    }
    
    .chapter-subtitle {
      color: rgba(255, 255, 255, 0.5);
      font-style: italic;
    }
    
    .credit {
      position: absolute;
      bottom: 30px;
      color: rgba(255, 255, 255, 0.5);
      letter-spacing: 0.05em;
      font-family: system-ui, -apple-system, sans-serif;
    }
    
    /* OG específico (1200x630) */
    .cover.og {
      width: 1200px;
      height: 630px;
    }
    .cover.og .title { font-size: 120px; }
    .cover.og .subtitle { font-size: 28px; margin-top: 20px; }
    .cover.og .credit { font-size: 14px; }
    
    /* Album cover (3000x3000, mostrado a escala) */
    .cover.album {
      width: 3000px;
      height: 3000px;
    }
    .cover.album .content { padding: 200px; }
    .cover.album.complete .title { font-size: 360px; }
    .cover.album.complete .subtitle { font-size: 120px; margin-top: 60px; }
    .cover.album.complete .subtitle-2 { font-size: 80px; margin-top: 40px; color: rgba(255,255,255,0.5); }
    .cover.album.chapter .title { font-size: 240px; }
    .cover.album.chapter .chapter-label { font-size: 70px; margin-top: 100px; }
    .cover.album.chapter .chapter-title { font-size: 140px; margin-top: 50px; max-width: 90%; }
    .cover.album.chapter .chapter-subtitle { font-size: 70px; margin-top: 30px; }
    .cover.album .credit { font-size: 50px; bottom: 120px; }
  </style>
</head>
<body>
  <div id="cover-container"></div>
  
  <script>
    const LANGUAGES = {
      es: { 
        title: 'El Uno', 
        subtitle: 'Una interpretación del Material Ra',
        credit: 'Material original © L/L Research · llresearch.org',
        complete: 'Audiolibro Completo',
        chapter: 'Capítulo'
      },
      en: { 
        title: 'The One', 
        subtitle: 'An interpretation of The Ra Material',
        credit: 'Original material © L/L Research · llresearch.org',
        complete: 'Complete Audiobook',
        chapter: 'Chapter'
      },
      pt: { 
        title: 'O Um', 
        subtitle: 'Uma interpretação do Material Ra',
        credit: 'Material original © L/L Research · llresearch.org',
        complete: 'Audiolivro Completo',
        chapter: 'Capítulo'
      }
    };
    
    const CHAPTERS_ES = [
      { num: 1, title: 'Cosmología y Génesis', subtitle: 'El origen de todo lo que existe' },
      { num: 2, title: 'El Logos y los Sub-Logos', subtitle: 'La arquitectura de la creación' },
      { num: 3, title: 'Las Siete Densidades', subtitle: 'El camino evolutivo de la consciencia' },
      { num: 4, title: 'La Tierra y Sus Ciclos', subtitle: 'Nuestro hogar en el cosmos' },
      { num: 5, title: 'Orígenes de la Humanidad', subtitle: 'De dónde venimos' },
      { num: 6, title: 'Civilizaciones Antiguas', subtitle: 'Atlántida, Lemuria y más allá' },
      { num: 7, title: 'La Confederación y Orión', subtitle: 'Fuerzas cósmicas en juego' },
      { num: 8, title: 'El Velo del Olvido', subtitle: 'Por qué olvidamos quiénes somos' },
      { num: 9, title: 'La Muerte y el Más Allá', subtitle: 'La transición entre vidas' },
      { num: 10, title: 'Karma y Reencarnación', subtitle: 'El ciclo del aprendizaje' },
      { num: 11, title: 'Errantes y Caminantes', subtitle: 'Almas de otras densidades' },
      { num: 12, title: 'Sanación y los Cuerpos Energéticos', subtitle: 'El templo del espíritu' },
      { num: 13, title: 'El Arquetipo de la Mente', subtitle: 'La estructura profunda del ser' },
      { num: 14, title: 'Polaridad y el Camino del Servicio', subtitle: 'La elección fundamental' },
      { num: 15, title: 'Meditación y Práctica Espiritual', subtitle: 'El trabajo interior' },
      { num: 16, title: 'La Cosecha y el Nuevo Ciclo', subtitle: 'El destino de la humanidad' }
    ];
    
    function generateStars(count) {
      let stars = '';
      for (let i = 0; i < count; i++) {
        const size = 1 + Math.random() * 2;
        const opacity = 0.3 + Math.random() * 0.4;
        stars += `<div class="star" style="left:${Math.random()*100}%;top:${Math.random()*100}%;width:${size}px;height:${size}px;opacity:${opacity}"></div>`;
      }
      return stars;
    }
    
    function generateSacredGeometry() {
      return `
        <svg viewBox="0 0 400 400" class="sacred-geometry">
          <circle cx="200" cy="200" r="180" fill="none" stroke="#c9a227" stroke-width="0.5"/>
          <circle cx="200" cy="200" r="140" fill="none" stroke="#c9a227" stroke-width="0.5"/>
          <circle cx="200" cy="200" r="100" fill="none" stroke="#c9a227" stroke-width="0.5"/>
          <polygon points="200,50 320,250 80,250" fill="none" stroke="#c9a227" stroke-width="0.5"/>
          <polygon points="200,350 80,150 320,150" fill="none" stroke="#c9a227" stroke-width="0.5"/>
          ${[0,60,120,180,240,300].map(angle => {
            const rad = (angle * Math.PI) / 180;
            const x = 200 + 140 * Math.sin(rad);
            const y = 200 - 140 * Math.cos(rad);
            return `<circle cx="${x}" cy="${y}" r="30" fill="none" stroke="#c9a227" stroke-width="0.5"/>`;
          }).join('')}
          <path d="M200,200 Q250,200 250,150 Q250,100 200,100 Q130,100 130,180 Q130,280 230,280 Q350,280 350,150" fill="none" stroke="#c9a227" stroke-width="0.3" opacity="0.5"/>
        </svg>
      `;
    }
    
    function renderOG(lang) {
      const t = LANGUAGES[lang];
      const container = document.getElementById('cover-container');
      container.innerHTML = `
        <div class="cover og" id="render-target">
          <div class="nebula-1"></div>
          <div class="nebula-2"></div>
          ${generateSacredGeometry()}
          ${generateStars(30)}
          <div class="content">
            <h1 class="title">${t.title}</h1>
            <p class="subtitle">${t.subtitle}</p>
          </div>
          <p class="credit">${t.credit}</p>
        </div>
      `;
    }
    
    function renderAlbumComplete(lang) {
      const t = LANGUAGES[lang];
      const container = document.getElementById('cover-container');
      container.innerHTML = `
        <div class="cover album complete" id="render-target">
          <div class="nebula-1"></div>
          <div class="nebula-2"></div>
          ${generateSacredGeometry()}
          ${generateStars(50)}
          <div class="content">
            <h1 class="title">${t.title}</h1>
            <p class="subtitle">${t.complete}</p>
            <p class="subtitle-2">${t.subtitle}</p>
          </div>
          <p class="credit">${t.credit}</p>
        </div>
      `;
    }
    
    function renderAlbumChapter(lang, chapterNum) {
      const t = LANGUAGES[lang];
      const chapter = CHAPTERS_ES[chapterNum - 1];
      const container = document.getElementById('cover-container');
      container.innerHTML = `
        <div class="cover album chapter" id="render-target">
          <div class="nebula-1"></div>
          <div class="nebula-2"></div>
          ${generateSacredGeometry()}
          ${generateStars(50)}
          <div class="content">
            <h1 class="title">${t.title}</h1>
            <p class="chapter-label">${t.chapter} ${chapterNum}</p>
            <h2 class="chapter-title">${chapter.title}</h2>
            <p class="chapter-subtitle">${chapter.subtitle}</p>
          </div>
          <p class="credit">${t.credit}</p>
        </div>
      `;
    }
    
    // Exponer funciones globalmente para Puppeteer
    window.renderOG = renderOG;
    window.renderAlbumComplete = renderAlbumComplete;
    window.renderAlbumChapter = renderAlbumChapter;
  </script>
</body>
</html>
```

---

## Paso 3: Crear el Script de Generación

Crear archivo `scripts/generate-covers.js`:

```javascript
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'covers');
const HTML_FILE = path.join(__dirname, 'cover-generator.html');

// Crear directorios si no existen
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function generateCovers() {
  console.log('🚀 Iniciando generación de portadas...\n');
  
  // Crear directorios
  ensureDir(path.join(OUTPUT_DIR, 'og'));
  ensureDir(path.join(OUTPUT_DIR, 'mp3'));
  
  // Iniciar Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Cargar el HTML
  await page.goto(`file://${HTML_FILE}`, { waitUntil: 'networkidle0' });
  
  // Esperar a que cargue la fuente
  await page.waitForFunction(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000)); // Extra wait for fonts
  
  const languages = ['es', 'en', 'pt'];
  let total = 0;
  
  // ==================
  // 1. Generar OG Images (1200x630)
  // ==================
  console.log('📸 Generando OG Images (1200x630)...');
  
  for (const lang of languages) {
    await page.evaluate((l) => window.renderOG(l), lang);
    await new Promise(r => setTimeout(r, 500));
    
    const element = await page.$('#render-target');
    const outputPath = path.join(OUTPUT_DIR, 'og', `og-image-${lang}.png`);
    
    await element.screenshot({ 
      path: outputPath,
      type: 'png'
    });
    
    console.log(`  ✓ og-image-${lang}.png`);
    total++;
  }
  
  // ==================
  // 2. Generar Album Covers (3000x3000)
  // ==================
  console.log('\n📀 Generando Album Covers (3000x3000)...');
  
  // Solo español por ahora (se puede expandir)
  const lang = 'es';
  
  // 2.1 Versión completa
  await page.evaluate((l) => window.renderAlbumComplete(l), lang);
  await new Promise(r => setTimeout(r, 500));
  
  let element = await page.$('#render-target');
  let outputPath = path.join(OUTPUT_DIR, 'mp3', `cover-complete-${lang}.png`);
  
  await element.screenshot({ 
    path: outputPath,
    type: 'png'
  });
  
  console.log(`  ✓ cover-complete-${lang}.png`);
  total++;
  
  // 2.2 Capítulos individuales
  for (let i = 1; i <= 16; i++) {
    await page.evaluate((l, ch) => window.renderAlbumChapter(l, ch), lang, i);
    await new Promise(r => setTimeout(r, 300));
    
    element = await page.$('#render-target');
    const chapterNum = i.toString().padStart(2, '0');
    outputPath = path.join(OUTPUT_DIR, 'mp3', `cover-${chapterNum}-${lang}.png`);
    
    await element.screenshot({ 
      path: outputPath,
      type: 'png'
    });
    
    console.log(`  ✓ cover-${chapterNum}-${lang}.png`);
    total++;
  }
  
  await browser.close();
  
  console.log(`\n✅ ¡Completado! ${total} imágenes generadas en ${OUTPUT_DIR}`);
}

// Ejecutar
generateCovers().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
```

---

## Paso 4: Ejecutar

```bash
# Desde la raíz del proyecto
node scripts/generate-covers.js
```

---

## Resultado Esperado

```
🚀 Iniciando generación de portadas...

📸 Generando OG Images (1200x630)...
  ✓ og-image-es.png
  ✓ og-image-en.png
  ✓ og-image-pt.png

📀 Generando Album Covers (3000x3000)...
  ✓ cover-complete-es.png
  ✓ cover-01-es.png
  ✓ cover-02-es.png
  ✓ cover-03-es.png
  ✓ cover-04-es.png
  ✓ cover-05-es.png
  ✓ cover-06-es.png
  ✓ cover-07-es.png
  ✓ cover-08-es.png
  ✓ cover-09-es.png
  ✓ cover-10-es.png
  ✓ cover-11-es.png
  ✓ cover-12-es.png
  ✓ cover-13-es.png
  ✓ cover-14-es.png
  ✓ cover-15-es.png
  ✓ cover-16-es.png

✅ ¡Completado! 20 imágenes generadas en /assets/covers
```

---

## Estructura Final de Archivos Generados

```
assets/covers/
├── og/
│   ├── og-image-es.png    (1200x630)
│   ├── og-image-en.png    (1200x630)
│   └── og-image-pt.png    (1200x630)
└── mp3/
    ├── cover-complete-es.png  (3000x3000)
    ├── cover-01-es.png        (3000x3000)
    ├── cover-02-es.png        (3000x3000)
    ├── cover-03-es.png        (3000x3000)
    ├── cover-04-es.png        (3000x3000)
    ├── cover-05-es.png        (3000x3000)
    ├── cover-06-es.png        (3000x3000)
    ├── cover-07-es.png        (3000x3000)
    ├── cover-08-es.png        (3000x3000)
    ├── cover-09-es.png        (3000x3000)
    ├── cover-10-es.png        (3000x3000)
    ├── cover-11-es.png        (3000x3000)
    ├── cover-12-es.png        (3000x3000)
    ├── cover-13-es.png        (3000x3000)
    ├── cover-14-es.png        (3000x3000)
    ├── cover-15-es.png        (3000x3000)
    └── cover-16-es.png        (3000x3000)
```

---

## Notas para Claude Code

1. **Dependencia única**: Solo necesita `puppeteer` (`npm install puppeteer`)

2. **Fuente**: El HTML carga Cormorant Garamond desde Google Fonts. Si hay problemas de red, se puede instalar localmente.

3. **Tamaño de imágenes**: Los album covers son 3000x3000 (tamaño recomendado para Spotify/Apple). Si se necesitan más pequeños para web, agregar un paso de resize con `sharp`.

4. **Extensión a otros idiomas**: Para generar covers en EN/PT, modificar el loop en la sección de "Album Covers" del script.

5. **Conversión a JPG**: Si se necesita JPG en lugar de PNG:
   ```javascript
   await element.screenshot({ 
     path: outputPath.replace('.png', '.jpg'),
     type: 'jpeg',
     quality: 90
   });
   ```

---

*Documento para Claude Code - Enero 2026*
