import { Fragment, useId, useState } from 'react';
import { useForumMessages } from '../hooks/useForumMessages.js';
import styles from './ForumPage.module.css';
import { MessageForm } from './MessageForm.jsx';

const CHANNELS = [
  { id: 'nasa', label: 'NASA' },
  { id: 'esports-tribunal', label: 'Esports Tribunal' },
  { id: 'notNasa', label: 'notNasa' },
];

const formatTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export function ForumPage() {
  const headingId = useId();
  const [channelId, setChannelId] = useState(CHANNELS[0].id);
  const { data, loading, refreshing, error, postMessage, retry } =
    useForumMessages(channelId);

  let status = `${data.length} ${data.length === 1 ? 'message' : 'messages'}`;
  if (loading) status = 'Loading messages...';
  else if (error) status = 'Could not load messages';
  else if (refreshing) status = 'Refreshing...';

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <h2 id={headingId}>Forum</h2>
      <ul className={styles.channels} aria-label="Channels">
        {CHANNELS.map((channel) => (
          <li key={channel.id}>
            <button
              type="button"
              className={styles.channelButton}
              aria-pressed={channel.id === channelId}
              onClick={() => setChannelId(channel.id)}
            >
              {channel.label}
            </button>
          </li>
        ))}
      </ul>
      <output className={styles.status} aria-live="polite">
        {status}
      </output>
      <section className={styles.board} aria-busy={loading}>
        {error && (
          <section className={styles.alert} role="alert">
            <p>{error}</p>
            <button type="button" onClick={retry}>
              Retry
            </button>
          </section>
        )}
        {!loading && !error && data.length === 0 && <p>No messages yet.</p>}
        {!loading && !error && data.length > 0 && (
          <dl className={styles.messages}>
            {data.map((msg) => (
              <Fragment key={msg.id}>
                <dt>{msg.author}</dt>
                <dd>
                  {msg.text}{' '}
                  <time dateTime={msg.timestamp}>{formatTime(msg.timestamp)}</time>
                </dd>
              </Fragment>
            ))}
          </dl>
        )}
      </section>
      <MessageForm onSubmit={postMessage} />
    </section>
  );
}