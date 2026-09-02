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

  // 1. Create .nojekyll in root
  fs.writeFileSync(path.resolve('./.nojekyll'), '');

  if (fs.existsSync(distDir)) {
    // 2. Add .nojekyll and 404.html to dist
    fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
    const distHtml = path.join(distDir, 'index.html');
    if (fs.existsSync(distHtml)) {
      fs.copyFileSync(distHtml, path.join(distDir, '404.html'));
      fs.copyFileSync(distHtml, path.resolve('./404.html'));
    }

    // 3. Copy dist to docs for GitHub Pages docs deployment
    copyFolderSync(distDir, docsDir);
    fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');
    const docsHtml = path.join(docsDir, 'index.html');
    if (fs.existsSync(docsHtml)) {
      fs.copyFileSync(docsHtml, path.join(docsDir, '404.html'));
    }
    console.log('✓ Successfully prepared docs/ and dist/ with .nojekyll & 404.html for GitHub Pages');

    // 4. Copy compiled assets to root assets for root index.html fallback
    const distAssetsDir = path.join(distDir, 'assets');
    if (fs.existsSync(distAssetsDir)) {
      copyFolderSync(distAssetsDir, assetsDir);
      console.log('✓ Successfully copied dist/assets/ to root ./assets/');
    }
  }
} catch (err) {
  console.error('Error during post-build copy:', err);
}

