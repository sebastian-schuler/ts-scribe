import { build } from 'bun';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const submodules = readdirSync('./src').filter((dir) => {
  const path = join('./src', dir);
  return statSync(path).isDirectory();
});

await Promise.all(
  submodules.map(async (submodule) => {
    const inputPath = `./src/${submodule}/index.ts`;
    const exists = await Bun.file(inputPath).exists();
    if (exists) {
      // ESM build
      await build({
        entrypoints: [inputPath],
        outdir: './dist',
        target: 'node',
        format: 'esm',
        naming: '[dir]/[name].[ext]',
        root: './src',
      });

      // CJS build
      await build({
        entrypoints: [inputPath],
        outdir: './dist/cjs',
        target: 'node',
        format: 'cjs',
        naming: '[dir]/[name].[ext]',
        root: './src',
      });
    }
  }),
);
