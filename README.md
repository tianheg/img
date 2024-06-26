# img

> powered by Astro

## Features

- AI-generated image captions
- Use [Astro](https://astro.build/) with [PhotoSwipe](https://photoswipe.com/)
- Random image
- theme change, based on [Daisy Blog](https://github.com/saadeghi/daisy-blog)

## Memo

- Don't just post pictures of your surroundings: a new AI model from Stanford University can quickly and accurately figure out where to be in a picture with 92% accuracy.

## Problems solved

### Cloudflare Pages deploy failure, locally build success

error logs:

```log
23:58:47.472	 generating static routes 
23:58:47.492	15:58:47 ▶ src/pages/internet.astro
23:58:48.324	15:58:47   └─ /internet/index.htmlSyntaxError: Unexpected token 'o', "[object Obj"... is not valid JSON
23:58:48.324	    at JSON.parse (<anonymous>)
23:58:48.324	    at altTexts (file:///opt/buildhome/repo/dist/chunks/_layout_Dry1hoQ2.mjs:1045:19)
23:58:48.324	    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
23:58:48.325	    at async file:///opt/buildhome/repo/dist/chunks/_layout_Dry1hoQ2.mjs:1050:23
23:58:48.364	 (+872ms)
23:58:48.366	15:58:48 ▶ src/pages/index.astro
23:58:48.548	15:58:48   └─ /index.htmlSyntaxError: Unexpected token 'o', "[object Obj"... is not valid JSON
23:58:48.549	    at JSON.parse (<anonymous>)
23:58:48.549	    at altTexts (file:///opt/buildhome/repo/dist/chunks/_layout_Dry1hoQ2.mjs:1045:19)
23:58:48.549	    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
23:58:48.549	    at async file:///opt/buildhome/repo/dist/chunks/_layout_Dry1hoQ2.mjs:1050:23
23:58:48.628	 (+262ms)
23:58:48.628	15:58:48 ✓ Completed in 1.16s.
```

key code change:

```diff
+ const response = await fetch(url, options);
+	const data = await response.json();
+	return data;
- const data = await client.kv.namespaces.values.get(
-	  'da0d1ae333544faea791fb166dfbc01c',
-		'img-altTexts',
-		kvOptions,
-	);
- return JSON.parse(data);
```

Old way is use cloudflare npm lib, new way use REST API.

data sample:

```json
[{"name":"trainspotting-0.jpeg","altText":"A man with short, red hair is in a close-up shot, wearing a gray jacket and holding a red object in his hand. The background is blurred, focusing on the man."},{"name":"manuel-osorio-manrique-de-zuñiga.jpeg","altText":"A young girl in a red outfit stands next to a bird cage, holding a string and a bird. A cat is nearby, and a bird is perched on a cage. The background is a dark green color."},{"name":"jiachezi.jpg","altText":"An old wooden cart with two large wheels is parked in a field, surrounded by tall grass and bare trees. The cart has a wooden frame and is positioned in the center of the image."},{"name":"night-painting.jpeg","altText":"A serene landscape painting depicts a tranquil river reflecting the moon's light, with a group of cows grazing on a hill in the foreground. The artist uses a realistic style, capturing the natural elements and the moon's light in a dreamy quality."}]
```

The changed code is a little problem:

not good:

```js
const data = await fetch(url, options).then((res) => res.json());
return JSON.parse(JSON.stringify(data));
```

good:

```js
const response = await fetch(url, options);
const data = await response.json();
return data;
```

or:

```js
fetch(url, options)
  .then(response => response.json())
  .then(data => return data)
```

Because `fetch().then()` and `await fetch()` can only choose one of them.

<details>
<summary>Explain <code>fetch().then()</code> and <code>await fetch()</code></summary>
<p>fetch().then() is a promise-based approach where fetch() returns a Promise that resolves to the Response to that request. Example:</p>
<pre>
fetch('https://api.example.com/data')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    return data;
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  })
</pre>
<p>await fetch() is used in conjunction with async function to pause the execution of the function until the Promise is settled(that is, untilthe request is complete). Use await makes the code easier to read. Example:</p>
<pre>
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch(error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}
</pre>
</details>

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
