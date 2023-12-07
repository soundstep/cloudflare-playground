import type { Env } from './types';

const puppeteerWork = async (urlParam: string, env: Env, writer: WritableStreamDefaultWriter) => {
	const textEncoder = new TextEncoder();
	// let img: Buffer;
	let elapsed: Number = 0;
	const url = new URL(urlParam).toString(); // normalize
	// img = await env.BROWSER_KV_DEMO.get(url, { type: "arrayBuffer" });
	// if (!img) {
	const browser = await puppeteer.launch(env.MYBROWSER);
	writer.write(textEncoder.encode('creating browser\n'));
	const page = await browser.newPage();
	const now = Date.now();
	// to bypass video intro
	const userAgent = 'Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) QtWebEngine/5.9.7 Chrome/56.0.2924.122 Safari/537.36 Sky_STB_BC7445_2018/1.0.0 (Sky, ES140UK, )';
	writer.write(textEncoder.encode(`setting user-agent: ${userAgent}\n`));
	await page.setUserAgent(userAgent);
	writer.write(textEncoder.encode(`load url ${url}\n`));
	await page.goto(url);
	writer.write(textEncoder.encode('setting some cookies\n'));
	await page.evaluate(() => {
		window.localStorage.setItem('itv-cookies-accepted', 'true');
	});
	writer.write(textEncoder.encode('waiting for: .App__wrapper\n'));
	await page.waitForSelector('.App__wrapper');
	writer.write(textEncoder.encode('waiting for: #homePage (with #loadingScreen not displayed)\n'));
	await page.waitForFunction(
		() => Boolean(
			!document.querySelector('#loadingScreen') &&
			document.querySelector('#homePage')
		)
	);
	elapsed = Date.now() - now;
	writer.write(textEncoder.encode(`elapsed time: ${elapsed} ms\n`));

	// img = (await page.screenshot()) as Buffer;
	// await env.BROWSER_KV_DEMO.put(url, img, {
	// 	expirationTtl: 60 * 60 * 24,
	// });
	await browser.close();
	writer.close();
	// }

	// const result = {
	// 	homepage: `${elapsed} ms`
	// }

	// return new Response(readable, {
	// 	headers: {
	// 		'Access-Control-Allow-Origin': '*'
	// 	}
	// });

	// return new Response(JSON.stringify(result, undefined, 2), {
	// 	headers: {
	// 		'content-type': 'application/json'
	// 	}
	// });
	// return new Response(img, {
	// 	headers: {
	// 		"content-type": "image/jpeg",
	// 	},
	// });
};

export const homepageRoute = async (request: Request, env: Env) => {
    let { readable, writable } = new TransformStream();
    let writer = writable.getWriter()
    const textEncoder = new TextEncoder();
    writer.write(textEncoder.encode('start\n'));
    const { searchParams } = new URL(request.url);
    // searchParams.append('t', Date.now().toString());
    let urlParam = searchParams.get("url");
    if (urlParam) {
        puppeteerWork(urlParam, env, writer);
        writer.write(textEncoder.encode('ready\n'));
        console.log(readable);
        return new Response(readable, {
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });

    } else {
        return new Response(
            "Please add an ?url=https://app.10ft.itv.com/3.181.1/browser/ parameter"
        );
    }
};
