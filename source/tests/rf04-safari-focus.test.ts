// Final exact-head trigger: tests are intentionally outside the generated release bundle.
import { describe, expect, it } from 'vitest';
import { isSafariUserAgent } from '../src/rf04-saved-session-recovery';

describe('RF-04 Safari recovery focus routing', () => {
  it('targets Safari while leaving Chromium and Firefox routes on the existing path', () => {
    expect(isSafariUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15',
    )).toBe(true);

    expect(isSafariUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
    )).toBe(false);

    expect(isSafariUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0',
    )).toBe(false);
  });
});
