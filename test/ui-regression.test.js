import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readPublicFile(relativePath) {
  return readFile(path.join(ROOT, 'public', relativePath), 'utf8');
}

test('mobile wallet search keeps its accessible clear action available when populated', async () => {
  const [html, css] = await Promise.all([
    readPublicFile('index.html'),
    readPublicFile('css/style.css'),
  ]);

  assert.match(
    html,
    /<button\s+id="clearBtn"\s+class="clear-btn hidden"\s+type="button"\s+aria-label="Clear wallet address"/s
  );
  assert.doesNotMatch(
    css,
    /\.search-box\s+\.clear-btn\s*\{\s*display:\s*none\s*!important;/s
  );
  assert.match(
    css,
    /\.search-box\s+\.clear-btn\s*\{\s*position:\s*absolute;\s*top:\s*29px;\s*right:\s*12px;\s*width:\s*44px;\s*height:\s*44px;/s
  );
  assert.match(
    css,
    /:where\(button, a, input, textarea, select, \[role="button"\], \[role="option"\]\):focus-visible/
  );
  assert.match(css, /\.hidden\s*\{\s*display:\s*none\s*!important;/);
});

test('cached stylesheet updates are paired with a new service-worker cache version', async () => {
  const serviceWorker = await readPublicFile('sw.js');
  assert.match(serviceWorker, /const CACHE_VERSION = 'Ichnite-v154';/);
  assert.match(serviceWorker, /\$\{BASE_PATH\}css\/style\.css/);
});
