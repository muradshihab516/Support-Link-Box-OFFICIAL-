import fs from 'fs';
import path from 'path';

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

try {
  const distDir = path.resolve('./dist');
  const docsDir = path.resolve('./docs');
  const assetsDir = path.resolve('./assets');

  if (fs.existsSync(distDir)) {
    // 1. Copy dist to docs for GitHub Pages docs deployment
    copyFolderSync(distDir, docsDir);
    console.log('✓ Successfully copied dist/ to docs/ for GitHub Pages');

    // 2. Copy compiled assets to root assets for root index.html fallback
    const distAssetsDir = path.join(distDir, 'assets');
    if (fs.existsSync(distAssetsDir)) {
      copyFolderSync(distAssetsDir, assetsDir);
      console.log('✓ Successfully copied dist/assets/ to root ./assets/');
    }
  }
} catch (err) {
  console.error('Error during post-build copy:', err);
}
