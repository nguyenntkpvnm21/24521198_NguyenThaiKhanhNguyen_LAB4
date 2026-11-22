import mongoose from 'mongoose';

const slaCaseSchema = new mongoose.Schema({
  playerID: { type: String, required: true, unique: true },
  openedAt: { type: Date, required: true },
  deadline: { type: Date, required: true },
});

const appealSchema = new mongoose.Schema(
  {
    playerID: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    incidentDate: { type: Date, required: true },
    appealDate: { type: Date, required: true },
    reason: { type: String, required: true },
  },
  { timestamps: true },
);

export function createModels() {
  const SlaCaseModel = mongoose.models.SlaCase ?? mongoose.model('SlaCase', slaCaseSchema);
  const AppealModel = mongoose.models.Appeal ?? mongoose.model('Appeal', appealSchema);

  return {
    SlaCase: {
      // Creates the SLA record on first request; later calls return the same deadline.
      async findOrCreate(playerID, now, windowMs) {
        const doc = await SlaCaseModel.findOneAndUpdate(
          { playerID },
          {
            $setOnInsert: {
              openedAt: now,
              deadline: new Date(now.getTime() + windowMs),
            },
          },
          { upsert: true, returnDocument: 'after' },
        ).lean();
        return { playerID: doc.playerID, openedAt: doc.openedAt, deadline: doc.deadline };
      },
    },
    Appeal: {
      async create(data) {
        const doc = await AppealModel.create(data);
        return { id: String(doc._id), playerID: doc.playerID, createdAt: doc.createdAt };
      },
    },
  };
}