const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BOOK_ARG = '--book';
const DEFAULT_BOOK = 'sham-e-shabistan-e-raza';
const INDEX_SIZE = 256;
const HASH_SIZE = 8;

function getBookName() {
  const index = process.argv.indexOf(BOOK_ARG);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : DEFAULT_BOOK;
}

function pageNumberFromName(name) {
  const match = name.match(/^page(\d+)\.(jpg|jpeg|png)$/i);
  return match ? Number(match[1]) : null;
}

function makeTileSpec() {
  const specs = [
    { id: 'full', x: 0, y: 0, w: 256, h: 256 },
    { id: 'top', x: 0, y: 0, w: 256, h: 128 },
    { id: 'center', x: 0, y: 64, w: 256, h: 128 },
    { id: 'bottom', x: 0, y: 128, w: 256, h: 128 },
    { id: 'left', x: 0, y: 0, w: 128, h: 256 },
    { id: 'right', x: 128, y: 0, w: 128, h: 256 },
  ];

  for (const size of [64, 128]) {
    const step = Math.max(32, Math.floor(size * 0.5));
    for (let y = 0; y <= INDEX_SIZE - size; y += step) {
      for (let x = 0; x <= INDEX_SIZE - size; x += step) {
        specs.push({ id: `g${size}_${x}_${y}`, x, y, w: size, h: size });
      }
    }
  }

  return specs;
}

function cropPixels(source, width, tile) {
  const pixels = Buffer.alloc(tile.w * tile.h);
  let offset = 0;

  for (let y = tile.y; y < tile.y + tile.h; y += 1) {
    const rowStart = y * width;
    for (let x = tile.x; x < tile.x + tile.w; x += 1) {
      pixels[offset] = source[rowStart + x];
      offset += 1;
    }
  }

  return pixels;
}

function averageHashFromGray(gray, width, height) {
  const buckets = new Array(HASH_SIZE * HASH_SIZE).fill(0);
  const counts = new Array(HASH_SIZE * HASH_SIZE).fill(0);

  for (let y = 0; y < height; y += 1) {
    const by = Math.min(HASH_SIZE - 1, Math.floor((y * HASH_SIZE) / height));
    for (let x = 0; x < width; x += 1) {
      const bx = Math.min(HASH_SIZE - 1, Math.floor((x * HASH_SIZE) / width));
      const bucket = by * HASH_SIZE + bx;
      buckets[bucket] += gray[y * width + x];
      counts[bucket] += 1;
    }
  }

  const values = buckets.map((sum, index) => sum / Math.max(1, counts[index]));
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  let hash = '';

  for (let i = 0; i < values.length; i += 4) {
    let nibble = 0;
    for (let bit = 0; bit < 4; bit += 1) {
      if (values[i + bit] >= mean) {
        nibble |= 1 << (3 - bit);
      }
    }
    hash += nibble.toString(16);
  }

  return hash;
}

async function readPageGray(filePath) {
  const { data, info } = await sharp(filePath)
    .resize(INDEX_SIZE, INDEX_SIZE, { fit: 'fill' })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.width !== INDEX_SIZE || info.height !== INDEX_SIZE) {
    throw new Error(`Unexpected resize output for ${filePath}`);
  }

  return data;
}

async function main() {
  const book = getBookName();
  const projectRoot = path.resolve(__dirname, '..');
  const bookDir = path.join(projectRoot, 'assets', 'books', book);
  const outputFile = path.join(projectRoot, 'assets', 'image_search_index.json');

  if (!fs.existsSync(bookDir)) {
    throw new Error(`Book images folder not found: ${bookDir}`);
  }

  const files = fs.readdirSync(bookDir)
    .map((name) => ({ name, page: pageNumberFromName(name) }))
    .filter((item) => item.page)
    .sort((a, b) => a.page - b.page);

  const tileSpec = makeTileSpec();
  const pages = [];

  for (const file of files) {
    const pagePath = path.join(bookDir, file.name);
    const gray = await readPageGray(pagePath);
    const tiles = tileSpec.map((tile) => {
      const cropped = cropPixels(gray, INDEX_SIZE, tile);
      return {
        id: tile.id,
        x: tile.x,
        y: tile.y,
        w: tile.w,
        h: tile.h,
        hash: averageHashFromGray(cropped, tile.w, tile.h),
      };
    });

    pages.push({
      page: file.page,
      image: `assets/books/${book}/${file.name}`,
      hash: tiles[0].hash,
      tiles,
    });

    if (file.page % 50 === 0) {
      console.log(`[image-index] indexed ${file.page}/${files.length}`);
    }
  }

  const index = {
    version: 1,
    book,
    generatedAt: new Date().toISOString(),
    method: 'average-hash-multiscale-tiles',
    indexSize: INDEX_SIZE,
    pages,
  };

  fs.writeFileSync(outputFile, JSON.stringify(index));
  console.log(`[image-index] wrote ${pages.length} pages to ${outputFile}`);
}

main().catch((error) => {
  console.error('[image-index] Failed:', error);
  process.exit(1);
});
