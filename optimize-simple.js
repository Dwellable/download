#!/usr/bin/env node

const fs = require('fs');

// Check if dependencies are available
let minify;
try {
  ({ minify } = require('html-minifier-terser'));
} catch (error) {
  console.log('📦 Please install dependencies: npm install');
  process.exit(1);
}

async function optimizeHTML() {
  console.log('📄 Optimizing HTML...');
  
  const minifyOptions = {
    removeComments: true,
    collapseWhitespace: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    minifyCSS: true,
    minifyJS: true
  };
  
  // Optimize index.html
  const html = fs.readFileSync('index.html', 'utf8');
  const minified = await minify(html, minifyOptions);
  
  // Keep original for comparison, then replace with minified
  fs.writeFileSync('index.original.html', html);
  fs.writeFileSync('index.html', minified);
  
  // Create gzipped version
  const zlib = require('zlib');
  const gzipped = zlib.gzipSync(minified);
  fs.writeFileSync('index.html.gz', gzipped);
  
  // Optimize join.html if it exists
  if (fs.existsSync('join.html')) {
    const joinHtml = fs.readFileSync('join.html', 'utf8');
    const joinMinified = await minify(joinHtml, minifyOptions);
    
    // Keep original for comparison, then replace with minified
    fs.writeFileSync('join.original.html', joinHtml);
    fs.writeFileSync('join.html', joinMinified);
    
    const joinGzipped = zlib.gzipSync(joinMinified);
    fs.writeFileSync('join.html.gz', joinGzipped);
    console.log('✅ join.html optimized and minified');
  }
  
  console.log('✅ HTML files optimized and minified');
  
  // Show size comparison for index.html
  const originalSize = fs.statSync('index.original.html').size;
  const minifiedSize = fs.statSync('index.html').size;
  const gzippedSize = fs.statSync('index.html.gz').size;
  
  console.log(`📊 index.html size comparison:`);
  console.log(`   Original:  ${(originalSize / 1024).toFixed(1)} KB`);
  console.log(`   Minified:  ${(minifiedSize / 1024).toFixed(1)} KB (${((1 - minifiedSize/originalSize) * 100).toFixed(1)}% smaller)`);
  console.log(`   Gzipped:   ${(gzippedSize / 1024).toFixed(1)} KB (${((1 - gzippedSize/originalSize) * 100).toFixed(1)}% smaller)`);
  
  // Show size comparison for join.html if it exists
  if (fs.existsSync('join.original.html')) {
    const joinOriginalSize = fs.statSync('join.original.html').size;
    const joinMinifiedSize = fs.statSync('join.html').size;
    const joinGzippedSize = fs.statSync('join.html.gz').size;
    
    console.log(`📊 join.html size comparison:`);
    console.log(`   Original:  ${(joinOriginalSize / 1024).toFixed(1)} KB`);
    console.log(`   Minified:  ${(joinMinifiedSize / 1024).toFixed(1)} KB (${((1 - joinMinifiedSize/joinOriginalSize) * 100).toFixed(1)}% smaller)`);
    console.log(`   Gzipped:   ${(joinGzippedSize / 1024).toFixed(1)} KB (${((1 - joinGzippedSize/joinOriginalSize) * 100).toFixed(1)}% smaller)`);
  }
}

function createServiceWorker() {
  console.log('🔧 Creating service worker...');
  
  // A kill switch, not a cache. An earlier version cached '/' cache-first under a fixed name, so
  // browsers that registered it kept showing the old homepage. This one clears those caches,
  // unregisters itself and reloads open pages from the network. Nothing registers a worker now.
  const sw = `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.registration.unregister();
    const windows = await self.clients.matchAll({ type: 'window' });
    windows.forEach(w => w.navigate(w.url));
  })());
});`;
  
  fs.writeFileSync('sw.js', sw);
  console.log('✅ Service worker kill switch written (sw.js)');
}

async function main() {
  console.log('🚀 Starting Dwellable website optimization...\n');
  
  try {
    await optimizeHTML();
    createServiceWorker();
    
    console.log('\n🎉 Optimization complete!');
    console.log('\n📋 What was optimized:');
    console.log('   ✅ HTML minified and gzipped');
    console.log('   ✅ Service worker kill switch (sw.js)');
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Use index.min.html instead of index.html');
    console.log('   2. Upload .htaccess to your web server');
    console.log('   4. Test with Chrome DevTools > Lighthouse');
    
  } catch (error) {
    console.error('❌ Optimization failed:', error.message);
    process.exit(1);
  }
}

main();