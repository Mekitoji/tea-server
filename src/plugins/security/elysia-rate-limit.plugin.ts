import { rateLimit } from "elysia-rate-limit";

export const elysiaRateLimitPlugin = rateLimit({
  duration: 60_000,
  max: 120,
  errorResponse: "Too many requests",
  generator: (request) => {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

    return (
      firstForwardedIp ??
      request.headers.get("x-real-ip") ??
      request.headers.get("cf-connecting-ip") ??
      "anonymous"
    );
  },
});
