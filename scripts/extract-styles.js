import fs from 'fs';
import path from 'path';

const htmlFilePath = 'd:\\home247\\.stitch\\designs\\bang_ieu_khien_home247_vn.html';
const styleGuidePath = 'd:\\home247\\resources\\style-guide.json';
const tailwindConfigPath = 'd:\\home247\\tailwind.config.js';

try {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
  
  // Find tailwind.config script block
  const startTag = '<script id="tailwind-config">';
  const endTag = '</script>';
  const startIndex = htmlContent.indexOf(startTag);
  const endIndex = htmlContent.indexOf(endTag, startIndex);
  
  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Tailwind config block not found in HTML file!');
  }
  
  const scriptContent = htmlContent.substring(startIndex + startTag.length, endIndex);
  
  // Extract JSON structure from tailwind.config = { ... }
  const jsonStart = scriptContent.indexOf('{');
  const jsonEnd = scriptContent.lastIndexOf('}');
  const jsonText = scriptContent.substring(jsonStart, jsonEnd + 1);
  
  // Evaluate the json text or parse it
  const evalConfig = new Function(`return ${jsonText}`)();
  const extend = evalConfig.theme.extend;
  
  const styleGuide = {
    theme: {
      colors: extend.colors,
      borderRadius: extend.borderRadius,
      spacing: extend.spacing,
      fontFamily: extend.fontFamily,
      fontSize: extend.fontSize
    }
  };

  // Ensure resources directory exists
  const resDir = path.dirname(styleGuidePath);
  if (!fs.existsSync(resDir)) {
    fs.mkdirSync(resDir, { recursive: true });
  }

  // Save style-guide.json
  fs.writeFileSync(styleGuidePath, JSON.stringify(styleGuide, null, 2));
  console.log(`✅ Successfully extracted style-guide to: ${styleGuidePath}`);

  // Also update tailwind.config.js with the extended theme values!
  const tailwindConfigTemplate = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: ${JSON.stringify(extend.colors, null, 8).trim().replace(/}$/, '      }')},
      borderRadius: ${JSON.stringify(extend.borderRadius, null, 8).trim().replace(/}$/, '      }')},
      spacing: ${JSON.stringify(extend.spacing, null, 8).trim().replace(/}$/, '      }')},
      fontFamily: ${JSON.stringify(extend.fontFamily, null, 8).trim().replace(/}$/, '      }')},
      fontSize: ${JSON.stringify(extend.fontSize, null, 8).trim().replace(/}$/, '      }')}
    },
  },
  plugins: [],
}
`;

  fs.writeFileSync(tailwindConfigPath, tailwindConfigTemplate);
  console.log(`✅ Successfully updated tailwind.config.js with project tokens.`);

} catch (err) {
  console.error('❌ Failed to extract styles:', err);
  process.exit(1);
}
