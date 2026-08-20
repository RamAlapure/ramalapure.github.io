/** @typedef {import('mdast').Root} Root */
/** @typedef {import('mdast').HTML} HTML */
/** @typedef {import('mdast').Parent} Parent */

/**
 * Render ```mermaid fences as empty mermaid containers. Source lives in
 * data-diagram (base64) so `-->` is never parsed as HTML.
 */
export function remarkMermaid() {
  /** @param {Root} tree */
  return (tree) => {
    visit(tree);
  };
}

/** @param {Parent} node */
function visit(node) {
  if (!node.children) return;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];

    if (child.type === 'code' && child.lang === 'mermaid') {
      const source = String(child.value ?? '')
        .replace(/\r\n/g, '\n')
        .trim();
      const encoded = Buffer.from(source, 'utf8').toString('base64');
      /** @type {HTML} */
      const html = {
        type: 'html',
        value: `<div class="mermaid" data-diagram="${encoded}"></div>`,
      };
      node.children[index] = html;
      continue;
    }

    if ('children' in child) {
      visit(/** @type {Parent} */ (child));
    }
  }
}
