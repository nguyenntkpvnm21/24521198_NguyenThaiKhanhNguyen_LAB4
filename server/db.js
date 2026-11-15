const SEED = {
  nasa: [
    { id: 'seed-nasa-1', author: 'Mission Control', text: 'Artemis telemetry is nominal.', timestamp: '2026-11-01T08:00:00.000Z' },
    { id: 'seed-nasa-2', author: 'Flight Dynamics', text: 'Trajectory burn scheduled for 14:30 UTC.', timestamp: '2026-11-01T08:05:00.000Z' },
    { id: 'seed-nasa-3', author: 'Capcom', text: 'All stations, standby for handover.', timestamp: '2026-11-01T08:12:00.000Z' },
  ],
  'esports-tribunal': [
    { id: 'seed-esports-1', author: 'Tribunal Clerk', text: 'Appeal #204 has been received.', timestamp: '2026-11-02T09:00:00.000Z' },
    { id: 'seed-esports-2', author: 'Referee', text: 'Replay evidence uploaded for review.', timestamp: '2026-11-02T09:20:00.000Z' },
  ],
  notNasa: [
    { id: 'seed-notnasa-1', author: 'Pilot', text: 'This channel is definitely not about space.', timestamp: '2026-11-03T10:00:00.000Z' },
    { id: 'seed-notnasa-2', author: 'Mod', text: 'Off-topic chatter goes here.', timestamp: '2026-11-03T10:07:00.000Z' },
  ],
};

export function createDb() {
  const store = new Map(Object.entries(SEED));

  return {
    hasForum: (forum) => store.has(forum),
    getMessagesByForum: (forum) => store.get(forum) ?? [],
    addMessage(forum, message) {
      store.set(forum, [...(store.get(forum) ?? []), message]);
    },
  };
}