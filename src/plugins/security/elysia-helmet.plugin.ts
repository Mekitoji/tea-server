import { elysiaHelmet, permission } from "elysiajs-helmet";

export const elysiHelmetPlugin = elysiaHelmet({
  csp: {
    defaultSrc: [permission.SELF],
    objectSrc: [permission.NONE],
    baseUri: [permission.SELF],
    frameSrc: [permission.NONE],
  },
  frameOptions: "DENY",
  referrerPolicy: "no-referrer",
  corp: "same-origin",
  coop: "same-origin",
});
