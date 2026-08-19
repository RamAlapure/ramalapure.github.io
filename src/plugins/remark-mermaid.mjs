/** @typedef {import('mdast').Root} Root */
/** @typedef {import('mdast').Code} Code */
/** @typedef {import('mdast').HTML} HTML */
/** @typedef {import('mdast').Parent} Parent */

/**
 * Render ```mermaid fences as <pre class="mermaid"> so they bypass Shiki
 * highlighting and are not parsed as nested HTML by rehype.
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
      /** @type {HTML} */
      const html = {
        type: 'html',
        value: `<pre class="mermaid">${escapeHtml(child.value)}</pre>`,
      };
      node.children[index] = html;
      continue;
    }

    if ('children' in child) {
      visit(/** @type {Parent} */ (child));
    }
  }
}

/** @param {string} text */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
