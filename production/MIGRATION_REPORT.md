# Migration Report: Firebase to Private Oracle Server

> **Objective**: Migrate `childcarebusinessplan.com` (Astro frontend) from Firebase Hosting to your private Oracle Cloud server (`150.136.42.8`), served alongside ERPNext via Caddy and Docker.

---

## 1. Executive Summary

**Selected Architecture**: **Node.js Server (SSR)**
**Reasoning**: Your project uses `@astrojs/node` adapter and contains server-side API routes (e.g., `api/capture-lead`). These require a running Node.js process, not just a static web server.

**Difficulty Level**: 🟡 **Medium**
**Estimated Time**: 2-3 hours

---

## 2. Target Architecture

| Feature | Implementation |
| :--- | :--- |
| **Runtime** | Docker Container (`node:20-alpine`) |
| **Entry Point** | `node dist/server/entry.mjs` (Standard Astro Node Adapter output) |
| **Routing** | Caddy Reverse Proxy (`childcarebusinessplan.com` -> Node Container :4321) |
| **Updates** | Git Push -> CI/CD Build -> Restart Container |

---

## 3. Required Implementation Steps

### Step 1: Dockerfile for Node.js SSR
We will create a specific Dockerfile that builds the Astro project and runs the Node server.

**Proposed `Dockerfile`:**
```dockerfile
FROM node:20-alpine AS runtime
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
```

### Step 2: Update Server Configuration

**Update `docker-compose.yml`:**
```yaml
  # ... existing services ...
  astro-site:
    build: .
    container_name: astro-site
    restart: unless-stopped
    ports:
      - "4321:4321" 
    environment:
      - HOST=0.0.0.0
      - PORT=4321
      # Add any other env vars here (FRAPPE_URL, etc.)
    networks:
      - frappe_docker_default
```

**Update `Caddyfile`:**
```caddy
childcarebusinessplan.com, www.childcarebusinessplan.com {
    reverse_proxy astro-site:4321
}

portal.childcarebusinessplan.com {
    # ... existing config ...
}
```

### Step 3: Deployment Pipeline

**Recommended Workflow**:
1. **Local**: You commit changes to Git.
2. **Server**: We add a script `deploy.sh` on the server:
   ```bash
   cd /opt/ccbusinessplan
   git pull origin main
   docker compose up -d --build astro-site
   ```

---

## 4. Next Steps
1. Create the `Dockerfile` in the project root.
2. Verify the `docker-compose.yml` on the server (I will provide the snippet to add).
3. Test the build locally if you wish (optional).
4. Deploy.

**Decision Needed**: Do you approve the Node.js Dockerfile approach?
