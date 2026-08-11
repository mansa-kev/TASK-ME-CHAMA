# Server Architecture & Deployment Memory

**CRITICAL DEPLOYMENT INFORMATION**

*   **Live App Directory**: `/home/ubuntu/chamasmart-app`
    *   *Do NOT deploy to `/home/ubuntu/taskme-chama`.*
*   **Live Database**: `taskme_chama_prod`
    *   *Do NOT target `taskme_prod`.*
*   **Live PM2 Process**: `chamasmart-backend`
    *   *Do NOT target `taskme-api`.*
*   **Live Domain Configuration**: Nginx uses the configuration file `/etc/nginx/sites-available/chamasmart` which points to `chamasmart-app/frontend/dist`.

**Deployment Script (`deploy.sh`) Requirements:**
1. Any deployment script running on the VPS must `cd ~/chamasmart-app` before building.
2. PM2 restart commands must explicitly target `chamasmart-backend`.
3. Database scripts connecting to the production database must be executed within `~/chamasmart-app/backend` to ensure they read the correct `.env` variables containing the `taskme_chama_prod` database connection.

**How this was discovered (August 7, 2026 Incident):**
Deployments and database migrations were successfully running but the live site (`chamasmart.task-me.ke`) wasn't reflecting changes. It was discovered that previous scripts were pushing updates to a legacy/stale directory (`taskme-chama`), restarting an unused PM2 instance (`taskme-api`), and wiping the wrong database (`taskme_prod`). 

**Agent Instruction**: Whenever an agent is performing a deployment or connecting to the VPS, they MUST read this file first.
