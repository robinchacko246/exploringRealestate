import type { IncomingMessage, ServerResponse } from 'http';
import server from '../src/server';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const protocol = (req.headers['x-forwarded-proto'] as string) || 'https';
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost';
    const fullUrl = `${protocol}://${host}${req.url || '/'}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '');
    let body: any = undefined;
    if (hasBody) {
      const buffers: Uint8Array[] = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      body = Buffer.concat(buffers);
    }

    const webRequest = new Request(fullUrl, {
      method: req.method || 'GET',
      headers,
      body,
    });

    const webResponse = await server.fetch(webRequest, process.env, {});

    res.statusCode = webResponse.status;
    webResponse.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    const arrayBuffer = await webResponse.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('Vercel handler error:', err);
    res.statusCode = 500;
    res.end(`Serverless Function Error: ${err?.message || String(err)}`);
  }
}
