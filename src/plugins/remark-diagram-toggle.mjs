/** @typedef {import('mdast').Root} Root */
/** @typedef {import('mdast').Paragraph} Paragraph */
/** @typedef {import('mdast').Image} Image */
/** @typedef {import('mdast').HTML} HTML */

/**
 * Pair a Markdown image with the following Mermaid block (or diagram row)
 * into a toggle: original image vs generated diagram.
 */
export function remarkDiagramToggle() {
  /** @param {Root} tree */
  return (tree) => {
    if (!tree.children?.length) return;

    const out = [];
    let index = 0;

    while (index < tree.children.length) {
      const node = tree.children[index];
      const next = tree.children[index + 1];
      const image = getSoleImage(node);

      if (image && next && isDiagramHtml(next)) {
        out.push({
          type: 'html',
          value: wrapToggle(image, /** @type {HTML} */ (next).value),
        });
        index += 2;
        continue;
      }

      out.push(node);
      index += 1;
    }

    tree.children = out;
  };
}

/** @param {unknown} node */
function getSoleImage(node) {
  if (
    typeof node !== 'object' ||
    node === null ||
    !('type' in node) ||
    node.type !== 'paragraph' ||
    !('children' in node) ||
    !Array.isArray(node.children) ||
    node.children.length !== 1
  ) {
    return null;
  }

  const child = node.children[0];
  if (
    typeof child !== 'object' ||
    child === null ||
    !('type' in child) ||
    child.type !== 'image' ||
    !('url' in child) ||
    typeof child.url !== 'string'
  ) {
    return null;
  }

  return /** @type {Image} */ (child);
}

/** @param {unknown} node */
function isDiagramHtml(node) {
  if (
    typeof node !== 'object' ||
    node === null ||
    !('type' in node) ||
    node.type !== 'html' ||
    !('value' in node) ||
    typeof node.value !== 'string'
  ) {
    return false;
  }

  return (
    node.value.startsWith('<div class="mermaid">') ||
    node.value.startsWith('<pre class="mermaid">') ||
    node.value.startsWith('<div class="diagram-row">')
  );
}

/**
 * @param {Image} image
 * @param {string} diagramHtml
 */
function wrapToggle(image, diagramHtml) {
  const src = escapeAttr(image.url);
  const alt = escapeAttr(image.alt ?? '');

  return `<div class="diagram-toggle" data-view="image">
  <div class="diagram-toggle-toolbar" role="group" aria-label="Diagram view">
    <button type="button" class="diagram-toggle-btn" data-view="image" aria-pressed="true">Original</button>
    <button type="button" class="diagram-toggle-btn" data-view="mermaid" aria-pressed="false">Mermaid</button>
  </div>
  <div class="diagram-toggle-panel" data-panel="image">
    <img src="${src}" alt="${alt}" />
  </div>
  <div class="diagram-toggle-panel" data-panel="mermaid" hidden>
    ${diagramHtml}
  </div>
</div>`;
}

/** @param {string} value */
function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
