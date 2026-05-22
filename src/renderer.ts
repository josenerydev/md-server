import { Marked, Renderer } from 'marked';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const base = new Marked({ gfm: true });

function buildSpeechRenderer(): Renderer {
  const r = new Renderer();

  // Old Renderer API uses raw strings, not token objects
  (r as any).code = (code: string): string =>
    `<hr><p style="font-family:monospace;white-space:pre-wrap;line-height:1.6;">${escapeHtml(code).replace(/\n/g, '<br>')}</p><hr>\n`;

  (r as any).codespan = (text: string): string => text;

  (r as any).blockquote = (quote: string): string =>
    `<div>${quote}</div>\n`;


  return r;
}

const speechMarked = new Marked({ gfm: true, renderer: buildSpeechRenderer() });

export function renderMarkdown(content: string): string {
  const result = base.parse(content);
  if (result instanceof Promise) throw new Error('marked returned Promise unexpectedly');
  return result;
}

export function renderMarkdownSpeech(content: string): string {
  const result = speechMarked.parse(content);
  if (result instanceof Promise) throw new Error('marked returned Promise unexpectedly');
  return result;
}
