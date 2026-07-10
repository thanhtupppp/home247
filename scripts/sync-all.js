import fs from 'fs';
import path from 'path';

const srcPath = 'C:\\Users\\thanh\\.gemini\\antigravity-ide\\brain\\be2cf371-a579-467e-aad3-6a3dded79aa0\\.system_generated\\steps\\30\\output.txt';
const targetDir = 'd:\\home247\\.stitch';
const designsDir = path.join(targetDir, 'designs');

if (!fs.existsSync(designsDir)) {
  fs.mkdirSync(designsDir, { recursive: true });
}

async function syncAll() {
  try {
    const rawData = fs.readFileSync(srcPath, 'utf8');
    const data = JSON.parse(rawData);
    const screens = data.screens;
    
    console.log(`Found ${screens.length} screens to sync...`);
    
    const syncTime = new Date().toISOString();
    const metadata = {
      projectId: "4367466681528895838",
      title: "Home247 Property Management",
      deviceType: "MOBILE",
      lastSyncTime: syncTime,
      screens: {}
    };

    for (const screen of screens) {
      const screenId = screen.name.split('/').pop();
      const pageName = screen.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove Vietnamese accents
        .replace(/[^a-z0-9]/g, "_")    // Replace spaces and special chars with underscore
        .replace(/_+/g, "_")            // Collapse multiple underscores
        .replace(/(^_|_$)/g, "");       // Trim underscores from ends
      
      const htmlFile = `${pageName}.html`;
      const pngFile = `${pageName}.png`;

      console.log(`Syncing screen: ${screen.title} -> ${pageName}`);

      metadata.screens[screenId] = {
        id: screenId,
        label: screen.title,
        pageName: pageName,
        htmlPath: `.stitch/designs/${htmlFile}`,
        pngPath: `.stitch/designs/${pngFile}`,
        width: screen.width,
        height: screen.height,
        deviceType: screen.deviceType
      };

      // 1. Download HTML
      const htmlUrl = screen.htmlCode.downloadUrl;
      const htmlDest = path.join(designsDir, htmlFile);
      console.log(`  Downloading HTML...`);
      const htmlRes = await fetch(htmlUrl);
      if (!htmlRes.ok) throw new Error(`Failed to download HTML for ${screen.title}: ${htmlRes.statusText}`);
      fs.writeFileSync(htmlDest, Buffer.from(await htmlRes.arrayBuffer()));

      // 2. Download Screenshot (with full width)
      const w = screen.width || '780';
      const screenshotUrl = `${screen.screenshot.downloadUrl}=w${w}`;
      const pngDest = path.join(designsDir, pngFile);
      console.log(`  Downloading PNG...`);
      const pngRes = await fetch(screenshotUrl);
      if (!pngRes.ok) throw new Error(`Failed to download PNG for ${screen.title}: ${pngRes.statusText}`);
      fs.writeFileSync(pngDest, Buffer.from(await pngRes.arrayBuffer()));
      
      console.log(`  ✅ Synced ${screen.title}`);
    }

    // Save metadata
    fs.writeFileSync(path.join(targetDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
    console.log(`\n🎉 All screens synced successfully! Metadata saved to .stitch/metadata.json`);
  } catch (err) {
    console.error(`❌ Sync failed:`, err);
    process.exit(1);
  }
}

syncAll();
