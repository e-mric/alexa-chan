import MarkdownIt from 'markdown-it';
import { MAX_NOTE_LENGTH } from './session-notes.js';

// Only this configured renderer feeds the formatted-note HTML boundary.
// Never enable raw HTML, plugins, remote embeds or syntax highlighter callbacks.
const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false, breaks: false });
const defaultValidateLink = markdown.validateLink;
markdown.validateLink = href => /^(https?:|mailto:)/i.test(href) && defaultValidateLink(href);
markdown.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
  tokens[index].attrSet('target', '_blank');
  tokens[index].attrSet('rel', 'noopener noreferrer');
  tokens[index].attrSet('referrerpolicy', 'no-referrer');
  return renderer.renderToken(tokens, index, options);
};
// Loading a pasted image URL would disclose a visit even without clicking.
markdown.renderer.rules.image = (tokens, index) => `<span class="note-image">[Image: ${markdown.utils.escapeHtml(tokens[index].content || 'not loaded')}]</span>`;
for (const rule of ['heading_open', 'heading_close']) {
  markdown.renderer.rules[rule] = (tokens, index, options, env, renderer) => {
    tokens[index].tag = `h${Math.min(6, Number(tokens[index].tag.slice(1)) + 4)}`;
    return renderer.renderToken(tokens, index, options);
  };
}

export function renderNoteMarkdown(source) {
  if (typeof source !== 'string' || source.length > MAX_NOTE_LENGTH) throw Error('Invalid Markdown note');
  return markdown.render(source);
}
