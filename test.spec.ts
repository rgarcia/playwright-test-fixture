import { test } from './index';

test('stealthy browser test', async ({ stealthyPage }) => {

  await stealthyPage.goto('https://www.coupang.com');
  await stealthyPage.waitForLoadState('domcontentloaded');

  // Accumulate errors to fail at the end
  const errors: Array<{ iteration: number; url: string; error: Error }> = [];

  // Repeat the random browsing 5 times
  for (let i = 0; i < 5; i++) {
    console.log(`\n--- Iteration ${i + 1} ---`);

    // Get all links on the page
    const links = await stealthyPage.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors
        .map(anchor => {
          const href = anchor.getAttribute('href');
          if (!href) return null;
          // Handle relative URLs
          try {
            const url = new URL(href, window.location.href);
            return {
              href: url.href,
              text: anchor.textContent?.trim() || '',
            };
          } catch {
            return null;
          }
        })
        .filter(link => link !== null);
    });

    // Filter links that are still on coupang.com and contain /products/ in the URL
    const coupangLinks = links.filter(link => {
      try {
        const url = new URL(link.href);
        return url.hostname.includes('coupang.com') && url.pathname.includes('/products/');
      } catch {
        return false;
      }
    });

    if (coupangLinks.length === 0) {
      console.log('No coupang.com product links found, stopping');
      break;
    }

    // Pick a random link
    const randomIndex = Math.floor(Math.random() * coupangLinks.length);
    const selectedLink = coupangLinks[randomIndex];
    console.log(`Selected link: ${selectedLink.href}`);

    // Click the link - catch errors and continue
    try {
      await stealthyPage.goto(selectedLink.href);
      await stealthyPage.waitForLoadState('domcontentloaded');

      // Wait for title to be non-empty
      await stealthyPage.waitForFunction(() => document.title.trim().length > 0);

      // Print URL and title
      const url = stealthyPage.url();
      const title = await stealthyPage.title();
      console.log(`URL: ${url}`);
      console.log(`Title: ${title}`);

      // Go back
      await stealthyPage.goBack();
      await stealthyPage.waitForLoadState('domcontentloaded');
    } catch (error) {
      // Check if it's an HTTP/2 protocol error or similar network error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isHttpError = errorMessage.includes('ERR_HTTP2_PROTOCOL_ERROR') ||
        errorMessage.includes('ERR_') ||
        errorMessage.includes('net::');

      if (isHttpError) {
        console.log(`Error in iteration ${i + 1}: ${errorMessage}`);
        errors.push({
          iteration: i + 1,
          url: selectedLink.href,
          error: error instanceof Error ? error : new Error(String(error))
        });
      } else {
        // Re-throw non-HTTP errors immediately
        throw error;
      }
    }
  }

  // Fail at the end if any HTTP/2 errors were encountered
  if (errors.length > 0) {
    const errorDetails = errors.map(e =>
      `Iteration ${e.iteration} - ${e.url}: ${e.error.message}`
    ).join('\n');

    throw new Error(`Encountered ${errors.length} HTTP/2 protocol error(s):\n${errorDetails}`);
  }
});

