import { useEffect, useId, useRef } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CATEGORIES, PHOTOS } from './photos.js';
import styles from './PhotoGalleryLayout.module.css';

function buildSearch(searchParams, changes) {
  const next = new URLSearchParams(searchParams);
  for (const [key, value] of Object.entries(changes)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  const query = next.toString();
  return query ? `?${query}` : '';
}

export default function PhotoGalleryLayout() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category');
  const isKnownCategory = CATEGORIES.some((item) => item.id === categoryParam);
  const category = isKnownCategory ? categoryParam : 'all';
  const hasUnknownCategory = categoryParam !== null && !isKnownCategory;

  const visiblePhotos =
    category === 'all'
      ? PHOTOS
      : PHOTOS.filter((photo) => photo.category === category);

  // Modal state is derived from the URL, never stored in useState.
  const selectedPhotoId = searchParams.get('photoId');
  const selectedPhoto =
    PHOTOS.find((photo) => photo.id === selectedPhotoId) ?? null;
  const hasUnknownPhoto = selectedPhotoId !== null && selectedPhoto === null;

  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const titleId = useId();

  // Syncs the native <dialog> (an external system) with the URL.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedPhoto) {
      if (!dialog.open) dialog.showModal(); // StrictMode runs effects twice
    } else if (dialog.open) {
      dialog.close(); // e.g. the browser Back button removed ?photoId
      triggerRef.current?.focus();
    }
  }, [selectedPhoto]);

  function handleClose() {
    // Back already removed photoId: nothing to sync, avoid a second navigation.
    if (selectedPhotoId === null) return;
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete('photoId'); // keep category and any other params
        return next;
      },
      { replace: true },
    );
    triggerRef.current?.focus();
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) event.currentTarget.close();
  }

  return (
    <section aria-label="Photo gallery" className={styles.gallery}>
      <nav aria-label="Photo categories">
        <ul className={styles.filterList}>
          {CATEGORIES.map((item) => {
            const isActive = item.id === category;
            return (
              <li key={item.id}>
                <Link
                  to={{
                    search: buildSearch(searchParams, {
                      category: item.id === 'all' ? '' : item.id,
                      photoId: '',
                    }),
                  }}
                  className={
                    isActive
                      ? `${styles.filterLink} ${styles.filterLinkActive}`
                      : styles.filterLink
                  }
                  aria-current={isActive ? 'true' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {hasUnknownCategory && (
        <p role="alert" className={styles.notice}>
          Unknown category “{categoryParam}”. Showing all photos.
        </p>
      )}
      {hasUnknownPhoto && (
        <p role="alert" className={styles.notice}>
          Photo “{selectedPhotoId}” was not found.
        </p>
      )}

      <p role="status" className={styles.status}>
        {`Showing ${visiblePhotos.length} of ${PHOTOS.length} photos`}
      </p>

      <ul className={styles.grid} aria-label="Photos">
        {visiblePhotos.map((photo, index) => (
          <li key={photo.id}>
            <Link
              to={{ search: buildSearch(searchParams, { photoId: photo.id }) }}
              className={styles.card}
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
              }}
            >
              <img
                className={styles.cardImage}
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading={index < 2 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : undefined}
              />
              <span className={styles.cardTitle}>{photo.title}</span>
            </Link>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={titleId}
        onClose={handleClose}
        onClick={handleBackdropClick}
      >
        {selectedPhoto && (
          <article className={styles.dialogBody}>
            <header className={styles.dialogHeader}>
              <h2 id={titleId} className={styles.dialogTitle}>
                {selectedPhoto.title}
              </h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => dialogRef.current?.close()}
              >
                Close
              </button>
            </header>
            <figure className={styles.figure}>
              <img
                className={styles.dialogImage}
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                width={selectedPhoto.width}
                height={selectedPhoto.height}
              />
              <figcaption className={styles.caption}>
                {selectedPhoto.caption}
              </figcaption>
            </figure>
          </article>
        )}
      </dialog>
    </section>
  );
}