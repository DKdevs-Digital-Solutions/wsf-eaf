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

// Logs básicos de roteamento (mantém o mesmo padrão do projeto original)
app.use((req, _res, next) => {
  try {
    const path = (req.originalUrl || req.path).split('?')[0];
    console.log('[ROUTER]', {
      method: req.method,
      path,
      time: new Date().toISOString()
    });
  } catch (_e) {
    // ignore
  }
  next();
});

app.get('/health', (_req, res) => res.status(200).send('ok'));

// Guardrail: este serviço NÃO expõe proxy. Se alguém bater em /proxy/*, devolve 404.
app.use('/proxy', (_req, res) => res.status(404).json({ error: 'not_found' }));

app.use(createFlowsRouter({ flowController }));

app.listen(port, '0.0.0.0', () => {
  console.log(`Flow endpoint rodando na porta ${port}`);
});
