/*
 * RF-01 diagnostic only — Safari + VoiceOver.
 *
 * Purpose: test whether Safari/VoiceOver will announce the existing Connecting
 * status when its live urgency is temporarily raised while retaining role=status.
 * Do not use for real data collection and do not merge into main as-is.
 *
 * Paste this AFTER the exact 64a936... Qualtrics bridge in the same Qualtrics
 * question JavaScript editor. Keep the forced wrong-origin setup for the A26
 * diagnostic route and listen only for the first Connecting announcement.
 */
Qualtrics.SurveyEngine.addOnReady(function rf01SafariVoiceOverStatusDiagnostic() {
  var status = document.getElementById('accessible-questionnaire-collection-status');
  var ua = window.navigator && window.navigator.userAgent
    ? String(window.navigator.userAgent)
    : '';
  var isSafari = /Safari\//.test(ua) && !/(Chrome|Chromium|CriOS|Edg|OPR|FxiOS)\//.test(ua);

  if (!status || !isSafari) return;

  window.setTimeout(function reannounceConnectingForSafariVoiceOver() {
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'assertive');
    status.setAttribute('aria-atomic', 'true');
    status.setAttribute('aria-relevant', 'additions text');
    status.setAttribute('data-severity', 'information');
    status.textContent = '';

    window.setTimeout(function insertConnectingDiagnostic() {
      status.textContent = 'Connecting questionnaire package 0.8.10-q10 to this Qualtrics response.';

      window.setTimeout(function restorePoliteStatus() {
        if (status.getAttribute('role') === 'status') {
          status.setAttribute('aria-live', 'polite');
        }
      }, 1500);
    }, 100);
  }, 500);
});
