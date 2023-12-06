import puppeteer from "@cloudflare/puppeteer";

interface Env {
	MYBROWSER: Fetcher;
	BROWSER_KV_DEMO: KVNamespace;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		console.log('START');
		const { searchParams } = new URL(request.url);
		searchParams.append('t', Date.now().toString());
		let url = searchParams.get("url");
		let img: Buffer;
		if (url) {
			url = new URL(url).toString(); // normalize
			// img = await env.BROWSER_KV_DEMO.get(url, { type: "arrayBuffer" });
			if (!img) {
				const browser = await puppeteer.launch(env.MYBROWSER);
				const page = await browser.newPage();
				// to bypass video intro
				const now = Date.now();
				await page.setUserAgent('Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) QtWebEngine/5.9.7 Chrome/56.0.2924.122 Safari/537.36 Sky_STB_BC7445_2018/1.0.0 (Sky, ES140UK, )');
				console.log(`LOAD: ${url}`);
				await page.goto(url);
				await page.evaluate(() => {
					window.localStorage.setItem('itv-cookies-accepted', 'true');
				});
				console.log('Wait for: .App__wrapper');
				await page.waitForSelector('.App__wrapper');
				console.log('Wait for: [data-testid=tile-slider]');
				await page.waitForSelector('[data-testid=tile-slider]');
				const elapsed = Date.now() - now;
				console.log('Wait for: 2 seconds');
				await new Promise(r => setTimeout(r, 2000));
				console.log(`Elapsed: ${elapsed}ms`);

				img = (await page.screenshot()) as Buffer;
				await env.BROWSER_KV_DEMO.put(url, img, {
					expirationTtl: 60 * 60 * 24,
				});
				await browser.close();
			}
			console.log('SEND RESPONSE');
			return new Response(img, {
				headers: {
					"content-type": "image/jpeg",
				},
			});
		} else {
			return new Response(
				"Please add an ?url=https://app.10ft.itv.com/3.181.1/browser/ parameter"
			);
		}
	},
};
