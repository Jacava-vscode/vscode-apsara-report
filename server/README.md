# apsara-report-backend

This repository contains the backend for Apsara Report. The `server/` folder is the canonical backend codebase.

Setup and running locally
1. Copy `server/.env.example` to `server/.env` and update MongoDB URIs and other settings.
2. Install dependencies and start server:

```powershell
Set-Location -LiteralPath 'D:\DEV\Apsara Report\server'
npm install
npm run dev
```

Reconfiguring nested backend (deprecated)
- The helper script `scripts/reconfigure-backend.ps1` previously moved files from a nested `server/server` directory to the canonical `server/` location. This repository now treats `server/` as the canonical backend; please clean nested directories manually if needed. The script is kept as a no-op for backward compatibility but is deprecated.

Database checks
- A helper `server/scripts/check_db.js` checks if all configured clusters are reachable and reports basic usage. It prefers `server/.env` but falls back to the repository root `.env` if not found.

Automating Atlas IP whitelist
- A PowerShell script `scripts/add-atlas-ip.ps1` can be used to add your current public IP (or any specified IP) to a MongoDB Atlas project's Access List so that Atlas clusters accept connections from your machine.

Example usage (local):
```powershell
# Use environment variables to hold Atlas keys securely
$env:ATLAS_PUBLIC_KEY = '<your-public-key>'
$env:ATLAS_PRIVATE_KEY = '<your-private-key>'
.\scripts\add-atlas-ip.ps1 -ProjectId '<your-project-id>'   # adds your public IP
.\scripts\add-atlas-ip.ps1 -ProjectName 'Apsara Project' -Ip '203.0.113.10' -DryRun
```

CI / GitHub Actions example snippet (store keys in repo secrets):
```yaml
- name: Add current IP to Atlas Access List
	uses: actions/powershell@v1
	with:
		script: .\scripts\add-atlas-ip.ps1 -ProjectId ${{ secrets.ATLAS_PROJECT_ID }} -PublicKey $env:ATLAS_PUBLIC_KEY -PrivateKey $env:ATLAS_PRIVATE_KEY
	env:
		ATLAS_PUBLIC_KEY: ${{ secrets.ATLAS_PUBLIC_KEY }}
		ATLAS_PRIVATE_KEY: ${{ secrets.ATLAS_PRIVATE_KEY }}
```

Security notes:
- Do not commit Atlas keys to source control; prefer injection via environment variables or CI secrets.
- Consider adding the IP only temporarily and removing it after use for improved security.

Secrets storage and access
- This repo supports storing plaintext secrets in either the application root (e.g., `./secrets/.env`) or on the host machine at `/etc/secrets/` (Linux/macOS) or a custom path pointed to by the `SECRETS_DIR` environment variable. Files in that directory are read at startup and mapped into environment variables.

How it works:
- `server/load-secrets.js` runs early in server startup and looks for `SECRETS_DIR/.env` or files in the directory. If a file is present, the loader will set `process.env[UPPERCASED_FILENAME]` to the file contents so your code can read it like `process.env.ATLAS_PRIVATE_KEY`.
- The loader respects any environment variables already set unless `SECRETS_OVERRIDE` is set to `true` — this allows CI to take precedence over mounted files.

Local development example:
1. Create a local secrets folder and scaffold an `.env` file:

```powershell
.\scripts\setup-local-secrets.ps1
# or choose ProgramData
.\scripts\setup-local-secrets.ps1 -UseProgramData
```

2. Edit the file `$REPO\secrets\.env` and/or create single-file secrets such as `secrets/ATLAS_PRIVATE_KEY` containing the raw private key.
3. Start the server as usual (the loader runs automatically):

```powershell
Set-Location -LiteralPath 'D:\DEV\Apsara Report\server'
node index.js
```

VS Code workspace convenience
----------------------------
If you're using VS Code, we've added a `.vscode` workspace folder to make working on the backend easier.

- Terminal default working directory is set to `server/`.
- Tasks available in the `Run Task` menu:
	- `Start Backend (prod)` — runs `npm start` in `server/`.
	- `Start Backend (dev)` — runs nodemon dev server.
	- `Check DB` — runs `npm run check-db` from project root.
	- `Update Backend (subtree)` — runs a dry-run subtree split. Replace the -DryRun with real push if you're confident.
- Launch configuration: `Debug Server (index)` will start a debug session that runs `server/index.js` using the dev task.

Open the repository root in VS Code and run these tasks (Ctrl+Shift+P → `Tasks: Run Task`) or use the Run view for the debug configuration.

Open workspace: Multi-root (recommended)
-------------------------------------
To get the most ergonomic VS Code experience, open the provided workspace file `apsara-report.code-workspace` rather than opening the folder directly. This sets the server and client as multi-root workspace items and configures the default terminal to start in `server/`.

1. In VS Code, File → Open Workspace… → select `apsara-report.code-workspace`.
2. Run tasks and debug as usual. The default terminal will be in `server/` and the named workspace folder variables (`${workspaceFolder:server}`) will resolve correctly.

CI example (GitHub Actions): write secret files before starting the app

```yaml
- name: Create secrets
	run: |
		echo "${{ secrets.ATLAS_PRIVATE_KEY }}" > /etc/secrets/ATLAS_PRIVATE_KEY
		echo "${{ secrets.ATLAS_PUBLIC_KEY }}" > /etc/secrets/ATLAS_PUBLIC_KEY
- name: Start app
	run: node server/index.js

Render & remote DB tests
- If you deploy to Render, you can have GitHub Actions poll the Render service and instruct the server to run `check_db` on the server host so you can test connectivity from Render. To enable this flow:

If you want Render to use `server/` as the root directory then set the `Root Directory` in the Render UI to `server`.
If you leave the `Root Directory` blank, the repo root `package.json` is used and the `npm start` script in the repo root will start the server.

NOTE: Some Render setups add `server/` to the start command and end up entering a nested path `server/server/index.js` (see screenshot). If you see the error:

	Error: Cannot find module '/opt/render/project/src/server/server/index.js'

It means Render executed `node server/index.js` from the `server` directory (so it attempted to load `server/server/index.js`).

Fixes:
- Preferred: Set Root Directory to the repo root (leave blank) and use `npm start`.
- If you prefer the `server` folder as root, set Start Command to `npm start` or `node index.js` (NOT `node server/index.js`).
- We added a compatibility wrapper at `server/server/index.js` to delegate to `server/index.js` for misconfigured cases, but the recommended fix is updating the start command.

Backend repo (deprecated)

The repository previously included scripts and GitHub Actions to mirror `server/` to an external backend repo. That automated mirror/push tooling has been removed and replaced with safe no-op stubs to avoid accidental remote writes.

If you need to synchronize `server/` with an external repository, the recommended approach is a manual or PR-based flow (create a subtree split locally, push the resulting branch to the external repo, and open a pull request). This is safer for teams because it avoids force-pushing and preserves reviewability.

If you want, I can add an automated PR-based GitHub Action that:
- creates a subtree branch containing `server/` content,
- pushes that branch to the external repository,
- opens a pull request using the GitHub REST API or `gh` CLI.

Contact me if you want that workflow added; it requires a repository secret (`BACKEND_REPO_PAT`) with minimal `repo` permissions.

PR-based backend update (safer, recommended for teams)
-----------------------------------------------
If you prefer a safer PR-based approach instead of force-pushing to the remote branch:

1. Run subtree split locally to create a branch with the `server/` content:

```powershell
git subtree split --prefix server -b mirror/server-$(Get-Date -Format 'yyyyMMddHHmmss')
```

2. Push this new branch to the external backend repo (no force):

```powershell
git push https://x-access-token:$env:BACKEND_REPO_PAT@github.com/your-org/your-backend.git mirror/server-YYYYMMDDHHMMSS:mirror/server-YYYYMMDDHHMMSS
```

3. Use the remote's web UI or `gh` CLI to create a pull request from `mirror/server-*` into `main` (or your target branch).

4. After the PR is merged, you can delete the mirror branch in the remote repo.

If you want this flow automated in GitHub Actions, I can add a workflow that creates the branch, pushes it, and opens a PR using the GitHub REST API or `gh` CLI (it requires a PAT with repo permissions).

1. Set `INTERNAL_CHECK_TOKEN` as an environment variable for your Render service (this is used to protect the internal endpoint `/api/internal/check-db`).
2. Add the same `INTERNAL_CHECK_TOKEN` value to your GitHub repository secrets (key: `INTERNAL_CHECK_TOKEN`).
3. When your service is up, run the GitHub Action `CI - Check DB on Render after deploy` (Workflow: `check-db-on-deploy.yml`) and provide the Render URL when prompted.

What happens:
- The workflow waits until `https://<render-url>/api/health` returns `200`.
- It then POSTs to `https://<render-url>/api/internal/check-db` with the token; the server then runs `server/scripts/check_db.js` and returns the output.

To run the DB checks manually from the repo root (local) or Render console (if available):

```powershell
Set-Location -LiteralPath 'D:\DEV\Apsara Report'
npm run check-db
```

Manual test script
------------------
There's also a quick test script at the repo root that performs a write/read test against configured clusters (this is more thorough than `check-db` which only checks connection and stats):

```powershell
# From repo root
node test-connection.js

# Or from VS Code: Run Task -> Test Connection (script)
```

The script prints detailed results and exits with nonzero code on failure so you can use it in CI.

Security notes:
- The internal route is protected by `INTERNAL_CHECK_TOKEN` — do not share this token publicly.
- Consider adding IP-based restrictions or a tighter auth method to this endpoint if you enable this on production.

Automatic addition & removal of Render IP
- You can use the included GitHub Actions in `.github/workflows/add-render-ip.yml` and `.github/workflows/remove-render-ip.yml` to add or remove an IP from Atlas.

How to add Render IP via GitHub Actions
1. Add `ATLAS_PUBLIC_KEY` and `ATLAS_PRIVATE_KEY` to your repository secrets.
2. (Optional) Add `RENDER_PUBLIC_IP` to repository secrets — this is the Render service public IP if you know it.
3. Run the `Add Render host IP to Atlas` workflow (accessible from the Actions tab). If you don't provide an IP in the workflow inputs, it will use the `RENDER_PUBLIC_IP` secret.

Auto-removal & TTL
- The `add-render-ip.yml` workflow supports a short-living TTL (set `remove_after_minutes` when dispatching). This constraint is intentionally conservative: the action can sleep up to 60 minutes before removing the IP automatically. This is appropriate for short-time testing; for longer TTLs, run the `Remove Render host IP from Atlas` workflow manually or add a scheduled run.

Notes & security
- The automatic removal step uses the GitHub runner to call the `remove-atlas-ip.ps1` script; it sleeps for `remove_after_minutes` in the workflow — workflows that run for a long time may be canceled, so prefer manual cleanup for large TTLs.
- You can also add a scheduled GitHub Action to check the list and remove any IP matching a known tag or comment.
```

Security notes:
- Do not store secrets in the repository. The `secrets/` directory is ignored by default.
- Limit `SECRETS_DIR` permissions so only the application user can read the files.
