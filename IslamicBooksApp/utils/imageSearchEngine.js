import pako from 'pako';
import imageIndex from '../assets/image_search_index.json';

const HASH_SIZE = 8;
const MAX_DISTANCE = 64;
const CONFIDENT_DISTANCE = 10;
const USABLE_DISTANCE = 18;

function base64ToBytes(base64) {
  const clean = base64.includes(',') ? base64.split(',').pop() : base64;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const output = [];
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < clean.length; i += 1) {
    const char = clean[i];
    if (char === '=') break;
    const value = alphabet.indexOf(char);
    if (value < 0) continue;
    buffer = (buffer << 6) | value;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output.push((buffer >> bits) & 255);
    }
  }

  return new Uint8Array(output);
}

function readUInt32(bytes, offset) {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
}

function paeth(left, up, upLeft) {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);

  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) return left;
  if (upDistance <= upLeftDistance) return up;
  return upLeft;
}

function decodePng(base64) {
  const bytes = base64ToBytes(base64);
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];

  for (let i = 0; i < signature.length; i += 1) {
    if (bytes[i] !== signature[i]) {
      throw new Error('Image decoder expected a PNG query image.');
    }
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks = [];

  while (offset < bytes.length) {
    const length = readUInt32(bytes, offset);
    offset += 4;
    const type = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
    offset += 4;
    const chunk = bytes.slice(offset, offset + length);
    offset += length + 4;

    if (type === 'IHDR') {
      width = readUInt32(chunk, 0);
      height = readUInt32(chunk, 4);
      bitDepth = chunk[8];
      colorType = chunk[9];
    } else if (type === 'IDAT') {
      idatChunks.push(chunk);
    } else if (type === 'IEND') {
      break;
    }
  }

  if (bitDepth !== 8) {
    throw new Error('Only 8-bit PNG query images are supported.');
  }

  const channels = colorType === 0 ? 1 : colorType === 2 ? 3 : colorType === 4 ? 2 : colorType === 6 ? 4 : 0;
  if (!channels) {
    throw new Error('Unsupported PNG color format.');
  }

  const idatLength = idatChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const compressed = new Uint8Array(idatLength);
  let compressedOffset = 0;
  idatChunks.forEach((chunk) => {
    compressed.set(chunk, compressedOffset);
    compressedOffset += chunk.length;
  });

  const inflated = pako.inflate(compressed);
  const stride = width * channels;
  const pixels = new Uint8Array(width * height * channels);
  let inputOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inputOffset];
    inputOffset += 1;
    const rowStart = y * stride;
    const prevRowStart = (y - 1) * stride;

    for (let x = 0; x < stride; x += 1) {
      const raw = inflated[inputOffset + x];
      const left = x >= channels ? pixels[rowStart + x - channels] : 0;
      const up = y > 0 ? pixels[prevRowStart + x] : 0;
      const upLeft = y > 0 && x >= channels ? pixels[prevRowStart + x - channels] : 0;
      let value = raw;

      if (filter === 1) value = raw + left;
      else if (filter === 2) value = raw + up;
      else if (filter === 3) value = raw + Math.floor((left + up) / 2);
      else if (filter === 4) value = raw + paeth(left, up, upLeft);
      else if (filter !== 0) throw new Error('Unsupported PNG filter.');

      pixels[rowStart + x] = value & 255;
    }

    inputOffset += stride;
  }

  return { width, height, channels, pixels };
}

function grayscaleAt(image, sourceX, sourceY) {
  const x = Math.min(image.width - 1, Math.max(0, sourceX));
  const y = Math.min(image.height - 1, Math.max(0, sourceY));
  const index = (y * image.width + x) * image.channels;
  const red = image.pixels[index];
  const green = image.channels >= 3 ? image.pixels[index + 1] : red;
  const blue = image.channels >= 3 ? image.pixels[index + 2] : red;

  return (red * 0.299) + (green * 0.587) + (blue * 0.114);
}

export function averageHashFromBase64Png(base64) {
  const image = decodePng(base64);
  const values = [];

  for (let bucketY = 0; bucketY < HASH_SIZE; bucketY += 1) {
    for (let bucketX = 0; bucketX < HASH_SIZE; bucketX += 1) {
      const startX = Math.floor((bucketX * image.width) / HASH_SIZE);
      const endX = Math.max(startX + 1, Math.floor(((bucketX + 1) * image.width) / HASH_SIZE));
      const startY = Math.floor((bucketY * image.height) / HASH_SIZE);
      const endY = Math.max(startY + 1, Math.floor(((bucketY + 1) * image.height) / HASH_SIZE));
      let sum = 0;
      let count = 0;

      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          sum += grayscaleAt(image, x, y);
          count += 1;
        }
      }

      values.push(sum / count);
    }
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  let hash = '';

  for (let i = 0; i < values.length; i += 4) {
    let nibble = 0;
    for (let bit = 0; bit < 4; bit += 1) {
      if (values[i + bit] >= mean) {
        nibble |= 1 << (3 - bit);
      }
    }
    hash += nibble.toString(16);
  }

  return hash;
}

export function hammingDistance(hashA, hashB) {
  let distance = 0;
  const length = Math.min(hashA.length, hashB.length);

  for (let i = 0; i < length; i += 1) {
    const xor = parseInt(hashA[i], 16) ^ parseInt(hashB[i], 16);
    distance += ((xor & 1) ? 1 : 0) + ((xor & 2) ? 1 : 0) + ((xor & 4) ? 1 : 0) + ((xor & 8) ? 1 : 0);
  }

  return distance + Math.abs(hashA.length - hashB.length) * 4;
}

function confidenceFromDistance(distance, runnerUpDistance) {
  const raw = Math.max(0, 1 - (distance / MAX_DISTANCE));
  const gap = Math.max(0, runnerUpDistance - distance);
  const calibrated = raw * 0.72 + Math.min(gap / 16, 1) * 0.28;
  return Math.round(calibrated * 100);
}

export function searchImageHashes(queryHashes, topK = 5) {
  const candidates = imageIndex.pages.map((page) => {
    let bestDistance = hammingDistance(queryHashes[0], page.hash);
    let bestReason = 'full-page';

    for (const queryHash of queryHashes) {
      const globalDistance = hammingDistance(queryHash, page.hash);
      if (globalDistance < bestDistance) {
        bestDistance = globalDistance;
        bestReason = 'full-page';
      }

      for (const tile of page.tiles) {
        const distance = hammingDistance(queryHash, tile.hash);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestReason = tile.id === 'full' ? 'full-page' : `tile:${tile.id}`;
        }
      }
    }

    return { page: page.page, distance: bestDistance, reason: bestReason };
  }).sort((a, b) => a.distance - b.distance);

  const runnerUpDistance = candidates[1]?.distance ?? MAX_DISTANCE;

  return candidates.slice(0, topK).map((candidate, index) => {
    const confidence = confidenceFromDistance(candidate.distance, index === 0 ? runnerUpDistance : candidates[index + 1]?.distance ?? runnerUpDistance);
    return {
      ...candidate,
      confidence,
      exact: candidate.distance <= CONFIDENT_DISTANCE && confidence >= 80,
      usable: candidate.distance <= USABLE_DISTANCE,
    };
  });
}

export function getImageSearchStatus(results) {
  const best = results[0];
  if (!best || !best.usable) {
    return {
      confident: false,
      message: 'Exact page not confidently found. Try a clearer crop or full page.',
    };
  }

  return {
    confident: best.exact,
    message: best.exact ? 'Strong visual match found.' : 'Possible match found; please verify the page.',
  };
}
