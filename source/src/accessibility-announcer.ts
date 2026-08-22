type AnnouncementPriority = 'polite' | 'assertive';

const ANNOUNCER_ROOT_ID = 'aqp-accessibility-announcer';
const ANNOUNCEMENT_RETENTION_MS = 7_000;

let announcerRoot: HTMLElement | null = null;
let politeLog: HTMLElement | null = null;
let assertiveLog: HTMLElement | null = null;

function visuallyHide(element: HTMLElement) {
  Object.assign(element.style, {
    border: '0',
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: '0',
    position: 'absolute',
    width: '1px',
    whiteSpace: 'nowrap',
  });
}

function createLog(priority: AnnouncementPriority) {
  const log = document.createElement('div');
  log.dataset.aqpAnnouncementPriority = priority;
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', priority);
  log.setAttribute('aria-relevant', 'additions');
  return log;
}

/**
 * Creates one page-level polite channel and one assertive channel before a
 * message is needed. The design follows the production announcer pattern used
 * by React Aria and Angular CDK: a stable body-level live region is created in
 * advance, and each announcement is a newly appended child rather than a text
 * replacement inside a transient component subtree.
 */
export function ensureAccessibilityAnnouncer() {
  if (
    announcerRoot?.isConnected &&
    politeLog?.isConnected &&
    assertiveLog?.isConnected
  ) {
    return announcerRoot;
  }

  const existing = document.getElementById(ANNOUNCER_ROOT_ID);
  if (existing) existing.remove();

  announcerRoot = document.createElement('div');
  announcerRoot.id = ANNOUNCER_ROOT_ID;
  announcerRoot.dataset.aqpAccessibilityAnnouncer = 'true';
  visuallyHide(announcerRoot);

  assertiveLog = createLog('assertive');
  politeLog = createLog('polite');
  announcerRoot.append(assertiveLog, politeLog);

  document.body.prepend(announcerRoot);
  return announcerRoot;
}

export function announceForAssistiveTechnology(
  message: string,
  priority: AnnouncementPriority = 'assertive',
  retentionMs = ANNOUNCEMENT_RETENTION_MS,
) {
  if (!message.trim()) return;
  ensureAccessibilityAnnouncer();

  const log = priority === 'assertive' ? assertiveLog : politeLog;
  if (!log) return;

  const item = document.createElement('div');
  item.textContent = message;
  log.append(item);

  window.setTimeout(() => item.remove(), retentionMs);
}

export function clearAccessibilityAnnouncements(priority?: AnnouncementPriority) {
  if (!announcerRoot?.isConnected) return;
  if (!priority || priority === 'assertive') assertiveLog?.replaceChildren();
  if (!priority || priority === 'polite') politeLog?.replaceChildren();
}

if (typeof document !== 'undefined') {
  if (document.body) {
    ensureAccessibilityAnnouncer();
  } else {
    document.addEventListener('DOMContentLoaded', ensureAccessibilityAnnouncer, { once: true });
  }
}
