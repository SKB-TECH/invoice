import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/core/constants/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProxyCtx = {
    params: Promise<{ path: string[] }>;
};

function buildUpstreamUrl(
    path: string[] | undefined,
    search: string
): string {
    const base = ENV.API_BASE_URL.replace(/\/+$/, "");
    const pathString = path?.length ? path.join("/") : "";

    if (!pathString) {
        return `${base}${search || ""}`;
    }

    return `${base}/${pathString}${search || ""}`;
}

function buildHeaders(req: NextRequest): Headers {
    const headers = new Headers();

    const forward = [
        "accept",
        "content-type",
        "authorization",
        "cookie",
    ] as const;

    forward.forEach((key) => {
        const val = req.headers.get(key);
        if (val) headers.set(key, val);
    });

    const token =
        req.cookies.get("auth_token")?.value ||
        req.cookies.get("accessToken")?.value;

    if (token && !headers.has("authorization")) {
        headers.set("authorization", `Bearer ${token}`);
    }

    if (ENV.API_KEY) {
        headers.set("x-api-key", ENV.API_KEY);
    }

    if (ENV.API_CHANNEL) {
        headers.set("x-api-channel", ENV.API_CHANNEL);
    }

    return headers;
}

async function proxy(
    method: string,
    req: NextRequest,
    ctx: ProxyCtx
): Promise<NextResponse> {
    const { path } = await ctx.params;
    const url = buildUpstreamUrl(path, req.nextUrl.search);
    const headers = buildHeaders(req);

    const init: RequestInit = {
        method,
        headers,
        cache: "no-store",
    };

    if (method !== "GET" && method !== "HEAD") {
        const body = await req.arrayBuffer();

        if (body.byteLength > 0) {
            init.body = body;
        }
    }

    try {
        const upstream = await fetch(url, init);
        const body = await upstream.arrayBuffer();

        const res = new NextResponse(body, {
            status: upstream.status,
            headers: {
                "cache-control": "no-store",
            },
        });

        const contentType = upstream.headers.get("content-type");
        if (contentType) {
            res.headers.set("content-type", contentType);
        }

        const setCookie = upstream.headers.get("set-cookie");
        if (setCookie) {
            setCookie
                .split(/,(?=\s*[^;]+?=)/)
                .forEach((cookie) =>
                    res.headers.append("set-cookie", cookie.trim())
                );
        }

        return res;
    } catch (error: unknown) {
        const err = error as Error & {
            cause?: {
                code?: string;
                message?: string;
            };
        };

        console.error("Proxy fetch failed:", {
            upstreamUrl: url,
            message: err.message,
            causeCode: err.cause?.code,
            causeMessage: err.cause?.message,
        });

        return NextResponse.json(
            {
                message: "Proxy fetch failed",
                upstreamUrl: url,
                error: err.message,
                causeCode: err.cause?.code,
                causeMessage: err.cause?.message,
            },
            { status: 502 }
        );
    }
}

export async function GET(req: NextRequest, ctx: ProxyCtx) {
    return proxy("GET", req, ctx);
}

export async function POST(req: NextRequest, ctx: ProxyCtx) {
    return proxy("POST", req, ctx);
}

export async function PUT(req: NextRequest, ctx: ProxyCtx) {
    return proxy("PUT", req, ctx);
}

export async function DELETE(req: NextRequest, ctx: ProxyCtx) {
    return proxy("DELETE", req, ctx);
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204 });
}
