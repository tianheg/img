# img

> powered by Astro

## Features

- AI-generated image captions
- Astro + PhotoSwipe

## Steps

1. Add an image
2. Run `node scripts/rmExif.js` to rm exif data
3. Run `node scripts/img2txt.js` to generate captions and upload to Cloudflare KV
4. Cloudflare auto deploy the site

## Cloudflare API request limits

- Workers AI - Image to Text: 720 requests per minute
- KV
  - Reads: 100,000 reads per day
  - Writes to different keys: 1,000 writes per day
  - Writes to same key: 1 per second
