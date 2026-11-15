// Compile the actual Astro components and render through Astro's Container API.
// Uses the compiler and esbuild already installed by Astro/tsx; no dev server or remote services.
import { transform } from '@astrojs/compiler-rs';
import { build } from 'esbuild';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const modules = new Map<string, Promise<any>>();
async function component(path: string, documents?: unknown[]) {
  const filename = resolve(path);
  const key = filename + (documents ? createHash('sha256').update(JSON.stringify(documents)).digest('hex') : '');
  if (!modules.has(key)) modules.set(key, (async () => {
    const result = await build({
      entryPoints: [filename], bundle: true, format: 'esm', platform: 'node', packages: 'external', write: false,
      define: { 'import.meta.env': JSON.stringify({ BASE_URL: '/' }) },
      plugins: [{
        name: 'astro-components',
        setup(builder) {
          if (documents) builder.onLoad({ filter: /[\\/]data[\\/]migration\.ts$/ }, () => ({ contents: `export const buildDocuments = () => ${JSON.stringify(documents)};`, loader: 'ts' }));
          builder.onLoad({ filter: /\.astro$/ }, async ({ path }) => {
            const source = await readFile(path, 'utf8');
            const compiled = transform(source, { filename: path, internalURL: 'astro/compiler-runtime', inlineComponentAssets: true, resolvePath: (specifier) => specifier });
            return { contents: compiled.code, loader: 'ts', resolveDir: resolve(path, '..') };
          });
          builder.onResolve({ filter: /^astro:env\/server$/ }, () => ({ path: 'secrets', namespace: 'test-env' }));
          builder.onLoad({ filter: /.*/, namespace: 'test-env' }, () => ({ contents: 'export const ESV_API_KEY = undefined; export const SANITY_API_READ_TOKEN = undefined; export const YOUTUBE_API_KEY = undefined;', loader: 'js' }));
          builder.onLoad({ filter: /\.css$/ }, () => ({ contents: '', loader: 'js' }));
        },
      }],
    });
    const dir = resolve('node_modules/.cache/ccc-components');
    await mkdir(dir, { recursive: true });
    const out = resolve(dir, `${key.replace(/[^a-z0-9]/gi, '_')}.mjs`);
    await writeFile(out, result.outputFiles[0].text);
    return (await import(pathToFileURL(out).href)).default;
  })());
  return modules.get(key)!;
}

export async function render(path: string, props: Record<string, unknown> = {}, documents?: unknown[]) {
  const factory = await component(path, documents);
  const container = await AstroContainer.create();
  return container.renderToString(factory, { props, request: new Request('https://chelseachurch.com/') });
}
