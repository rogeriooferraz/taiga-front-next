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
  const cd = { markForCheck: jest.fn(), detectChanges: jest.fn() } as any;

  it('sanitizes incoming content before updating CKEditor', () => {
    const component = new HtmlEditorComponent(cd);
    const setData = jest.fn();
    (component as any).editor = { setData };

    component.setHtmlContent('<p>Safe <a href="javascript:alert(1)" ' +
      'onclick="alert(1)">link</a></p>');

    expect(setData).toHaveBeenCalledTimes(1);
    expect(setData).toHaveBeenCalledWith('<p>Safe <a>link</a></p>');
  });

  it('sanitizes content received before CKEditor initializes', () => {
    const component = new HtmlEditorComponent(cd);

    component.setHtmlContent('<p>Safe</p><img src="/media/photo.png" onerror="alert(1)">');

    expect((component as any).html).toBe('<p>Safe</p><img src="/media/photo.png">');
  });

  it('keeps external images inert until the editor requests them', () => {
    const component = new HtmlEditorComponent(cd);
    const setData = jest.fn();
    component.setHtmlContent('<p><img src="https://other.example/photo.png" alt="photo"></p>');
    const hidden = (component as any).html;
    expect(hidden).not.toContain('src="https://other.example/photo.png"');
    expect(component.hasDeferredImages).toBe(true);

    (component as any).editor = { getData: () => hidden, setData };
    component.loadDeferredImages();

    expect(setData).toHaveBeenCalledWith(
      '<p><img src="https://other.example/photo.png" alt="photo"></p>'
    );
    expect(component.hasDeferredImages).toBe(false);
  });

  it('keeps arbitrary same-origin images inert until the editor requests them', () => {
    const component = new HtmlEditorComponent(cd);
    const setData = jest.fn();
    component.setHtmlContent('<p><img src="/api/v1/projects" alt="local"></p>');
    const hidden = (component as any).html;
    expect(hidden).not.toContain('src="/api/v1/projects"');
    expect(component.hasDeferredImages).toBe(true);

    (component as any).editor = { getData: () => hidden, setData };
    component.loadDeferredImages();

    expect(setData).toHaveBeenCalledWith(
      '<p><img src="/api/v1/projects" alt="local"></p>'
    );
    expect(component.hasDeferredImages).toBe(false);
  });
});
