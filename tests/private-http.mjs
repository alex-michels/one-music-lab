import test from 'node:test';
import assert from 'node:assert/strict';
import { request as httpRequest } from 'node:http';

assert.ok(process.env.OML_TEST_BASE_URL, 'Set OML_TEST_BASE_URL to an explicit SSH tunnel URL.');
const base = new URL(process.env.OML_TEST_BASE_URL);
assert.equal(base.protocol, 'http:');
assert.equal(base.hostname, '127.0.0.1', 'Only a loopback target is allowed.');
assert.equal(base.pathname, '/');
const request = (path, options = {}) => fetch(new URL(path, base), {
  ...options, redirect: 'error', signal: AbortSignal.timeout(10_000),
});

test('Private staging serves the app with no cookies and privacy headers', async () => {
  const response = await request('/');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  const csp = response.headers.get('content-security-policy');
  assert.ok(csp);
  for (const directive of ["default-src 'self'", "connect-src 'self'", "frame-ancestors 'none'", "object-src 'none'"]) {
    assert.ok(csp.split(';').map((part) => part.trim()).includes(directive), directive);
  }
  const html = await response.text();
  assert.match(html, /<title>OML — One Music Lab<\/title>/);
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)];
  assert.ok(scripts.length > 0);
  for (const [, path] of scripts) {
    assert.equal(new URL(path, base).origin, base.origin);
    const asset = await request(path);
    assert.equal(asset.status, 200, path);
    assert.match(asset.headers.get('content-type'), /javascript/);
    assert.ok((await asset.text()).length > 0);
  }
});

test('Unknown paths and unshipped internal files return 404 instead of app HTML', async () => {
  for (const path of ['/not-a-route', '/.git/config', '/.env', '/.vite/manifest.json', '/server/index.js', '/outputs/vps-deployment-audit.md']) {
    const response = await request(path);
    assert.equal(response.status, 404, path);
    await response.arrayBuffer();
  }
});

test('The file server cannot accept uploads', async () => {
  const response = await request('/', { method: 'POST', body: 'not-an-upload' });
  assert.equal(response.status, 405);
  await response.arrayBuffer();
});

test('An unrelated HTTP Host is rejected', async () => {
  // Fetch can replace a supplied Host header. Send the real wire header here.
  const status = await new Promise((resolve, reject) => {
    const req = httpRequest(base, {
      headers: { Host: 'unrelated.invalid' }, timeout: 10_000,
    }, (res) => {
      res.resume();
      res.on('end', () => resolve(res.statusCode));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('HTTP Host test timed out')));
    req.end();
  });
  assert.equal(status, 421);
});
