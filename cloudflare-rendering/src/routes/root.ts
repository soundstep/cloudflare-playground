import type { Env } from './types';

export const rootRoute = async (request: Request, env: Env) => {
    const url = new URL(request.url);
    url.pathname = '/client';
    return Response.redirect(url.toString(), 301);
};
