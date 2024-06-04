# img

> powered by Astro

## Features

- AI-generated image captions
- Use [Astro](https://astro.build/) with [PhotoSwipe](https://photoswipe.com/)
- Random image
- theme change, based on [Daisy Blog](https://github.com/saadeghi/daisy-blog)

## Memo

- Don't just post pictures of your surroundings: a new AI model from Stanford University can quickly and accurately figure out where to be in a picture with 92% accuracy.

## TODO

- [ ] add load more button, not load all imgs at the first time

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
