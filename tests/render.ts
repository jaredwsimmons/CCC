// Compile the actual Astro components and render through Astro's Container API.
// Uses the compiler and esbuild already installed by Astro/tsx; no dev server or remote services.
import { transform } from '@astrojs/compiler-rs';
import { build } from 'esbuild';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const modules = new Map<string, Promise<any>>();
async function component(path: string) {
  const filename = resolve(path);
  if (!modules.has(filename)) modules.set(filename, (async () => {
    const result = await build({
      entryPoints: [filename], bundle: true, format: 'esm', platform: 'node', packages: 'external', write: false,
      define: { 'import.meta.env': JSON.stringify({ BASE_URL: '/' }) },
      plugins: [{
        name: 'astro-components',
        setup(builder) {
          builder.onLoad({ filter: /\.astro$/ }, async ({ path }) => {
            const source = await readFile(path, 'utf8');
            const compiled = transform(source, { filename: path, internalURL: 'astro/compiler-runtime', inlineComponentAssets: true, resolvePath: (specifier) => specifier });
            return { contents: compiled.code, loader: 'ts', resolveDir: resolve(path, '..') };
          });
          builder.onResolve({ filter: /^astro:env\/server$/ }, () => ({ path: 'secrets', namespace: 'test-env' }));
          builder.onLoad({ filter: /.*/, namespace: 'test-env' }, () => ({ contents: 'export const ESV_API_KEY = undefined; export const SANITY_API_READ_TOKEN = undefined;', loader: 'js' }));
          builder.onLoad({ filter: /\.css$/ }, () => ({ contents: '', loader: 'js' }));
        },
      }],
    });
    const dir = resolve('node_modules/.cache/ccc-components');
    await mkdir(dir, { recursive: true });
    const out = resolve(dir, `${filename.replace(/[^a-z0-9]/gi, '_')}.mjs`);
    await writeFile(out, result.outputFiles[0].text);
    return (await import(pathToFileURL(out).href)).default;
  })());
  return modules.get(filename)!;
}

export async function render(path: string, props: Record<string, unknown> = {}) {
  const factory = await component(path);
  const container = await AstroContainer.create();
  return container.renderToString(factory, { props, request: new Request('https://chelseachurch.com/') });
}
