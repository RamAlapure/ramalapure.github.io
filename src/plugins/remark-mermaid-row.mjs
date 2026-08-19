/** @typedef {import('mdast').Root} Root */
/** @typedef {import('mdast').HTML} HTML */

/**
 * Wrap consecutive Mermaid diagram blocks in a side-by-side row container.
 * Use two (or more) adjacent ```mermaid fences for comparison charts.
 */
export function remarkMermaidRow() {
  /** @param {Root} tree */
  return (tree) => {
    if (!tree.children?.length) return;

    const out = [];
    let index = 0;

    while (index < tree.children.length) {
      const node = tree.children[index];

      if (isMermaidHtml(node)) {
        const group = [/** @type {HTML} */ (node)];
        let next = index + 1;

        while (next < tree.children.length && isMermaidHtml(tree.children[next])) {
          group.push(/** @type {HTML} */ (tree.children[next]));
          next += 1;
        }

        if (group.length >= 2) {
          out.push({
            type: 'html',
            value: `<div class="diagram-row">${group.map((n) => n.value).join('')}</div>`,
          });
          index = next;
          continue;
        }
      }

      out.push(node);
      index += 1;
    }

    tree.children = out;
  };
}

/** @param {unknown} node */
function isMermaidHtml(node) {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    node.type === 'html' &&
    'value' in node &&
    typeof node.value === 'string' &&
    (node.value.startsWith('<div class="mermaid">') ||
      node.value.startsWith('<pre class="mermaid">'))
  );
}
