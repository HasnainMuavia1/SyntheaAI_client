# Synthea Frontend

This directory contains the Next.js frontend for the Synthea project.

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Create a `.env.local` file based on the project requirements (ensure Supabase and API URLs are set).

## Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Build

To create a production build:
```bash
npm run build
```

To start the production server:
```bash
npm run start
```

## Linting
To check for code quality issues:
```bash
npm run lint
```

---

## Running with Docker (Recommended)

You can run the frontend seamlessly inside Docker with automatic server-side API proxying to the backend service.

### 1. Prerequisites
Ensure you have created the shared external Docker network once:
```bash
docker network create synthea-net
```

### 2. Build & Run
To build the Next.js image and start the frontend service in the background:
```bash
docker compose up -d --build
```
The application will be available at **[http://localhost:3000/](http://localhost:3000/)**.

### 3. Build Arguments & Configuration
* **`BACKEND_URL`**: Used for server-side API calls/proxies. Defaults to `http://synthea-backend:8000`.
* **`NEXT_PUBLIC_API_BASE_URL`**: Used for browser-side API calls. Defaults to `http://localhost:8000/api`.

### 4. Useful Commands
* **Logs**: `docker compose logs -f`
* **Restart**: `docker compose restart`
* **Clean rebuild**: `docker compose build --no-cache`

