# Tea Server

## Getting Started

Install dependencies:

```bash
bun install
```

## Development

To start the development server run:

```bash
bun run dev
```

Open <http://localhost:3000/api/v1/health> to check the server.
Open <http://localhost:3000/api/v1/metrics> to inspect Prometheus metrics.

Build the server bundle with Bun as the runtime target:

```bash
bun run build
```

The equivalent direct command is:

```bash
bun build --target=bun --outdir dist ./src/index.ts
```

### Docker

The `api` service runs in watch mode under Docker Compose, so source changes in
`src` restart the Bun process automatically:

```bash
docker compose up --build
```

For the first Docker start, create `.env` from `.env.example`, prepare the logs
folder, build images, and start containers with the Bun script:

```bash
bun run start:docker:dev
```

With the `observability` profile enabled, local dashboards are available at:

- Jaeger: <http://localhost:16686>
- Prometheus: <http://localhost:9090>
- Grafana: <http://localhost:3001>
