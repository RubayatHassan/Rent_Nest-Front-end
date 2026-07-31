import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function forward(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const target = `${BACKEND_API_URL}/${path.join("/")}${
    request.nextUrl.search
  }`;
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const cookie = request.headers.get("cookie");
  const authorization = request.headers.get("authorization");
  const isPublicRead =
    request.method === "GET" &&
    (path[0] === "properties" || path[0] === "categories");
  if (contentType) headers.set("content-type", contentType);
  if (cookie && !isPublicRead) headers.set("cookie", cookie);
  if (authorization && !isPublicRead)
    headers.set("authorization", authorization);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
      cache: isPublicRead ? "force-cache" : "no-store",
      ...(isPublicRead ? { next: { revalidate: 30 } } : {}),
    });
    const responseHeaders = new Headers();
    const responseType = upstream.headers.get("content-type");
    const setCookie = upstream.headers.get("set-cookie");
    if (responseType) responseHeaders.set("content-type", responseType);
    if (setCookie) responseHeaders.set("set-cookie", setCookie);
    if (isPublicRead) {
      responseHeaders.set(
        "cache-control",
        "public, s-maxage=30, stale-while-revalidate=300",
      );
    }
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to the backend server." },
      { status: 502 },
    );
  }
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
