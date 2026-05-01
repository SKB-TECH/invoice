import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/core/constants/env';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ProxyCtx = {
    params: Promise<{ path: string[] }>;
};

function buildUpstreamUrl(path: string[] | undefined, search: string): string {
    const base = ENV.API_BASE_URL.replace(/\/+$/, '');
    const pathString = path?.length ? path.join('/') : '';
    if (!pathString) {
        return `${base}${search || ''}`;
    }
    return `${base}/${pathString}${search || ''}`;
}

function buildHeaders(req: NextRequest): Headers {
    const headers = new Headers();

    const forward = [
        'accept',
        'content-type',
        'authorization',
        'cookie',
        'origin',
        'referer',
    ] as const;

    forward.forEach((key) => {
        const val = req.headers.get(key);
        if (val) headers.set(key, val);
    });

    const token =
        req.cookies.get('auth_token')?.value ||
        req.cookies.get('accessToken')?.value;

    if (token && !headers.has('authorization')) {
        headers.set('authorization', `Bearer ${token}`);
    }

    if (ENV.API_KEY) headers.set('x-api-key', ENV.API_KEY);
    if (ENV.API_CHANNEL) headers.set('x-api-channel', ENV.API_CHANNEL);

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
    const init: RequestInit & { duplex?: 'half' } = { method, headers };
    if (method !== 'GET' && method !== 'HEAD') {
        /**
         * Préserver le multipart tel quel vers l’upstream. Avec Undici / Node fetch,
         * recopier tout le corps puis le renvoyer peut poser problème ; le stream
         * natif évite aussi des pertes/troncatures dans certains cas.
         */
        if (req.body) {
            init.body = req.body;
            init.duplex = 'half';
        } else {
            init.body = await req.arrayBuffer();
        }
    }
    try {
        const upstream = await fetch(url, init);
        const body = await upstream.arrayBuffer();
        const res = new NextResponse(body, {
            status: upstream.status,
            headers: { 'cache-control': 'no-store' },
        });
        const contentType = upstream.headers.get('content-type');
        if (contentType) res.headers.set('content-type', contentType);
        const setCookie = upstream.headers.get('set-cookie');
        if (setCookie) {
            setCookie
                .split(/,(?=\s*[^;]+?=)/)
                .forEach((c) => res.headers.append('set-cookie', c.trim()));
        }
        return res;
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        return NextResponse.json(
            { message: 'Proxy fetch failed', upstreamUrl: url, error: message },
            { status: 502 }
        );
    }
}

export async function GET(req: NextRequest, ctx: ProxyCtx) {
    return proxy('GET', req, ctx);
}
export async function POST(req: NextRequest, ctx: ProxyCtx) {
    return proxy('POST', req, ctx);
}
export async function PUT(req: NextRequest, ctx: ProxyCtx) {
    return proxy('PUT', req, ctx);
}
export async function DELETE(req: NextRequest, ctx: ProxyCtx) {
    return proxy('DELETE', req, ctx);
}
export async function OPTIONS() {
    return new NextResponse(null, { status: 204 });
}
