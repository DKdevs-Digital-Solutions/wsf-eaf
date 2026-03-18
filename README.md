# WhatsApp Flows Backend

Backend mínimo só para a rota do WhatsApp Flows.

## Rotas
- `POST /whatsapp/flows`
- `GET /health`

## Rodar local
```bash
cp .env.example .env
npm install
npm start
```

## Rodar com Docker Compose
```bash
cp .env.example .env
docker compose up --build -d
```
