/**
 * Generates a valid Windows ICO file containing both 16x16 and 32x32 images.
 * Uses raw RGBA pixel data + BMP DIB header format (no external deps required).
 */
const fs = require('fs');
const path = require('path');

// ----- helpers -----
function writeUint16LE(buf, offset, val) {
  buf[offset] = val & 0xff;
  buf[offset + 1] = (val >> 8) & 0xff;
}
function writeUint32LE(buf, offset, val) {
  buf[offset]     =  val        & 0xff;
  buf[offset + 1] = (val >>  8) & 0xff;
  buf[offset + 2] = (val >> 16) & 0xff;
  buf[offset + 3] = (val >> 24) & 0xff;
}

/**
 * Build a BMP DIB (BITMAPINFOHEADER + pixel data) for an ICO entry.
 * The pixel order in ICO BMPs is bottom-up and the mask plane must be appended.
 */
function buildBmpData(size, r, g, b) {
  const bitsPerPixel = 32;
  const pixelCount   = size * size;
  const rowBytes     = size * 4;           // 32bpp, no padding needed for power-of-two
  const maskRowBytes = Math.ceil(size / 8) * 4; // padded to 4-byte boundary
  const headerSize   = 40;
  const xorSize      = pixelCount * 4;
  const andSize      = maskRowBytes * size;
  const totalSize    = headerSize + xorSize + andSize;

  const buf = Buffer.alloc(totalSize, 0);

  // BITMAPINFOHEADER
  writeUint32LE(buf, 0,  headerSize);          // biSize
  writeUint32LE(buf, 4,  size);                // biWidth
  writeUint32LE(buf, 8,  size * 2);            // biHeight (×2 for XOR+AND planes)
  writeUint16LE(buf, 12, 1);                   // biPlanes
  writeUint16LE(buf, 14, bitsPerPixel);        // biBitCount
  writeUint32LE(buf, 16, 0);                   // biCompression (BI_RGB)
  writeUint32LE(buf, 20, xorSize);             // biSizeImage
  // rest of header stays 0

  // XOR (colour) plane — bottom-up rows, BGRA order
  let offset = headerSize;
  for (let row = size - 1; row >= 0; row--) {
    for (let col = 0; col < size; col++) {
      buf[offset++] = b;   // Blue
      buf[offset++] = g;   // Green
      buf[offset++] = r;   // Red
      buf[offset++] = 255; // Alpha (fully opaque)
    }
  }

  // AND (mask) plane — all 0 means fully opaque, bottom-up
  // already zeroed by Buffer.alloc, nothing to do

  return buf;
}

function buildIco(entries) {
  // entries: [{ size, bmpData }]
  const ICONDIRENTRY_SIZE = 16;
  const headerSize = 6;
  const dirSize    = ICONDIRENTRY_SIZE * entries.length;
  let imageOffset  = headerSize + dirSize;

  const parts = [Buffer.alloc(headerSize + dirSize, 0)];

  // ICO header
  const header = parts[0];
  writeUint16LE(header, 0, 0);               // reserved
  writeUint16LE(header, 2, 1);               // type = ICO
  writeUint16LE(header, 4, entries.length);  // image count

  entries.forEach((entry, i) => {
    const dirOffset = headerSize + i * ICONDIRENTRY_SIZE;
    header[dirOffset + 0] = entry.size === 256 ? 0 : entry.size; // width  (0 = 256)
    header[dirOffset + 1] = entry.size === 256 ? 0 : entry.size; // height (0 = 256)
    header[dirOffset + 2] = 0;   // color count (0 = 32bpp)
    header[dirOffset + 3] = 0;   // reserved
    writeUint16LE(header, dirOffset + 4,  1);                     // planes
    writeUint16LE(header, dirOffset + 6,  32);                    // bit count
    writeUint32LE(header, dirOffset + 8,  entry.bmpData.length);  // bytes in image
    writeUint32LE(header, dirOffset + 12, imageOffset);           // offset

    imageOffset += entry.bmpData.length;
    parts.push(entry.bmpData);
  });

  return Buffer.concat(parts);
}

// ---- build icon ----
// Warm amber/yellow colour for the sticky-note brand identity
const R = 255, G = 200, B = 0;

const ico = buildIco([
  { size: 16, bmpData: buildBmpData(16, R, G, B) },
  { size: 32, bmpData: buildBmpData(32, R, G, B) },
]);

const outPath = path.join(__dirname, '..', 'assets', 'icon.ico');
fs.writeFileSync(outPath, ico);
console.log(`✅ icon.ico written (${ico.length} bytes) → ${outPath}`);
