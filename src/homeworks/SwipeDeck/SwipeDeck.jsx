import { useId, useRef } from 'react';
import { directionFromDelta } from './swipeLogic.js';
import styles from './SwipeDeck.module.css';
import { useSwipeDeck } from './useSwipeDeck.js';

const KEY_DIRECTIONS = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
};

export default function SwipeDeck() {
  const {
    status,
    error,
    current,
    remainingCount,
    historyCount,
    score,
    syncError,
    isSaving,
    swipe,
    undo,
  } = useSwipeDeck();
  const pointerStart = useRef(null);
  const hintId = useId();

  if (status === 'loading') return <p role="status">Loading profiles…</p>;
  if (status === 'error') {
    return (
      <p role="alert" className={styles.notice}>
        Could not load profiles: {error}
      </p>
    );
  }

  function handleKeyDown(event) {
    const direction = KEY_DIRECTIONS[event.key];
    if (direction) {
      event.preventDefault();
      swipe(direction);
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      undo();
    }
  }

  function handlePointerDown(event) {
    pointerStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerUp(event) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return; // pointerup without a matching pointerdown
    const direction = directionFromDelta(
      event.clientX - start.x,
      event.clientY - start.y,
    );
    if (direction) swipe(direction);
  }

  function handlePointerCancel() {
    pointerStart.current = null;
  }

  return (
    <section
      aria-label="Swipe deck"
      aria-busy={isSaving}
      aria-describedby={hintId}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={styles.deck}
    >
      <h2 className={styles.title}>Card-Swipe Deck</h2>
      <p id={hintId} className={styles.hint}>
        Keyboard: Left arrow to pass, Right arrow to like, Up arrow to super
        like, Backspace to undo. You can also drag the card or use the buttons.
      </p>
      <p role="status" className={styles.status}>
        {`Score ${score}. ${remainingCount} ${remainingCount === 1 ? 'card' : 'cards'} left.`}
      </p>
      {syncError && (
        <p role="alert" className={styles.notice}>
          {syncError}
        </p>
      )}

      {current ? (
        <article
          className={styles.card}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <span className={styles.avatar} aria-hidden="true">
            {current.name.charAt(0)}
          </span>
          <h3 className={styles.name}>
            {current.name}, {current.age}
          </h3>
          <p className={styles.bio}>{current.bio}</p>
        </article>
      ) : (
        <p className={styles.finished}>No more profiles. Check your score above.</p>
      )}

      <ul className={styles.actions}>
        <li>
          <button
            type="button"
            className={styles.actionButton}
            disabled={!current}
            onClick={() => swipe('left')}
          >
            Pass
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.actionPrimary}`}
            disabled={!current}
            onClick={() => swipe('right')}
          >
            Like
          </button>
        </li>
        <li>
          <button
            type="button"
            className={styles.actionButton}
            disabled={!current}
            onClick={() => swipe('up')}
          >
            Super Like
          </button>
        </li>
        <li>
          <button
            type="button"
            className={styles.actionButton}
            disabled={historyCount === 0}
            onClick={undo}
          >
            Undo
          </button>
        </li>
      </ul>
    </section>
  );
}