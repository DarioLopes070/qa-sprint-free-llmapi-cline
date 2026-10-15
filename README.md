# Minimal API Project

This repository contains a bare‑bones Node.js API that exposes a single
health endpoint:

```
GET /health
```

The endpoint responds with a JSON body `{ "status": "ok" }` and HTTP status
code 200.

## Usage

```bash
# Install dependencies
npm install

# Start the server (listens on port 3000 or $PORT)
npm start
```

## Tests

The project uses Jest and Supertest for integration style tests.

```bash
npm test
```
