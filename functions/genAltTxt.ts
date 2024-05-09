interface Env {
  AI: any;
}

const generateAltText = async (imageBuffer: Buffer, env: Env): Promise<string> => {
  try {
    const input = {
      image: [...new Uint8Array(imageBuffer)],
      prompt: "Generate a caption for this image",
      max_tokens: 512,
    };

    const response = await env.AI.run("@cf/unum/uform-gen2-qwen-500m", input);

    return response?.caption || "Alt text not available";
  } catch (error) {
    console.error(`Error generating alt text: ${error.message}`);
    return "Alt text generation error";
  }
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const { method, body } = request;

  if (method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const requestBody = await body.json();
  const imageData = requestBody.image;

  if (!imageData) {
    return new Response("Missing image data in the request body", { status: 400 });
  }

  try {
    const imageBuffer = Buffer.from(imageData, "base64");
    const altTxt = await generateAltText(imageBuffer, env);

    return new Response(altTxt, { headers: { "content-type": "text/plain" } });
  } catch (error) {
    console.error(`Error processing image: ${error.message}`);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
};