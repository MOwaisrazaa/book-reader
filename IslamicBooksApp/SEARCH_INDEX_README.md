# Search Index Generation

## Overview
The app now has full-text search functionality powered by OCR text extracted from all 896 book pages.

## How It Works

### 1. OCR Text Files
- Located in: `pages_output/` folder
- Contains 896 text files (page1.txt through page896.txt)
- Each file contains OCR-extracted text from the corresponding book page image

### 2. Search Index Generation
- Script: `generateSearchIndex.js`
- Reads all 896 OCR text files from `pages_output/`
- Generates `assets/searchIndex.json` with all entries
- Each entry contains: `{ page: number, text: string }`

### 3. Search Functionality
- User types a search query in the app
- App searches through all 896 entries in `searchIndex.json`
- Returns matching pages with text snippets
- User can tap a result to jump to that page in the book reader

## Regenerating the Search Index

If you add or modify OCR text files, regenerate the index:

```bash
npm run generate-search-index
```

Or manually:
```bash
node generateSearchIndex.js
```

## Search Index Statistics
- Total Pages: 896
- Total Entries: 896
- File Size: ~2-3 MB (searchIndex.json)
- Search Speed: Instant (all data loaded in memory)

## Features
✓ Full-text search across all 896 pages
✓ Case-insensitive matching
✓ Text snippet preview in results
✓ Direct navigation to page with highlighted text
✓ Urdu/Arabic text support
✓ Offline functionality (no internet required)
