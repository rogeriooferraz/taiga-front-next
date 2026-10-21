/**
 * This source code is licensed under the terms of the
 * GNU Affero General Public License found in the LICENSE file in
 * the root directory of this source tree.
 *
 * Copyright (c) 2021-present Kaleidos INC
 */

declare module 'taiga-html-editor/packages/ckeditor5-build-classic/build/ckeditor' {
  const content: any;
	export default content;
}

declare module '@ckeditor/ckeditor5-inspector' {
  const content: any;
	export default content;
}

declare module 'imurmurhash' {
  const content: any;
	export default content;
}

// DOMPurify's declarations use the browser DOMParser type added after
// this project's TypeScript 3.9 DOM library.
type DOMParserSupportedType = 'text/html' | 'text/xml' | 'application/xml' |
  'application/xhtml+xml' | 'image/svg+xml';
