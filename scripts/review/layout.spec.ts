import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { pages } from '../../tests/pages';

for (const route of pages) {
  test(`${route.name}: layout and screenshots`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(route.path);
    expect.soft(response?.status(), route.path).toBe(200);
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; });
      await Promise.race([
        Promise.all(Array.from(document.images).map((image) => image.decode().catch(() => {}))),
        new Promise((resolve) => setTimeout(resolve, 10_000)),
      ]);
    });
    await mkdir('layout-review/screenshots', { recursive: true });
    await mkdir('layout-review/metrics', { recursive: true });
    const results = [];
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: width > 800 ? 900 : 844 });
      await page.screenshot({ path: `layout-review/screenshots/${route.name}-${width}.jpg`, fullPage: true, type: 'jpeg', quality: 75, animations: 'disabled' });
      const metrics = await page.evaluate(() => {
        const visible = (element: Element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
        const box = (element: Element) => {
          const rect = element.getBoundingClientRect();
          return { x: Math.round(rect.x), y: Math.round(rect.y + scrollY), width: Math.round(rect.width), height: Math.round(rect.height) };
        };
        const style = (element: Element) => {
          const s = getComputedStyle(element);
          return { font: s.fontFamily, size: s.fontSize, weight: s.fontWeight, lineHeight: s.lineHeight, color: s.color, background: s.backgroundColor, radius: s.borderRadius, padding: s.padding };
        };
        const all = (selector: string) => Array.from(document.querySelectorAll(selector)).filter(visible);
        return {
          width: innerWidth,
          overflow: document.documentElement.scrollWidth - innerWidth,
          header: document.querySelector('header') && box(document.querySelector('header')!),
          footer: document.querySelector('footer') && box(document.querySelector('footer')!),
          headings: all('main h1, main h2, main h3').map((element) => ({ text: element.textContent?.trim(), tag: element.tagName, ...box(element), ...style(element) })),
          sections: all('main > section, main > div, main .section').map((element) => ({ class: element.className, title: element.querySelector('h2')?.textContent?.trim(), ...box(element), padding: getComputedStyle(element).padding })),
          buttons: all('main .btn').map((element) => ({ text: element.textContent?.trim(), ...box(element), ...style(element) })),
          brokenImages: Array.from(document.images).filter((image) => image.complete && !image.naturalWidth).map((image) => ({ src: image.getAttribute('src'), alt: image.alt })),
          overflowing: all('main *').filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.width > 2 && (rect.right > innerWidth + 1 || rect.left < -1);
          }).slice(0, 20).map((element) => ({ tag: element.tagName, class: element.className, text: element.textContent?.trim().slice(0, 80), ...box(element) })),
          activeNav: all('header [aria-current="page"]').map((element) => element.textContent?.trim()),
        };
      });
      results.push(metrics);
      expect.soft(metrics.overflow, `${route.path} at ${width}px`).toBeLessThanOrEqual(1);
    }
    await writeFile(`layout-review/metrics/${route.name}.json`, JSON.stringify({ route, errors, results }, null, 2));
    await expect.soft(page.locator('main h1')).toHaveCount(1);
    expect.soft(errors, route.path).toEqual([]);
  });
}
