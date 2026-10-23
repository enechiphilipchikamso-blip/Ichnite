import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, test } from 'node:test';

import { createSafeFetch, UpstreamError } from '../lib/upstream-fetch.js';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getFreePort() {
  const socket = net.createServer();
  await new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.listen(0, '127.0.0.1', resolve);
  });
  const { port } = socket.address();
  await new Promise((resolve, reject) => socket.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function requestJson(baseUrl, route, options = {}) {
  const response = await fetch(new URL(route, baseUrl), options);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { response, body, text };
}

test('safe upstream fetch bounds requests and redacts provider details', async (t) => {
  await t.test('uses a timeout, redirect cap, and response-size cap', async () => {
    let observedOptions;
    const safeFetch = createSafeFetch(async (_url, options) => {
      observedOptions = options;
      return {
        ok: true,
        status: 200,
        json: async () => ({ ok: true }),
      };
    });

    assert.deepEqual(
      await safeFetch('https://provider.example/api/data?api-key=not-a-real-secret'),
      { ok: true }
    );
    assert.equal(observedOptions.follow, 5);
    assert.equal(observedOptions.size, 10 * 1024 * 1024);
    assert.ok(observedOptions.signal instanceof AbortSignal);
  });

  await t.test('rejects non-HTTPS and invalid upstream URLs without echoing them', async () => {
    const safeFetch = createSafeFetch(async () => {
      throw new Error('fetch must not be called for an invalid URL');
    });

    await assert.rejects(
      safeFetch('http://provider.example/private'),
      (error) => {
        assert.ok(error instanceof UpstreamError);
        assert.equal(error.message, 'Upstream URL must use HTTPS.');
        assert.doesNotMatch(error.message, /private/);
        return true;
      }
    );
    await assert.rejects(
      safeFetch('not a URL with token=top-secret'),
      (error) => {
        assert.ok(error instanceof UpstreamError);
        assert.equal(error.message, 'Invalid upstream URL.');
        assert.doesNotMatch(error.message, /top-secret/);
        return true;
      }
    );
  });

  await t.test('sanitizes network errors while preserving only known classification codes', async () => {
    const safeFetch = createSafeFetch(async () => {
      const error = new Error(
        'request to https://beta.helius-rpc.com/?api-key=secret-marker failed'
      );
      error.code = 'ECONNRESET';
      throw error;
    });

    await assert.rejects(
      safeFetch('https://beta.helius-rpc.com/?api-key=secret-marker'),
      (error) => {
        assert.equal(error.message, 'Upstream request failed');
        assert.equal(error.code, 'ECONNRESET');
        assert.doesNotMatch(error.message + error.stack, /secret-marker/);
        assert.equal(Object.hasOwn(error, 'cause'), false);
        return true;
      }
    );
  });

  await t.test('does not copy arbitrary transport error codes or messages', async () => {
    const safeFetch = createSafeFetch(async () => {
      const error = new Error('token=secret-marker');
      error.code = 'UNTRUSTED_SECRET_CODE';
      throw error;
    });

    await assert.rejects(
      safeFetch('https://provider.example/data'),
      (error) => {
        assert.equal(error.message, 'Upstream request failed');
        assert.equal(error.code, undefined);
        assert.doesNotMatch(error.message + error.stack, /secret-marker|UNTRUSTED_SECRET_CODE/);
        return true;
      }
    );
  });

  await t.test('reports a bounded timeout without exposing the requested URL', async () => {
    const safeFetch = createSafeFetch(
      (_url, options) => new Promise((resolve, reject) => {
        const abort = () => reject(options.signal.reason);
        if (options.signal.aborted) return abort();
        options.signal.addEventListener('abort', abort, { once: true });
      }),
      20
    );

    await assert.rejects(
      safeFetch('https://provider.example/?api-key=secret-marker'),
      (error) => {
        assert.equal(error.name, 'TimeoutError');
        assert.equal(error.code, 'ETIMEDOUT');
        assert.equal(error.message, 'Upstream request timed out');
        assert.doesNotMatch(error.message + error.stack, /secret-marker/);
        return true;
      }
    );
  });

  await t.test('retains upstream HTTP status without retaining URL or provider text', async () => {
    const safeFetch = createSafeFetch(async () => ({
      ok: false,
      status: 503,
      statusText: 'secret-marker',
      json: async () => ({}),
    }));

    await assert.rejects(
      safeFetch('https://provider.example/?api-key=secret-marker'),
      (error) => {
        assert.ok(error instanceof UpstreamError);
        assert.equal(error.status, 503);
        assert.equal(error.message, 'Upstream responded with HTTP 503');
        assert.doesNotMatch(error.message + error.stack, /secret-marker/);
        return true;
      }
    );
  });

  await t.test('sanitizes invalid JSON responses', async () => {
    const safeFetch = createSafeFetch(async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('unexpected content: secret-marker');
      },
    }));

    await assert.rejects(
      safeFetch('https://provider.example/data'),
      (error) => {
        assert.ok(error instanceof UpstreamError);
        assert.equal(error.status, 200);
        assert.equal(error.message, 'Upstream response was not valid JSON.');
        assert.doesNotMatch(error.message + error.stack, /secret-marker/);
        return true;
      }
    );
  });
});

test('production HTTP controls reject bad input, protect logs, and preserve rate-limit exemptions', { timeout: 45_000 }, async (t) => {
  const port = await getFreePort();
  const baseUrl = 'http://127.0.0.1:' + port;
  const capturedOutput = { value: '' };
  const emptySecretVariables = [
    'HELIUS_API_KEY',
    'HELIUS_BARCHART_TRANSACTION_API_KEY',
    'SHYFT_API_KEY',
    'COINGECKO_API_KEY',
    'CMC_API_KEY',
    'JUPITER_API_KEY',
    'BREVO_API_KEY',
    'RESEND_API_KEY',
    'FEEDBACK_RECIPIENT_EMAIL',
    'BREVO_SENDER_EMAIL',
    'RESEND_SENDER_EMAIL',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ];
  const childEnvironment = {
    ...process.env,
    PORT: String(port),
    NODE_ENV: 'production',
    TRUST_PROXY: 'false',
    DEBUG_TRUST_PROXY: 'true',
    ALLOWED_ORIGINS: 'https://allowed.example',
    CODESPACE_NAME: '',
    REDIS_KEY_PREFIX: 'ichnite:test-rate-limit:',
    FEEDBACK_REDIS_KEY_PREFIX: 'ichnite:test-feedback:',
  };
  for (const name of emptySecretVariables) childEnvironment[name] = '';

  const server = spawn(process.execPath, [path.join(REPOSITORY_ROOT, 'server.js')], {
    cwd: REPOSITORY_ROOT,
    env: childEnvironment,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const collectOutput = (chunk) => {
    capturedOutput.value = (capturedOutput.value + chunk.toString()).slice(-30_000);
  };
  server.stdout.on('data', collectOutput);
  server.stderr.on('data', collectOutput);

  const stopServer = async () => {
    if (server.exitCode !== null || server.signalCode !== null) return;
    const exitPromise = once(server, 'exit');
    server.kill('SIGTERM');
    await Promise.race([exitPromise, sleep(2_000)]);
    if (server.exitCode === null && server.signalCode === null) server.kill('SIGKILL');
  };
  t.after(stopServer);

  let ready = false;
  const deadline = Date.now() + 12_000;
  while (Date.now() < deadline && server.exitCode === null) {
    try {
      const result = await requestJson(baseUrl, '/api/ping');
      if (result.response.status === 200 && result.body?.ok === true) {
        ready = true;
        break;
      }
    } catch {
      // Startup may take a moment while Node resolves the locked dependencies.
    }
    await sleep(100);
  }
  assert.equal(
    ready,
    true,
    'server did not become ready; captured output: ' + capturedOutput.value
  );

  await t.test('health and rate-limit status endpoints are exempt from counted requests', async () => {
    const health = await requestJson(baseUrl, '/api/ping');
    assert.equal(health.response.status, 200);
    assert.deepEqual(health.body, { ok: true });

    const before = await requestJson(baseUrl, '/api/rate-limit-status');
    assert.equal(before.response.status, 200);
    assert.equal(before.body.remaining, 100);

    const invalid = await requestJson(baseUrl, '/api/tokens?address=not-a-valid-wallet');
    assert.equal(invalid.response.status, 400);

    const after = await requestJson(baseUrl, '/api/rate-limit-status');
    assert.equal(after.response.status, 200);
    assert.equal(after.body.remaining, 99);
  });

  await t.test('feedback validation preserves empty and honeypot behavior', async () => {
    const empty = await requestJson(baseUrl, '/api/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ feedback: '   ' }),
    });
    assert.equal(empty.response.status, 400);
    assert.equal(empty.body.code, 'empty-feedback');

    const honeypot = await requestJson(baseUrl, '/api/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ feedback: 'A normal product comment', website: 'filled-by-bot' }),
    });
    assert.equal(honeypot.response.status, 200);
    assert.deepEqual(honeypot.body, { success: true });
  });

  await t.test('rejects an unapproved origin without logging its value', async () => {
    const result = await requestJson(baseUrl, '/api/tokens?address=not-a-valid-wallet', {
      headers: { Origin: 'https://untrusted.example' },
    });
    assert.equal(result.response.status, 403);
  });

  await t.test('ignores development proxy diagnostics in production', async () => {
    const marker = '198.51.100.77';
    const result = await requestJson(baseUrl, '/api/tokens?address=not-a-valid-wallet', {
      headers: { 'x-forwarded-for': marker },
    });
    assert.equal(result.response.status, 400);
  });

  await t.test('returns safe body-parser errors for malformed and oversized JSON', async () => {
    const malformed = await requestJson(baseUrl, '/api/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{',
    });
    assert.equal(malformed.response.status, 400);
    assert.deepEqual(malformed.body, { error: 'Invalid JSON request body.' });

    const oversized = await requestJson(baseUrl, '/api/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ feedback: 'x'.repeat(110 * 1024) }),
    });
    assert.equal(oversized.response.status, 413);
    assert.deepEqual(oversized.body, { error: 'Request body is too large.' });
  });

  await t.test('enforces the shared request limit while keeping health/status reachable', async () => {
    let sawRateLimit = false;
    for (let index = 0; index < 110; index += 1) {
      const result = await requestJson(baseUrl, '/api/tokens?address=invalid');
      if (result.response.status === 429) {
        sawRateLimit = true;
        break;
      }
      assert.equal(result.response.status, 400);
    }
    assert.equal(sawRateLimit, true);

    const health = await requestJson(baseUrl, '/api/ping');
    assert.equal(health.response.status, 200);
    assert.deepEqual(health.body, { ok: true });

    const status = await requestJson(baseUrl, '/api/rate-limit-status');
    assert.equal(status.response.status, 200);
    assert.equal(status.body.rateLimited, true);
    assert.equal(status.body.remaining, 0);
  });

  assert.doesNotMatch(capturedOutput.value, /https:\/\/untrusted\.example/);
  assert.doesNotMatch(capturedOutput.value, /198\.51\.100\.77/);
});
