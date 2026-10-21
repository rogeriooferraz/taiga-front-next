/**
 * This source code is licensed under the terms of the
 * GNU Affero General Public License found in the LICENSE file in
 * the root directory of this source tree.
 *
 * Copyright (c) 2021-present Kaleidos INC
 */

import { HtmlEditorComponent } from './html-editor.component';

jest.mock('taiga-html-editor/packages/ckeditor5-build-classic/build/ckeditor', () => ({
  __esModule: true,
  default: { create: jest.fn() },
}));

describe('HtmlEditorComponent', () => {
  it('sanitizes incoming content before updating CKEditor', () => {
    const component = new HtmlEditorComponent();
    const setData = jest.fn();
    (component as any).editor = { setData };

    component.setHtmlContent('<p>Safe <a href="javascript:alert(1)" ' +
      'onclick="alert(1)">link</a></p>');

    expect(setData).toHaveBeenCalledTimes(1);
    expect(setData).toHaveBeenCalledWith('<p>Safe <a>link</a></p>');
  });

  it('sanitizes content received before CKEditor initializes', () => {
    const component = new HtmlEditorComponent();

    component.setHtmlContent('<p>Safe</p><img src="x" onerror="alert(1)">');

    expect((component as any).html).toBe('<p>Safe</p><img src="x">');
  });
});
