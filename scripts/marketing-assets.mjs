// Closed publication vocabulary for this site's original art, not a general SVG sanitizer.
export const VISUAL_FILES = Object.freeze({ device: 'device.png', capture: 'capture.png', secondaryCapture: 'secondary-capture.png', illustration: 'art.svg' });

const NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?%?$/;
const ID = /^[A-Za-z_][A-Za-z0-9_.-]*$/;
const PAINT = /^(?:#[a-fA-F0-9]{3,4}|#[a-fA-F0-9]{6}|#[a-fA-F0-9]{8}|none|white|black|transparent|currentColor)$/;
const COMMON = new Set(['id', 'fill', 'stroke', 'opacity', 'fill-opacity', 'stroke-opacity', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'fill-rule', 'transform', 'mask']);
const ATTRIBUTES = {
  svg: new Set(['xmlns', 'width', 'height', 'viewBox', 'role', 'aria-labelledby', 'aria-label']),
  title: new Set(), desc: new Set(), g: new Set(), defs: new Set(),
  path: new Set(['d']), circle: new Set(['cx', 'cy', 'r']), ellipse: new Set(['cx', 'cy', 'rx', 'ry']),
  linearGradient: new Set(['x1', 'y1', 'x2', 'y2', 'gradientUnits', 'gradientTransform']),
  stop: new Set(['offset', 'stop-color', 'stop-opacity']),
  mask: new Set(['x', 'y', 'width', 'height', 'maskUnits', 'maskContentUnits']),
};
const NUMERIC = new Set(['x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height', 'opacity', 'fill-opacity', 'stroke-opacity', 'stroke-width', 'offset', 'stop-opacity']);

function validateSvg(bytes, visual) {
  const reject = reason => { throw new Error(`unsafe SVG ${visual.src}: ${reason}`); };
  let xml;
  try { xml = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { reject('invalid UTF-8'); }
  // No entity decoding, alternate namespaces, declarations or processing instructions.
  if (/[&\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(xml) || /<\?|<!(?!--)/.test(xml)) reject('entities, declarations or processing instructions');
  const stack = [];
  const ids = new Set();
  const references = [];
  let root = false;
  let cursor = 0;
  while (cursor < xml.length) {
    if (xml.startsWith('<!--', cursor)) {
      const end = xml.indexOf('-->', cursor + 4);
      if (end < 0 || xml.slice(cursor + 4, end).includes('--')) reject('malformed comment');
      cursor = end + 3;
      continue;
    }
    if (xml[cursor] !== '<') {
      const end = xml.indexOf('<', cursor);
      const value = xml.slice(cursor, end < 0 ? xml.length : end);
      if (value.trim() && !['title', 'desc'].includes(stack.at(-1))) reject('unexpected text');
      if (value.includes(']]>')) reject('malformed text');
      cursor = end < 0 ? xml.length : end;
      continue;
    }
    const end = xml.indexOf('>', cursor);
    if (end < 0) reject('unclosed tag');
    const token = xml.slice(cursor, end + 1);
    cursor = end + 1;
    const closing = /^<\/([A-Za-z]+)\s*>$/.exec(token);
    if (closing) {
      if (stack.pop() !== closing[1]) reject('unbalanced element');
      continue;
    }
    const opening = /^<([A-Za-z]+)((?:\s+[\s\S]*?)?)\s*(\/?)>$/.exec(token);
    if (!opening) reject('malformed element');
    const [, tag, raw, selfClosing] = opening;
    if (!Object.hasOwn(ATTRIBUTES, tag)) reject(`unsupported element ${tag}`);
    if (['title', 'desc', 'stop', 'path', 'circle', 'ellipse'].includes(stack.at(-1))) reject('unexpected child element');
    if (!stack.length) {
      if (root || tag !== 'svg') reject('expected one SVG root');
      root = true;
    } else if (tag === 'svg') reject('nested SVG root');
    const attrs = new Map();
    let offset = 0;
    while (offset < raw.length) {
      if (!raw.slice(offset).trim()) break;
      const match = /^\s+([A-Za-z][A-Za-z0-9:-]*)\s*=\s*(?:"([^"<>]*)"|'([^'<>]*)')/.exec(raw.slice(offset));
      if (!match) reject('malformed attribute');
      offset += match[0].length;
      const name = match[1];
      const value = match[2] ?? match[3];
      if (attrs.has(name) || (!COMMON.has(name) && !ATTRIBUTES[tag].has(name))) reject(`unsupported or duplicate attribute ${name}`);
      attrs.set(name, value);
      if (name === 'id') {
        if (!ID.test(value) || ids.has(value)) reject('invalid or duplicate ID');
        ids.add(value);
      } else if (['fill', 'stroke', 'mask', 'stop-color'].includes(name)) {
        const local = /^url\(#([A-Za-z_][A-Za-z0-9_.-]*)\)$/.exec(value);
        if (local && name !== 'stop-color') references.push(local[1]);
        else if (name === 'mask' ? value !== 'none' : !PAINT.test(value)) reject('unsupported paint or resource reference');
      } else if (NUMERIC.has(name)) {
        if (!NUMBER.test(value) || !Number.isFinite(Number(value.replace(/%$/, '')))) reject('invalid numeric geometry');
      } else if (name === 'd') {
        if (!value || !/^[MmZzLlHhVvCcSsQqTtAaEe0-9+.,\s-]+$/.test(value)) reject('unsupported path geometry');
      } else if (name === 'transform' || name === 'gradientTransform') {
        if (!/^(?:\s*(?:matrix|translate|scale|rotate|skewX|skewY)\(\s*[+\-.0-9eE,\s]+\)\s*)+$/.test(value)) reject('unsupported transform');
      } else if (name === 'stroke-dasharray') {
        if (value !== 'none' && !value.split(/[\s,]+/).every(n => NUMBER.test(n))) reject('invalid dash array');
      } else if (name === 'stroke-linecap') {
        if (!['butt', 'round', 'square'].includes(value)) reject('unsupported line cap');
      } else if (name === 'stroke-linejoin') {
        if (!['miter', 'round', 'bevel'].includes(value)) reject('unsupported line join');
      } else if (name === 'fill-rule') {
        if (!['nonzero', 'evenodd'].includes(value)) reject('unsupported fill rule');
      } else if (['gradientUnits', 'maskUnits', 'maskContentUnits'].includes(name)) {
        if (!['userSpaceOnUse', 'objectBoundingBox'].includes(value)) reject('unsupported coordinate units');
      } else if (name === 'role') {
        if (value !== 'img') reject('unsupported role');
      } else if (name === 'aria-labelledby') {
        if (!value.split(/\s+/).every(id => ID.test(id))) reject('invalid ARIA reference');
        references.push(...value.split(/\s+/));
      }
    }
    if (tag === 'svg') {
      const viewBox = attrs.get('viewBox')?.trim().split(/[\s,]+/).map(Number);
      if (attrs.get('xmlns') !== 'http://www.w3.org/2000/svg') reject('missing SVG namespace');
      if (attrs.get('width') !== String(visual.width) || attrs.get('height') !== String(visual.height) || !viewBox || viewBox.length !== 4 || viewBox[0] !== 0 || viewBox[1] !== 0 || viewBox[2] !== visual.width || viewBox[3] !== visual.height) reject('dimensions or viewBox do not match metadata');
    }
    if (!selfClosing) stack.push(tag);
  }
  if (!root || stack.length) reject('incomplete SVG document');
  if (references.some(id => !ids.has(id))) reject('unresolved local reference');
}

export function validateVisualAsset(bytes, visual, role) {
  if (!Object.hasOwn(VISUAL_FILES, role)) throw new Error(`unknown visual role: ${role}`);
  if (role === 'illustration') {
    validateSvg(bytes, visual);
    return;
  }
  if (bytes.length < 33 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || bytes.readUInt32BE(8) !== 13 || bytes.toString('ascii', 12, 16) !== 'IHDR' || bytes.readUInt32BE(16) !== visual.width || bytes.readUInt32BE(20) !== visual.height) throw new Error(`visual dimensions or PNG content do not match: ${visual.src}`);
}
