# Image Search Server

ONNX Runtime based vector embedding server for Islamic Books App.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Prepare Images
```bash
# Create images folder
mkdir images

# Copy all book pages (page1.jpg, page2.jpg, etc.)
cp /path/to/book/images/* ./images/
```

### 3. Start Server
```bash
node server.js
```

Server will run on `http://localhost:3000`

### 4. Pre-compute Embeddings
```bash
# Send POST request to pre-compute all embeddings
curl -X POST http://localhost:3000/api/precompute
```

Or use Postman/Thunder Client to POST to `http://localhost:3000/api/precompute`

## Mobile App Configuration

Update `IslamicBooksApp/utils/imageSearch.js`:

```javascript
const SERVER_URL = 'http://YOUR_IP:3000';
```

Replace `YOUR_IP` with your computer's IP address:
- Windows: `ipconfig` → Look for IPv4 Address
- Mac/Linux: `ifconfig` → Look for inet

## API Endpoints

### Search
```
POST /api/search
Content-Type: multipart/form-data

Body: image file

Response:
[
  {
    "pageId": 1,
    "fileName": "page1.jpg",
    "similarity": 0.95
  },
  ...
]
```

### Pre-compute
```
POST /api/precompute

Response:
{
  "message": "Processed 896 images, 0 failed",
  "total": 896
}
```

### Stats
```
GET /api/stats

Response:
{
  "totalEmbeddings": 896,
  "model": "Feature Vector (Sharp)",
  "embeddingDimension": 1024,
  "method": "Cosine Similarity"
}
```

### Health Check
```
GET /api/health

Response:
{
  "status": "ok",
  "message": "Server is running"
}
```

## Database

SQLite database: `embeddings.db`

Schema:
```sql
CREATE TABLE embeddings (
  id INTEGER PRIMARY KEY,
  pageId INTEGER UNIQUE,
  fileName TEXT,
  embedding TEXT
);
```

## Performance

- Pre-compute time: ~5-10 minutes for 896 pages
- Search time: 100-200ms per query
- Database size: ~5 MB
- Memory usage: 50-100 MB

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Try: `netstat -ano | findstr :3000` (Windows)

### Images not found
- Make sure `./images` folder exists
- Check image file names (should be page1.jpg, page2.jpg, etc.)

### Mobile can't connect
- Check firewall settings
- Ensure mobile and server are on same WiFi
- Verify IP address is correct

## Notes

- Server must be running for image search to work
- Mobile app must be on same network as server
- Pre-computed embeddings are stored in SQLite
- Each embedding is ~4 KB (1024 dimensions × 4 bytes)
