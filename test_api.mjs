import { mkdir, writeFile } from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DIAGNOSTICS_DIR = path.join(PROJECT_DIR, 'diagnostics');
const OUTPUT_FILE = path.join(DIAGNOSTICS_DIR, 'api_diagnostic.json');
const REQUEST_TIMEOUT_MS = 10_000;

const URLS = [
  'https://myembed.xyz/api.php?format=json',
  'https://cors.eu.org/https://myembed.xyz/api.php?format=json',
  'https://api.codetabs.com/v1/proxy/?quest=https%3A%2F%2Fmyembed.xyz%2Fapi.php%3Fformat%3Djson',
];

function fetchUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(
      url,
      {
        headers: {
          Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
          'User-Agent': 'sports-streaming-site-diagnostic/1.0',
        },
      },
      (response) => {
        const chunks = [];

        response.on('data', (chunk) => {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        });

        response.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          resolve({
            status: response.statusCode ?? 0,
            content_preview: body.slice(0, 300),
            contains_events_key: body.includes('"events"'),
          });
        });
      },
    );

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(new Error(`Timeout after ${REQUEST_TIMEOUT_MS / 1000}s`));
    });

    request.on('error', (error) => {
      resolve({
        error: error instanceof Error ? error.message : String(error),
      });
    });
  });
}

async function main() {
  await mkdir(DIAGNOSTICS_DIR, { recursive: true });
  const results = {};

  for (const url of URLS) {
    console.log(`Test de : ${url}`);
    results[url] = await fetchUrl(url);
  }

  await writeFile(OUTPUT_FILE, `${JSON.stringify(results, null, 2)}\n`, 'utf8');
  console.log(`\nDiagnostic termine. Fichier cree : ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
