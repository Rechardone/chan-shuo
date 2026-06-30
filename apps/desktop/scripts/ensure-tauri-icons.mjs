import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const iconPath = resolve(here, '../src-tauri/icons/icon.png');
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKklEQVR4nO3NMQEAAAgDoJvc6FMCexgJQnK0bQAAAAAAAAAAAAAAwN8GDXgAAXaR65cAAAAASUVORK5CYII=';

mkdirSync(dirname(iconPath), { recursive: true });
writeFileSync(iconPath, Buffer.from(pngBase64, 'base64'));
console.log(`tauri icon ready: ${iconPath}`);
