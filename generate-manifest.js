/**
 * generate-manifest.js
 * ─────────────────────────────────────────────────────────────
 * Run by Netlify at build time (see netlify.toml).
 * Scans the /gallery folder and writes gallery-manifest.json
 * so the website can load images dynamically — no HTML edits needed.
 *
 * TO ADD NEW IMAGES: just upload .jpg / .jpeg / .png / .webp files
 * to the /gallery folder on GitHub. The site rebuilds automatically.
 * ─────────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

const GALLERY_DIR    = path.join(__dirname, 'gallery');
const MANIFEST_PATH  = path.join(__dirname, 'gallery-manifest.json');
const IMAGE_EXTS     = /\.(jpg|jpeg|png|webp|gif)$/i;

// Read all image files from the gallery folder
const files = fs.readdirSync(GALLERY_DIR)
  .filter(f => IMAGE_EXTS.test(f))
  .sort(); // consistent order

if (files.length === 0) {
  console.warn('⚠️  No images found in /gallery — manifest will be empty.');
}

// Build manifest entries
const manifest = files.map(filename => {
  // Generate a human-friendly caption by stripping the filename noise
  const caption = filename
    .replace(IMAGE_EXTS, '')         // remove extension
    .replace(/WhatsApp Image \d{4}-\d{2}-\d{2} at \d{2}\.\d{2}\.\d{2}(\s*\(\d+\))?/i, '')
    .replace(/[-_]+/g, ' ')
    .trim() || 'Culinary Creation';  // fallback caption

  return {
    src:     `gallery/${encodeURIComponent(filename)}`,
    caption: caption || 'Culinary Creation',
    alt:     caption || 'A dish prepared by Ziningi'
  };
});

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log(`✅  gallery-manifest.json generated — ${manifest.length} image(s).`);
