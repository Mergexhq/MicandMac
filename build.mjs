// build.mjs — esbuild pipeline for Mic & Mac theme TypeScript
import esbuild from 'esbuild';
import chokidar from 'chokidar';

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

if (isDev) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('👀 Watching TypeScript files...');

  chokidar.watch('src/**/*.ts').on('change', (path) => {
    console.log(`✏️  Changed: ${path}`);
  });
} else {
  await esbuild.build(buildOptions);
  console.log('✅ Build complete');
}
