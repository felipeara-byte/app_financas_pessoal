import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  // pdfjs-dist loads its worker (and @napi-rs/canvas its native binary) via
  // dynamic imports that the file tracer can't see, so without this they are
  // missing from the Vercel bundle and PDF parsing crashes in production.
  outputFileTracingIncludes: {
    "/transactions/import": [
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
      "./node_modules/@napi-rs/**/*",
    ],
  },
};

export default nextConfig;
