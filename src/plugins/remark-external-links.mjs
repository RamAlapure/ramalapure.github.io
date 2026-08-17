/** @typedef {import('mdast').Root} Root */
/** @typedef {import('mdast').Link} Link */
/** @typedef {import('mdast').Parent} Parent */

const SITE_HOSTS = new Set(['alapureram.com', 'www.alapureram.com']);

/**
 * Open external http(s) links in a new tab with safe rel attributes.
 * Same-site links stay in the current tab.
 */
export function remarkExternalLinks() {
  /** @param {Root} tree */
  return (tree) => {
    visit(tree);
  };
}

/** @param {Parent} node */
function visit(node) {
  if (!node.children) return;

  for (const child of node.children) {
    if (child.type === 'link') {
      applyExternalLinkAttrs(/** @type {Link} */ (child));
    }

    if ('children' in child) {
      visit(/** @type {Parent} */ (child));
    }
  }
}

/** @param {Link} node */
function applyExternalLinkAttrs(node) {
  const url = node.url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return;

  try {
    const { hostname } = new URL(url);
    if (SITE_HOSTS.has(hostname)) return;
  } catch {
    return;
  }

  node.data = node.data ?? {};
  node.data.hProperties = {
    ...node.data.hProperties,
    target: '_blank',
    rel: 'noopener noreferrer',
  };
}
