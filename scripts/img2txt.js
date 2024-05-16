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
const MAX_CONCURRENT_REQUESTS = 5;
const altTexts = [];
const processing = new Set();
let concurrentRequests = 0;

/**
 * Process an image to generate a caption using the Cloudflare AI API.
 *
 * @param {string} imageFile - The file name of the image to be processed.
 * @return {Promise} A Promise that resolves with the generated caption information.
 */
const processImage = async (imageFile) => {
  const imagePath = join(imageFolderPath, imageFile);
  const imageBuffer = fs.readFileSync(imagePath);
  const input = {
    image: Array.from(new Uint8Array(imageBuffer)),
    prompt: 'Generate a caption for this image.',
    max_tokens: 256,
  };

  processing.add(imageFile);
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

    if (data.result.description !== '') {
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
    if (concurrentRequests < MAX_CONCURRENT_REQUESTS && imageFiles.some(file => !processing.has(file) && !altTexts.some(a => a.name === file))) {
      processImagesConcurrently(imageFiles.filter(file => !processing.has(file) && !altTexts.some(a => a.name === file)));
    }
  }
};

/**
 * Process images concurrently by checking if each image file is being processed and starting a new process if not.
 *
 * @param {Array} currentFiles - An array of image files to process concurrently.
 * @return {Promise} A Promise that resolves with the processing results of all image files.
 */
const processImagesConcurrently = async (currentFiles) => {
  const availableSlots = MAX_CONCURRENT_REQUESTS - concurrentRequests;
  const filesToProcess = currentFiles.slice(0, availableSlots);

  const promises = filesToProcess.map(imageFile => {
    if (!processing.has(imageFile)) {
      return processImage(imageFile);
    }
    return Promise.resolve();
  });

  await Promise.all(promises);
};

const startProcessing = async () => {
  await processImagesConcurrently(imageFiles);

  // Store results only when all images are processed
  const cloudflareKVUrl = 'https://api.cloudflare.com/client/v4/accounts/b0dda00db555f237f277259bed93134b/storage/kv/namespaces/da0d1ae333544faea791fb166dfbc01c/values/img-altTexts';
  const kvOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CF_KV_API_TOKEN}`,
    },
    body: JSON.stringify(altTexts),
  };

  try {
    const res = await fetch(cloudflareKVUrl, kvOptions);
    const json = await res.json();
    console.log(json);
  } catch (err) {
    console.error(`Error: ${err}`);
  }
};

startProcessing().catch(err => console.error(`Error: ${err}`));