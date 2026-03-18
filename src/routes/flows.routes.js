import { Router } from 'express';

export function createFlowsRouter({ flowController }) {
  const router = Router();

  router.post('/whatsapp/flows', flowController.handleFlowWebhook);
  router.get('/health', flowController.health);

  return router;
}
