import { TastingPage } from './app.po';

describe('tasting App', function() {
  let page: TastingPage;

  beforeEach(() => {
    page = new TastingPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
