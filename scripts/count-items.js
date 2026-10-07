const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'src', 'app', 'services', 'data.service.ts');
const data = fs.readFileSync(dataFilePath, 'utf8');

const items = new Set();

// 1. Stories pages & sentences
const storyRegex = /en:\s*['"]([^'"]+)['"]/g;
let m;
while ((m = storyRegex.exec(data)) !== null) {
  const s = m[1].trim();
  if (s.length > 2) items.add(s);
}

// 2. Story Titles
const titleRegex = /title:\s*['"]([^'"]+)['"]/g;
while ((m = titleRegex.exec(data)) !== null) {
  const s = m[1].trim();
  if (s.length > 2) items.add(s);
}

// 3. Alphabet words
const wordRegex = /word:\s*['"]([^'"]+)['"]/g;
while ((m = wordRegex.exec(data)) !== null) {
  const s = m[1].trim();
  if (s.length > 1) items.add(s);
}

console.log('Total items found:', items.size);
let totalChars = 0;
for (const i of items) {
  totalChars += i.length;
}
console.log('Total characters required:', totalChars);
