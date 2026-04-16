// build.mjs — esbuild pipeline for Mic & Mac theme TypeScript
import esbuild from 'esbuild';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';

const isDev = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: {
    'assets/theme': 'src/theme.ts',
    'assets/cart': 'src/modules/cart.ts',
    'assets/hero-parallax': 'src/modules/hero-parallax.ts',
  },
  bundle: true,
  minify: !isDev,
  sourcemap: isDev ? 'inline' : false,
  target: ['es2020'],
  format: 'iife',
  outdir: '.',
  logLevel: 'info',
};

// Helper: Flatten and copy assets from our source folders
function copyAssets() {
  const folders = ['src/images', 'src/icons', 'src/css'];
  if (!fs.existsSync('assets')) fs.mkdirSync('assets');
  folders.forEach(folder => {
    if (fs.existsSync(folder)) {
      const files = fs.readdirSync(folder);
      files.forEach(file => {
        const sourcePath = path.join(folder, file);
        if (fs.statSync(sourcePath).isFile()) {
          fs.copyFileSync(sourcePath, path.join('assets', file));
        }
      });
    }
  });
  console.log('✅ Local static assets copied to assets/');
}

if (isDev) {
  copyAssets(); // Initial bulk copy
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('👀 Watching TypeScript files...');

  chokidar.watch('src/**/*.ts').on('change', (changedPath) => {
    console.log(`✏️  Changed: ${changedPath}`);
  });

  // Watch for static asset changes and instantly sync them
  chokidar.watch(['src/images', 'src/icons', 'src/css']).on('all', (event, targetPath) => {
    if (event === 'add' || event === 'change') {
      try {
        if (fs.statSync(targetPath).isFile()) {
          const filename = path.basename(targetPath);
          fs.copyFileSync(targetPath, path.join('assets', filename));
          console.log(`📁 Synced asset: ${filename}`);
        }
      } catch (err) {
        // file might be deleted
      }
    }
  });
} else {
  copyAssets();
  await esbuild.build(buildOptions);
  console.log('✅ Build complete');
}
