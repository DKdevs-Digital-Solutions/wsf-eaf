import { decryptRequest, encryptResponse } from '../lib/encryption.js';
import { handleFlowStep } from '../services/flow.service.js';

function activeResponse(version) {
  return { version: version || '3.0', data: { status: 'active' } };
}

function extractFlowData(payload) {
  if (!payload || typeof payload !== 'object') return {};
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data;
  }
  return payload;
}

export function createFlowController({ privateKey }) {
  return {
    health: (_req, res) => {
      res.status(200).json({ ok: true });
    },

    handleFlowWebhook: async (req, res) => {
      try {
        const { decryptedBody, aesKeyBuffer, initialVectorBuffer } = decryptRequest(req.body, privateKey);
        const { action, version, screen, data } = decryptedBody;
        const normalizedData = extractFlowData(data);

        if (action === 'ping') {
          return res
            .status(200)
            .type('text/plain')
            .send(encryptResponse(activeResponse(version), aesKeyBuffer, initialVectorBuffer));
        }

        if (action === 'INIT') {
          const responsePayload = await handleFlowStep({
            screen: 'INIT',
            data: normalizedData,
            version
          });

          return res
            .status(200)
            .type('text/plain')
            .send(encryptResponse(responsePayload, aesKeyBuffer, initialVectorBuffer));
        }

        if (action === 'data_exchange') {
          const responsePayload = await handleFlowStep({
            screen,
            data: normalizedData,
            version
          });

          return res
            .status(200)
            .type('text/plain')
            .send(encryptResponse(responsePayload, aesKeyBuffer, initialVectorBuffer));
        }

        return res
          .status(200)
          .type('text/plain')
          .send(encryptResponse(activeResponse(version), aesKeyBuffer, initialVectorBuffer));
      } catch (error) {
        console.error('Erro endpoint flow:', error);
        return res.status(500).send('internal_error');
      }
    }
  };
}
