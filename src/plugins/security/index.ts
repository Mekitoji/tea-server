import { Elysia } from "elysia";

import { elysiHelmetPlugin } from "./elysia-helmet.plugin";
import { elysiaCORSPlugin } from "./elysia-cors.plugin";
import { elysiaRateLimitPlugin } from "./elysia-rate-limit.plugin";

export const securityPlugin = new Elysia({ name: "security" })
  .use(elysiHelmetPlugin)
  .use(elysiaCORSPlugin)
  .use(elysiaRateLimitPlugin);
