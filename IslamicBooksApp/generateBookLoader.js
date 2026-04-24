const fs = require('fs');
const path = require('path');

// Generate bookLoader.js with all 896 requires
let code = `// Auto-generated file - do not edit manually\n\n`;
code += `const bookImages = {\n`;

for (let i = 1; i <= 896; i++) {
  code += `  ${i}: require('../assets/books/sham-e-shabistan-e-raza/page${i}.jpg'),\n`;
}

code += `};\n\n`;
code += `export const getBookImages = async (bookName) => {
  const images = [];
  
  if (bookName === 'sham-e-shabistan-e-raza') {
    for (let i = 1; i <= 896; i++) {
      if (bookImages[i]) {
        images.push(bookImages[i]);
      }
    }
  }
  
  return images;
};

export const getAvailableBooks = () => {
  return [
    {
      name: 'sham-e-shabistan-e-raza',
      title: 'Sham-e-Shabistan-e-Raza',
      pages: 896,
    },
  ];
};\n`;

const outputPath = path.join(__dirname, 'utils', 'bookLoader.js');
fs.writeFileSync(outputPath, code);
console.log('✓ bookLoader.js generated successfully!');
