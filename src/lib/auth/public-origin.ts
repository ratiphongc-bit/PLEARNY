import type { NextRequest } from "next/server";

function parseOrigin(value: string | null): URL | null {
  if (!value || value === "null") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    if (url.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

export function getPublicOrigin(request: NextRequest): string {
  const originHeader = parseOrigin(request.headers.get("origin"));
  if (originHeader) return originHeader.origin;

  const referer = request.headers.get("referer");
  const refererOrigin = referer ? parseOrigin(referer) : null;
  if (refererOrigin) return refererOrigin.origin;

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  if (host && forwardedProto) {
    const forwardedOrigin = parseOrigin(`${forwardedProto}://${host}`);
    if (forwardedOrigin) return forwardedOrigin.origin;
  }

  const requestUrl = parseOrigin(request.url);
  if (requestUrl) return requestUrl.origin;
  throw new Error("Unable to determine the public application origin");
}
