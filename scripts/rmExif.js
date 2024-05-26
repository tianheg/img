import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import exifParser from 'exif-parser';
import sharp from 'sharp';

// Path to the source directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDirs = [
  join(__dirname, '..', 'src', 'assets', 'home'),
  join(__dirname, '..', 'src', 'assets', 'internet')
]

// Function to process a single image
const processImage = (filePath) => {
  sharp(filePath)
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      sharp(data)
        .toFile(filePath, (err, info) => {
          if (err) {
            console.error(`Error processing image ${filePath}:`, err);
          } else {
            console.log(`Successfully removed EXIF data from ${filePath}:`, info);
          }
        });
    })
    .catch(err => {
      console.error(`Error loading image ${filePath}:`, err);
    });
};

// Function to check if an image has EXIF data
const hasExifData = (buffer) => {
  try {
    const parser = exifParser.create(buffer);
    const result = parser.parse();
    return result.tags && Object.keys(result.tags).length > 0;
  } catch (err) {
    return false;
  }
};

// Read the source directory and process each image
for (const srcDir of srcDirs) {
  fs.readdir(srcDir, (err, files) => {
    if (err) {
      console.error('Error reading source directory:', err);
      return;
    }

    for (const file of files) {
      const filePath = join(srcDir, file);

      // Check if the file is an image based on its extension
      if (/\.(jpe?g|png|tiff|webp)$/i.test(file)) {
        fs.readFile(filePath, (err, data) => {
          if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return;
          }

          if (hasExifData(data)) {
            processImage(filePath);
          } else {
            console.log(`Skipping image without EXIF data: ${file}`);
          }
        });
      } else {
        console.log(`Skipping non-image file: ${file}`);
      }
    }
  });
}

// see img exif info https://mutiny.cz/exifr/