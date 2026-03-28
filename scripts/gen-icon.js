/**
 * gen-icon.js
 * Generates a valid multi-size ICO file (16x16 up to 256x256) with a sticky-note yellow color.
 * Run with: node scripts/gen-icon.js
 */

const fs = require('fs');
const path = require('path');

// Sticky note yellow: R=255, G=210, B=0
const R = 255, G = 210, B = 0, A = 255;

/**
 * Build a raw 32-bit BMP (BITMAPINFOHEADER + pixel data) for use inside an ICO.
 * ICO BMPs have doubled height (h*2) to include the AND mask.
 */
function buildBmpData(size) {
  const w = size, h = size;
  const headerSize = 40; // BITMAPINFOHEADER
  const rowSize = w * 4; // 32bpp, no padding needed for powers of 2
  const pixelDataSize = rowSize * h;
  // AND mask: all zeros (fully opaque), rows padded to 4 bytes
  const maskRowSize = Math.ceil(w / 32) * 4;
  const maskSize = maskRowSize * h;

  const buf = Buffer.alloc(headerSize + pixelDataSize + maskSize, 0);
  let off = 0;

  // BITMAPINFOHEADER (40 bytes)
  buf.writeUInt32LE(40, off);         off += 4; // biSize
  buf.writeInt32LE(w, off);           off += 4; // biWidth
  buf.writeInt32LE(h * 2, off);       off += 4; // biHeight (doubled for ICO)
  buf.writeUInt16LE(1, off);          off += 2; // biPlanes
  buf.writeUInt16LE(32, off);         off += 2; // biBitCount
  buf.writeUInt32LE(0, off);          off += 4; // biCompression (BI_RGB)
  buf.writeUInt32LE(pixelDataSize + maskSize, off); off += 4; // biSizeImage
  buf.writeInt32LE(0, off);           off += 4; // biXPelsPerMeter
  buf.writeInt32LE(0, off);           off += 4; // biYPelsPerMeter
  buf.writeUInt32LE(0, off);          off += 4; // biClrUsed
  buf.writeUInt32LE(0, off);          off += 4; // biClrImportant

  // Pixel data — BMP rows are bottom-up
  for (let row = h - 1; row >= 0; row--) {
    for (let col = 0; col < w; col++) {
      buf[off++] = B; // Blue  (BGRA order)
      buf[off++] = G; // Green
      buf[off++] = R; // Red
      buf[off++] = A; // Alpha
    }
  }

  // AND mask — all zeros (opaque), rows padded to 4-byte boundary
  // Already zeroed by Buffer.alloc, just advance offset
  off += maskSize;

  return buf;
}

/**
 * Build a complete ICO file with the given sizes.
 */
function buildIco(sizes) {
  const bmps = sizes.map(buildBmpData);

  // ICO header: 6 bytes
  // Directory: 16 bytes * numImages
  const dirOffset = 6;
  const dirSize = 16 * sizes.length;
  const imageDataStart = dirOffset + dirSize;

  // Calculate offsets
  const offsets = [];
  let currentOffset = imageDataStart;
  for (const bmp of bmps) {
    offsets.push(currentOffset);
    currentOffset += bmp.length;
  }

  const totalSize = currentOffset;
  const ico = Buffer.alloc(totalSize, 0);
  let pos = 0;

  // ICO Header
  ico.writeUInt16LE(0, pos);          pos += 2; // Reserved (must be 0)
  ico.writeUInt16LE(1, pos);          pos += 2; // Type: 1 = ICO
  ico.writeUInt16LE(sizes.length, pos); pos += 2; // Image count

  // Directory entries
  for (let i = 0; i < sizes.length; i++) {
    const s = sizes[i];
    ico[pos++] = s === 256 ? 0 : s;   // Width  (0 means 256)
    ico[pos++] = s === 256 ? 0 : s;   // Height (0 means 256)
    ico[pos++] = 0;                    // Color count (0 for 32bpp)
    ico[pos++] = 0;                    // Reserved
    ico.writeUInt16LE(1, pos);         pos += 2; // Planes
    ico.writeUInt16LE(32, pos);        pos += 2; // Bit count
    ico.writeUInt32LE(bmps[i].length, pos); pos += 4; // Size of image data
    ico.writeUInt32LE(offsets[i], pos);     pos += 4; // Offset of image data
  }

  // Image data
  for (const bmp of bmps) {
    bmp.copy(ico, pos);
    pos += bmp.length;
  }

  return ico;
}

const icoData = buildIco([16, 32, 48, 64, 128, 256]);
const outPath = path.join(__dirname, '..', 'assets', 'icon.ico');
fs.writeFileSync(outPath, icoData);
console.log(`✅ Written ${icoData.length} bytes to ${outPath}`);
console.log(`   Contains sizes [16, 32, 48, 64, 128, 256], 32bpp, yellow (#FFD200)`);
