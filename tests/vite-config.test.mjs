import { test } from 'vitest';
import assert from 'node:assert/strict';
import config from '../vite.config.ts';

const WRANGLER_VARS = [
  'WRANGLER_WRITE_LOGS',
  'WRANGLER_LOG_PATH',
  'MINIFLARE_REGISTRY_PATH',
];

/** Runs the config factory with a clean environment and restores it after. */
async function resolve(mode, preset = {}) {
  const saved = Object.fromEntries(
    WRANGLER_VARS.map((name) => [name, process.env[name]]),
  );
  try {
    for (const name of WRANGLER_VARS) delete process.env[name];
    Object.assign(process.env, preset);
    const resolved = await config({
      mode,
      command: 'build',
      isSsrBuild: false,
    });
    // A plugin list can hold falsy entries and unnamed hooks; only named
    // plugins say which target was configured.
    const plugins = resolved.plugins
      .flat(Infinity)
      .map((plugin) => plugin?.name)
      .filter((name) => typeof name === 'string');
    const environment = Object.fromEntries(
      WRANGLER_VARS.map((name) => [name, process.env[name]]),
    );
    return { resolved, plugins, environment };
  } finally {
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

test('The static target loads no hosting plugin and needs no hosting state', async () => {
  const { resolved, plugins, environment } = await resolve('static');

  assert.ok(
    plugins.some((name) => name.startsWith('vinext:')),
    'the framework itself still builds the pages',
  );
  assert.equal(
    plugins.filter((name) => name === 'sites').length,
    0,
    'the portable artifact must not carry the Sites plugin',
  );
  assert.equal(
    plugins.filter((name) => name.startsWith('vite-plugin-cloudflare')).length,
    0,
    'the portable artifact must not carry the Cloudflare plugin',
  );
  assert.deepEqual(
    environment,
    {
      WRANGLER_WRITE_LOGS: undefined,
      WRANGLER_LOG_PATH: undefined,
      MINIFLARE_REGISTRY_PATH: undefined,
    },
    'building the portable artifact must not create Wrangler state',
  );
  assert.ok(
    resolved.css.postcss.plugins.length > 0,
    'the stylesheet is still processed',
  );
});

test('The Worker target loads the hosting plugins and keeps its state local', async () => {
  const { plugins, environment } = await resolve('production');

  assert.ok(plugins.includes('sites'), 'the Sites plugin is present');
  assert.ok(
    plugins.some((name) => name.startsWith('vite-plugin-cloudflare')),
    'the Cloudflare plugin is present',
  );
  assert.deepEqual(environment, {
    WRANGLER_WRITE_LOGS: 'false',
    WRANGLER_LOG_PATH: '.wrangler/logs',
    MINIFLARE_REGISTRY_PATH: '.wrangler/registry',
  });
});

test('An operator setting for Wrangler state is not overwritten', async () => {
  const { environment } = await resolve('production', {
    WRANGLER_LOG_PATH: '/tmp/oml-wrangler-logs',
  });

  assert.equal(environment.WRANGLER_LOG_PATH, '/tmp/oml-wrangler-logs');
  assert.equal(environment.WRANGLER_WRITE_LOGS, 'false');
});
