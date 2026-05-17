import cors from "@elysiajs/cors";

const allowedOrigins = (Bun.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const elysiaCORSPlugin = cors({
  origin:
    allowedOrigins.length > 0
      ? (request) => {
          const origin = request.headers.get("origin");

          return origin ? allowedOrigins.includes(origin) : false;
        }
      : false,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 600,
});
