import type { Env } from './types';

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Streamed Response</title>
</head>
<body>
  <pre id="output"></pre>

  <script>
    async function fetchData() {
      const response = await fetch('###URL###');
      if (response.body) {
        const reader = response.body.getReader();
        const textDecoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Streaming complete
            break;
          }
          // Append the received chunk to the output element
          document.getElementById('output').innerText += textDecoder.decode(value);
        }
      }
    }
    // Call the function to start fetching and streaming data
    fetchData();
  </script>
</body>
</html>
`;

export const clientRoute = async (request: Request, env: Env, urlParam: string) => {
    const url = `/data/homepage?url=${urlParam}}`;
    return new Response(html.replace('###URL###', url), {
        headers: {
            'content-type': 'text/html'
        }
    });
};
