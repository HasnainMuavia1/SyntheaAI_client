# 🪐 Synthea Frontend (Next.js 14)

This is the interactive IDE and AI agent client dashboard for Synthea, built with **Next.js 14**, **Tailwind CSS**, and **Framer Motion**. It communicates with the Python Django backend using highly optimized REST and Websocket protocols.

---

## ⚡ Quick Start: Running with Docker Compose (Recommended)

Since the frontend and backend are structured as separate microservices, they communicate over a shared Docker network named `synthea-net`. Follow these steps to spin up the entire application:

### Step 1: Create the Shared Network (One-time Setup)
Run this command from your terminal to create the shared container network:
```bash
docker network create synthea-net
```

### Step 2: Build and Start the Backend
Navigate to `SyntheaAI_server/` and start the backend container:
```bash
docker compose up -d --build
```
*Note: The first build will compile PortAudio and download PyTorch (CPU version). This runs automatically but takes a few minutes.*

### Step 3: Create an Admin / Superuser Account (Optional)
If you want to access the Django admin panel, create a superuser:
```bash
docker exec -it synthea-backend python manage.py createsuperuser
```

### Step 4: Build and Start the Frontend
Navigate to `SyntheaAI_client/` and start the Next.js container:
```bash
docker compose up -d --build
```
Access the application at 👉 **[http://localhost:3000](http://localhost:3000)** and log in using either the superuser credentials or by registering a new account.

---

## 🛠️ Local Development (Without Docker)

### Prerequisites
- Node.js 20+
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Local Proxy Target
By default, the client proxies server-side `/api/*` rewrites to `http://127.0.0.1:8000`. Ensure your local Django server is running on port `8000`.

### 3. Launch Development Server
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** to begin coding.

---

## ⚙️ Docker Network Proxy Settings
Next.js statically bakes proxy targets at build time. During container compilation, we explicitly pass the container's private DNS record as build arguments:
- **`NEXT_PUBLIC_API_BASE_URL`**: `http://localhost:8000/api` (Browser-side endpoint mapping)
- **`BACKEND_URL`**: `http://synthea-backend:8000` (Server-side Next.js proxy route)
These are configured out-of-the-box in `docker-compose.yml`.
