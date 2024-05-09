interface Env {
  AI: any;
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const { method, url } = request;
  const parsedUrl = new URL(url);

  // 检查请求方法是否为 POST
  if (method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // // 检查内容类型是否为 image/webp
  // const contentType = headers.get("content-type");
  // if (contentType !== "image/webp") {
  //   return new Response("Invalid content-type", { status: 400 });
  // }

  // 解析查询参数中的图片 URL
  const imgParam = parsedUrl.searchParams.get("img");
  if (!imgParam) {
    return new Response("Missing img parameter", { status: 400 });
  }

  try {
    // 使用 fetch 获取图片数据
    const imageResponse = await fetch(imgParam);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch the image");
    }
    const blob = await imageResponse.blob();

    // 准备输入数据
    const input = {
      image: [...new Uint8Array(await blob.arrayBuffer())],
      prompt: "Generate a caption for this image",
      max_tokens: 512,
    };

    // 调用 AI 服务生成标题
    const response = await env.AI.run(
      "@cf/unum/uform-gen2-qwen-500m",
      input
    );

    // 返回结果
    return new Response(JSON.stringify(response), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    // 如果有错误发生，返回错误信息
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
};
