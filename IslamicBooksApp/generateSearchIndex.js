const fs = require('fs');
const path = require('path');

// Read all OCR text files from pages_output folder
const pagesOutputDir = path.join(__dirname, '..', 'pages_output');
const searchIndex = [];

console.log('Generating search index from OCR files...');

// Get all .txt files and sort them numerically
const files = fs.readdirSync(pagesOutputDir)
  .filter(file => file.endsWith('.txt'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

console.log(`Found ${files.length} OCR files`);

// Process each file
files.forEach((file, index) => {
  try {
    const filePath = path.join(pagesOutputDir, file);
    const text = fs.readFileSync(filePath, 'utf-8').trim();
    
    // Extract page number from filename (page1.txt -> 1)
    const pageNum = parseInt(file.match(/\d+/)[0]);
    
    if (text.length > 0) {
      searchIndex.push({
        page: pageNum,
        text: text
      });
    }
    
    if ((index + 1) % 100 === 0) {
      console.log(`Processed ${index + 1}/${files.length} files...`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

// Write to searchIndex.json
const outputPath = path.join(__dirname, 'assets', 'searchIndex.json');
fs.writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2), 'utf-8');

console.log(`✓ Search index generated successfully!`);
console.log(`✓ Total entries: ${searchIndex.length}`);
console.log(`✓ Output file: ${outputPath}`);
