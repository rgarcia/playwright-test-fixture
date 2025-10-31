import Kernel from '@onkernel/sdk';
import { BrowserCreateResponse } from '@onkernel/sdk/resources';
import 'dotenv/config';
import { BrowserContext, chromium, Page } from 'patchright';
import { test as base } from 'patchright/test';

type StealthyFixtures = {
  stealthyPage: Page;
  stealthyContext: {
    browserContext: BrowserContext;
    kernel: Kernel;
    kBrowser: BrowserCreateResponse;
  };
};

export const test = base.extend<StealthyFixtures>({
  stealthyContext: async ({ }, use) => {
    const kernel = new Kernel({
      apiKey: process.env.KERNEL_API_KEY,
    });
    const kBrowser = await kernel.browsers.create({
      stealth: false,
      headless: false,
      proxy_id: process.env.KERNEL_PROXY_ID
    });
    const browser = await chromium.connectOverCDP(kBrowser.cdp_ws_url);
    const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.3' });
    await use({ browserContext: context, kernel, kBrowser });
    await context.close();
    if (kBrowser.persistence?.id) {
      await kernel.browsers.deleteByID(kBrowser.session_id);
    }
  },

  stealthyPage: async ({ stealthyContext }, use) => {
    const page = await stealthyContext.browserContext.newPage();
    await use(page);
    await page.close();
  },
});
