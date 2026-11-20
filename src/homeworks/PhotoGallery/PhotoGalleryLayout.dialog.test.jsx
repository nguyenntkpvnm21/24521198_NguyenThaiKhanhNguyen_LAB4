import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderGallery } from './testUtils.jsx';

const getDialog = () => document.querySelector('dialog');
const getUrl = () => screen.getByTestId('url').textContent;

describe('PhotoGalleryLayout native <dialog> (URL driven)', () => {
  it('is closed when the URL has no photoId', () => {
    renderGallery('/gallery');
    expect(getDialog().open).toBe(false);
  });

  it('opens when a thumbnail is clicked and writes photoId to the URL', () => {
    renderGallery('/gallery');
    fireEvent.click(screen.getByRole('link', { name: /Exhibit B/ }));
    expect(getUrl()).toBe('/gallery?photoId=2');
    const dialog = getDialog();
    expect(dialog.open).toBe(true);
    expect(within(dialog).getByRole('heading', { name: 'Exhibit B' })).toBeTruthy();
    expect(within(dialog).getByRole('img').getAttribute('alt')).toMatch(/diagonal bands/);
  });

  it('opens from a deep link and keeps working under StrictMode', () => {
    renderGallery('/gallery?category=scene&photoId=5');
    const dialog = getDialog();
    expect(dialog.open).toBe(true);
    expect(within(dialog).getByRole('heading', { name: 'Scene 2' })).toBeTruthy();
  });

  it('keeps the category and removes only photoId when the Close button is used', async () => {
    renderGallery('/gallery?category=scene&photoId=5');
    fireEvent.click(within(getDialog()).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(getUrl()).toBe('/gallery?category=scene'));
    expect(getDialog().open).toBe(false);
  });

  it('syncs the URL when the dialog is closed natively (Esc)', async () => {
    renderGallery('/gallery?photoId=1');
    act(() => getDialog().close());
    await waitFor(() => expect(getUrl()).toBe('/gallery'));
  });

  it('closes when the backdrop is clicked but not when the content is clicked', async () => {
    renderGallery('/gallery?photoId=1');
    fireEvent.click(within(getDialog()).getByRole('img'));
    expect(getDialog().open).toBe(true);
    fireEvent.click(getDialog());
    await waitFor(() => expect(getUrl()).toBe('/gallery'));
    expect(getDialog().open).toBe(false);
  });

  it('closes when the browser Back button is pressed', async () => {
    renderGallery('/gallery');
    fireEvent.click(screen.getByRole('link', { name: /Exhibit A/ }));
    expect(getDialog().open).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Browser back' }));
    await waitFor(() => expect(getDialog().open).toBe(false));
    expect(getUrl()).toBe('/gallery');
  });

  it('returns focus to the thumbnail that opened the dialog', async () => {
    renderGallery('/gallery');
    const thumbnail = screen.getByRole('link', { name: /Exhibit B/ });
    thumbnail.focus();
    fireEvent.click(thumbnail);
    fireEvent.click(within(getDialog()).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(getDialog().open).toBe(false));
    expect(document.activeElement).toBe(thumbnail);
  });

  it('does not open for an unknown photoId and announces it', () => {
    renderGallery('/gallery?photoId=999');
    expect(getDialog().open).toBe(false);
    expect(screen.getByRole('alert').textContent).toMatch(/999/);
  });
});