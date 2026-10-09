import type { Request, Response } from 'express';
import { createApiApp } from '../server';

const app = createApiApp();

export default function handler(req: Request, res: Response) {
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const routePath = requestUrl.searchParams.get('path');

  if (!routePath) {
    res.status(400).json({ error: 'Missing API route path.' });
    return;
  }

  requestUrl.searchParams.delete('path');
  req.url = `/api/${routePath}${requestUrl.search}`;
  return app(req, res);
}
