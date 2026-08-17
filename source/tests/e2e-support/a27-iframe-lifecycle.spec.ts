import { expect, test, type Page } from '@playwright/test';

async function waitForIframe(page: Page) {
  await page.waitForFunction(() =>
    (window as Window & { __aqpIframeLoads?: number }).__aqpIframeLoads === 1);
  const frame = page.frames().find((candidate) => candidate !== page.mainFrame());
  expect(frame, 'one live child iframe should be present').toBeDefined();
  return frame!;
}

test('moving a live iframe between DOM parents recreates its child document', async ({ page }) => {
  await page.setContent(`
    <!doctype html>
    <meta charset="utf-8">
    <div id="original-parent">
      <iframe id="participant-frame" srcdoc="<script>window.__aqpRecoveryMarker='fresh-document'; parent.__aqpIframeLoads=(parent.__aqpIframeLoads||0)+1;<\/script>"></iframe>
    </div>
    <div id="recovery-parent"></div>
  `);

  const firstFrame = await waitForIframe(page);
  await firstFrame.evaluate(() => {
    (window as Window & { __aqpRecoveryMarker?: string }).__aqpRecoveryMarker = 'completed-recovery-state';
  });
  await expect.poll(() => firstFrame.evaluate(() =>
    (window as Window & { __aqpRecoveryMarker?: string }).__aqpRecoveryMarker)).toBe('completed-recovery-state');

  const loadsBeforeMove = await page.evaluate(() =>
    (window as Window & { __aqpIframeLoads?: number }).__aqpIframeLoads ?? 0);
  await page.evaluate(() => {
    const iframe = document.getElementById('participant-frame');
    const target = document.getElementById('recovery-parent');
    if (!iframe || !target) throw new Error('iframe lifecycle fixture is incomplete');
    target.appendChild(iframe);
  });

  await expect.poll(() => page.evaluate(() =>
    (window as Window & { __aqpIframeLoads?: number }).__aqpIframeLoads ?? 0)).toBeGreaterThan(loadsBeforeMove);
  const recreatedFrame = page.frames().find((candidate) => candidate !== page.mainFrame());
  expect(recreatedFrame, 'the moved iframe should have a newly created child document').toBeDefined();
  await expect.poll(() => recreatedFrame!.evaluate(() =>
    (window as Window & { __aqpRecoveryMarker?: string }).__aqpRecoveryMarker)).toBe('fresh-document');
});

test('style-only recovery changes preserve the live iframe document', async ({ page }) => {
  await page.setContent(`
    <!doctype html>
    <meta charset="utf-8">
    <div id="live-question" style="position:fixed;inset:0;overflow:hidden">
      <iframe id="participant-frame" srcdoc="<script>window.__aqpRecoveryMarker='fresh-document'; parent.__aqpIframeLoads=(parent.__aqpIframeLoads||0)+1;<\/script>"></iframe>
    </div>
  `);

  const frame = await waitForIframe(page);
  await frame.evaluate(() => {
    (window as Window & { __aqpRecoveryMarker?: string }).__aqpRecoveryMarker = 'completed-recovery-state';
  });
  const loadsBeforeStyleRelease = await page.evaluate(() =>
    (window as Window & { __aqpIframeLoads?: number }).__aqpIframeLoads ?? 0);

  await page.evaluate(() => {
    const liveQuestion = document.getElementById('live-question');
    const iframe = document.getElementById('participant-frame');
    if (!liveQuestion || !iframe) throw new Error('iframe lifecycle fixture is incomplete');
    liveQuestion.style.position = 'relative';
    liveQuestion.style.inset = 'auto';
    liveQuestion.style.width = '100%';
    liveQuestion.style.height = 'auto';
    liveQuestion.style.overflow = 'visible';
    iframe.style.position = 'relative';
    iframe.style.width = '100%';
    iframe.style.height = '70vh';
  });

  await page.waitForTimeout(50);
  expect(await page.evaluate(() =>
    (window as Window & { __aqpIframeLoads?: number }).__aqpIframeLoads ?? 0)).toBe(loadsBeforeStyleRelease);
  expect(await frame.evaluate(() =>
    (window as Window & { __aqpRecoveryMarker?: string }).__aqpRecoveryMarker)).toBe('completed-recovery-state');
});
