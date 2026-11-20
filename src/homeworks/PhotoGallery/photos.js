export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'scene', label: 'Scene' },
  { id: 'document', label: 'Documents' },
];

const CIRCLES = 'Abstract illustration of two overlapping circles on a dark background';
const DIAGONAL = 'Abstract illustration of two diagonal bands on a dark background';
const WAVES = 'Abstract illustration of layered waves along the bottom of a dark background';
const LINES = 'Abstract illustration of horizontal bars of decreasing length on a dark background';

function photo(id, category, title, alt, caption) {
  return {
    id: String(id),
    category,
    title,
    alt,
    caption,
    src: `/gallery/photo-${id}.svg`,
    width: 1200,
    height: 800,
  };
}

export const PHOTOS = [
  photo(1, 'evidence', 'Exhibit A', CIRCLES, 'Sample evidence image generated for this lab.'),
  photo(2, 'evidence', 'Exhibit B', DIAGONAL, 'Second sample evidence image.'),
  photo(3, 'evidence', 'Exhibit C', WAVES, 'Third sample evidence image.'),
  photo(4, 'scene', 'Scene 1', WAVES, 'Placeholder scene image.'),
  photo(5, 'scene', 'Scene 2', CIRCLES, 'Placeholder scene image.'),
  photo(6, 'scene', 'Scene 3', DIAGONAL, 'Placeholder scene image.'),
  photo(7, 'document', 'Document 1', LINES, 'Placeholder document image.'),
  photo(8, 'document', 'Document 2', LINES, 'Placeholder document image.'),
];