/**
 * Script to generate Android icons from logo.png
 * 
 * This will copy logo.png to all required Android mipmap folders.
 * For production, you should use proper image resizing tools to create:
 * - mipmap-mdpi: 48x48px
 * - mipmap-hdpi: 72x72px
 * - mipmap-xhdpi: 96x96px
 * - mipmap-xxhdpi: 144x144px
 * - mipmap-xxxhdpi: 192x192px
 * 
 * For now, Android will automatically scale the image.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceLogo = path.join(__dirname, '..', 'public', 'logo.png');
const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

const mipmapFolders = [
  'mipmap-mdpi',
  'mipmap-hdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi'
];

console.log('🎨 Generating Android app icons...\n');

// Check if source logo exists
if (!fs.existsSync(sourceLogo)) {
  console.error('❌ Error: logo.png not found in public folder');
  process.exit(1);
}

// Copy logo to each mipmap folder
mipmapFolders.forEach(folder => {
  const targetFolder = path.join(resDir, folder);
  const targetFile = path.join(targetFolder, 'ic_launcher.png');
  const targetRoundFile = path.join(targetFolder, 'ic_launcher_round.png');
  
  try {
    // Copy as ic_launcher.png
    fs.copyFileSync(sourceLogo, targetFile);
    console.log(`✅ Copied to ${folder}/ic_launcher.png`);
    
    // Copy as ic_launcher_round.png
    fs.copyFileSync(sourceLogo, targetRoundFile);
    console.log(`✅ Copied to ${folder}/ic_launcher_round.png`);
  } catch (error) {
    console.error(`❌ Error copying to ${folder}:`, error.message);
  }
});

console.log('\n✨ Android app icons generated successfully!');
console.log('📝 Note: For best results, create properly sized icons:');
console.log('   - mdpi: 48x48px');
console.log('   - hdpi: 72x72px');
console.log('   - xhdpi: 96x96px');
console.log('   - xxhdpi: 144x144px');
console.log('   - xxxhdpi: 192x192px');
