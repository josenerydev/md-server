import path from 'path';

const CSS_RESET = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2328; }
  a { color: #0969da; text-decoration: none; }
  a:hover { text-decoration: underline; }
`;

const CSS_INDEX = `
  ${CSS_RESET}
  body { background: #f6f8fa; }
  .container { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
  header { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #d0d7de; }
  header h1 { font-size: 1.5rem; font-weight: 600; }
  .meta { margin-top: 0.5rem; font-size: 0.875rem; color: #656d76; }
  .meta code { font-family: ui-monospace, monospace; background: #eaeef2; padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.8125rem; }
  .section { margin-bottom: 1.75rem; }
  .section-header { font-size: 0.8125rem; font-weight: 600; color: #656d76; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; padding: 0 0.25rem; }
  .file-list { list-style: none; background: #fff; border: 1px solid #d0d7de; border-radius: 6px; overflow: hidden; }
  .file-list li + li { border-top: 1px solid #d0d7de; }
  .file-list a { display: flex; align-items: baseline; gap: 0.5rem; padding: 0.625rem 1rem; font-size: 0.9375rem; }
  .file-list a:hover { background: #f6f8fa; text-decoration: none; }
  .file-list .name { font-weight: 500; }
  .file-list .ext { color: #8c959f; font-size: 0.8125rem; }
`;

const CSS_FILE = `
  ${CSS_RESET}
  body { background: #fff; }
  .top-bar { background: #f6f8fa; border-bottom: 1px solid #d0d7de; padding: 0.625rem 1.25rem; font-size: 0.875rem; }
  .top-bar a { color: #57606a; }
  .top-bar a:hover { color: #0969da; text-decoration: none; }
  .container { max-width: 860px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
  h1 { font-size: 1.875rem; padding-bottom: 0.5rem; border-bottom: 1px solid #d0d7de; margin-bottom: 1.25rem; }
  h2 { font-size: 1.375rem; margin: 1.75rem 0 0.75rem; padding-bottom: 0.375rem; border-bottom: 1px solid #d0d7de; }
  h3 { font-size: 1.125rem; margin: 1.5rem 0 0.5rem; }
  h4, h5, h6 { font-size: 1rem; margin: 1.25rem 0 0.5rem; }
  p { margin: 0.75rem 0; line-height: 1.7; }
  ul, ol { margin: 0.75rem 0; padding-left: 1.75rem; }
  li { margin: 0.25rem 0; line-height: 1.7; }
  li > ul, li > ol { margin: 0.25rem 0; }
  code { font-family: ui-monospace, 'SFMono-Regular', Consolas, monospace; font-size: 0.875em; background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 4px; padding: 0.1em 0.4em; }
  pre { background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 6px; padding: 1rem 1.25rem; overflow-x: auto; margin: 1rem 0; }
  pre code { background: none; border: none; padding: 0; font-size: 0.875rem; line-height: 1.6; }
  blockquote { border-left: 4px solid #d0d7de; margin: 1rem 0; padding: 0.5rem 1rem; color: #57606a; }
  table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.9375rem; }
  th, td { border: 1px solid #d0d7de; padding: 0.5rem 0.75rem; text-align: left; }
  th { background: #f6f8fa; font-weight: 600; }
  __ZEBRA__
  hr { border: none; border-top: 1px solid #d0d7de; margin: 1.5rem 0; }
  img { max-width: 100%; height: auto; }
  .task-list-item { list-style: none; margin-left: -1.75rem; padding-left: 1.75rem; }
`;

export function renderIndexPage(files: string[], root: string): string {
  const groups = new Map<string, string[]>();

  for (const f of files) {
    const dir = path.dirname(f) === '.' ? '(raiz)' : path.dirname(f);
    const list = groups.get(dir) ?? [];
    list.push(f);
    groups.set(dir, list);
  }

  const sections = Array.from(groups.entries())
    .map(([dir, groupFiles]) => {
      const items = groupFiles
        .map((f) => {
          const name = path.basename(f, '.md');
          const href = f.split('/').map(encodeURIComponent).join('/');
          return `<li><a href="/file/${href}"><span class="name">${escapeHtml(name)}</span><span class="ext">.md</span></a></li>`;
        })
        .join('\n');
      return `
        <div class="section">
          <div class="section-header">${escapeHtml(dir)}</div>
          <ul class="file-list">${items}</ul>
        </div>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>md-server</title>
  <style>${CSS_INDEX}</style>
</head>
<body>
  <div class="container">
    <header>
      <h1>md-server</h1>
      <p class="meta">Servindo <code>${escapeHtml(root)}</code> &mdash; ${files.length} arquivo${files.length !== 1 ? 's' : ''}</p>
    </header>
    ${sections}
  </div>
</body>
</html>`;
}

export function renderFilePage(
  htmlContent: string,
  relPath: string,
  { showBack = true, speech = false }: { showBack?: boolean; speech?: boolean } = {}
): string {
  const name = path.basename(relPath, '.md');
  const topBar = showBack
    ? `<div class="top-bar">
    <a href="/">&#8592; Índice</a>
    &nbsp;/&nbsp;
    ${escapeHtml(relPath)}
  </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(name)}</title>
  <style>${CSS_FILE.replace('__ZEBRA__', speech ? '' : 'tr:nth-child(even) td { background: #f6f8fa; }')}${speech ? 'th { background: none; font-weight: normal; }' : ''}</style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
</head>
<body>
  ${topBar}
  <div class="container">
    ${htmlContent}
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>hljs.highlightAll();</script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
