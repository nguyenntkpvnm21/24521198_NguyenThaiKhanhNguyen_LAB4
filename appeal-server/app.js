import express from 'express';
import { getDossier } from '../src/homeworks/AppealPortal/dossierData.js';
import { parseAppealPayload } from './parseAppeal.js';

export const SLA_WINDOW_MS = 72 * 60 * 60 * 1000;

export function createApp({
  models,
  clientOrigin,
  now = () => new Date(),
  windowMs = SLA_WINDOW_MS,
}) {
  if (!clientOrigin) throw new Error('clientOrigin is required');
  const app = express();

  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', clientOrigin);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  });
  app.use(express.json());

  app.get('/api/dossiers/:playerID', async (req, res) => {
    const dossier = getDossier(req.params.playerID);
    if (!dossier) return res.status(404).json({ error: 'Dossier not found' });

    const serverTime = now();
    const sla = await models.SlaCase.findOrCreate(dossier.id, serverTime, windowMs);
    return res.json({
      dossier,
      sla: {
        deadline: sla.deadline.toISOString(),
        serverTime: serverTime.toISOString(),
      },
    });
  });

  app.post('/api/appeals', async (req, res) => {
    const { playerID, values, errors } = parseAppealPayload(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', fields: errors });
    }

    const dossier = getDossier(playerID);
    if (!dossier) return res.status(404).json({ error: 'Dossier not found' });

    const submittedAt = now();
    const sla = await models.SlaCase.findOrCreate(dossier.id, submittedAt, windowMs);
    if (submittedAt.getTime() >= sla.deadline.getTime()) {
      return res.status(403).json({ error: 'The appeal window has closed' });
    }

    const saved = await models.Appeal.create({
      playerID: dossier.id,
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      incidentDate: new Date(values.incidentDate),
      appealDate: new Date(values.appealDate),
      reason: values.reason.trim(),
    });
    return res.status(201).json({
      id: saved.id,
      playerID: saved.playerID,
      createdAt: saved.createdAt.toISOString(),
    });
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

  app.use((err, req, res, _next) => {
    const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 500 ? err.status : 500;
    if (status === 500) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(status).json({ error: 'Bad request' });
  });

  return app;
}