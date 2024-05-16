import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const imageFolderPath = join(__dirname, '..', 'src', 'assets', 'home');

const cloudflareAIApiUrl = 'https://api.cloudflare.com/client/v4/accounts/b0dda00db555f237f277259bed93134b/ai/run/@cf/unum/uform-gen2-qwen-500m';

const imageFiles = fs.readdirSync(imageFolderPath);
const MAX_CONCURRENT_REQUESTS = 5; // 同时处理的请求数量
const altTexts = [];
const processing = new Set();
let concurrentRequests = 0;

const processImage = async (imageFile) => {
  const imagePath = join(imageFolderPath, imageFile);
  const imageBuffer = fs.readFileSync(imagePath);
  const input = {
    image: Array.from(new Uint8Array(imageBuffer)),
    prompt: 'Generate a caption for this image.',
    max_tokens: 256,
  };

  processing.add(imageFile); // 添加到正在处理的 Set 中
  concurrentRequests++;

  console.log(`Processing image: ${imageFile}, concurrent requests: ${concurrentRequests}`);

  try {
    const response = await fetch(cloudflareAIApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CF_AI_API_TOKEN}`,
      },
      body: JSON.stringify(input),
      timeout: 15000,
    });
    const data = await response.json();

    // Only add the alt text if it's non-empty and the request was successful
    if (data.success && data.result.description !== '') {
      altTexts.push({
        name: imageFile,
        altText: data.result.description,
      });
    }

    console.log(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request timed out');
    } else {
      console.error(error);
    }
  } finally {
    processing.delete(imageFile);
    concurrentRequests--;
    console.log(`Finished processing image: ${imageFile}, concurrent requests: ${concurrentRequests}`);
    if (concurrentRequests < MAX_CONCURRENT_REQUESTS && imageFiles.length > 0) {
      const unprocessedFiles = imageFiles.filter(file => !processing.has(file) && !altTexts.some(a => a.name === file));
      if (unprocessedFiles.length > 0) {
        processImagesConcurrently(unprocessedFiles);
      }
    }
  }
};

const processImagesConcurrently = (currentFiles) => {
  const availableSlots = MAX_CONCURRENT_REQUESTS - concurrentRequests;
  const filesToProcess = currentFiles.slice(0, availableSlots);

  return Promise.all(
    filesToProcess.map((imageFile) => {
      if (!processing.has(imageFile)) { // 确保图片文件没有在处理中
        return processImage(imageFile);
      }
      return Promise.resolve(); // 如果图片已经在处理中，则不启动新的处理
    })
  );
};

processImagesConcurrently(imageFiles)
  .then(() => {
    const cloudflareKVUrl = 'https://api.cloudflare.com/client/v4/accounts/b0dda00db555f237f277259bed93134b/storage/kv/namespaces/da0d1ae333544faea791fb166dfbc01c/values/img-altTexts';
    const kvOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CF_KV_API_TOKEN}`,
      },
      body: JSON.stringify(altTexts),
    };

    return fetch(cloudflareKVUrl, kvOptions);
  })
  .then((res) => res.json())
  .then((json) => console.log(json))
  .catch((err) => console.error(`Error: ${err}`));