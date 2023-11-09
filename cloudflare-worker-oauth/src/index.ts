/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { google } from 'worker-auth-providers';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

const CLIENT_ID = '';
const CLIENT_SECRET = '';

const getRedirectUrl = async () => {
	const url = await google.redirect({
		options: {
			clientId: CLIENT_ID,
			redirectTo: 'http://127.0.0.1:8787/auth/google.callback',
			responseType: 'code',
			scope: ['openid email profile'],
			state: 'pass-through value',
		},
	});
	return {
		status: 302,
		headers: {
			location: url,
		},
	};
};

const getUser = async (request: Request) => {
	const { user: providerUser, tokens } = await google.users({
		options: {
			clientSecret: CLIENT_SECRET,
			clientId: CLIENT_ID,
			redirectUrl: 'http://127.0.0.1:8787/auth/google.callback'
		},
		request,
	});
	console.log("[providerUser]", providerUser);
	console.log("[tokens]", tokens);
	return {
		providerUser,
		tokens,
	}
};


export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			const url: URL = new URL(request.url);
			if (url.pathname.includes('/auth/google.callback') && url.searchParams.has('code')) {
				const { providerUser } = await getUser(request);
				if (providerUser) {
					console.log('user:', providerUser.id, providerUser.email, providerUser.name);
					return new Response(`Hello ${providerUser.name}!`);
				}
			}
			else {
				const redirect = await getRedirectUrl();
				return Response.redirect(redirect.headers.location, redirect.status);
			}
		} catch (err) {
			if (err instanceof Error) {
				console.log("[error]", err?.stack);
			}
		}
		return new Response('Hello World!');
	},
};
