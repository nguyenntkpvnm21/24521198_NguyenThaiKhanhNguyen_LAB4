import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderGallery } from './testUtils.jsx';

const getPhotoItems = () =>
  within(screen.getByRole('list', { name: 'Photos' })).getAllByRole('listitem');
const getCategoryNav = () =>
  within(screen.getByRole('navigation', { name: 'Photo categories' }));
const getUrl = () => screen.getByTestId('url').textContent;

describe('PhotoGalleryLayout category filter (URL driven)', () => {
  it('shows all 8 photos when no category is in the URL', () => {
    renderGallery('/gallery');
    expect(getPhotoItems()).toHaveLength(8);
    expect(screen.getByRole('status').textContent).toBe('Showing 8 of 8 photos');
    expect(getCategoryNav().getByRole('link', { name: 'All' }).getAttribute('aria-current')).toBe('true');
  });

  it('reads ?category=evidence from the URL', () => {
    renderGallery('/gallery?category=evidence');
    expect(getPhotoItems()).toHaveLength(3);
    expect(screen.getByRole('status').textContent).toBe('Showing 3 of 8 photos');
    expect(getCategoryNav().getByRole('link', { name: 'Evidence' }).getAttribute('aria-current')).toBe('true');
    expect(screen.getByRole('link', { name: /Exhibit A/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Scene 1/ })).toBeNull();
  });

  it('shows only documents for ?category=document', () => {
    renderGallery('/gallery?category=document');
    expect(getPhotoItems()).toHaveLength(2);
    expect(screen.getByRole('link', { name: /Document 1/ })).toBeTruthy();
  });

  it('writes the category to the URL when a filter link is clicked', () => {
    renderGallery('/gallery');
    fireEvent.click(getCategoryNav().getByRole('link', { name: 'Scene' }));
    expect(getUrl()).toBe('/gallery?category=scene');
    expect(getPhotoItems()).toHaveLength(3);
  });

  it('removes the category from the URL when All is clicked', () => {
    renderGallery('/gallery?category=scene');
    fireEvent.click(getCategoryNav().getByRole('link', { name: 'All' }));
    expect(getUrl()).toBe('/gallery');
    expect(getPhotoItems()).toHaveLength(8);
  });

  it('falls back to all photos and announces an unknown category', () => {
    renderGallery('/gallery?category=nope');
    expect(screen.getByRole('alert').textContent).toMatch(/Unknown category/);
    expect(getPhotoItems()).toHaveLength(8);
  });

  it('keeps the other routes working (about and 404)', () => {
    renderGallery('/gallery/about');
    expect(screen.getByRole('heading', { name: 'About this gallery' })).toBeTruthy();
  });

  it('shows a 404 alert for an unknown gallery route', () => {
    renderGallery('/gallery/missing');
    expect(screen.getByRole('alert').textContent).toMatch(/404/);
  });
});