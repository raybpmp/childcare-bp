# Server Access & Management Guide

> [!NOTE]
> This is the new "Headquarters" for server operations.
> **Server IP**: `150.136.42.8` (Oracle Cloud ARM64)
> **User**: `ubuntu`

## 1. SSH Access

The original key is in `production/server_key.pem`, but the workspace filesystem (fuseblk) does not support the mandatory `chmod 600` permissions. 

**STABLE KEY LOCATION:** `/home/leader/.ssh/childcare_server_key.pem`

**Connect:**
```bash
# Recommended stable command:
ssh -i /home/leader/.ssh/childcare_server_key.pem ubuntu@150.136.42.8
```

## 2. Production Environment (Triple Stack)

The new Triple Stack (ERPNext + CRM + LMS) is managed via Docker Compose in the standard `frappe_docker` infrastructure.

### Location on Server
We will deploy the `production_launch` files to:
`/opt/ccbusinessplan/`

### Credentials

| Service | User | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Server SSH** | `ubuntu` | *(Key Auth)* | Use `/home/leader/.ssh/childcare_server_key.pem` |
| **MariaDB Root** | `root` | `@sodium1223` | Defined in `custom.env` |
| **ERPNext Admin** | `Administrator` | `@sodium1223` | https://portal.childcarebusinessplan.com |
| **Triple Stack** | - | - | ERPNext 16.0.1 + CRM 1.57.9 + LMS 2.44.0 |

### Quick Commands

**Check Status**:
```bash
cd /opt/ccbusinessplan
docker compose ps
```

**View Logs**:
```bash
docker compose logs -f backend
```

**Enter Bench Console**:
```bash
docker compose exec backend bench --site portal.childcarebusinessplan.com console
```

## 3. Maintenance

### Deploying Updates
1.  Pull latest code on your local machine.
2.  Run `./build.sh` (if apps changed).
3.  Push image/config to server (or build on server).
4.  Run:
    ```bash
    docker compose up -d
    ```

### Backups
Backups are stored in the docker volume `sites`.
To trigger a manual backup:
```bash
docker compose exec backend bench --site portal.childcarebusinessplan.com backup --with-files
```
Backups location inside container: `./sites/portal.childcarebusinessplan.com/private/backups/`
