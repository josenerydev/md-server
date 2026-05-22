import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { scanMarkdownFiles } from './scanner.js';
import { renderMarkdown, renderMarkdownSpeech } from './renderer.js';
import { renderIndexPage, renderFilePage } from './templates.js';

interface ServerOptions {
  root?: string;
  file?: string;
  port?: number;
  speech?: boolean;
}

export function startServer({ root, file, port = 0, speech = false }: ServerOptions): void {
  const render = speech ? renderMarkdownSpeech : renderMarkdown;
  const app = express();

  if (file) {
    const absFile = path.resolve(file);
    app.get('/', (_req, res) => {
      try {
        const content = fs.readFileSync(absFile, 'utf-8');
        const html = render(content);
        res.send(renderFilePage(html, path.basename(absFile), { showBack: false, speech }));
      } catch {
        res.status(500).send('Error reading file');
      }
    });
  } else {
    const resolvedRoot = path.resolve(root!);

    app.get('/', (_req, res) => {
      const files = scanMarkdownFiles(resolvedRoot);
      res.send(renderIndexPage(files, resolvedRoot));
    });

    app.get('/file/*', (req, res) => {
      const relPath = (req.params as Record<string, string>)[0];
      if (!relPath) {
        res.status(400).send('Bad Request');
        return;
      }

      const absPath = path.resolve(resolvedRoot, ...relPath.split('/'));

      if (!absPath.startsWith(resolvedRoot + path.sep) && absPath !== resolvedRoot) {
        res.status(403).send('Forbidden');
        return;
      }

      if (!fs.existsSync(absPath)) {
        res.status(404).send('Not Found');
        return;
      }

      try {
        const content = fs.readFileSync(absPath, 'utf-8');
        const html = render(content);
        res.send(renderFilePage(html, relPath, { speech }));
      } catch {
        res.status(500).send('Error reading file');
      }
    });
  }

  const server = http.createServer(app);

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\nError: Port ${port} is already in use. Try again (a new port will be chosen) or use --port <n>.\n`);
    } else {
      console.error(`\nServer error: ${err.message}\n`);
    }
    process.exit(1);
  });

  server.listen(port, () => {
    const addr = server.address();
    const actualPort = typeof addr === 'object' && addr ? addr.port : port;
    const url = `http://localhost:${actualPort}`;
    const serving = file ?? root!;
    console.log(`\n  md-server running at ${url}`);
    console.log(`  Serving: ${path.resolve(serving)}\n`);

    import('open')
      .then(({ default: open }) => open(url))
      .catch(() => {
        console.log(`  Could not open browser automatically. Navigate to ${url}`);
      });
  });
}
