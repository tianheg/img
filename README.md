# img

> powered by Astro

## Features

- AI-generated image captions
- Use [Astro](https://astro.build/) with [PhotoSwipe](https://photoswipe.com/)
- Random image
- theme change, based on [Daisy Blog](https://github.com/saadeghi/daisy-blog)

## Steps

1. Add an image.
2. Run `node scripts/rmExif.js` to rm exif data, it also compress the image.
3. Run `node scripts/img2txt.js` to generate captions and upload to Cloudflare KV.(If the image is too large, this step will fail.)
4. Cloudflare auto deploy the site.

## Cloudflare API request limits

- Workers AI - Image to Text: 720 requests per minute
- KV
  - Reads: 100,000 reads per day
  - Writes to different keys: 1,000 writes per day
  - Writes to same key: 1 per second
