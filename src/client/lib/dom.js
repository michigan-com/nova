/**
 * Toggle class
 *
 * @param {Object} node - DOM Object
 * @param {String} className - class to toggle
 */
export function toggleClass(node, className) {
  let regex = new RegExp(`\s*${className}\s*`, 'g');
  if (regex.test(node.className)) {
    node.className = node.className.replace(regex, '');
  } else {
    node.className += ` ${className}`;
  }
}
