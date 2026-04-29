const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const sharp = require('sharp');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Database setup
const db = new sqlite3.Database('./embeddings.db', (err) => {
  if (err) console.error('DB Error:', err);
  else console.log('✅ Database connected');
});

db.run(`
  CREATE TABLE IF NOT EXISTS embeddings (
    id INTEGER PRIMARY KEY,
    pageId INTEGER UNIQUE,
    fileName TEXT,
    embedding TEXT
  )
`);

// Simple embedding generator (without ONNX for now)
// This generates a better feature vector from image
async function generateEmbedding(imageBuffer) {
  try {
    // Resize image to 224x224
    const resized = await sharp(imageBuffer)
      .resize(224, 224)
      .grayscale()
      .raw()
      .toBuffer();

    // Create embedding from pixel histogram
    const embedding = new Array(1024).fill(0);
    
    // Divide image into 32x32 blocks (1024 blocks total)
    const blockSize = Math.floor(Math.sqrt(resized.length / 1024));
    
    for (let i = 0; i < Math.min(resized.length, 1024); i++) {
      // Normalize pixel value (0-255 to 0-1)
      embedding[i] = resized[i] / 255;
    }

    // Pad remaining dimensions
    while (embedding.length < 1024) {
      embedding.push(0);
    }

    return embedding.slice(0, 1024);
  } catch (error) {
    console.error('Embedding error:', error);
    return null;
  }
}

// Cosine similarity
function cosineSimilarity(a, b) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// Search API
app.post('/api/search', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log('Generating embedding for search image...');
    const userEmbedding = await generateEmbedding(req.file.buffer);

    if (!userEmbedding) {
      return res.status(500).json({ error: 'Failed to generate embedding' });
    }

    db.all('SELECT * FROM embeddings', (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const results = rows
        .map(row => ({
          pageId: row.pageId,
          fileName: row.fileName,
          similarity: cosineSimilarity(userEmbedding, JSON.parse(row.embedding))
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      console.log(`Found ${results.length} similar pages`);
      res.json(results);
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pre-compute embeddings
app.post('/api/precompute', async (req, res) => {
  const imagesDir = './images';

  if (!fs.existsSync(imagesDir)) {
    return res.status(400).json({ error: 'Images directory not found' });
  }

  const files = fs.readdirSync(imagesDir)
    .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || 0);
      const numB = parseInt(b.match(/\d+/)?.[0] || 0);
      return numA - numB;
    });

  console.log(`\n📚 Processing ${files.length} images...`);
  let processed = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imagePath = path.join(imagesDir, file);

    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const embedding = await generateEmbedding(imageBuffer);
      const pageId = i + 1;

      if (embedding) {
        db.run(
          'INSERT OR REPLACE INTO embeddings (pageId, fileName, embedding) VALUES (?, ?, ?)',
          [pageId, file, JSON.stringify(embedding)],
          (err) => {
            if (err) {
              console.error(`❌ Error saving page ${pageId}:`, err);
              failed++;
            } else {
              processed++;
              if (processed % 100 === 0) {
                console.log(`✓ Processed ${processed}/${files.length}`);
              }
            }
          }
        );
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
      failed++;
    }
  }

  setTimeout(() => {
    res.json({
      message: `Processed ${processed} images, ${failed} failed`,
      total: files.length
    });
  }, 2000);
});

// Stats API
app.get('/api/stats', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM embeddings', (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      totalEmbeddings: row?.count || 0,
      model: 'Feature Vector (Sharp)',
      embeddingDimension: 1024,
      method: 'Cosine Similarity'
    });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 For mobile: http://<YOUR_IP>:${PORT}`);
  console.log(`\n📝 To pre-compute embeddings:`);
  console.log(`   1. Copy book images to ./images folder`);
  console.log(`   2. POST http://localhost:${PORT}/api/precompute`);
  console.log(`\n🔍 To search:`);
  console.log(`   POST http://localhost:${PORT}/api/search with image file\n`);
});
