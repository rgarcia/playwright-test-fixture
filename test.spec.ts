import { test } from './index';

test('stealthy browser test', async ({ stealthyPage, stealthyContext }) => {
  const { kernel, kBrowser } = stealthyContext;

  await stealthyPage.goto('https://www.coupang.com');
  const title = await stealthyPage.title();
  console.log('Page title:', title);

  // move the mouse around
  await kernel.browsers.computer.moveMouse(kBrowser.session_id, { x: 500, y: 500 });
  await kernel.browsers.computer.moveMouse(kBrowser.session_id, { x: 100, y: 100 });
  await kernel.browsers.computer.moveMouse(kBrowser.session_id, { x: 500, y: 500 });
  await kernel.browsers.computer.moveMouse(kBrowser.session_id, { x: 100, y: 100 });

  await stealthyPage.goto('https://www.coupang.com/vp/products/7225189423?itemId=3252308337&vendorItemId=71239386725&from=home_C2&traid=home_C2&trcid=4750068');
  const newTitle = await stealthyPage.title();
  console.log('Page title:', newTitle);
});

