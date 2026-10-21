/**
 * This source code is licensed under the terms of the
 * GNU Affero General Public License found in the LICENSE file in
 * the root directory of this source tree.
 *
 * Copyright (c) 2021-present Kaleidos INC
 */

// A fixed, inert image keeps CKEditor's image model and Markdown round trips
// intact without requesting an author-supplied origin before consent.
const placeholderSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60">' +
  '<rect width="220" height="60" fill="#ddd"/>' +
  '<text x="10" y="35" font-size="16">External image</text></svg>';
const placeholderPrefix = 'data:image/svg+xml,' + encodeURIComponent(placeholderSvg) +
  '#taiga-remote-image=';

function isRemoteHttpImage(src: string | null): boolean {
  if (!src) return false;
  try {
    const url = new URL(src, document.baseURI);
    return (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.origin !== window.location.origin;
  } catch (_error) {
    return false;
  }
}

export function originalRemoteImageUrl(src: string | null): string | null {
  if (!src || !src.startsWith(placeholderPrefix)) {
    return null;
  }

  try {
    const original = decodeURIComponent(src.slice(placeholderPrefix.length));
    return isRemoteHttpImage(original) ? original : null;
  } catch (_error) {
    return null;
  }
}

export function deferRemoteImageUrl(src: string | null): string | null {
  return src && isRemoteHttpImage(src) ?
    placeholderPrefix + encodeURIComponent(src) : src;
}

export function hideRemoteImages(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html || '';
  template.content.querySelectorAll('img[src]').forEach((image) => {
    const src = image.getAttribute('src');
    const deferred = deferRemoteImageUrl(src);
    if (deferred && deferred !== src) {
      image.setAttribute('src', deferred);
    }
  });
  return template.innerHTML;
}

export function restoreRemoteImages(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html || '';
  template.content.querySelectorAll('img[src]').forEach((image) => {
    const original = originalRemoteImageUrl(image.getAttribute('src'));
    if (original) {
      image.setAttribute('src', original);
    }
  });
  return template.innerHTML;
}

export function hasHiddenRemoteImages(html: string): boolean {
  const template = document.createElement('template');
  template.innerHTML = html || '';
  return Array.from(template.content.querySelectorAll('img[src]')).some(
    (image) => !!originalRemoteImageUrl(image.getAttribute('src'))
  );
}
