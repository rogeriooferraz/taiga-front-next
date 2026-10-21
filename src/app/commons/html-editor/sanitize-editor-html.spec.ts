/**
 * This source code is licensed under the terms of the
 * GNU Affero General Public License found in the LICENSE file in
 * the root directory of this source tree.
 *
 * Copyright (c) 2021-present Kaleidos INC
 */

import { sanitizeEditorHtml } from './sanitize-editor-html';

describe('sanitizeEditorHtml', () => {
  it('preserves Markdown structures needed for editing', () => {
    const html = '<h2 id="heading">Heading</h2>' +
      '<p><strong>Bold</strong> <a class="mention" data-mention="true" ' +
      'href="project/demo/t/12">#12</a></p>' +
      '<ul><li class="task-list-item"><input type="checkbox" disabled checked>' +
      'Done</li></ul>' +
      '<p><img src="/attachments/1" alt="diagram"></p>' +
      '<pre><code class="language-python">print(1)</code></pre>';

    const result = sanitizeEditorHtml(html);

    expect(result).toContain('id="heading"');
    expect(result).toContain('<strong>Bold</strong>');
    expect(result).toContain('class="mention"');
    expect(result).toContain('data-mention="true"');
    expect(result).toContain('href="project/demo/t/12"');
    expect(result).toContain('class="task-list-item"');
    expect(result).toContain('type="checkbox"');
    expect(result).toContain('checked');
    expect(result).toContain('src="/attachments/1"');
    expect(result).toContain('class="language-python"');
  });

  it('removes executable markup before it reaches the editor', () => {
    const html = '<p>Safe <a href="javascript:alert(1)" onclick="alert(1)">link</a></p>' +
      '<img src="x" onerror="alert(1)">' +
      '<script>window.executed = true</script>' +
      '<svg onload="alert(1)"><circle></circle></svg>' +
      '<math><mtext>unsafe</mtext></math>' +
      '<p style="background:url(javascript:alert(1))">Text</p>';

    const result = sanitizeEditorHtml(html);

    expect(result).toContain('Safe');
    expect(result).toContain('Text');
    expect(result).not.toMatch(/javascript:|onclick|onerror|onload|<script|<svg|<math|style=/i);
  });

  it('rejects encoded executable URLs while retaining ordinary links', () => {
    const html = '<a href="&#x6a;ava&#x73;cript:alert(1)">encoded</a>' +
      '<a href="DATA:text/html,alert(1)">data</a>' +
      '<img src="/attachments/1" srcset="https://other.example/1 1x">' +
      '<a href="/project/demo">project</a>';

    const result = sanitizeEditorHtml(html);

    expect(result).toContain('>encoded</a>');
    expect(result).toContain('>data</a>');
    expect(result).toContain('src="/attachments/1"');
    expect(result).toContain('href="/project/demo"');
    expect(result).not.toMatch(/javascript:|data:text\/html|srcset=/i);
  });
});
