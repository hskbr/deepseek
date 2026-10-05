import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health and config status endpoint (safe: does not leak secret key)
app.get('/api/status', (_req, res) => {
  const rawKey = process.env.ROTEIA_API_KEY;
  const isConfigured = Boolean(rawKey && rawKey.trim().length > 0 && !rawKey.includes('your_key_here'));
  
  res.json({
    configured: isConfigured,
    defaultModel: 'deepseek/deepseek-v4-flash',
    provider: 'Roteia AI',
    endpoint: 'https://api.roteia.ai/v1/chat/completions',
  });
});

// Proxy endpoint for Roteia chat completions
app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.ROTEIA_API_KEY?.trim();
    if (!apiKey || apiKey.includes('your_key_here')) {
      return res.status(401).json({
        error: 'A chave ROTEIA_API_KEY não está configurada no servidor. Por favor, adicione sua chave nas variáveis de ambiente (.env ou secrets do AI Studio).',
        code: 'MISSING_API_KEY',
      });
    }

    const { messages, model = 'deepseek/deepseek-v4-flash', stream = true, temperature = 0.7 } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Histórico de mensagens inválido ou vazio. Envie ao menos uma mensagem.',
        code: 'INVALID_MESSAGES',
      });
    }

    // Clean and validate messages payload
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'system' ? m.role : 'user',
      content: String(m.content || ''),
    }));

    const roteiaUrl = 'https://api.roteia.ai/v1/chat/completions';
    
    // Upstream request to Roteia API
    const upstreamResponse = await fetch(roteiaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        stream: Boolean(stream),
        temperature,
      }),
    });

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text();
      let parsedError: any = null;
      try {
        parsedError = JSON.parse(errText);
      } catch {
        // Not JSON
      }

      const errorMessage =
        parsedError?.error?.message ||
        parsedError?.message ||
        parsedError?.error ||
        errText ||
        `Erro ${upstreamResponse.status}: ${upstreamResponse.statusText}`;

      return res.status(upstreamResponse.status).json({
        error: errorMessage,
        status: upstreamResponse.status,
      });
    }

    // If stream is requested, pipe SSE stream to client
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      if (upstreamResponse.body) {
        // Read upstream stream and forward to client
        const reader = upstreamResponse.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
        } catch (streamErr) {
          console.error('Error during streaming to client:', streamErr);
        } finally {
          res.end();
        }
      } else {
        res.end();
      }
      return;
    }

    // Non-streaming response
    const json = await upstreamResponse.json();
    return res.json(json);
  } catch (error: any) {
    console.error('API Proxy Error:', error);
    return res.status(500).json({
      error: error?.message || 'Erro interno ao processar a requisição no servidor proxy.',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
