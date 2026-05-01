import { NextResponse } from 'next/server';
import { ENV } from '@/core/constants/env';

const FILES_BASE_URL = ENV.NEXT_PUBLIC_FILES_BASE_URL || '';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');

    if (!path) {
        return NextResponse.json({ message: 'Missing path' }, { status: 400 });
    }

    let url: string;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        try {
            const targetHost = new URL(path).host;
            const allowedHost = new URL(FILES_BASE_URL).host;
            if (targetHost !== allowedHost) {
                return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
            }
        } catch {
            return NextResponse.json({ message: 'Invalid path' }, { status: 400 });
        }
        url = path;
    } else {
        const cleanPath = path.replace(/^\//, '');
        url = `${FILES_BASE_URL.replace(/\/$/, '')}/${cleanPath}`;
    }

    const r = await fetch(url);
    if (!r.ok) {
        return NextResponse.json(
            { message: 'File fetch failed', status: r.status },
            { status: r.status }
        );
    }

    const buf = await r.arrayBuffer();
    const urlPath = new URL(url).pathname;
    const fileName = urlPath.split('/').pop() || 'file';
    const contentType =
        r.headers.get('content-type') ||
        (urlPath.toLowerCase().endsWith('.pdf')
            ? 'application/pdf'
            : 'application/octet-stream');

    return new NextResponse(buf, {
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${fileName}"`,
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
