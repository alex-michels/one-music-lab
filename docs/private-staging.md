# Private staging

The owner permits a private VPS preview. Public release is blocked by ROADMAP
P10, P00/P04 and the first topic's G gate. A merged PR does not authorize public
deployment. The public GitHub repository and website access are separate settings.

## Build and artifact boundary

Keep the existing Sites development workflow (`npm run dev`) and Worker target
(`npm run build`). The portable target is:

```sh
npm ci
npm run build:static
npm run test:static
```

Vinext's static mode prerenders `/` and a 404 document into `dist/client`.
The four existing sections are hash links on `/`; they do not require an SPA
fallback. Future lesson paths need their own export and refresh tests. This
target skips Sites and Cloudflare plugins and needs no hosting credentials.
Build modes share `dist`; run them sequentially, never concurrently.

On Windows with Node 24.18.0 / Vinext 1.0.0-beta.5, static prerender currently
finishes writing files but the CLI crashes during native process shutdown
(`UV_HANDLE_CLOSING`), both inside and outside the sandbox. That is a failed
build. Do not ignore its exit code or deploy those files. Use the successful
Linux GitHub Actions artifact for staging. Windows development and the separate
Worker build remain available; resolving the Windows static build is P04 work.

The CI workflow tests both targets and packages **only** these paths:

```sh
mkdir -p outputs
tar -czf outputs/one-music-lab-static.tgz -C dist/client index.html index.rsc 404.html favicon.svg _next -C ../.. LICENSE NOTICE CONTENT-LICENSE.md THIRD-PARTY-NOTICES.md LICENSES
cd outputs
sha256sum one-music-lab-static.tgz > one-music-lab-static.tgz.sha256
```

The `static-staging` Actions artifact contains that archive and checksum. Check
the exact run, branch and commit before downloading; a checksum alone does not
establish trusted provenance. No workflow connects to the VPS or deploys a site.
Do not package the repository, entire `dist`, `.vite`, Worker server, `.openai`,
`.env`, `outputs`, source maps, `node_modules`, private audits or CI credentials.
The included notices are provisional; the complete bundled-license audit is P10.

## Access design

Use the separate `deploy/Caddyfile.private` in its own unprivileged process.
Its HTTP listener and explicit bind are **127.0.0.1:8098 only**. `admin off`
prevents a second Caddy admin endpoint; `persist_config off` prevents overwriting
another instance's autosave. Automatic HTTPS is off because encryption and
authentication are provided by SSH. It does not use ports 80/443 or a domain.

Set `OML_STATIC_ROOT` to the absolute path of an isolated, read-only release
directory. Validate before starting:

```sh
OML_STATIC_ROOT=/absolute/private/release caddy validate --config deploy/Caddyfile.private --adapter caddyfile
OML_STATIC_ROOT=/absolute/private/release caddy run --config deploy/Caddyfile.private --adapter caddyfile
```

These are examples, not this owner's server settings. Keep the actual host,
user, paths, systemd unit, checksums, service snapshots and rollback commands in
ignored local `outputs/`. Recheck port/path availability first. Never alter
shared Caddy, existing bots, Compose projects, firewall, SSH policy or DNS.
Run with resource limits and no additional privileges. Trusted local VPS users
can reach loopback; this design is not isolation from the server administrator.

Use a local SSH alias and tunnel, replacing `YOUR_SSH_ALIAS` with your own alias:

```sh
ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:8098:127.0.0.1:8098 YOUR_SSH_ALIAS
```

Then visit `http://127.0.0.1:8098/`. Stop the tunnel with Ctrl+C. If the local
port is occupied, change only the first `8098`, and use that port in the URL.
Do not use `-g`, bind the tunnel to all interfaces, or add a public reverse proxy.
`noindex` and `no-store` headers are extra controls, not authentication.

## Verify and roll back

Run through the SSH tunnel, with `OML_TEST_BASE_URL` set as in the README:

```sh
OML_TEST_BASE_URL=http://127.0.0.1:8098 npm run test:site
OML_TEST_BASE_URL=http://127.0.0.1:8098 npm run test:private
```

PowerShell: `$env:OML_TEST_BASE_URL = 'http://127.0.0.1:8098'`, then run both npm
commands. Checks cover identity, assets, privacy headers, missing/private paths,
rejected uploads and unrelated Host headers. Also verify with `ss -ltn` that the
only added listener is loopback; inspect public interfaces separately. HTTP
tests cannot prove network isolation. Compare existing service states before
and after. Browser hydration, audio, storage and accessibility still need their
P00/G validation; HTTP success alone does not certify them.

Keep versioned release directories and a previous release. Stop only the OML
private process, switch its root to the retained release, start it and rerun the
checks. For the first deployment, rollback is stopping only that new process;
leave its directory for inspection. Do not delete or move shared server paths.

Technical references: [Vinext](https://github.com/cloudflare/vinext),
[Caddy bind](https://caddyserver.com/docs/caddyfile/directives/bind) and
[Caddy global options](https://caddyserver.com/docs/caddyfile/options).
