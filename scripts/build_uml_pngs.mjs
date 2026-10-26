import fs from 'fs';
import path from 'path';

const umlDir = path.resolve(process.cwd(), 'UML');

async function convertPumlToPng(pumlPath) {
  const pngPath = pumlPath.replace(/\.puml$/, '.png');
  const code = fs.readFileSync(pumlPath, 'utf8');

  console.log(`Processing: ${path.relative(process.cwd(), pumlPath)}...`);

  try {
    const response = await fetch('https://kroki.io/plantuml/png', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'image/png'
      },
      body: code
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Failed to convert ${pumlPath}: HTTP ${response.status} ${errText}`);
      return false;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(pngPath, buffer);
    console.log(`Saved: ${path.relative(process.cwd(), pngPath)} (${buffer.length} bytes)`);
    return true;
  } catch (err) {
    console.error(`Network error converting ${pumlPath}:`, err.message);
    return false;
  }
}

async function walkAndBuild(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkAndBuild(fullPath);
    } else if (entry.name.endsWith('.puml')) {
      await convertPumlToPng(fullPath);
      // Small pause to be courteous to the public API
      await new Promise(r => setTimeout(r, 600));
    }
  }
}

console.log('Starting UML PNG generation from PlantUML sources...');
walkAndBuild(umlDir).then(() => {
  console.log('Finished PNG build process.');
}).catch(console.error);
