import dotenv from 'dotenv';
import express from 'express';
import { loadPrivateKey, validatePrivateKey } from './config/private-key.js';
import { createFlowsRouter } from './routes/flows.routes.js';
import { createFlowController } from './controllers/flow.controller.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3005);
const privateKey = validatePrivateKey(loadPrivateKey(process.env));
const flowController = createFlowController({ privateKey });

app.use(express.json({ limit: '20mb' }));
app.use(createFlowsRouter({ flowController }));

app.listen(port, '0.0.0.0', () => {
  console.log(`WhatsApp Flows rodando na porta ${port}`);
});
