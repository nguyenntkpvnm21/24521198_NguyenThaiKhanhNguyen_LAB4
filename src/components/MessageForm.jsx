import { useId, useState } from 'react';
import styles from './MessageForm.module.css';

export function MessageForm({ onSubmit }) {
  const authorId = useId();
  const textId = useId();
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await onSubmit({ author: author.trim(), text: text.trim() });
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.field}>
        <label htmlFor={authorId}>Author</label>
        <input
          id={authorId}
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          autoComplete="nickname"
        />
      </p>
      <p className={styles.field}>
        <label htmlFor={textId}>Message</label>
        <input
          id={textId}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
        />
      </p>
      <p className={styles.actions}>
        <button type="submit" disabled={sending}>
          Send
        </button>
        <span className={styles.error} role="alert">
          {error}
        </span>
      </p>
    </form>
  );
}