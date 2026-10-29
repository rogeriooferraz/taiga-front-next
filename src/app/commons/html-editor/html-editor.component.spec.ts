/**
 * This source code is licensed under the terms of the
 * GNU Affero General Public License found in the LICENSE file in
 * the root directory of this source tree.
 *
 * Copyright (c) 2021-present Kaleidos INC
 */

import { HtmlEditorComponent } from './html-editor.component';
import ClassicEditor from 'taiga-html-editor/packages/ckeditor5-build-classic/build/ckeditor';

jest.mock('taiga-html-editor/packages/ckeditor5-build-classic/build/ckeditor', () => ({
  __esModule: true,
  default: { create: jest.fn() },
}));

describe('HtmlEditorComponent', () => {
  const cd = { markForCheck: jest.fn(), detectChanges: jest.fn() } as any;

  it('uses the selected editor UI language and its shipped translation', async () => {
    for (const [language, uiLanguage] of [
      ['en', 'en'],
      ['pt-br', 'pt-br'],
      ['zh-hans', 'zh-cn'],
      ['zh-hant', 'zh'],
    ]) {
      const component = new HtmlEditorComponent(cd);
      component.lan = language;
      (component as any).el = { nativeElement: document.createElement('div') };
      const create = ClassicEditor.create as jest.Mock;
      create.mockReturnValue(new Promise(() => {}));

      (component as any).initEditor();
      expect(create.mock.calls[0][1].language.content).toBe(language);
      expect(create.mock.calls[0][1].language.ui).toBe(uiLanguage);
      create.mockClear();

      if (language !== 'en') {
        const load = jest.fn((_path, done) => done());
        const previousLoader = (window as any).ljs;
        const previousVersion = (window as any).TAIGA_VERSION;
        (window as any).ljs = { load };
        (window as any).TAIGA_VERSION = 'v-test';
        try {
          await component.getLegacyLoadTranslation();
          expect(load.mock.calls[0][0]).toBe(
            `/v-test/ckeditor-translations/${uiLanguage}.js`);
        } finally {
          (window as any).ljs = previousLoader;
          (window as any).TAIGA_VERSION = previousVersion;
        }
      }
    }
  });

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
