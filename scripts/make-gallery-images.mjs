import { mkdirSync, writeFileSync } from 'node:fs';

const W = 1200;
const H = 800;
const specs = [
  { id: 1, hue: 190, shape: 'circles' },
  { id: 2, hue: 160, shape: 'diagonal' },
  { id: 3, hue: 280, shape: 'waves' },
  { id: 4, hue: 210, shape: 'waves' },
  { id: 5, hue: 330, shape: 'circles' },
  { id: 6, hue: 30, shape: 'diagonal' },
  { id: 7, hue: 190, shape: 'lines' },
  { id: 8, hue: 120, shape: 'lines' },
];

function shapes(shape, a, b) {
  if (shape === 'circles') {
    return `<circle cx="450" cy="400" r="260" fill="${a}" opacity="0.85"/><circle cx="750" cy="400" r="260" fill="${b}" opacity="0.7"/>`;
  }
  if (shape === 'diagonal') {
    return `<polygon points="0,800 600,0 900,0 300,800" fill="${a}"/><polygon points="500,800 1100,0 1200,0 1200,300 800,800" fill="${b}" opacity="0.8"/>`;
  }
  if (shape === 'waves') {
    return `<path d="M0 520 C200 400 400 640 600 520 S1000 400 1200 520 V800 H0Z" fill="${a}"/><path d="M0 620 C200 500 400 740 600 620 S1000 500 1200 620 V800 H0Z" fill="${b}" opacity="0.8"/>`;
  }
  return Array.from({ length: 6 }, (_, i) => {
    const width = 880 - (i % 3) * 180;
    return `<rect x="160" y="${140 + i * 100}" width="${width}" height="48" rx="8" fill="${a}" opacity="${(0.9 - i * 0.1).toFixed(1)}"/>`;
  }).join('');
}

mkdirSync('public/gallery', { recursive: true });

for (const { id, hue, shape } of specs) {
  const bg = `hsl(${hue} 45% 12%)`;
  const a = `hsl(${hue} 80% 60%)`;
  const b = `hsl(${(hue + 40) % 360} 70% 45%)`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${bg}"/>${shapes(shape, a, b)}</svg>`;
  writeFileSync(`public/gallery/photo-${id}.svg`, svg);
}
console.log(`Generated ${specs.length} images in public/gallery`);