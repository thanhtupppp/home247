import fs from 'fs';
import path from 'path';

const url = process.argv[2];
const outputPath = process.argv[3];

if (!url || !outputPath) {
  console.error("Usage: node scripts/fetch-stitch.js <url> <output_path>");
  process.exit(1);
}

async function fetchStitch() {
  console.log(`Initiating fetch for: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    
    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    console.log(`✅ Successfully retrieved content at: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error: Failed to retrieve content.`, error.message);
    process.exit(1);
  }
}

fetchStitch();
