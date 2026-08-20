import{y as ct,g as Ke,z as pt,M as Ne,a as g,t as mt,i as ht,D as ft,n as me,v as U,B as De,C as Oe,E as Me,x as gt,p as yt,F as vt,j as bt,G as Fe,f as be,P as we,A as $,m as l,l as he,k as wt,H as je}from"./shared-BYbRkO1_.js";const Ie=`__js_AQP_ACCEPTED
__js_AQP_BRIDGE_READY
__js_AQP_BRIDGE_BUILD
__js_AQP_SCHEMA
__js_AQP_SUBMISSION_ID
__js_AQP_STUDY_ID
__js_AQP_CONFIG_ID
__js_AQP_PARTICIPANT_CODE
__js_AQP_STARTED_AT
__js_AQP_COMPLETED_AT
__js_AQP_PROTOTYPE_VERSION
__js_AQP_COLLECTION_MODE
__js_AQP_INSTRUMENT_ID
__js_AQP_INSTRUMENT_NAME
__js_AQP_INSTRUMENT_VERSION
__js_AQP_DEFINITION_HASH
__js_AQP_SCORING_STRATEGY
__js_AQP_SCORE_NAME
__js_AQP_PRIMARY_SCORE
__js_AQP_SCORE_MINIMUM
__js_AQP_SCORE_MAXIMUM
__js_AQP_SCORE_DETAILS_JSON
__js_AQP_RATINGS_JSON
__js_AQP_PAIR_CHOICES_JSON
__js_AQP_PAIR_ORDER_JSON
__js_AQP_RATING_ROUTES_JSON
__js_AQP_PAIR_ROUTES_JSON
__js_AQP_CONFIGURED_SUPPORT_JSON
__js_AQP_SUPPORT_CHANGE_COUNT
__js_AQP_FINAL_SIMPLE_LANGUAGE
__js_AQP_FINAL_ANSWER_MODE
__js_AQP_FINAL_LARGE_TEXT
__js_AQP_FINAL_AUDIO
__js_AQP_FINAL_RECOVERY
__js_AQP_READ_ALOUD_USED
__js_AQP_INTERRUPTION_SUMMARY
__js_AQP_GAZE_USED
__js_AQP_GAZE_ACTION_COUNT
__js_AQP_RAW_CHUNK_COUNT
__js_AQP_RAW_01
__js_AQP_RAW_02
__js_AQP_RAW_03
__js_AQP_RAW_04
__js_AQP_RAW_05
__js_AQP_RAW_06
__js_AQP_RAW_07
__js_AQP_RAW_08
__js_AQP_RAW_09
__js_AQP_RAW_10
__js_AQP_RAW_11
__js_AQP_RAW_12
__js_AQP_RAW_13
__js_AQP_RAW_14
__js_AQP_RAW_15
__js_AQP_RAW_16
__js_AQP_RAW_17
__js_AQP_RAW_18
__js_AQP_RAW_19
__js_AQP_RAW_20
__js_AQP_RAW_21
__js_AQP_RAW_22
__js_AQP_RAW_23
__js_AQP_RAW_24
`,St=`Questionnaire complete

{{OPTIONAL_SCORE_BLOCK}}

Your questionnaire responses have been recorded successfully.

Any accessibility-support choices and input-route information have been saved separately from the questionnaire score.

No further action is required.
You may now close this page.
`,Ae=`/*
 * Accessible Questionnaire Platform Version 0.8 Qualtrics question bridge.
 *
 * Paste this complete file into the JavaScript editor of the Qualtrics
 * question that contains the iframe from question-html-template.html.
 * Keep the participant prototype on https://sasoup-yr.github.io.
 */
Qualtrics.SurveyEngine.addOnReady(function initialiseAccessibleQuestionnaireBridge() {
  var question = this;
  var childOrigin = 'https://sasoup-yr.github.io';
  var submitType = 'accessible-questionnaire:qualtrics-submit:v2';
  var receiptType = 'accessible-questionnaire:qualtrics-receipt:v2';
  var parentReadyType = 'accessible-questionnaire:qualtrics-parent-ready:v2';
  var childReadyType = 'accessible-questionnaire:qualtrics-child-ready:v2';
  var advanceFailedType = 'accessible-questionnaire:qualtrics-advance-failed:v2';
  var bridgeBuild = '0.8.10-q10';
  var iframe = document.getElementById('accessible-questionnaire-frame');
  var status = document.getElementById('accessible-questionnaire-collection-status');
  var liveQuestion = document.getElementById('accessible-questionnaire-live-question');
  var recordedSummary = document.getElementById('accessible-questionnaire-recorded-summary');
  var originalLiveParent = liveQuestion && liveQuestion.parentNode;
  var originalLiveNextSibling = liveQuestion && liveQuestion.nextSibling;
  var stagedSubmissionId = null;
  var advancing = false;
  var childConnected = false;
  var completionTimerId = null;
  var advanceWatchdogTimerId = null;
  var connectionTimerId = null;
  var parentReadyTimerIds = [];
  var relaxedLayoutStyles = [];
  var rawChunkLength = 900;
  var maximumRawChunks = 24;
  // setJSEmbeddedData only writes into the in-browser survey session; the values reach
  // the Qualtrics response when this page is submitted by clickNextButton() below.
  // Everything between the receipt and that submission is a window in which closing the
  // tab loses the response, so this hand-off is kept as short as the receipt round-trip
  // allows rather than being used as a reading pause.
  var completionDelayMs = 800;

  function setStatus(message, quiet, severity) {
    if (!status) return;
    status.textContent = message;
    if (typeof status.setAttribute === 'function') {
      status.setAttribute('data-quiet', quiet ? 'true' : 'false');
      status.setAttribute('data-severity', severity === 'error' ? 'error' : 'information');
      status.setAttribute('aria-live', quiet ? 'off' : 'polite');
    }
  }

  function setImportantStyle(element, name, value) {
    if (!element || !element.style) return;
    if (typeof element.style.setProperty === 'function') {
      element.style.setProperty(name, value, 'important');
      return;
    }
    element.style[name] = value;
  }

  function prepareFrameLayout() {
    if (typeof iframe.setAttribute === 'function') iframe.setAttribute('scrolling', 'yes');
    if (typeof iframe.setAttribute === 'function') iframe.setAttribute('aria-hidden', 'true');
    if (document.body && liveQuestion && liveQuestion.parentNode !== document.body) {
      document.body.appendChild(liveQuestion);
    }
    setImportantStyle(liveQuestion, 'position', 'fixed');
    setImportantStyle(liveQuestion, 'inset', '0');
    setImportantStyle(liveQuestion, 'width', '100vw');
    setImportantStyle(liveQuestion, 'height', '100vh');
    if (
      window.CSS &&
      typeof window.CSS.supports === 'function' &&
      window.CSS.supports('height', '100dvh')
    ) {
      setImportantStyle(liveQuestion, 'height', '100dvh');
    }
    setImportantStyle(liveQuestion, 'margin', '0');
    setImportantStyle(liveQuestion, 'padding', '0');
    setImportantStyle(liveQuestion, 'overflow', 'hidden');
    setImportantStyle(liveQuestion, 'background', '#eef2f6');
    setImportantStyle(liveQuestion, 'z-index', '2147483000');
    setImportantStyle(iframe, 'display', 'block');
    setImportantStyle(iframe, 'position', 'absolute');
    setImportantStyle(iframe, 'inset', '0');
    setImportantStyle(iframe, 'width', '100%');
    setImportantStyle(iframe, 'max-width', 'none');
    setImportantStyle(iframe, 'height', '100%');
    setImportantStyle(iframe, 'overflow', 'auto');
    setImportantStyle(iframe, 'border', '0');
    setImportantStyle(iframe, 'visibility', 'hidden');
  }

  function revealConnectedFrame() {
    if (typeof iframe.removeAttribute === 'function') iframe.removeAttribute('aria-hidden');
    setImportantStyle(iframe, 'visibility', 'visible');
  }

  function relaxStyle(element, property, value) {
    if (!element || !element.style) return;
    var previousValue = typeof element.style.getPropertyValue === 'function'
      ? element.style.getPropertyValue(property)
      : element.style[property];
    var previousPriority = typeof element.style.getPropertyPriority === 'function'
      ? element.style.getPropertyPriority(property)
      : '';
    relaxedLayoutStyles.push({
      element: element,
      property: property,
      value: previousValue || '',
      priority: previousPriority || ''
    });
    if (typeof element.style.setProperty === 'function') {
      element.style.setProperty(property, value, 'important');
    } else {
      element.style[property] = value;
    }
  }

  function lockOuterQualtricsViewport() {
    if (document.documentElement) {
      relaxStyle(document.documentElement, 'overflow', 'hidden');
    }
    if (document.body) {
      relaxStyle(document.body, 'overflow', 'hidden');
    }
  }

  function restoreRelaxedLayoutStyles() {
    for (var index = relaxedLayoutStyles.length - 1; index >= 0; index -= 1) {
      var entry = relaxedLayoutStyles[index];
      if (!entry.element || !entry.element.style) continue;
      if (typeof entry.element.style.setProperty === 'function') {
        entry.element.style.setProperty(
          entry.property,
          entry.value,
          entry.priority
        );
      } else {
        entry.element.style[entry.property] = entry.value;
      }
    }
    relaxedLayoutStyles = [];
  }

  function restoreQualtricsQuestionLayout() {
    restoreRelaxedLayoutStyles();
    if (liveQuestion && originalLiveParent && liveQuestion.parentNode !== originalLiveParent) {
      if (
        originalLiveNextSibling &&
        originalLiveNextSibling.parentNode === originalLiveParent &&
        typeof originalLiveParent.insertBefore === 'function'
      ) {
        originalLiveParent.insertBefore(liveQuestion, originalLiveNextSibling);
      } else if (typeof originalLiveParent.appendChild === 'function') {
        originalLiveParent.appendChild(liveQuestion);
      }
    }
  }

  function releaseFullscreenForNativeNavigation(preserveLiveQuestion) {
    if (preserveLiveQuestion === true) {
      restoreRelaxedLayoutStyles();
    } else {
      restoreQualtricsQuestionLayout();
    }
    setImportantStyle(liveQuestion, 'position', 'relative');
    setImportantStyle(liveQuestion, 'inset', 'auto');
    setImportantStyle(liveQuestion, 'width', '100%');
    setImportantStyle(liveQuestion, 'height', 'auto');
    setImportantStyle(liveQuestion, 'margin', '0');
    setImportantStyle(liveQuestion, 'overflow', 'visible');
    setImportantStyle(liveQuestion, 'z-index', 'auto');
    setImportantStyle(iframe, 'position', 'relative');
    setImportantStyle(iframe, 'inset', 'auto');
    setImportantStyle(iframe, 'width', '100%');
    setImportantStyle(iframe, 'height', '70vh');
    setImportantStyle(iframe, 'min-height', '600px');
    setImportantStyle(iframe, 'overflow', 'auto');
    setImportantStyle(status, 'position', 'relative');
    setImportantStyle(status, 'top', 'auto');
    setImportantStyle(status, 'left', 'auto');
    setImportantStyle(status, 'width', '100%');
    setImportantStyle(status, 'transform', 'none');
    setImportantStyle(status, 'margin', '0 0 0.75rem');
  }

  function sendParentReady() {
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage({
      type: parentReadyType,
      protocolVersion: 2,
      bridgeBuild: bridgeBuild
    }, childOrigin);
  }

  // This protocol receipt is a page-side staging acknowledgement only.
  // It does not prove that Qualtrics has durably recorded the response.
  function sendStagingReceipt(target, accepted, submissionId, error) {
    target.postMessage({
      type: receiptType,
      accepted: accepted,
      submissionId: submissionId,
      receiptId: accepted ? 'qualtrics-accepted-' + submissionId : undefined,
      error: error || undefined,
      bridgeBuild: bridgeBuild
    }, childOrigin);
  }

  function sendAdvanceFailure(message) {
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage({
      type: advanceFailedType,
      submissionId: stagedSubmissionId || '',
      error: message,
      bridgeBuild: bridgeBuild
    }, childOrigin);
  }

  function recoverFailedAdvance(reason) {
    advanceWatchdogTimerId = null;
    if (!advancing) return;
    advancing = false;
    var advanceFailureMessage = reason === 'offline'
      ? 'Internet connection unavailable. Qualtrics has not recorded this response. ' +
        'A complete backup is saved on this device. Reconnect, keep this page open, ' +
        'then select Next to try again. You may download a backup before closing.'
      : 'Qualtrics could not confirm this response. Reconnect to the internet, then select Next to try again. ' +
        'Keep this page open or download one backup before closing it.';
    // Keep the already-running participant iframe in the same DOM parent during
    // post-staging recovery. Moving a live iframe back into the Qualtrics question
    // container can recreate its browsing context, which would discard the in-memory
    // completion/recovery state before the advance-failure message can focus it.
    releaseFullscreenForNativeNavigation(true);
    setImportantStyle(status, 'position', 'sticky');
    setImportantStyle(status, 'top', '0');
    setImportantStyle(status, 'z-index', '2147483001');
    setStatus(advanceFailureMessage, false, 'error');
    if (status && typeof status.scrollIntoView === 'function') {
      status.scrollIntoView({ block: 'start', inline: 'nearest' });
    }
    sendAdvanceFailure(advanceFailureMessage);
    question.showNextButton();
    if (reason === 'offline') {
      // The participant has already selected Calculate and submit. Make the
      // first native Qualtrics attempt for them so the platform-owned offline
      // dialog appears without a second, easily missed Next-button action.
      // The restored Next button remains available for a retry after reconnecting.
      question.clickNextButton();
    }
  }

  function setField(name, value) {
    Qualtrics.SurveyEngine.setJSEmbeddedData(
      name,
      value === null || value === undefined ? '' : String(value)
    );
  }

  function stageConnectionDiagnostic() {
    /*
     * These fields show that the exact bridge connected. They are deliberately
     * separate from AQP_ACCEPTED, which is written only after a complete record
     * has passed validation. They reach Data & Analysis only when Qualtrics
     * submits the page.
     */
    setField('AQP_BRIDGE_READY', 1);
    setField('AQP_BRIDGE_BUILD', bridgeBuild);
    setField('AQP_SCHEMA', 4);
    setField('AQP_COLLECTION_MODE', 'qualtrics');
  }

  function requireRecord(record) {
    if (!record || typeof record !== 'object') throw new Error('The questionnaire returned an empty record.');
    if (record.schemaVersion !== 4) throw new Error('The questionnaire record version is not supported.');
    if (!record.submissionId || typeof record.submissionId !== 'string') throw new Error('The submission ID is missing.');
    if (!record.study || !record.participantCode || !record.timing || !record.instrument || !record.result) {
      throw new Error('The questionnaire record is incomplete.');
    }
    if (
      !record.instrument.id ||
      !record.instrument.name ||
      !record.instrument.version ||
      record.instrument.definitionSchemaVersion !== 1 ||
      typeof record.instrument.definitionHash !== 'string' ||
      !/^sha256:[0-9a-f]{64}$/.test(record.instrument.definitionHash) ||
      !record.instrument.scoringStrategy
    ) {
      throw new Error('The questionnaire definition metadata is incomplete.');
    }
    var definition = record.instrument.definition;
    if (
      !definition ||
      typeof definition !== 'object' ||
      Array.isArray(definition) ||
      definition.schemaVersion !== 1 ||
      definition.id !== record.instrument.id ||
      definition.name !== record.instrument.name ||
      definition.version !== record.instrument.version ||
      !definition.scoring ||
      definition.scoring.strategy !== record.instrument.scoringStrategy
    ) {
      throw new Error('The questionnaire definition snapshot does not match its metadata.');
    }
    if (
      !record.result.scoreName ||
      !Number.isFinite(record.result.primaryScore) ||
      !Number.isFinite(record.result.scoreMinimum) ||
      !Number.isFinite(record.result.scoreMaximum)
    ) {
      throw new Error('The questionnaire score is missing or invalid.');
    }
    if (!record.responses || !record.responses.ratings || !record.responses.pairwiseChoices) {
      throw new Error('The questionnaire answers are incomplete.');
    }
    if (!record.supportMetadata || !Array.isArray(record.supportMetadata.supportChanges)) {
      throw new Error('The questionnaire support metadata is incomplete.');
    }
  }

  function storeRecord(record) {
    var raw = JSON.stringify(record);
    var chunkCount = Math.ceil(raw.length / rawChunkLength);
    if (chunkCount > maximumRawChunks) {
      throw new Error('The questionnaire record is larger than the approved Qualtrics field allocation.');
    }

    setField('AQP_SCHEMA', record.schemaVersion);
    setField('AQP_SUBMISSION_ID', record.submissionId);
    setField('AQP_STUDY_ID', record.study.studyId);
    setField('AQP_CONFIG_ID', record.study.configId);
    setField('AQP_PARTICIPANT_CODE', record.participantCode);
    setField('AQP_STARTED_AT', record.timing.startedAt);
    setField('AQP_COMPLETED_AT', record.timing.completedAt);
    setField('AQP_PROTOTYPE_VERSION', record.prototype.version);
    setField('AQP_COLLECTION_MODE', record.collection.mode);
    setField('AQP_INSTRUMENT_ID', record.instrument.id);
    setField('AQP_INSTRUMENT_NAME', record.instrument.name);
    setField('AQP_INSTRUMENT_VERSION', record.instrument.version);
    setField('AQP_DEFINITION_HASH', record.instrument.definitionHash);
    setField('AQP_SCORING_STRATEGY', record.instrument.scoringStrategy);
    setField('AQP_SCORE_NAME', record.result.scoreName);
    setField('AQP_PRIMARY_SCORE', Number(record.result.primaryScore).toFixed(2));
    setField('AQP_SCORE_MINIMUM', record.result.scoreMinimum);
    setField('AQP_SCORE_MAXIMUM', record.result.scoreMaximum);
    setField('AQP_SCORE_DETAILS_JSON', JSON.stringify(record.result.details));
    setField('AQP_RATINGS_JSON', JSON.stringify(record.responses.ratings));
    setField('AQP_PAIR_CHOICES_JSON', JSON.stringify(record.responses.pairwiseChoices));
    setField('AQP_PAIR_ORDER_JSON', JSON.stringify(record.responses.pairPresentationOrder));
    setField('AQP_RATING_ROUTES_JSON', JSON.stringify(record.supportMetadata.ratingInputRoutes));
    setField('AQP_PAIR_ROUTES_JSON', JSON.stringify(record.supportMetadata.pairInputRoutes));
    setField('AQP_CONFIGURED_SUPPORT_JSON', JSON.stringify(record.configuration));
    setField('AQP_SUPPORT_CHANGE_COUNT', record.supportMetadata.supportChanges.length);
    setField('AQP_FINAL_SIMPLE_LANGUAGE', record.supportMetadata.simplerExplanationsShownAtSubmission);
    setField('AQP_FINAL_ANSWER_MODE', record.supportMetadata.answerModeAtSubmission);
    setField('AQP_FINAL_LARGE_TEXT', record.supportMetadata.largeTextUsedAtSubmission);
    setField('AQP_FINAL_AUDIO', record.supportMetadata.automaticAudioGuidanceEnabledAtSubmission);
    setField('AQP_FINAL_RECOVERY', record.supportMetadata.recoveryEnabledAtSubmission);
    setField('AQP_READ_ALOUD_USED', record.supportMetadata.readAloudUsed);
    setField('AQP_INTERRUPTION_SUMMARY', record.supportMetadata.interruptionSummaryShown);
    setField('AQP_GAZE_USED', record.supportMetadata.gazeUsed);
    setField('AQP_GAZE_ACTION_COUNT', record.supportMetadata.gazeActionCount);
    setField('AQP_RAW_CHUNK_COUNT', chunkCount);

    for (var index = 0; index < maximumRawChunks; index += 1) {
      var suffix = String(index + 1).padStart(2, '0');
      setField(
        'AQP_RAW_' + suffix,
        index < chunkCount ? raw.slice(index * rawChunkLength, (index + 1) * rawChunkLength) : ''
      );
    }

    /*
     * Staging marker: write only after every provenance, result and raw-record
     * field has staged successfully. It does not prove durable Qualtrics recording.
     * A partial write must never look staged successfully.
     */
    setField('AQP_ACCEPTED', 1);
  }

  function receiveResult(event) {
    if (!iframe || event.source !== iframe.contentWindow || event.origin !== childOrigin) return;
    var message = event.data;
    if (message && message.type === childReadyType) {
      if (message.protocolVersion !== 2 || message.bridgeBuild !== bridgeBuild) {
        setStatus(
          'The generated questionnaire HTML, JavaScript and participant page do not use the same bridge version. ' +
          'Do not collect a response. Regenerate and replace the complete package.',
          false
        );
        releaseFullscreenForNativeNavigation();
        question.showNextButton();
        return;
      }
      try {
        stageConnectionDiagnostic();
      } catch (error) {
        var diagnosticDetail = error && error.message
          ? error.message
          : 'Qualtrics could not stage the connection diagnostic.';
        setStatus(
          diagnosticDetail +
          ' Do not collect a response. Check the Survey Flow fields and question JavaScript.',
          false
        );
        releaseFullscreenForNativeNavigation();
        question.showNextButton();
        return;
      }
      childConnected = true;
      if (connectionTimerId !== null) {
        window.clearTimeout(connectionTimerId);
        connectionTimerId = null;
      }
      parentReadyTimerIds.forEach(function clearParentReadyTimer(timerId) {
        window.clearTimeout(timerId);
      });
      parentReadyTimerIds = [];
      revealConnectedFrame();
      setStatus(
        'The questionnaire is connected. Bridge ' + bridgeBuild +
        ' staged its Qualtrics diagnostic fields. Completed answers will save into this response.',
        true
      );
      return;
    }
    if (!message || message.type !== submitType) return;
    var submissionId = message.record && message.record.submissionId;
    if (!childConnected) {
      sendStagingReceipt(
        event.source,
        false,
        submissionId || '',
        'The verified Qualtrics bridge connection is not ready.'
      );
      return;
    }
    if (message.bridgeBuild !== bridgeBuild) {
      sendStagingReceipt(
        event.source,
        false,
        submissionId || '',
        'The questionnaire and Qualtrics bridge versions do not match.'
      );
      return;
    }

    if (stagedSubmissionId === submissionId) {
      sendStagingReceipt(event.source, true, submissionId);
      return;
    }
    if (stagedSubmissionId || advancing) {
      sendStagingReceipt(event.source, false, submissionId || '', 'A different response is already being saved.');
      return;
    }

    if (document.body && liveQuestion.parentNode !== document.body) {
      prepareFrameLayout();
      lockOuterQualtricsViewport();
    }
    try {
      requireRecord(message.record);
      storeRecord(message.record);
      stagedSubmissionId = message.record.submissionId;
      advancing = true;
      setStatus(
        'Waiting for Qualtrics. Keep this page open.',
        true
      );
      sendStagingReceipt(event.source, true, stagedSubmissionId);
      // A definite browser-offline state cannot produce a durable Qualtrics
      // response. Show the platform-owned recovery notice immediately instead
      // of waiting for Qualtrics' slower native network-error dialog.
      if (window.navigator && window.navigator.onLine === false) {
        recoverFailedAdvance('offline');
        return;
      }
      completionTimerId = window.setTimeout(function continueStagedResponse() {
        completionTimerId = null;
        question.clickNextButton();
        // If Qualtrics does not unload this question after the native advance, keep
        // the participant out of a dead end. The questionnaire iframe still holds
        // its in-memory JSON/CSV routes, and the native navigation is restored.
        advanceWatchdogTimerId = window.setTimeout(recoverFailedAdvance, 6000);
      }, completionDelayMs);
    } catch (error) {
      var detail = error && error.message ? error.message : 'Qualtrics could not stage the response.';
      setStatus(
        detail +
        ' The response was not staged. Keep the questionnaire open and use its Retry, Change, JSON or CSV recovery actions.',
        false,
        'error'
      );
      // Preserve the live participant iframe and its review/recovery state. Reparenting
      // the iframe here can recreate its browsing context and replace the actionable
      // staging failure with a generic saved-session offer.
      releaseFullscreenForNativeNavigation(true);
      setImportantStyle(status, 'position', 'sticky');
      setImportantStyle(status, 'top', '0');
      setImportantStyle(status, 'z-index', '2147483001');
      sendStagingReceipt(event.source, false, submissionId || '', detail);
      // Do not expose native Qualtrics Next as a bypass while staging is unresolved.
      // The participant can retry from the still-live AQP review screen. A27's
      // post-staging advance-failure path remains separate and still restores Next.
    }
  }

  if (
    recordedSummary &&
    typeof recordedSummary.getAttribute === 'function' &&
    recordedSummary.getAttribute('data-recorded') === '1'
  ) {
    return;
  }
  if (!iframe || !iframe.contentWindow || !liveQuestion) {
    setStatus(
      'The accessible questionnaire package is incomplete. The study conductor must replace the complete generated HTML and JavaScript.',
      false
    );
    // Keep the native navigation available on a misconfigured test page instead of
    // trapping the researcher or participant. This path must fail the synthetic
    // preflight and must never be used to collect a participant response.
    question.showNextButton();
    return;
  }
  if (
    typeof liveQuestion.getAttribute !== 'function' ||
    liveQuestion.getAttribute('data-aqp-package-build') !== bridgeBuild
  ) {
    setStatus(
      'The questionnaire HTML and JavaScript versions do not match. Expected package ' +
      bridgeBuild + '. Do not collect a response. Replace both generated blocks together.',
      false
    );
    releaseFullscreenForNativeNavigation();
    question.showNextButton();
    return;
  }

  prepareFrameLayout();
  lockOuterQualtricsViewport();
  question.hideNextButton();
  window.addEventListener('message', receiveResult);
  setStatus('Connecting questionnaire package ' + bridgeBuild + ' to this Qualtrics response.', false);
  if (typeof iframe.addEventListener === 'function') {
    iframe.addEventListener('load', sendParentReady);
  }
  [0, 100, 500, 1500, 4000].forEach(function scheduleParentReady(delay) {
    parentReadyTimerIds.push(window.setTimeout(sendParentReady, delay));
  });
  sendParentReady();
  connectionTimerId = window.setTimeout(function reportMissingConnection() {
    connectionTimerId = null;
    if (childConnected) return;
    setStatus(
      'The questionnaire connection did not start. Do not collect a real response. ' +
      'Regenerate and replace the complete HTML and JavaScript, then test again.',
      false
    );
    releaseFullscreenForNativeNavigation();
    question.showNextButton();
  }, 8000);
  Qualtrics.SurveyEngine.addOnUnload(function removeAccessibleQuestionnaireListener() {
    if (completionTimerId !== null) {
      window.clearTimeout(completionTimerId);
      completionTimerId = null;
    }
    if (advanceWatchdogTimerId !== null) {
      window.clearTimeout(advanceWatchdogTimerId);
      advanceWatchdogTimerId = null;
    }
    if (connectionTimerId !== null) {
      window.clearTimeout(connectionTimerId);
      connectionTimerId = null;
    }
    parentReadyTimerIds.forEach(function clearParentReadyTimer(timerId) {
      window.clearTimeout(timerId);
    });
    parentReadyTimerIds = [];
    if (typeof iframe.removeEventListener === 'function') {
      iframe.removeEventListener('load', sendParentReady);
    }
    restoreQualtricsQuestionLayout();
    window.removeEventListener('message', receiveResult);
  });
});
`,_t=`<!--
  REFERENCE TEMPLATE ONLY.
  Do not paste this file into Qualtrics unchanged. Use the complete generated
  question HTML from study.html so the iframe has the configured participant URL.
-->
<style>
  #accessible-questionnaire-recorded-summary {
    display: none;
    color: #172235;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.5;
  }
  #accessible-questionnaire-recorded-summary[data-recorded="1"] { display: block !important; }
  #accessible-questionnaire-recorded-summary[data-recorded="1"] + #accessible-questionnaire-live-question { display: none; }
  #accessible-questionnaire-recorded-summary h2,
  #accessible-questionnaire-recorded-summary h3 { color: #173f63; }
  #accessible-questionnaire-recorded-summary table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 1.25rem;
  }
  #accessible-questionnaire-recorded-summary th,
  #accessible-questionnaire-recorded-summary td {
    border: 2px solid #6d7f91;
    padding: 0.5rem;
    text-align: left;
    vertical-align: top;
  }
  #accessible-questionnaire-recorded-summary th { background: #edf4f8; }
  #accessible-questionnaire-recorded-summary .aqp-long-value {
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
  #accessible-questionnaire-live-question {
    position: fixed;
    inset: 0;
    z-index: 2147483000;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #eef2f6;
  }
  #accessible-questionnaire-frame {
    display: block;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    overflow: auto;
    background: #eef2f6;
  }
  #accessible-questionnaire-collection-status {
    position: fixed;
    z-index: 2147483001;
    top: 1rem;
    left: 50%;
    width: min(44rem, calc(100vw - 2rem));
    box-sizing: border-box;
    transform: translateX(-50%);
    margin: 0;
    padding: 0.75rem 1rem;
    border: 2px solid #315b7d;
    background: #edf4f8;
    color: #172235;
    font: 600 1rem/1.5 Arial, Helvetica, sans-serif;
  }
  #accessible-questionnaire-collection-status[data-quiet="true"] {
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
  #accessible-questionnaire-collection-status[data-severity="error"] {
    border-color: #b10e1e;
    background: #fff4f4;
    color: #171717;
    box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.18);
  }
</style>
<section
  id="accessible-questionnaire-recorded-summary"
  data-recorded="\${e://Field/__js_AQP_ACCEPTED}"
  aria-labelledby="accessible-questionnaire-recorded-summary-heading"
  style="display:none"
>
  <h2 id="accessible-questionnaire-recorded-summary-heading">Accessible questionnaire recorded response</h2>
  <p>This read-only summary is generated from the values saved in this Qualtrics response.</p>
  <table>
    <caption>Submission details</caption>
    <tbody>
      <tr><th scope="row">Participant code</th><td>\${e://Field/__js_AQP_PARTICIPANT_CODE}</td></tr>
      <tr><th scope="row">Study ID</th><td>\${e://Field/__js_AQP_STUDY_ID}</td></tr>
      <tr><th scope="row">Questionnaire</th><td>\${e://Field/__js_AQP_INSTRUMENT_NAME}</td></tr>
      <tr><th scope="row">Questionnaire version</th><td>\${e://Field/__js_AQP_INSTRUMENT_VERSION}</td></tr>
      <tr><th scope="row">Definition SHA-256</th><td class="aqp-long-value">\${e://Field/__js_AQP_DEFINITION_HASH}</td></tr>
      <tr><th scope="row">Submission ID</th><td class="aqp-long-value">\${e://Field/__js_AQP_SUBMISSION_ID}</td></tr>
      <tr><th scope="row">Started</th><td>\${e://Field/__js_AQP_STARTED_AT}</td></tr>
      <tr><th scope="row">Completed</th><td>\${e://Field/__js_AQP_COMPLETED_AT}</td></tr>
      <tr><th scope="row">Scoring rule</th><td>\${e://Field/__js_AQP_SCORING_STRATEGY}</td></tr>
      <tr>
        <th scope="row">\${e://Field/__js_AQP_SCORE_NAME}</th>
        <td>
          \${e://Field/__js_AQP_PRIMARY_SCORE}
          (defined range \${e://Field/__js_AQP_SCORE_MINIMUM}–\${e://Field/__js_AQP_SCORE_MAXIMUM})
        </td>
      </tr>
    </tbody>
  </table>
  <h3>Item responses</h3>
  <p class="aqp-long-value">\${e://Field/__js_AQP_RATINGS_JSON}</p>
  <h3>Pairwise responses, when required by the definition</h3>
  <p class="aqp-long-value">\${e://Field/__js_AQP_PAIR_CHOICES_JSON}</p>
  <h3>Accessibility-support record</h3>
  <table>
    <tbody>
      <tr><th scope="row">Simpler explanations at submission</th><td>\${e://Field/__js_AQP_FINAL_SIMPLE_LANGUAGE}</td></tr>
      <tr><th scope="row">Answer presentation at submission</th><td>\${e://Field/__js_AQP_FINAL_ANSWER_MODE}</td></tr>
      <tr><th scope="row">Large text at submission</th><td>\${e://Field/__js_AQP_FINAL_LARGE_TEXT}</td></tr>
      <tr><th scope="row">Automatic audio at submission</th><td>\${e://Field/__js_AQP_FINAL_AUDIO}</td></tr>
      <tr><th scope="row">Recovery at submission</th><td>\${e://Field/__js_AQP_FINAL_RECOVERY}</td></tr>
      <tr><th scope="row">Read aloud used</th><td>\${e://Field/__js_AQP_READ_ALOUD_USED}</td></tr>
      <tr><th scope="row">Gaze used</th><td>\${e://Field/__js_AQP_GAZE_USED}</td></tr>
      <tr><th scope="row">Support changes</th><td>\${e://Field/__js_AQP_SUPPORT_CHANGE_COUNT}</td></tr>
    </tbody>
  </table>
  <p><strong>Rating input routes:</strong> <span class="aqp-long-value">\${e://Field/__js_AQP_RATING_ROUTES_JSON}</span></p>
  <p><strong>Pair input routes:</strong> <span class="aqp-long-value">\${e://Field/__js_AQP_PAIR_ROUTES_JSON}</span></p>
  <p>The reconstructed raw JSON or CSV export is the lossless research record. This section is a readable response/PDF summary.</p>
</section>
<div
  id="accessible-questionnaire-live-question"
  data-aqp-package-build="0.8.10-q10"
>
  <p
    id="accessible-questionnaire-collection-status"
    role="status"
    aria-live="polite"
    data-quiet="false"
    data-severity="information"
  >
    Connecting this questionnaire to the current Qualtrics response.
  </p>
  <iframe
    id="accessible-questionnaire-frame"
    src="PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE"
    title="Accessible questionnaire participant page"
    allow="camera; microphone"
    referrerpolicy="origin"
    scrolling="yes"
    aria-hidden="true"
    style="display:block;position:absolute;inset:0;width:100%;height:100%;border:0;overflow:auto;visibility:hidden;background:#eef2f6"
  ></iframe>
</div>`,G=20;let Ue=0;function ge(e={}){return Ue+=1,{key:`custom-item-${Ue}`,name:"",prompt:"",lowAnchor:"",highAnchor:"",simpleExplanation:"",reverseScored:!1,...e}}function ze(){return{language:"en-GB",name:"",shortName:"",version:"1.0.0",description:"A researcher-supplied questionnaire.",introPrompt:"Answer each item about the task that you have just completed.",sourceLabel:"Researcher-supplied questionnaire",sourceUrl:"",scaleType:"agreement",minimum:1,maximum:5,step:1,scoreName:"Questionnaire score",aggregation:"mean",items:[ge({name:"Item 1"}),ge({name:"Item 2"})]}}function Q(e,t){const i=e.trim().replace(/\s+/g," ");if(!i)throw new Error(`${t} is required.`);return i}function It(e){return e.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,50)}function At(e,t){const i=t.trim()||e.trim();return i.length<=240?i:`${i.slice(0,237).trimEnd()}...`}function Ge(e){if(!Number.isInteger(e.minimum)||!Number.isInteger(e.maximum)||!Number.isInteger(e.step))throw new Error("Scale minimum, maximum and step must be whole numbers.");if(!Array.isArray(e.items)||e.items.length<1||e.items.length>G)throw new Error(`Add between 1 and ${G} questionnaire items.`);const t=Q(e.name,"Questionnaire name"),i=Q(e.shortName,"Short name"),n=It(i||t);if(!n)throw new Error("Questionnaire name must contain at least one Latin letter or number for its stable ID.");const r=e.items.map((p,c)=>{const S=Q(p.prompt,`Item ${c+1} question`),u=p.simpleExplanation.trim().replace(/\s+/g," ");return{id:`item-${String(c+1).padStart(2,"0")}`,name:Q(p.name,`Item ${c+1} label`),prompt:S,...u?{simpleExplanation:u}:{},shortMeaning:At(S,u),lowAnchor:Q(p.lowAnchor,`Item ${c+1} low endpoint`),highAnchor:Q(p.highAnchor,`Item ${c+1} high endpoint`),...p.responseLabels?{responseLabels:p.responseLabels}:{}}}),o=e.items.flatMap((p,c)=>p.reverseScored?[`item-${String(c+1).padStart(2,"0")}`]:[]),a=r.every(p=>p.simpleExplanation),v=e.aggregation==="mean"?e.minimum:e.minimum*r.length,f=e.aggregation==="mean"?e.maximum:e.maximum*r.length,d={schemaVersion:1,language:Q(e.language,"Questionnaire language"),id:`custom-${n}`,version:Q(e.version,"Questionnaire version"),name:t,shortName:i,description:Q(e.description,"Questionnaire description"),introPrompt:Q(e.introPrompt,"Participant instruction"),officialContentNotice:"This questionnaire definition was supplied by the study conductor. Its wording, use and interpretation must match the approved study protocol.",source:{label:Q(e.sourceLabel,"Source or authorship label"),...e.sourceUrl.trim()?{url:e.sourceUrl.trim()}:{}},scale:{type:e.scaleType,minimum:e.minimum,maximum:e.maximum,step:e.step},items:r,scoring:{strategy:e.aggregation==="mean"?"mean-v1":"sum-v1",scoreName:Q(e.scoreName,"Score name"),minimum:v,maximum:f,...o.length?{reverseItemIds:o}:{}},supports:{simplerExplanations:a,smileyLandmarks:!1}};return Ze(d)}function Ze(e){const t=ct(e);if(Ke(t.id))throw new Error("A custom questionnaire cannot replace a built-in questionnaire ID.");if(!t.id.startsWith("custom-"))throw new Error("A custom questionnaire ID must start with custom-.");if(t.scoring.strategy!=="mean-v1"&&t.scoring.strategy!=="sum-v1")throw new Error("A custom questionnaire must use the reviewed mean or sum scorer.");if(t.pairwise)throw new Error("Custom questionnaires do not support pairwise comparisons.");if(t.landmarks||t.supports.smileyLandmarks)throw new Error("Custom questionnaires do not support smiley landmarks.");const i=pt(t);if(i>Ne)throw new Error(`The questionnaire definition is ${i} bytes; the participant-link limit is ${Ne} bytes.`);return t}function $t(e){return`${e.id}-${e.version.replace(/[^A-Za-z0-9._-]+/g,"-")}.questionnaire.json`}const qt=2e6,$e=/<\s*(?:script|iframe|object|embed|style)\b|(?:href|src)\s*=\s*["']?\s*javascript:|\son[a-z]+\s*=/i,qe=/<\s*(?:img|picture|video|audio|canvas|svg|math|form|input|button|select|textarea|table)\b/i,Ce=/\$\{(?:e|q|lm|gr)?:?\/?\/|q:\/\/|\{(?:if|TOKEN|INSERTANS|[A-Za-z][A-Za-z0-9_.]*\.(?:NAOK|shown))\b/i;function R(e){return e&&typeof e=="object"&&!Array.isArray(e)?e:null}function q(e){return typeof e=="string"||typeof e=="number"?String(e):""}function A(e){return e.replace(/\s+/g," ").trim()}function I(e,t){e.confirmationCodes.has(t.code)||(e.confirmationCodes.add(t.code),e.confirmations.push(t))}function B(e,t,i,n){const r=q(e);if(!r.trim())return n.unsupported.push({code:"missing-visible-text",title:`${t} is empty`,detail:`${i} does not contain participant-visible text.`}),null;if($e.test(r)||Ce.test(r))return n.unsupported.push({code:"unsafe-dynamic-content",title:`${t} contains executable or dynamic content`,detail:`${i} contains script, an event handler, a JavaScript URL or survey-expression text. The importer does not execute or approximate it.`}),null;if(qe.test(r))return n.unsupported.push({code:"unsupported-structured-content",title:`${t} contains media, a table or an interactive control`,detail:`${i} cannot be represented as one safe plain-text rating item without changing participant-visible content.`}),null;const a=new DOMParser().parseFromString(`<body>${r}</body>`,"text/html"),v=A(a.body.textContent??"");return v?((/<[^>]+>/.test(r)||v!==A(r))&&I(n,{code:"plain-text-normalisation",title:"Formatting was converted to plain text",detail:"Imported wording is rendered as safe plain text. Review it against the source export before use."}),v):(n.unsupported.push({code:"missing-visible-text",title:`${t} has no readable text`,detail:`${i} contains no participant-visible text after safe text extraction.`}),null)}function ie(e){const t=typeof e=="number"?e:Number(q(e).trim());return Number.isInteger(t)?t:null}function oe(e){if(e.length<2||e.some(i=>i<0||i>100)||new Set(e).size!==e.length)return!1;const t=e[1]-e[0];return t>0&&e.every((i,n)=>n===0||i-e[n-1]===t)}function Xe(e,t){if(!Array.isArray(e)||e.length!==Object.keys(t).length)return null;const i=e.map(String);return new Set(i).size===i.length&&i.every(n=>n in t)?i:null}function et(e,t,i,n){const r=R(e);return B(r?.Display,t,i,n)}function Ct(e){return e.flatMap(i=>i.labels).map(i=>i.toLowerCase()).some(i=>i.includes("agree")||i.includes("disagree"))?"agreement":"semantic-differential"}function Tt(e){const t=e.split(/\s+/).map(n=>n.replace(/[^A-Za-z0-9]/g,"")[0]??"").join("").slice(0,12);return t?t.toUpperCase():e.replace(/[^A-Za-z0-9]+/g,"").slice(0,12)||"IMPORTED"}const Rt={SQI:"sq",AR:"ar",HYE:"hy",ASM:"as","AZ-AZ":"az-AZ",ID:"id",MS:"ms",BEL:"be",BN:"bn",BS:"bs","PT-BR":"pt-BR",BG:"bg",CA:"ca",CEB:"ceb","ZH-S":"zh-CN","ZH-T":"zh-TW",HR:"hr",CS:"cs",DA:"da",NL:"nl","EN-GB":"en-GB",EN:"en",EO:"eo",ET:"et",FI:"fi",FR:"fr","FR-CA":"fr-CA",KAT:"ka",DE:"de",EL:"el",GU:"gu",HE:"he",HI:"hi",HIL:"hil",HU:"hu",ISL:"is",IT:"it",JA:"ja",KAN:"kn",KAZ:"kk",KM:"km",KO:"ko",LV:"lv",LT:"lt",MK:"mk",MAL:"ml",MAR:"mr",MN:"mn","SR-ME":"sr-ME",MY:"my",NE:"ne",NO:"no",ORI:"or",FA:"fa",PL:"pl",PT:"pt","PA-IN":"pa-IN",RO:"ro",RU:"ru",SR:"sr",SIN:"si",SK:"sk",SL:"sl","ES-ES":"es-ES",ES:"es",SW:"sw",SV:"sv",TGL:"fil",TA:"ta",TEL:"te",TH:"th",TR:"tr",UK:"uk",UR:"ur",VI:"vi",CY:"cy"};function tt(e,t="en"){const i=A(q(e))||t,n=Rt[i.toUpperCase()]??i.replace(/_/g,"-");if(!/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(n))return t;try{return Intl.getCanonicalLocales(n)[0]??t}catch{return t}}function it(e,t,i,n,r,o){if(!r.length)return o.unsupported.push({code:"no-supported-items",title:"No supported questionnaire items were found",detail:"This release needs at least one required, ordered single-choice rating item."}),null;if(r.length>G)return o.unsupported.push({code:"too-many-items",title:"The questionnaire has too many items for a participant link",detail:`${r.length} supported items were found; this release accepts at most ${G}.`}),null;const a=r[0].values;if(!oe(a))return o.unsupported.push({code:"unsupported-response-values",title:"Response values are not one increasing whole-number scale",detail:"Values must be unique whole numbers from 0 to 100 with one constant positive step."}),null;const v=a.join("|");return r.some(f=>f.values.join("|")!==v)?(o.unsupported.push({code:"mixed-response-scales",title:"Items use different response values",detail:"The current participant interface requires every imported item to share the same ordered numeric scale."}),null):(I(o,{code:"review-scoring",title:"Scoring and reverse scoring require confirmation",detail:"Answer recodes do not establish a questionnaire score. Choose reviewed mean or sum, then mark any reverse-scored items."}),I(o,{code:"review-scale-type",title:"The scale description requires confirmation",detail:"Confirm whether the imported scale should be described as agreement or semantic differential."}),{language:n,name:e.slice(0,120),shortName:Tt(e),version:"1.0.0",description:`Questionnaire imported from ${t}.`,introPrompt:i.slice(0,400),sourceLabel:t,sourceUrl:"",scaleType:Ct(r),minimum:a[0],maximum:a.at(-1),step:a[1]-a[0],scoreName:"Questionnaire score",aggregation:"mean",items:r.map(f=>ge({name:f.name.slice(0,120),prompt:f.prompt.slice(0,1e3),lowAnchor:f.labels[0].slice(0,80),highAnchor:f.labels.at(-1).slice(0,80),responseLabels:Object.fromEntries(f.values.map((d,p)=>[String(d),f.labels[p].slice(0,120)]))}))})}function se(e){return{code:`item-${e.sourceId}`,title:`${e.name}: imported`,detail:`${e.sourceId}; “${e.prompt}”; ordered choices: `+e.values.map((t,i)=>`${t} = ${e.labels[i]}`).join("; ")}}function fe(e,t,i,n,r,o,a={}){return{source:e,sourceName:t,fileName:i,title:n,draft:r,imported:o.imported,confirmations:o.confirmations,unsupported:o.unsupported,canConvert:!!r&&o.unsupported.length===0,...a}}function nt(){return{imported:[],confirmations:[],unsupported:[],confirmationCodes:new Set}}function Be(e,t){const i=R(e);if(!i)throw new Error(t);return i}function Qt(e,t){const i=e.find(u=>u.Element==="BL"),n=Array.isArray(i?.Payload)?i.Payload.map(R).filter(u=>!!u):[],r=n.filter(u=>u.Type!=="Trash"),o=new Set(n.filter(u=>u.Type==="Trash").flatMap(u=>Array.isArray(u.BlockElements)?u.BlockElements:[]).map(R).filter(u=>!!u).map(u=>q(u.QuestionID)).filter(Boolean));o.size&&I(t,{code:"qualtrics-trash-ignored",title:"Questions in the Qualtrics Trash block were ignored",detail:`${o.size} deleted question${o.size===1?"":"s"} will not appear in the converted questionnaire.`});const a=e.find(u=>u.Element==="FL"),v=R(a?.Payload),f=Array.isArray(v?.Flow)?v.Flow.map(R).filter(u=>!!u):[];if(r.length!==1||f.length!==1||f[0].Type!=="Block")return t.unsupported.push({code:"qualtrics-complex-flow",title:"Qualtrics flow is outside the supported single-block subset",detail:"Use one ordinary question block only. Branches, randomisers, embedded-data flow and multiple blocks are not removed or flattened."}),{order:[],trashQuestionIds:o};const d=q(f[0].ID),p=r.find(u=>q(u.ID)===d);if(!p)return t.unsupported.push({code:"qualtrics-missing-block",title:"The active Qualtrics block could not be resolved",detail:`Survey Flow references ${d||"an unknown block"}.`}),{order:[],trashQuestionIds:o};const c=Array.isArray(p.BlockElements)?p.BlockElements:[],S=[];for(const u of c){const x=R(u);if(!x||x.Type!=="Question"||!q(x.QuestionID)){t.unsupported.push({code:"qualtrics-non-question-block-item",title:"The Qualtrics block contains unsupported content",detail:"Only ordered question entries are supported in the imported block."});continue}(x.SkipLogic||x.DisplayLogic)&&t.unsupported.push({code:"qualtrics-question-logic",title:`${q(x.QuestionID)} uses question logic`,detail:"Skip and display logic are not imported."}),S.push(q(x.QuestionID))}return{order:S,trashQuestionIds:o}}function Et(e){return["QuestionJS","JavaScript","DisplayLogic","SkipLogic","ChoiceDisplayLogic","CarryForward","Randomization","ChoiceRandomization"].some(t=>e[t]!==void 0&&e[t]!==null)}function We(e,t,i,n,r){const o=R(e[t]);if(!o)return r.unsupported.push({code:"qualtrics-missing-scale",title:`${n} has no answer scale`,detail:`${t} must contain every visible answer option.`}),null;const a=Xe(e[i],o);if(!a)return r.unsupported.push({code:"qualtrics-unknown-answer-order",title:`${n} has no reliable answer order`,detail:`${i} must list every ${t.toLowerCase()} entry exactly once.`}),null;const v=R(e.RecodeValues);let f;if(v){const p=a.map(c=>ie(v[c]));if(p.some(c=>c===null))return r.unsupported.push({code:"qualtrics-nonnumeric-recodes",title:`${n} has missing or non-integer recode values`,detail:"Every visible option needs an explicit whole-number recode."}),null;f=p}else{if(!a.every((c,S)=>c===String(S+1)))return r.unsupported.push({code:"qualtrics-missing-scale",title:`${n} has no explicit recode table or default sequential choice IDs`,detail:"Without RecodeValues, ChoiceOrder must explicitly list the default IDs 1 through N. The importer will not infer values from other object keys."}),null;f=a.map((c,S)=>S+1),I(r,{code:"qualtrics-default-recodes",title:"Qualtrics default sequential recodes were used",detail:"The QSF omits RecodeValues and explicitly orders default choice IDs 1 through N. Confirm these values against the source survey before conversion."})}const d=a.map((p,c)=>et(o[p],`Answer ${c+1}`,`${n}/${p}`,r));return d.some(p=>p===null)?null:{values:f,labels:d}}function xt(e,t){let i;try{i=JSON.parse(e)}catch{throw new Error("The Qualtrics QSF file is not valid JSON.")}const n=Be(i,"The Qualtrics QSF root must be a JSON object."),r=Be(n.SurveyEntry,"The file does not contain a Qualtrics SurveyEntry.");if(!Array.isArray(n.SurveyElements))throw new Error("The file does not contain Qualtrics SurveyElements.");const o=nt(),a=A(q(r.SurveyName))||"Imported Qualtrics questionnaire",v=tt(r.SurveyLanguage,"en"),f=n.SurveyElements.map(R).filter(y=>!!y),{order:d,trashQuestionIds:p}=Qt(f,o),c=new Set(f.map(y=>q(y.Element)).filter(y=>y&&!["BL","FL","SQ"].includes(y)));c.size&&I(o,{code:"qualtrics-platform-settings-not-imported",title:"Qualtrics platform and presentation settings are not imported",detail:`The following non-question element types remain in Qualtrics only: ${[...c].sort().join(", ")}. Review the converted participant presentation.`});const S=new Map(f.filter(y=>y.Element==="SQ").map(y=>[q(y.PrimaryAttribute),R(y.Payload)]));if(d.length){const y=new Set(d);for(const _ of S.keys())!_||y.has(_)||p.has(_)||o.unsupported.push({code:"qualtrics-unreferenced-question",title:`${_} is outside the imported active block`,detail:"The importer will not silently omit an active question that is not represented by the supported single-block flow."})}const u=[];for(const y of d){const _=S.get(y);if(!_){o.unsupported.push({code:"qualtrics-missing-question",title:`${y} is missing`,detail:"The active block references a question that is not present in SurveyElements."});continue}if(Et(_)){o.unsupported.push({code:"qualtrics-unsupported-behaviour",title:`${y} contains logic, randomisation or code`,detail:"The importer does not execute or remove question behaviour."});continue}const W=R(_.Validation);if(R(W?.Settings)?.ForceResponse!=="ON"){o.unsupported.push({code:"qualtrics-optional-question",title:`${y} is not a forced-response question`,detail:"The participant platform currently requires every imported item."});continue}const H=B(_.QuestionText,"Question text",y,o);if(!H)continue;const J=q(_.QuestionType),F=q(_.Selector),C=q(_.SubSelector),ae=A(q(_.DataExportTag))||y;if(J==="MC"&&F==="SAVR"){const k=We(_,"Choices","ChoiceOrder",y,o);if(!k)continue;const L={sourceId:y,name:ae,prompt:H,...k};u.push(L),o.imported.push(se(L));continue}if(J==="Matrix"&&F==="Likert"&&C==="SingleAnswer"){const k=We(_,"Answers","AnswerOrder",y,o),L=R(_.Choices),le=L?Xe(_.ChoiceOrder,L):null;if(!k||!L||!le){le||o.unsupported.push({code:"qualtrics-unknown-row-order",title:`${y} has no reliable matrix row order`,detail:"ChoiceOrder must list every matrix row exactly once."});continue}I(o,{code:"qualtrics-matrix-expanded",title:"Single-answer matrix rows were expanded into items",detail:"Review each generated item against the original matrix before conversion."}),le.forEach((V,Y)=>{const D=et(L[V],`Matrix row ${Y+1}`,`${y}/${V}`,o);if(!D)return;const O={sourceId:`${y}/${V}`,name:D,prompt:`${H} — ${D}`,...k};u.push(O),o.imported.push(se(O))});continue}o.unsupported.push({code:"qualtrics-unsupported-question",title:`${y} uses an unsupported Qualtrics question type`,detail:`${J||"Unknown"} / ${F||"Unknown"} / ${C||"none"} is not converted. Supported: MC/SAVR and Matrix/Likert/SingleAnswer.`})}const ne=(q(r.SurveyDescription).trim()?B(r.SurveyDescription,"Survey description","SurveyEntry",o):null)??"Answer each imported item about the task that you have just completed.",ye=it(a,"Imported from Qualtrics QSF",ne,v,u,o);return fe("qualtrics-qsf","Qualtrics QSF",t,a,ye,o)}function E(e,t){const i=[...e.documentElement.children].find(r=>r.localName===t);if(!i)return[];const n=[...i.children].find(r=>r.localName==="rows");return n?[...n.children].filter(r=>r.localName==="row").map(r=>Object.fromEntries([...r.children].map(o=>[o.localName,o.textContent??""]))):[]}function z(e,t,i,n,r){return e.find(o=>o[t]===i&&(!o.language||o.language===r))?.[n]??""}const Pt={answer_width:["0"],answer_order:["normal"],array_filter_style:["0"],clear_default:["N"],dropdown_prefix:["0"],hidden:["0"],hide_tip:["0"],max_answers:["1"],min_answers:["1"],other_comment_mandatory:["0"],other_numbers_only:["0"],other_position:["default"],page_break:["0"],public_statistics:["0"],random_order:["0"],save_as_default:["N"],scale_export:["0"],slider_rating:["0"],statistics_graphtype:["0"],statistics_showgraph:["1"],time_limit_action:["1"],time_limit_disable_next:["0"],time_limit_disable_prev:["0"],use_dropdown:["0"]};function kt(e,t){if(!e.length)return;const i=e.filter(n=>{const r=n.attribute?.trim()??"",o=n.value?.trim()??"";return o?!Pt[r]?.includes(o):!1});if(i.length){const n=i.slice(0,6).map(r=>`${r.qid||"unknown question"}: ${r.attribute||"unknown"}=${r.value||""}`).join("; ");t.unsupported.push({code:"limesurvey-question-attributes",title:"The LimeSurvey export contains active or unknown question attributes",detail:`${n}${i.length>6?`; and ${i.length-6} more`:""}. These settings may change validation, randomisation, timing or presentation and are not discarded.`});return}I(t,{code:"limesurvey-default-question-attributes",title:"Default LimeSurvey question settings were not imported",detail:"Only empty or known default attributes were present; no active validation, randomisation or timing rule was found. Review the converted participant presentation."})}function He(e){if(!e.trim())return"";const i=new DOMParser().parseFromString(`<body>${e}</body>`,"text/html");return A(i.body.textContent??"")}function rt(e){const t=e.map(r=>ie(r.sortorder));if(t.some(r=>r===null))return!1;const i=t;if(new Set(i).size!==i.length)return!1;const n=i[0];return(n===0||n===1)&&i.every((r,o)=>r===n+o)}function st(e){return e.every((t,i)=>t.code===`A${String(i+1).padStart(3,"0")}`)}function ot(e,t){if(e.type==="5")return[1,2,3,4,5];if(e.type!=="F"&&e.type!=="L"&&e.type!=="!")return null;const i=t.filter(o=>o.qid===e.qid&&(!o.scale_id||o.scale_id==="0")).sort((o,a)=>(Number(o.sortorder)||0)-(Number(a.sortorder)||0));if(!rt(i))return null;const n=i.map(o=>ie(o.code));if(n.every(o=>o!==null)&&oe(n))return n;const r=i.map(o=>ie(o.assessment_value));return r.every(o=>o!==null)&&oe(r)?r:st(i)?i.map((o,a)=>a+1):null}function Lt(e,t,i){const n=new Map;for(const r of e){if(r.mandatory!=="Y"||r.other&&r.other!=="N"||r.relevance&&r.relevance!=="1")continue;const o=ot(r,i);if(!o)continue;const a=r.type==="F"?t.filter(d=>d.parent_qid===r.qid).length:1;if(a<1)continue;const v=o.join("|"),f=n.get(v)??{questions:[],values:o,itemCount:0};f.questions.push(r),f.itemCount+=a,n.set(v,f)}return[...n.entries()].map(([r,o])=>({id:`values-${r.replace(/\|/g,"-")}`,name:o.questions.map(a=>a.title||a.qid).join(" + "),sourceQuestionCount:o.questions.length,itemCount:o.itemCount,responseValues:o.values,questionTypes:[...new Set(o.questions.map(a=>a.type||"unknown"))]}))}function Je(e,t,i,n,r){const o=e.qid||e.title||"unknown-question",a=t.filter(c=>c.qid===e.qid&&(!c.scale_id||c.scale_id==="0")).sort((c,S)=>(Number(c.sortorder)||0)-(Number(S.sortorder)||0));if(!rt(a))return r.unsupported.push({code:"limesurvey-answer-order",title:`${e.title||o} has no reliable answer order`,detail:"Every answer needs one unique consecutive sort order starting at 0 or 1."}),null;const v=a.map(c=>ie(c.code)),f=a.map(c=>ie(c.assessment_value));let d;if(v.every(c=>c!==null)&&oe(v))d=v;else if(f.every(c=>c!==null)&&oe(f))d=f,I(r,{code:"limesurvey-assessment-values",title:"LimeSurvey assessment values were used as response values",detail:"Verify every imported value against the LimeSurvey answer table."});else if(st(a))d=a.map((c,S)=>S+1),I(r,{code:"limesurvey-positional-values",title:"LimeSurvey default answer codes were converted to ordered positions",detail:"The source uses A001 through A00N rather than numeric scores. The converted scale uses positions 1 through N. Confirm the intended values and scoring before conversion."});else return r.unsupported.push({code:"limesurvey-unsupported-values",title:`${e.title||o} has no safe increasing numeric recode`,detail:"Answer codes or assessment values must form one increasing whole-number scale with a constant step."}),null;const p=a.map((c,S)=>{const u=z(i,"aid",c.aid,"answer",n)||c.answer;return A(u??"")?B(u,`Answer ${S+1}`,`${e.title||o}/${c.code}`,r):(I(r,{code:"limesurvey-blank-scale-labels",title:"Blank scale positions will be shown as their numeric values",detail:"LimeSurvey leaves one or more intermediate labels blank. The converted questionnaire shows the reviewed numeric response value at those positions."}),String(d[S]))});return p.some(c=>!c)?null:{values:d,labels:p}}function Nt(e,t,i,n){if(/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/i.test(e))throw new Error("The LimeSurvey file contains a DTD, entity or stylesheet declaration and was not parsed.");const o=new DOMParser().parseFromString(e,"application/xml");if(o.querySelector("parsererror"))throw new Error("The LimeSurvey file is not valid XML.");const a=o.querySelector("LimeSurveyDocType")?.textContent?.trim();if(a!=="Survey"&&a!=="Group"&&a!=="Question")throw new Error("The XML file is not a LimeSurvey survey, question-group or question export.");const v=a==="Group"?"limesurvey-lsg":a==="Question"?"limesurvey-lsq":"limesurvey-lss",f=a==="Group"?"LimeSurvey LSG":a==="Question"?"LimeSurvey LSQ":"LimeSurvey LSS",d=nt(),p=[...o.querySelectorAll("languages > language")].map(s=>s.textContent?.trim()??"").filter(Boolean),c=E(o,"surveys"),u=A(c[0]?.language??"")||p[0]||"";!u||p.length&&!p.includes(u)?d.unsupported.push({code:"limesurvey-base-language",title:"The LimeSurvey base language could not be resolved",detail:"The survey language must match one language declared in the LSS export."}):p.length>1&&I(d,{code:"limesurvey-base-language-only",title:`Only the LimeSurvey base language (${u}) will be imported`,detail:`Additional languages (${p.filter(s=>s!==u).join(", ")}) remain in LimeSurvey and are not included in the converted definition. Confirm the intended participant language.`});const x=E(o,"surveys_languagesettings"),ne=x.find(s=>!s.surveyls_language||s.surveyls_language===u)??x[0],ye=A(ne?.surveyls_title??"")||"Imported LimeSurvey questionnaire",y=E(o,"questions").filter(s=>!s.language||!u||s.language===u),_=y.find(s=>!s.parent_qid||s.parent_qid==="0"),W=_?.gid||"__lsq__",N=a==="Question"?[{gid:W,group_order:"0",grelevance:"1",randomization_group:""}]:E(o,"groups"),H=a==="Question"?[{gid:W,group_name:_?.title||"Imported LimeSurvey question",description:"",language:u}]:E(o,"group_l10ns"),J=y.map(s=>({...s,gid:s.gid||W}));if(!N.length)throw new Error("The LimeSurvey export contains no questionnaire group.");const F=N.slice().sort((s,b)=>(Number(s.group_order)||0)-(Number(b.group_order)||0)).map(s=>{const b=H.find(T=>T.gid===s.gid&&(!T.language||T.language===u)),re=J.filter(T=>T.gid===s.gid&&(!T.parent_qid||T.parent_qid==="0"));return{id:s.gid,name:A(b?.group_name??s.group_name??"")||`Group ${s.gid}`,questionCount:re.length,questionTypes:[...new Set(re.map(T=>T.type||"unknown"))]}});if(a==="Survey"&&N.length>1&&!i)return fe(v,f,t,ye,null,d,{requiresGroupSelection:!0,groupOptions:F});const C=i?N.find(s=>s.gid===i):N[0];if(!C)throw new Error("Choose a questionnaire group contained in this LimeSurvey export.");const ae=H.find(s=>s.gid===C.gid&&(!s.language||s.language===u)),k=A(ae?.group_name??C.group_name??"")||`Group ${C.gid}`,L=J.filter(s=>s.gid===C.gid),V=E(o,"subquestions").filter(s=>!s.language||!u||s.language===u).map(s=>({...s,gid:s.gid||W})).filter(s=>s.gid===C.gid||L.some(b=>b.qid===s.parent_qid)),Y=L.filter(s=>!s.parent_qid||s.parent_qid==="0").sort((s,b)=>(Number(s.question_order)||0)-(Number(b.question_order)||0)),D=E(o,"answers").filter(s=>!s.language||!u||s.language===u),O=Lt(Y,V,D);if(a==="Survey"&&N.length>1&&I(d,{code:"limesurvey-selected-group-only",title:`Only “${k}” will be converted`,detail:`${N.length-1} other survey group${N.length===2?"":"s"} will remain outside the converted questionnaire. The researcher selected this group explicitly; no other group is silently flattened or removed.`}),a==="Question"&&I(d,{code:"limesurvey-question-context-not-retained",title:"The LimeSurvey question will run as a standalone questionnaire",detail:"An LSQ contains one question and its local answer settings, but not its original survey or group context. Confirm that standalone use is intended."}),C.grelevance&&C.grelevance!=="1"&&I(d,{code:"limesurvey-group-relevance-not-retained",title:"The source group display condition will not be retained",detail:`The LimeSurvey group condition is “${A(C.grelevance)}”. The converted questionnaire runs this selected group as a standalone instrument. Confirm that this is intended.`}),A(C.randomization_group??"")&&I(d,{code:"limesurvey-group-randomisation-not-retained",title:"The source group randomisation setting will not be retained",detail:"The converted questionnaire uses the reviewed exported question order. Confirm that a fixed order is suitable."}),O.length>1&&!n)return fe(v,f,t,k,null,d,{groupOptions:F,selectedGroupId:C.gid,requiresRatingSetSelection:!0,ratingSetOptions:O});const K=n?O.find(s=>s.id===n):O[0];if(n&&!K)throw new Error("Choose a rating set contained in the selected LimeSurvey group.");const Te=K?.responseValues.join("|"),ve=Te?Y.filter(s=>ot(s,D)?.join("|")===Te&&s.mandatory==="Y"&&(!s.other||s.other==="N")&&(!s.relevance||s.relevance==="1")):Y,Re=new Set(ve.map(s=>s.qid)),Qe=V.filter(s=>Re.has(s.parent_qid)),de=new Set(ve.map(s=>s.qid));for(const s of Qe)de.add(s.qid);const ue=Y.filter(s=>!Re.has(s.qid));K&&ue.length&&I(d,{code:"limesurvey-selected-rating-set-only",title:`Only the ${K.responseValues[0]}–${K.responseValues.at(-1)} rating set will be converted`,detail:`${ue.length} other source question${ue.length===1?"":"s"} (${ue.map(s=>`${s.title||s.qid} [type ${s.type||"unknown"}]`).join(", ")}) will remain in LimeSurvey. They are listed here rather than silently removed or mixed into an invalid score.`}),E(o,"conditions").filter(s=>de.has(s.qid)||de.has(s.cqid)).length&&d.unsupported.push({code:"limesurvey-conditions",title:"The selected LimeSurvey group contains question conditions",detail:"Branching and conditional relevance are not imported."});for(const[s,b]of[["assessments","assessment rules"],["defaultvalues","default answers"],["quotas","quota rules"],["quota_members","quota membership rules"],["quota_languages","localised quota messages"]])E(o,s).length&&d.unsupported.push({code:`limesurvey-${s.replace(/_/g,"-")}`,title:`The LimeSurvey export contains ${b}`,detail:`${b[0].toUpperCase()}${b.slice(1)} are not executed or silently discarded.`});kt(E(o,"question_attributes").filter(s=>de.has(s.qid)),d);const Z=E(o,"question_l10ns"),Ee=E(o,"answer_l10ns"),M=[];I(d,{code:"limesurvey-platform-settings-not-imported",title:"LimeSurvey platform and presentation settings are not imported",detail:"Theme, navigation, notification and publication settings remain in LimeSurvey. Review the converted participant presentation."});for(const s of ve){const b=s.qid||s.title||"unknown-question";if(s.mandatory!=="Y"){d.unsupported.push({code:"limesurvey-optional-question",title:`${s.title||b} is not mandatory`,detail:"The participant platform currently requires every imported item."});continue}if(s.other&&s.other!=="N"){d.unsupported.push({code:"limesurvey-other-answer",title:`${s.title||b} allows an “Other” answer`,detail:"Free-text “Other” responses are not imported."});continue}if(s.relevance&&s.relevance!=="1"){d.unsupported.push({code:"limesurvey-question-relevance",title:`${s.title||b} uses relevance logic`,detail:"Conditional questions are not imported."});continue}const re=z(Z,"qid",s.qid,"question",u)||s.question,T=z(Z,"qid",s.qid,"help",u)||s.help,dt=z(Z,"qid",s.qid,"script",u)||s.script;if(A(dt||"")){d.unsupported.push({code:"limesurvey-question-script",title:`${s.title||b} contains a question script`,detail:"Imported scripts are never executed or silently removed."});continue}if($e.test(T||"")||Ce.test(T||"")||qe.test(T||"")){d.unsupported.push({code:"limesurvey-question-help-structure",title:`${s.title||b} contains dynamic or structured help content`,detail:"Executable code, expressions, media and interactive help are not imported."});continue}if(He(T||"")){d.unsupported.push({code:"limesurvey-question-help",title:`${s.title||b} contains participant help text`,detail:"Question help text is not silently merged into or removed from the item wording."});continue}const j=A(re??"")?B(re,"Question text",s.title||b,d):null;if(s.type==="5"){if(!j){d.unsupported.push({code:"missing-visible-text",title:"Question text is empty",detail:`${s.title||b} does not contain participant-visible text.`});continue}const P={sourceId:s.title||b,name:s.title||`Item ${M.length+1}`,prompt:j,values:[1,2,3,4,5],labels:["1","2","3","4","5"]};M.push(P),d.imported.push(se(P))}else if(s.type==="L"||s.type==="!"){if(!j){d.unsupported.push({code:"missing-visible-text",title:"Question text is empty",detail:`${s.title||b} does not contain participant-visible text.`});continue}const P=Je(s,D,Ee,u,d);if(!P)continue;const X={sourceId:s.title||b,name:s.title||`Item ${M.length+1}`,prompt:j,...P};M.push(X),d.imported.push(se(X))}else if(s.type==="F"){const P=Qe.filter(w=>w.parent_qid===s.qid).sort((w,ee)=>(Number(w.question_order)||0)-(Number(ee.question_order)||0));if(!P.length){d.unsupported.push({code:"limesurvey-array-without-rows",title:`${s.title||b} has no array row`,detail:"A LimeSurvey Array question must contain at least one explicit row before it can be converted."});continue}if(P.some(w=>w.relevance&&w.relevance!=="1"||w.other&&w.other!=="N"||w.scale_id&&w.scale_id!=="0")){d.unsupported.push({code:"limesurvey-array-row-behaviour",title:`${s.title||b} contains an unsupported array row`,detail:"Conditional, “Other” or secondary-scale array rows are not flattened."});continue}const X=Je(s,D,Ee,u,d);if(!X)continue;P.length===1?I(d,{code:"limesurvey-single-row-array-expanded",title:"Single-row LimeSurvey Array questions were converted to rating items",detail:"Each source question contains one array row. Review the displayed item wording and response scale against LimeSurvey."}):I(d,{code:"limesurvey-array-expanded",title:"LimeSurvey Array rows were converted to separate rating items",detail:"The source array heading is combined with each visible row label when both contain text. Review the converted wording and order."});for(const w of P){const ee=w.qid||w.title||`${b}-row`,Pe=z(Z,"qid",w.qid,"question",u)||w.question,ce=z(Z,"qid",w.qid,"help",u)||w.help,ut=z(Z,"qid",w.qid,"script",u)||w.script;if(A(ut||"")||$e.test(ce||"")||Ce.test(ce||"")||qe.test(ce||"")||He(ce||"")){d.unsupported.push({code:"limesurvey-array-row-content",title:`${w.title||ee} contains unsupported row content`,detail:"Array-row scripts, dynamic content and help text are not imported."});continue}const pe=A(Pe??"")?B(Pe,"Array row text",w.title||ee,d):null,ke=j&&pe?`${j}: ${pe}`:j||pe;if(!ke){d.unsupported.push({code:"missing-visible-text",title:"Array item text is empty",detail:`${w.title||ee} and its parent question contain no participant-visible text.`});continue}const Le={sourceId:`${s.title||b}/${w.title||ee}`,name:P.length===1&&!pe?s.title||`Item ${M.length+1}`:w.title||s.title||`Item ${M.length+1}`,prompt:ke,values:[...X.values],labels:[...X.labels]};M.push(Le),d.imported.push(se(Le))}}else d.unsupported.push({code:"limesurvey-unsupported-question",title:`${s.title||b} uses unsupported LimeSurvey type ${s.type||"unknown"}`,detail:"Supported in this release: List (Radio), 5 Point Choice and reviewed Array rating rows."})}const xe=a==="Question"?"":ae?.description||C.description||ne?.surveyls_description||ne?.surveyls_welcometext||"",at=A(xe)?B(xe,"Survey introduction","surveys_languagesettings",d):null,lt=it(k,`Imported from ${f}`,at??"Answer each imported item about the task that you have just completed.",tt(u,"en"),M,d);return fe(v,f,t,k,lt,d,{groupOptions:F,selectedGroupId:C.gid,ratingSetOptions:O,selectedRatingSetId:K?.id})}function Dt(e,t){const i=t.toLowerCase().split(".").at(-1),n=e.trimStart();if(n.startsWith("{")&&/"SurveyElements"/.test(e))return"qualtrics-qsf";if(n.startsWith("<")&&/<LimeSurveyDocType>Survey</.test(e))return"limesurvey-lss";if(n.startsWith("<")&&/<LimeSurveyDocType>Group</.test(e))return"limesurvey-lsg";if(n.startsWith("<")&&/<LimeSurveyDocType>Question</.test(e))return"limesurvey-lsq";if(i==="qsf")return"qualtrics-qsf";if(i==="lss")return"limesurvey-lss";if(i==="lsg")return"limesurvey-lsg";if(i==="lsq")return"limesurvey-lsq";throw i==="lsa"?new Error("LimeSurvey LSA archives are not imported because they may contain responses, tokens and participant data. Export survey structure as LSS instead."):i==="lsl"?new Error("A LimeSurvey LSL file contains only a reusable label set, not a questionnaire. Export the containing question as LSQ, group as LSG or survey as LSS."):i==="csv"||i==="tsv"||i==="xls"||i==="xlsx"?new Error("CSV, TSV and spreadsheet files are ambiguous table formats used for response data or platform-specific bulk authoring. Import the file into its source platform, review it there, then export Qualtrics QSF or LimeSurvey LSS, LSG or LSQ."):i==="sav"||i==="spss"||i==="vv"?new Error("This is a response-data format, not a reusable questionnaire definition. Export Qualtrics QSF or LimeSurvey LSS, LSG or LSQ from the source questionnaire."):i==="txt"||i==="doc"||i==="docx"||i==="rtf"||i==="odt"?new Error("Text and word-processing files may be manually prepared authoring files or readable exports; they are not an unambiguous native structure export. Import the file into Qualtrics or LimeSurvey first, review it there, then export QSF, LSS, LSG or LSQ."):i==="pdf"||i==="html"||i==="htm"||i==="xml"||i==="zip"?new Error("This print, generic XML or archive format is not an unambiguous native questionnaire structure export. Export Qualtrics QSF or LimeSurvey LSS, LSG or LSQ."):i==="json"?new Error("This JSON file is not a Qualtrics QSF. If it is an AQP questionnaire definition, use the separate “Reuse an AQP questionnaire definition” route; otherwise export Qualtrics QSF."):new Error("Choose a Qualtrics .qsf file or a LimeSurvey .lss, .lsg or .lsq file.")}function Se(e,t,i="auto",n,r){const o=new TextEncoder().encode(e).length;if(!e.trim())throw new Error("The selected questionnaire export is empty.");if(o>qt)throw new Error("The selected questionnaire export is larger than the 2 MB review limit.");const a=Dt(e,t);if(i!=="auto"&&i!==a){const v=a==="qualtrics-qsf"?"Qualtrics QSF":a==="limesurvey-lss"?"LimeSurvey LSS":a==="limesurvey-lsg"?"LimeSurvey LSG":"LimeSurvey LSQ";throw new Error(`The selected file looks like ${v}, not the chosen format.`)}return a==="qualtrics-qsf"?xt(e,t):Nt(e,t,n,r)}var Ot=Object.defineProperty,Mt=Object.getOwnPropertyDescriptor,h=(e,t,i,n)=>{for(var r=n>1?void 0:n?Mt(t,i):t,o=e.length-1,a;o>=0;o--)(a=e[o])&&(r=(n?a(t,i,r):a(r))||r);return n&&r&&Ot(t,i,r),r};const Ft=Ie.trim().split(/\r?\n/).filter(Boolean).length,te=Ae.match(/var bridgeBuild = '([^']+)'/)?.[1]??"unidentified",Ve=[{key:"source",title:"Choose the questionnaire source"},{key:"scoring",title:"Confirm the questionnaire and scoring"},{key:"study",title:"Enter study details"},{key:"support",title:"Set participant support"},{key:"collection",title:"Choose result collection"},{key:"review",title:"Review and generate"}],Ye=[{key:"source",title:"Choose the questionnaire source"},{key:"upload",title:"Upload the file and choose the relevant part"},{key:"questions",title:"Review the questions"},{key:"answers",title:"Review answer choices and stored values"},{key:"warnings",title:"Resolve import warnings"},{key:"scoring",title:"Confirm the scoring rule"},{key:"study",title:"Enter study details"},{key:"support",title:"Set participant support"},{key:"collection",title:"Choose result collection"},{key:"review",title:"Review and generate"}],_e="accessible-questionnaire-v0.8-conductor-draft";function jt(e){const t=Array.isArray(e)?e:[e];return t.length>0&&t.some(i=>{if(!i||typeof i!="object")return!1;const n=i;return"study"in n&&"responses"in n&&"result"in n})}function Ut(e){const t="PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE";if(!e||e.includes(t))throw new Error("A generated participant URL is required for the Qualtrics question HTML.");const i=e.replace(/&/g,"&amp;").replace(/"/g,"&quot;");return _t.trim().replace(t,i)}function zt(e){const t=e?["Questionnaire:","${e://Field/__js_AQP_INSTRUMENT_NAME}","","${e://Field/__js_AQP_SCORE_NAME}:","${e://Field/__js_AQP_PRIMARY_SCORE}"].join(`
`):"";return St.replace("{{OPTIONAL_SCORE_BLOCK}}",t).replace(/\n{3,}/g,`

`).trim()}let m=class extends ht{constructor(){super(...arguments),this.setupRoute="ready-made",this.wizardStepIndex=0,this.scoringConfirmed=!1,this.importWarningsAcknowledged=!1,this.instrumentId=ft,this.customDefinition=null,this.customDraft=ze(),this.customBuilderOpen=!1,this.platformImportSource="auto",this.platformImportReview=null,this.platformImportConfirmed=!1,this.platformImportSelectedGroupId="",this.platformImportSelectedRatingSetId="",this.platformImportContents="",this.platformImportFileName="",this.studyId="",this.studyTitle="",this.taskLabel="",this.participantCode="",this.showScoreToParticipant=!1,this.showSimpleLanguage=!1,this.answerMode="standard",this.largeText=!1,this.audioGuidance=!1,this.recoveryEnabled=!0,this.participantAdjustmentPolicy="participant-choice",this.voiceInputAvailable=!0,this.gazeInputAvailable=!1,this.collectionMode="local",this.qualtricsSurveyUrl="",this.generatedConfig=null,this.participantUrl="",this.message="",this.definitionConfirmation="",this.configurationConfirmation="",this.errorMessage="",this.completedResults=[],this.draftRestored=!1,this.handleWizardPopState=e=>{const t=Number(e.state?.aqpConductorStep);!Number.isInteger(t)||t<0||t>=this.wizardSteps.length||(this.wizardStepIndex=t,this.errorMessage="",this.focusWizardHeading())},this.continueWizard=()=>{this.errorMessage="";const e=this.wizardStep.key;try{if(e==="upload"){const i=this.platformImportReview;if(!i)throw new Error("Choose and review a questionnaire export before continuing.");if(i.requiresGroupSelection)throw new Error("Choose the LimeSurvey questionnaire group before continuing.");if(i.requiresRatingSetSelection)throw new Error("Choose the compatible LimeSurvey rating set before continuing.");if(!i.canConvert||!i.draft)throw new Error("This export contains unsupported content. Correct the source and review a new export before continuing.")}if(e==="warnings"&&!this.importWarningsAcknowledged)throw new Error("Acknowledge the listed import findings before continuing.");if(e==="scoring"){if(this.setupRoute==="imported"){if(!this.platformImportConfirmed)throw new Error("Confirm the scoring rule and imported values against the source before continuing.");if(this.usePlatformImport(),this.customDefinition?.id!==this.instrumentId)throw new Error("The reviewed questionnaire could not be activated. Check the scoring fields and try again.")}else if(!this.scoringConfirmed)throw new Error("Confirm that the selected questionnaire and scoring rule match the study protocol.")}e==="study"&&this.validateStudyDetails(),e==="collection"&&this.currentCollectionConfig();const t=Math.min(this.wizardStepIndex+1,this.wizardSteps.length-1);if(t===this.wizardStepIndex)return;this.wizardStepIndex=t,window.history.pushState({...window.history.state??{},aqpConductorStep:t},"",window.location.href),this.message=`Step ${t+1} of ${this.wizardSteps.length}: ${this.wizardSteps[t].title}.`,this.focusWizardHeading()}catch(t){this.showError(t instanceof Error?t.message:"This step is incomplete.")}},this.previousWizard=()=>{if(this.wizardStepIndex===0)return;const e=this.wizardStepIndex-1;this.wizardStepIndex=e,window.history.pushState({...window.history.state??{},aqpConductorStep:e},"",window.location.href),this.errorMessage="",this.message=`Step ${e+1} of ${this.wizardSteps.length}: ${this.wizardSteps[e].title}.`,this.focusWizardHeading()},this.selectInstrument=e=>{const t=e.currentTarget.value,i=this.availableDefinitions.find(n=>n.id===t)??null;i&&(this.instrumentId=t,i.supports.simplerExplanations||(this.showSimpleLanguage=!1),i.supports.smileyLandmarks||(this.answerMode="standard"),this.scoringConfirmed=!1,this.generatedConfig=null,this.participantUrl="",this.definitionConfirmation=`${i.name} ${i.version} selected. Complete the study details, then generate a new configuration.`,this.configurationConfirmation="",this.message=`${i.name} selected. Generate a new configuration before testing.`)},this.importPlatformQuestionnaire=async e=>{const t=e.currentTarget,i=t.files?.[0];if(i){this.errorMessage="",this.definitionConfirmation="",this.platformImportReview=null,this.platformImportConfirmed=!1,this.importWarningsAcknowledged=!1;try{const n=await i.text();this.platformImportContents=n,this.platformImportFileName=i.name,this.platformImportSelectedGroupId="",this.platformImportSelectedRatingSetId="";const r=Se(n,i.name,this.platformImportSource);this.platformImportReview=r,this.platformImportSelectedGroupId=r.selectedGroupId??"",r.draft&&(this.customDraft=structuredClone(r.draft)),this.message=r.requiresGroupSelection?"Choose one LimeSurvey questionnaire group to review.":r.requiresRatingSetSelection?"Choose one compatible LimeSurvey rating set to review.":r.canConvert?"Import review ready. Check every section and confirm scoring before conversion.":"Import review found unsupported content. No partial questionnaire was created.",this.revealConductorResult("#platform-import-review")}catch(n){this.showError(n instanceof Error?n.message:"The questionnaire export could not be reviewed.")}finally{t.value=""}}},this.reviewSelectedLimeSurveyGroup=()=>{if(!(!this.platformImportContents||!this.platformImportFileName||!this.platformImportSelectedGroupId)){this.errorMessage="",this.definitionConfirmation="",this.platformImportConfirmed=!1,this.importWarningsAcknowledged=!1;try{const e=Se(this.platformImportContents,this.platformImportFileName,this.platformImportSource,this.platformImportSelectedGroupId);this.platformImportReview=e,this.platformImportSelectedRatingSetId="",e.draft&&(this.customDraft=structuredClone(e.draft)),this.message=e.requiresRatingSetSelection?"Choose one compatible rating set in the selected LimeSurvey group.":e.canConvert?"Selected group review ready. Check every section and confirm scoring before conversion.":"The selected group contains unsupported content. No partial questionnaire was created.",this.revealConductorResult("#platform-import-review")}catch(e){this.showError(e instanceof Error?e.message:"The selected LimeSurvey group could not be reviewed.")}}},this.reviewSelectedLimeSurveyRatingSet=()=>{if(!(!this.platformImportContents||!this.platformImportFileName||!this.platformImportSelectedGroupId||!this.platformImportSelectedRatingSetId)){this.errorMessage="",this.definitionConfirmation="",this.platformImportConfirmed=!1,this.importWarningsAcknowledged=!1;try{const e=Se(this.platformImportContents,this.platformImportFileName,this.platformImportSource,this.platformImportSelectedGroupId,this.platformImportSelectedRatingSetId);this.platformImportReview=e,e.draft&&(this.customDraft=structuredClone(e.draft)),this.message=e.canConvert?"Selected rating-set review ready. Check every section and confirm scoring before conversion.":"The selected rating set contains unsupported content. No partial questionnaire was created.",this.revealConductorResult("#platform-import-review")}catch(e){this.showError(e instanceof Error?e.message:"The selected LimeSurvey rating set could not be reviewed.")}}},this.usePlatformImport=()=>{const e=this.platformImportReview;if(!(!e?.canConvert||!e.draft||!this.platformImportConfirmed)){this.errorMessage="",this.definitionConfirmation="";try{const t=Ge(this.customDraft);this.activateCustomDefinition(t,"imported")}catch(t){this.showError(t instanceof Error?t.message:"The reviewed questionnaire could not be converted.")}}},this.addCustomItem=()=>{this.customDraft.items.length>=G||(this.customDraft={...this.customDraft,items:[...this.customDraft.items,ge({name:`Item ${this.customDraft.items.length+1}`})]})},this.useCustomDraft=()=>{this.errorMessage="",this.definitionConfirmation="";try{this.activateCustomDefinition(Ge(this.customDraft),"validated")}catch(e){this.showError(e instanceof Error?e.message:"The custom questionnaire could not be validated.")}},this.importCustomDefinition=async e=>{const t=e.currentTarget,i=t.files?.[0];if(i){this.errorMessage="",this.definitionConfirmation="";try{const n=Ze(JSON.parse(await i.text()));this.activateCustomDefinition(n,"imported")}catch(n){this.showError(n instanceof Error?n.message:"The questionnaire definition file could not be read.")}finally{t.value=""}}},this.downloadCustomDefinition=()=>{this.customDefinition&&me($t(this.customDefinition),JSON.stringify(this.customDefinition,null,2),"application/json")},this.resetCustomDraft=()=>{this.customDraft=ze(),this.platformImportReview=null,this.platformImportConfirmed=!1,this.importWarningsAcknowledged=!1,this.platformImportSelectedGroupId="",this.platformImportSelectedRatingSetId="",this.platformImportContents="",this.platformImportFileName="",this.message="Custom questionnaire builder fields reset. The selected questionnaire is unchanged until you validate a new definition."},this.updateParticipantCode=e=>{if(this.participantCode=e.currentTarget.value.trim(),!this.generatedConfig)return;const t=U(this.participantCode);this.participantUrl=t?De(new URL("index.html",window.location.href).toString(),this.generatedConfig,this.participantCode):"",this.configurationConfirmation=t?`Participant-specific link ready for code ${this.participantCode}.`:""},this.generateParticipantLink=()=>{this.errorMessage="",this.configurationConfirmation="";try{if(!U(this.participantCode))throw new Error("Enter a pseudonymous participant code using 1–32 letters, numbers, hyphens or underscores.");const e=Oe({instrumentId:this.instrumentId,...this.customDefinition?.id===this.instrumentId?{questionnaireDefinition:this.customDefinition}:{},studyId:this.studyId,studyTitle:this.studyTitle,taskLabel:this.taskLabel,showScoreToParticipant:this.showScoreToParticipant,support:this.currentSupportConfig(),collection:this.currentCollectionConfig()});this.useConfiguration(e),this.configurationConfirmation="Participant link and configuration generated. The ready-to-use files and link are shown below.",this.message="",this.revealConductorResult("#configuration-ready-panel")}catch(e){this.showError(e instanceof Error?e.message:"The study configuration could not be generated.")}},this.copyParticipantLink=async()=>{this.participantUrl&&await this.copySetupAsset(this.participantUrl,"participant link")},this.copySetupAsset=async(e,t)=>{try{if(!navigator.clipboard?.writeText)throw new Error("Clipboard API unavailable.");await navigator.clipboard.writeText(e),this.message=`${t.charAt(0).toUpperCase()}${t.slice(1)} copied.`}catch{this.message=`Automatic copy was unavailable. Select and copy the ${t} from its text box.`}},this.downloadConfiguration=()=>{this.generatedConfig&&me(`${this.generatedConfig.studyId}-${this.generatedConfig.configId}.json`,JSON.stringify(this.generatedConfig,null,2),"application/json")},this.importConfiguration=async e=>{const t=e.currentTarget,i=t.files?.[0];if(i){this.errorMessage="",this.configurationConfirmation="";try{const n=JSON.parse(await i.text()),r=Me(n);if(!r)throw jt(n)?new Error("This is a completed result file, not a study configuration. Import the JSON downloaded from Configuration ready."):new Error("This is not a valid Version 0.8 study configuration or supported Version 0.7 configuration.");this.useConfiguration(r),this.configurationConfirmation=U(this.participantCode)?"Configuration imported and participant-specific link reproduced. The configuration ID and files are shown below.":"Configuration imported. Enter the approved pseudonymous participant code to create a participant-specific link.",this.message="",this.revealConductorResult("#configuration-ready-panel")}catch(n){this.showError(n instanceof Error?n.message:"The configuration file could not be read.")}finally{t.value=""}}},this.refreshResults=()=>{this.completedResults=gt()},this.exportResultsJson=()=>{this.completedResults.length&&me(`accessible-questionnaire-results-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(this.completedResults,null,2),"application/json")},this.exportResultsCsv=()=>{this.completedResults.length&&me(`accessible-questionnaire-results-${new Date().toISOString().slice(0,10)}.csv`,`\uFEFF${yt(this.completedResults)}`,"text/csv")},this.eraseResults=()=>{window.confirm("Erase every completed questionnaire record stored by this site in this browser? Confirm only after checking the exported files.")&&(vt(),this.refreshResults(),this.message="Local completed records erased.")}}connectedCallback(){super.connectedCallback(),this.restoreConductorDraft(),this.refreshResults(),window.addEventListener("storage",this.refreshResults),window.addEventListener("popstate",this.handleWizardPopState),window.history.replaceState({...window.history.state??{},aqpConductorStep:this.wizardStepIndex},"",window.location.href)}disconnectedCallback(){window.removeEventListener("storage",this.refreshResults),window.removeEventListener("popstate",this.handleWizardPopState),super.disconnectedCallback()}updated(){this.draftRestored&&this.persistConductorDraft()}createRenderRoot(){return this}get definition(){return bt(this.instrumentId,this.customDefinition??void 0)}get availableDefinitions(){return this.customDefinition?[...Fe,this.customDefinition]:Fe}get wizardSteps(){return this.setupRoute==="imported"?Ye:Ve}get wizardStep(){return this.wizardSteps[Math.min(this.wizardStepIndex,this.wizardSteps.length-1)]}selectSetupRoute(e){this.setupRoute!==e&&(this.setupRoute=e,this.wizardStepIndex=0,this.errorMessage="",this.scoringConfirmed=!1,this.importWarningsAcknowledged=!1,this.generatedConfig=null,this.participantUrl="",this.replaceWizardHistory())}replaceWizardHistory(){window.history.replaceState({...window.history.state??{},aqpConductorStep:this.wizardStepIndex},"",window.location.href)}focusWizardHeading(){this.updateComplete.then(()=>{const e=this.querySelector("#conductor-step-heading");e&&be(e,{block:"start"})})}persistConductorDraft(){try{window.sessionStorage.setItem(_e,JSON.stringify({setupRoute:this.setupRoute,wizardStepIndex:this.wizardStepIndex,scoringConfirmed:this.scoringConfirmed,importWarningsAcknowledged:this.importWarningsAcknowledged,instrumentId:this.instrumentId,customDefinition:this.customDefinition,customDraft:this.customDraft,platformImportSource:this.platformImportSource,platformImportReview:this.platformImportReview,platformImportConfirmed:this.platformImportConfirmed,platformImportSelectedGroupId:this.platformImportSelectedGroupId,platformImportSelectedRatingSetId:this.platformImportSelectedRatingSetId,studyId:this.studyId,studyTitle:this.studyTitle,taskLabel:this.taskLabel,participantCode:this.participantCode,showScoreToParticipant:this.showScoreToParticipant,showSimpleLanguage:this.showSimpleLanguage,answerMode:this.answerMode,largeText:this.largeText,audioGuidance:this.audioGuidance,recoveryEnabled:this.recoveryEnabled,participantAdjustmentPolicy:this.participantAdjustmentPolicy,voiceInputAvailable:this.voiceInputAvailable,gazeInputAvailable:this.gazeInputAvailable,collectionMode:this.collectionMode,qualtricsSurveyUrl:this.qualtricsSurveyUrl,generatedConfig:this.generatedConfig}))}catch{}}restoreConductorDraft(){try{const e=window.sessionStorage.getItem(_e);if(!e){this.draftRestored=!0;return}const t=JSON.parse(e),i=t.setupRoute==="imported"?"imported":"ready-made";this.setupRoute=i;const n=i==="imported"?Ye:Ve,r=Number(t.wizardStepIndex);this.wizardStepIndex=Number.isInteger(r)&&r>=0&&r<n.length?r:0,this.scoringConfirmed=t.scoringConfirmed===!0,this.importWarningsAcknowledged=t.importWarningsAcknowledged===!0,typeof t.instrumentId=="string"&&(this.instrumentId=t.instrumentId),t.customDefinition&&typeof t.customDefinition=="object"&&(this.customDefinition=t.customDefinition),t.customDraft&&typeof t.customDraft=="object"&&(this.customDraft=t.customDraft),typeof t.platformImportSource=="string"&&(this.platformImportSource=t.platformImportSource),t.platformImportReview&&typeof t.platformImportReview=="object"&&(this.platformImportReview=t.platformImportReview),this.platformImportConfirmed=t.platformImportConfirmed===!0,typeof t.platformImportSelectedGroupId=="string"&&(this.platformImportSelectedGroupId=t.platformImportSelectedGroupId),typeof t.platformImportSelectedRatingSetId=="string"&&(this.platformImportSelectedRatingSetId=t.platformImportSelectedRatingSetId),typeof t.studyId=="string"&&(this.studyId=t.studyId),typeof t.studyTitle=="string"&&(this.studyTitle=t.studyTitle),typeof t.taskLabel=="string"&&(this.taskLabel=t.taskLabel),typeof t.participantCode=="string"&&U(t.participantCode)&&(this.participantCode=t.participantCode),this.showScoreToParticipant=t.showScoreToParticipant===!0,this.showSimpleLanguage=t.showSimpleLanguage===!0,this.answerMode=t.answerMode==="smiley"?"smiley":"standard",this.largeText=t.largeText===!0,this.audioGuidance=t.audioGuidance===!0,this.recoveryEnabled=t.recoveryEnabled!==!1,(t.participantAdjustmentPolicy==="locked"||t.participantAdjustmentPolicy==="presentation-only"||t.participantAdjustmentPolicy==="participant-choice")&&(this.participantAdjustmentPolicy=t.participantAdjustmentPolicy),this.voiceInputAvailable=t.voiceInputAvailable!==!1,this.gazeInputAvailable=t.gazeInputAvailable===!0,this.collectionMode=t.collectionMode==="qualtrics"?"qualtrics":"local",typeof t.qualtricsSurveyUrl=="string"&&(this.qualtricsSurveyUrl=t.qualtricsSurveyUrl);const o=t.generatedConfig?Me(t.generatedConfig):null;o&&this.useConfiguration(o),i==="imported"&&(this.platformImportReview?.requiresGroupSelection||this.platformImportReview?.requiresRatingSetSelection)&&!this.platformImportContents&&(this.wizardStepIndex=1,this.platformImportReview=null,this.platformImportSelectedGroupId="",this.platformImportSelectedRatingSetId="",this.message="Select the source file again to continue choosing its LimeSurvey group or rating set.")}catch{window.sessionStorage.removeItem(_e)}finally{this.draftRestored=!0}}validateStudyDetails(){Oe({instrumentId:this.instrumentId,...this.customDefinition?.id===this.instrumentId?{questionnaireDefinition:this.customDefinition}:{},studyId:this.studyId,studyTitle:this.studyTitle,taskLabel:this.taskLabel,showScoreToParticipant:this.showScoreToParticipant,support:this.currentSupportConfig(),collection:{mode:"local"}})}render(){return l`
      <a class="skip-link" href="#conductor-main">Skip to study setup</a>
      <main class="app-shell conductor-shell" id="conductor-main">
        <header class="app-header">
          <p class="eyebrow">
            Study conductor · Version ${we} · Qualtrics package ${te}
          </p>
          <h1>Prepare an accessible questionnaire study</h1>
          <p class="subtitle">Create one configuration, give participants a prepared link, and export completed records.</p>
        </header>

        <aside class="boundary-note important-boundary" aria-labelledby="current-generator-heading">
          <h2 id="current-generator-heading">Current Qualtrics generator: ${te}</h2>
          <p>
            Every generated JavaScript block must contain
            <code>var bridgeBuild = '${te}';</code>. If it shows another value, that browser tab is
            running a stale conductor build. Close that tab and reopen the versioned
            <a href="study.html?package=${te}">Prepare a study page</a> before copying anything.
          </p>
        </aside>

        <aside class="boundary-note important-boundary">
          <h2>What this page does</h2>
          <p>
            This separates study setup from participant answering. Participants receive a configured questionnaire and do not
            have to set it up themselves. This researcher page generates a separate participant page. Measurement-adjacent
            support starts from the study configuration. The conductor can keep it fixed or allow documented participant
            preferences without making initial configuration a participant task.
          </p>
          <p>
            <strong>Collection boundary:</strong> local mode stays in this browser. Qualtrics mode sends a completed,
            pseudonymous record to the exact approved Qualtrics survey origin through the documented bridge. It places no
            account token in the participant page.
          </p>
        </aside>

        ${this.errorMessage?l`<div class="error-summary" role="alert" tabindex="-1" id="conductor-error">
              <h2>There is a problem</h2><p>${this.errorMessage}</p>
            </div>`:$}
        <p class="sr-only" aria-live="polite">${this.message}</p>

        <div class="progress-card conductor-progress">
          <p class="step-label">Step ${this.wizardStepIndex+1} of ${this.wizardSteps.length}</p>
          <progress max=${this.wizardSteps.length} value=${this.wizardStepIndex+1}>
            ${this.wizardStepIndex+1} of ${this.wizardSteps.length}
          </progress>
          <h2 id="conductor-step-heading" tabindex="-1">${this.wizardStep.title}</h2>
          <p>Complete this task, then use Continue. Your draft is kept in this browser tab if the page reloads.</p>
        </div>

        <section
          class="panel conductor-panel"
          aria-labelledby="study-details-heading"
          ?hidden=${this.wizardStep.key!=="source"&&this.wizardStep.key!=="study"}
        >
          <h2 id="study-details-heading">
            ${this.wizardStep.key==="source"?"Choose the questionnaire source":"Enter study details"}
          </h2>
          ${this.wizardStep.key==="source"?l`
                <fieldset class="answer-mode-control conductor-answer-mode source-route-control">
                  <legend>How will you provide the questionnaire?</legend>
                  <label>
                    <input
                      type="radio"
                      name="questionnaire-source-route"
                      value="ready-made"
                      .checked=${this.setupRoute==="ready-made"}
                      @change=${()=>this.selectSetupRoute("ready-made")}
                    />
                    <span>
                      <strong>Use a ready-made or saved AQP questionnaire</strong>
                      <small>Six short steps. You can select a built-in questionnaire or add a reviewed AQP definition.</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="questionnaire-source-route"
                      value="imported"
                      .checked=${this.setupRoute==="imported"}
                      @change=${()=>this.selectSetupRoute("imported")}
                    />
                    <span>
                      <strong>Import a Qualtrics or LimeSurvey export</strong>
                      <small>Ten short steps separate file selection, questions, values, warnings and scoring.</small>
                    </span>
                  </label>
                </fieldset>
                ${this.setupRoute==="imported"?l`<p class="support-boundary">
                      Continue to choose a QSF, LSS, LSG or LSQ file. The original file is read only in this browser.
                    </p>`:$}
                <p class="support-boundary">
                  Participant identity is kept separate from study setup. Give each participant a
                  pseudonymous code such as <strong>P-001</strong>. The generated participant-specific link fills it in;
                  the participant may correct it if needed.
                </p>
              `:l`<p class="support-boundary">
                These fields identify the questionnaire configuration, not the participant. Give each participant a separate
                pseudonymous code such as P-001. The generated participant-specific link fills it in;
                the participant may correct it if needed.
              </p>`}
          <div class="form-grid" ?hidden=${this.wizardStep.key!=="source"||this.setupRoute!=="ready-made"}>
            <label class="full-width">
              <strong>Questionnaire definition</strong>
              <span>
                Choose a versioned definition. Item wording, scale, workflow and scoring are loaded from that
                definition; accessibility supports are configured separately.
              </span>
              <select @change=${this.selectInstrument}>
                ${this.availableDefinitions.map(e=>l`<option
                    value=${e.id}
                    .selected=${e.id===this.instrumentId}
                  >
                    ${e.name} · ${e.version}${Ke(e.id)?"":" · researcher supplied"}
                  </option>`)}
              </select>
            </label>
            <aside
              class=${`definition-summary full-width${this.definitionConfirmation?" success-confirmation":""}`}
              id="selected-questionnaire-summary"
              tabindex="-1"
              aria-describedby=${this.definitionConfirmation?"definition-confirmation-message":$}
            >
              ${this.definitionConfirmation?l`<p
                    class="success-message"
                    id="definition-confirmation-message"
                  >
                    <span class="success-icon" aria-hidden="true">✓</span>
                    <span><strong>Questionnaire ready.</strong> ${this.definitionConfirmation}</span>
                  </p>`:$}
              <strong>${this.definition.shortName}</strong>
              <span>
                ${this.definition.items.length} items,
                ${he(this.definition).length}
                ${this.definition.scale.type.replace("-"," ")} response values,
                ${wt(this.definition).length} comparisons,
                ${this.definition.scoring.scoreName}.
              </span>
              <span>
                Questionnaire language: <code>${this.definition.language}</code>.
                Voice input uses English recognition. Every supported questionnaire accepts a shown
                number spoken in English. English questionnaires also accept one complete exact visible
                English answer label. Non-English answer-label recognition is outside this prototype's
                tested boundary. Visible answer buttons remain available.
              </span>
              ${this.definition.source.url?l`<a href=${this.definition.source.url} target="_blank" rel="noopener">
                    Instrument source: ${this.definition.source.label}
                  </a>`:l`<span>Instrument source: ${this.definition.source.label}</span>`}
            </aside>
            <div class="full-width button-row compact">
              <button
                class="secondary-button"
                type="button"
                aria-expanded=${String(this.customBuilderOpen)}
                aria-controls="custom-questionnaire-builder"
                @click=${()=>{this.customBuilderOpen=!this.customBuilderOpen}}
              >
                ${this.customBuilderOpen?"Close custom questionnaire builder":"Add your own questionnaire"}
              </button>
              ${this.customDefinition?l`
                    <button
                      class="secondary-button"
                      type="button"
                      @click=${this.downloadCustomDefinition}
                    >
                      Download current questionnaire definition
                    </button>
                  `:$}
            </div>
            ${this.customBuilderOpen?this.renderCustomQuestionnaireBuilder(!1):$}
          </div>
          <div class="form-grid" ?hidden=${this.wizardStep.key!=="study"}>
            <label>
              <strong>Study ID</strong>
              <span>Internal label shared by records from one study or condition. Example: ACCESS-TECH-01. Do not use a participant name.</span>
              <input placeholder="ACCESS-TECH-01" autocomplete="off" spellcheck="false" .value=${this.studyId} maxlength="64" @input=${e=>{this.studyId=e.currentTarget.value}} />
            </label>
            <label>
              <strong>Study title</strong>
              <span>Participant-facing name of the study. Example: Route-planning interface study.</span>
              <input placeholder="Route-planning interface study" autocomplete="off" .value=${this.studyTitle} maxlength="120" @input=${e=>{this.studyTitle=e.currentTarget.value}} />
            </label>
            <label class="full-width">
              <strong>Task label</strong>
              <span>Exact activity the participant has just completed and must rate. Example: planning a route from A to B using the prototype.</span>
              <input placeholder="planning a route from A to B using the prototype" autocomplete="off" .value=${this.taskLabel} maxlength="160" @input=${e=>{this.taskLabel=e.currentTarget.value}} />
            </label>
          </div>
        </section>

        ${this.renderQuestionnaireReviewStep()}

        <section
          class="panel conductor-panel"
          aria-labelledby="support-config-heading"
          ?hidden=${this.wizardStep.key!=="support"}
        >
          <h2 id="support-config-heading">Set participant support</h2>
          <p>
            These are starting settings. The selected definition keeps its declared items, values,
            workflow and allowlisted scoring rule unchanged.
          </p>
          <div class="config-grid">
            ${this.definition.supports.simplerExplanations?this.booleanOption("Show simpler explanations from the start",this.showSimpleLanguage,e=>{this.showSimpleLanguage=e}):l`<aside class="boundary-note">
                  <strong>No alternate item wording is included for ${this.definition.shortName}</strong>
                  <p>
                    Built-in instruments keep their sourced item text. Controls and instructions use plain language,
                    but AQP does not present an author-written paraphrase as an equivalent standard item.
                    If your protocol approves supplemental explanations, import a custom definition containing them;
                    its distinct definition hash and any use of the support will be recorded.
                  </p>
                </aside>`}
            ${this.booleanOption("Use large text from the start",this.largeText,e=>{this.largeText=e})}
            ${this.booleanOption("Use automatic spoken guidance from the start",this.audioGuidance,e=>{this.audioGuidance=e})}
            ${this.booleanOption("Save incomplete progress on this device",this.recoveryEnabled,e=>{this.recoveryEnabled=e})}
            ${this.booleanOption("Allow confirmed built-in voice answers",this.voiceInputAvailable,e=>{this.voiceInputAvailable=e})}
            ${this.booleanOption("Allow experimental webcam gaze input",this.gazeInputAvailable,e=>{this.gazeInputAvailable=e},"Default off because current gaze accuracy is recorded as Partial.")}
            ${this.booleanOption(`Show the ${this.definition.scoring.scoreName.toLowerCase()} to the participant`,this.showScoreToParticipant,e=>{this.showScoreToParticipant=e},"Default off for a study; the conductor receives the score in the export.")}
          </div>

          <fieldset class="answer-mode-control conductor-answer-mode">
            <legend>Participant personalisation policy</legend>
            <label>
              <input
                type="radio"
                name="participant-adjustment-policy"
                value="locked"
                .checked=${this.participantAdjustmentPolicy==="locked"}
                @change=${()=>{this.participantAdjustmentPolicy="locked"}}
              />
              <span>
                <strong>Prepared settings only</strong>
                <small>Use for a controlled measurement condition. The participant can still use any permitted answer route.</small>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="participant-adjustment-policy"
                value="presentation-only"
                .checked=${this.participantAdjustmentPolicy==="presentation-only"}
                @change=${()=>{this.participantAdjustmentPolicy="presentation-only"}}
              />
              <span>
                <strong>Allow display, audio and recovery preferences</strong>
                <small>
                  The participant may change text size, automatic spoken guidance and interruption recovery. Simpler
                  explanations and the standard/smiley answer presentation remain fixed.
                </small>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="participant-adjustment-policy"
                value="participant-choice"
                .checked=${this.participantAdjustmentPolicy==="participant-choice"}
                @change=${()=>{this.participantAdjustmentPolicy="participant-choice"}}
              />
              <span>
                <strong>Prepared defaults with optional participant choice</strong>
                <small>
                  Recommended for evaluating the accessibility support. Nothing must be configured before starting; the
                  participant may change applicable optional support, and every change is exported separately from the scored answers.
                </small>
              </span>
            </label>
          </fieldset>

          ${this.definition.supports.smileyLandmarks?l`<fieldset class="answer-mode-control conductor-answer-mode">
                <legend>Starting rating presentation</legend>
                <label>
                  <input type="radio" name="conductor-answer-mode" value="standard" .checked=${this.answerMode==="standard"} @change=${()=>{this.answerMode="standard"}} />
                  <span>
                    <strong>Standard ${he(this.definition).length}-value scale</strong>
                    <small>Recommended default.</small>
                  </span>
                </label>
                <label>
                  <input type="radio" name="conductor-answer-mode" value="smiley" .checked=${this.answerMode==="smiley"} @change=${()=>{this.answerMode="smiley"}} />
                  <span><strong>Experimental smiley landmarks</strong><small>Use only when this presentation is part of the approved protocol.</small></span>
                </label>
              </fieldset>`:l`<p class="support-boundary">
                ${this.definition.shortName} uses its standard ${he(this.definition).length}-value
                response scale. Smiley landmarks are disabled because this definition does not declare validated
                landmark meanings; adding faces could change the meaning of its response scale.
              </p>`}
        </section>

        <section
          class="panel conductor-panel"
          aria-labelledby="collection-heading"
          ?hidden=${this.wizardStep.key!=="collection"}
        >
          <h2 id="collection-heading">Choose where completed results are collected</h2>
          <fieldset class="answer-mode-control conductor-answer-mode">
            <legend>Result collection route</legend>
            <label>
              <input
                type="radio"
                name="collection-mode"
                value="local"
                .checked=${this.collectionMode==="local"}
                @change=${()=>{this.collectionMode="local"}}
              />
              <span>
                <strong>This browser only</strong>
                <small>Use for development and supervised same-device testing. It does not collect results across devices.</small>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="collection-mode"
                value="qualtrics"
                .checked=${this.collectionMode==="qualtrics"}
                @change=${()=>{this.collectionMode="qualtrics"}}
              />
              <span>
                <strong>UCL Qualtrics central collection</strong>
                <small>Recommended for an approved remote study that does not collect highly confidential data.</small>
              </span>
            </label>
          </fieldset>
          ${this.collectionMode==="qualtrics"?l`<label class="full-width">
                <strong>Qualtrics survey or preview URL</strong>
                <span>
                  Paste the HTTPS URL opened by your UCL Qualtrics survey. Only its exact origin is stored in the
                  questionnaire configuration; the survey identifier is not exposed in the result record.
                </span>
                <input
                  placeholder="https://your-ucl-brand.eu.qualtrics.com/jfe/form/SV_..."
                  autocomplete="off"
                  spellcheck="false"
                  .value=${this.qualtricsSurveyUrl}
                  @input=${e=>{this.qualtricsSurveyUrl=e.currentTarget.value}}
                />
              </label>
              <p class="support-boundary">
                Participants must receive the Qualtrics distribution link, not the embedded GitHub page URL. Complete the
                one-question bridge setup and verify a synthetic record in Qualtrics Data &amp; Analysis before recruitment.
              </p>`:$}
        </section>

        <section
          class="panel conductor-panel"
          aria-labelledby="link-heading"
          ?hidden=${this.wizardStep.key!=="review"}
        >
          <h2 id="link-heading">Review and generate the participant configuration</h2>
          ${this.renderConfigurationSummary()}
          <label class="participant-code-field" for="conductor-participant-code">
            <strong>Pseudonymous participant code for this link</strong>
            <span>
              Use the code from the approved participant list, not a name or email. The generated link fills it in;
              the participant may correct it if needed.
            </span>
            <input
              id="conductor-participant-code"
              type="text"
              maxlength="32"
              autocomplete="off"
              spellcheck="false"
              placeholder="P-001"
              .value=${this.participantCode}
              @input=${this.updateParticipantCode}
            />
          </label>
          <div class="button-row compact">
            <button class="primary-button large-answer-button" type="button" @click=${this.generateParticipantLink}>Generate link</button>
            <label class="file-button secondary-button">
              Import configuration JSON
              <input
                class="sr-only"
                data-configuration-import
                type="file"
                accept="application/json,.json"
                @change=${this.importConfiguration}
              />
            </label>
          </div>
          <p class="support-boundary">
            Import only the JSON downloaded from <strong>Configuration ready</strong>. Completed-result JSON is a different
            record type and is not imported here.
          </p>

          ${this.generatedConfig?l`<div
                class=${`generated-link${this.configurationConfirmation?" success-confirmation":""}`}
                id="configuration-ready-panel"
                role="region"
                aria-labelledby="generated-link-heading"
                aria-describedby=${this.configurationConfirmation?"configuration-confirmation-message":$}
                tabindex="-1"
              >
                ${this.configurationConfirmation?l`<p
                      class="success-message"
                      id="configuration-confirmation-message"
                    >
                      <span class="success-icon" aria-hidden="true">✓</span>
                      <span><strong>Success.</strong> ${this.configurationConfirmation}</span>
                    </p>`:$}
                <h3 id="generated-link-heading">Configuration ready</h3>
                <dl class="study-details">
                  <div><dt>Questionnaire</dt><dd>${this.definition.name} · ${this.definition.version}</dd></div>
                  <div><dt>Study ID</dt><dd>${this.generatedConfig.studyId}</dd></div>
                  <div><dt>Configuration ID</dt><dd>${this.generatedConfig.configId}</dd></div>
                  <div><dt>Definition SHA-256</dt><dd class="aqp-long-value">${this.generatedConfig.definitionHash}</dd></div>
                  <div>
                    <dt>Participant code in this link</dt>
                    <dd>${U(this.participantCode)?this.participantCode:"Not set"}</dd>
                  </div>
                  <div><dt>Created</dt><dd>${this.generatedConfig.createdAt}</dd></div>
                </dl>
                ${U(this.participantCode)&&this.participantUrl?l`
                      <label for="participant-link">
                        <strong>${this.generatedConfig.collection.mode==="qualtrics"?"Participant page URL for the Qualtrics iframe":"Participant link"}</strong>
                      </label>
                      <textarea id="participant-link" readonly rows="5" .value=${this.participantUrl}></textarea>
                      <div class="button-row compact">
                        <button class="secondary-button" type="button" @click=${this.copyParticipantLink}>Copy link</button>
                        ${this.generatedConfig.collection.mode==="local"?l`<a class="secondary-button link-button" href=${this.participantUrl} target="_blank" rel="noopener">Open participant page</a>`:$}
                        <button class="secondary-button" type="button" @click=${this.downloadConfiguration}>Download configuration JSON</button>
                      </div>
                      ${this.generatedConfig.collection.mode==="qualtrics"?this.renderQualtricsSetup():$}
                    `:l`
                      <p class="field-error" role="status">
                        Enter the approved pseudonymous participant code above. No participant link is available until the code is valid.
                      </p>
                      <div class="button-row compact">
                        <button class="secondary-button" type="button" @click=${this.downloadConfiguration}>Download configuration JSON</button>
                      </div>
                    `}
                <p class="support-boundary">
                  Save the JSON with the study protocol. It preserves the configuration ID and definition hash. After importing it,
                  enter the approved pseudonymous code to regenerate a participant-specific link. The link contains no name, email or answer.
                </p>
              </div>`:$}
        </section>

        <section
          class="panel conductor-panel"
          aria-labelledby="results-heading"
          ?hidden=${this.wizardStep.key!=="review"}
        >
          <h2 id="results-heading">Results saved on this device</h2>
          <p><strong>${this.completedResults.length}</strong> completed record${this.completedResults.length===1?"":"s"} found in this browser.</p>
          ${this.completedResults.length?l`
                <div class="table-scroll">
                  <table>
                    <thead><tr><th>Study ID</th><th>Instrument</th><th>Participant code</th><th>Completed</th><th>Primary score</th></tr></thead>
                    <tbody>
                      ${this.completedResults.map(e=>l`<tr>
                        <td>${e.study.studyId}</td>
                        <td>${e.instrument.name}</td>
                        <td>${e.participantCode}</td>
                        <td>${e.timing.completedAt}</td>
                        <td>${e.result.scoreName}: ${e.result.primaryScore.toFixed(2)}</td>
                      </tr>`)}
                    </tbody>
                  </table>
                </div>
                <div class="button-row compact">
                  <button class="primary-button" type="button" @click=${this.exportResultsCsv}>Export all as CSV</button>
                  <button class="secondary-button" type="button" @click=${this.exportResultsJson}>Export all as JSON</button>
                  <button class="danger-button" type="button" @click=${this.eraseResults}>Erase local results</button>
                </div>
                <p class="support-boundary">
                  Verify the exported files and move them through the approved data-management route before erasing the browser copy.
                </p>
              `:l`<p>After a configured questionnaire is completed in this same browser, its pseudonymous record will appear here.</p>`}
        </section>

        <section
          class="panel conductor-panel"
          aria-labelledby="remote-heading"
          ?hidden=${this.wizardStep.key!=="collection"}
        >
          <h2 id="remote-heading">Remote-study boundary</h2>
          <p>
            <strong>Central collection is not configured on this GitHub Pages deployment.</strong> A participant using another
            device will otherwise keep the result in that device's browser. Do not make the participant download and email data
            as the normal study procedure.
          </p>
          <p>
            Version ${we} includes a Qualtrics parent bridge. The participant page sends a complete record only to the
            exact HTTPS origin stored by the conductor; Qualtrics writes the fields into the current response and returns a
            matching receipt before advancing. A failed save leaves the answers on Review for retry. Platform selection,
            consent, retention and access must still match the project's existing approved protocol and data-management documents.
          </p>
        </section>

        ${this.renderWizardNavigation()}
      </main>
    `}renderQuestionnaireReviewStep(){const e=this.wizardStep.key;if(!["upload","questions","answers","warnings","scoring"].includes(e))return $;if(e==="scoring"&&this.setupRoute==="ready-made")return l`
        <section class="panel conductor-panel" aria-labelledby="questionnaire-scoring-heading">
          <h2 id="questionnaire-scoring-heading">Confirm the questionnaire and scoring</h2>
          <dl class="study-details">
            <div><dt>Questionnaire</dt><dd>${this.definition.name} · ${this.definition.version}</dd></div>
            <div><dt>Items</dt><dd>${this.definition.items.length}</dd></div>
            <div><dt>Response values</dt><dd>${he(this.definition).join(", ")}</dd></div>
            <div><dt>Scoring rule</dt><dd>${this.definition.scoring.strategy}</dd></div>
            <div><dt>Reported result</dt><dd>${this.definition.scoring.scoreName}</dd></div>
            <div><dt>Source</dt><dd>${this.definition.source.label}</dd></div>
          </dl>
          <label class="platform-import-final-confirmation">
            <input
              type="checkbox"
              .checked=${this.scoringConfirmed}
              @change=${i=>{this.scoringConfirmed=i.currentTarget.checked}}
            />
            <span>
              I checked that this questionnaire version, response scale and scoring rule match the study protocol.
            </span>
          </label>
        </section>
      `;const t=this.platformImportReview;if(e==="upload")return l`
        <section class="panel conductor-panel" aria-labelledby="questionnaire-upload-heading">
          <h2 id="questionnaire-upload-heading">Upload the file and choose the relevant part</h2>
          ${this.renderPlatformQuestionnaireImport(!1)}
          ${t&&!t.requiresGroupSelection&&!t.requiresRatingSetSelection?l`<aside class=${`definition-summary${t.canConvert?" success-confirmation":""}`}>
                <strong>${t.canConvert?"File review ready":"This file cannot be converted"}</strong>
                <span>${t.title} · ${t.sourceName} · ${t.fileName}</span>
                <span>
                  ${t.draft?.items.length??0} compatible item${t.draft?.items.length===1?"":"s"};
                  ${t.unsupported.length} blocking finding${t.unsupported.length===1?"":"s"}.
                </span>
              </aside>`:$}
        </section>
      `;if(!t?.draft)return l`<section class="panel conductor-panel">
        <h2>${this.wizardStep.title}</h2>
        <p>Return to the upload step and review a supported questionnaire export.</p>
      </section>`;if(e==="questions")return l`
        <section class="panel conductor-panel" aria-labelledby="import-question-review-heading">
          <h2 id="import-question-review-heading">Review the questions</h2>
          <p>Compare every item, its order and its wording with the untouched source preview.</p>
          <ol class="wizard-review-list">
            ${this.customDraft.items.map(i=>l`<li>
              <strong>${i.name||"Unnamed item"}</strong>
              <span>${i.prompt||"No question text was found."}</span>
              <small>Source key: ${i.key} · required single answer</small>
            </li>`)}
          </ol>
        </section>
      `;if(e==="answers"){const i=[];for(let n=this.customDraft.minimum;n<=this.customDraft.maximum;n+=this.customDraft.step)i.push(n);return l`
        <section class="panel conductor-panel" aria-labelledby="import-answer-review-heading">
          <h2 id="import-answer-review-heading">Review answer choices and stored values</h2>
          <dl class="study-details">
            <div><dt>Scale type</dt><dd>${this.customDraft.scaleType.replace("-"," ")}</dd></div>
            <div><dt>Stored values</dt><dd>${i.join(", ")}</dd></div>
            <div><dt>Direction</dt><dd>${this.customDraft.minimum} to ${this.customDraft.maximum}</dd></div>
          </dl>
          <ol class="wizard-review-list compact-review-list">
            ${this.customDraft.items.map(n=>l`<li>
              <strong>${n.name}</strong>
              <span>${n.lowAnchor} (${this.customDraft.minimum}) → ${n.highAnchor} (${this.customDraft.maximum})</span>
              ${n.responseLabels?l`<small>Visible labels: ${Object.entries(n.responseLabels).map(([r,o])=>`${r} = ${o}`).join("; ")}</small>`:l`<small>Intermediate positions use their stored number.</small>`}
            </li>`)}
          </ol>
        </section>
      `}return e==="warnings"?l`
        <section class="panel conductor-panel" aria-labelledby="import-warning-heading">
          <h2 id="import-warning-heading">Resolve import warnings</h2>
          <p>Blocking content must be corrected in the source. Other transformations must be understood before scoring is confirmed.</p>
          <div class="platform-import-findings">
            ${this.renderImportFindingList("Imported safely","import-safe",t.imported,"No safe import findings were recorded.")}
            ${this.renderImportFindingList("Requires confirmation","import-confirm",t.confirmations,"No extra confirmation finding was recorded.")}
            ${this.renderImportFindingList("Unsupported content","import-unsupported",t.unsupported,"No unsupported content was found.")}
          </div>
          <label class="platform-import-final-confirmation">
            <input
              data-platform-import-warnings-confirm
              type="checkbox"
              .checked=${this.importWarningsAcknowledged}
              @change=${i=>{this.importWarningsAcknowledged=i.currentTarget.checked}}
            />
            <span>I read the findings and understand what the platform keeps, changes and does not support.</span>
          </label>
        </section>
      `:l`
      <section class="panel conductor-panel" aria-labelledby="import-scoring-heading">
        <h2 id="import-scoring-heading">Confirm the scoring rule</h2>
        <p>The export may not encode the intended scoring rule. Check these fields against the instrument source or study protocol.</p>
        <div class="form-grid">
          <label>
            <strong>Questionnaire language</strong>
            <span>BCP 47 language tag for the questionnaire text.</span>
            <input
              data-platform-import-language
              maxlength="35"
              spellcheck="false"
              .value=${this.customDraft.language}
              @input=${i=>this.updateCustomDraft("language",i.currentTarget.value)}
            />
          </label>
          <label>
            <strong>Scale description</strong>
            <select
              data-platform-import-scale-type
              .value=${this.customDraft.scaleType}
              @change=${i=>this.updateCustomDraft("scaleType",i.currentTarget.value)}
            >
              <option value="agreement">Agreement</option>
              <option value="magnitude">Magnitude</option>
              <option value="semantic-differential">Semantic differential</option>
            </select>
          </label>
          <label>
            <strong>Score calculation</strong>
            <select
              data-platform-import-aggregation
              .value=${this.customDraft.aggregation}
              @change=${i=>this.updateCustomDraft("aggregation",i.currentTarget.value)}
            >
              <option value="mean">Mean of reviewed item values</option>
              <option value="sum">Sum of reviewed item values</option>
            </select>
          </label>
          <label>
            <strong>Score name</strong>
            <input
              data-platform-import-score-name
              maxlength="120"
              .value=${this.customDraft.scoreName}
              @input=${i=>this.updateCustomDraft("scoreName",i.currentTarget.value)}
            />
          </label>
        </div>
        <fieldset class="platform-import-reverse-items">
          <legend>Reverse-scored items</legend>
          <p>Select an item only when the reviewed scoring instructions require it.</p>
          ${this.customDraft.items.map((i,n)=>l`<label>
            <input
              data-platform-import-reverse=${n}
              type="checkbox"
              .checked=${i.reverseScored}
              @change=${r=>this.updateCustomItem(n,"reverseScored",r.currentTarget.checked)}
            />
            <span>${n+1}. ${i.name}: ${i.prompt}</span>
          </label>`)}
        </fieldset>
        <label class="platform-import-final-confirmation">
          <input
            data-platform-import-confirm
            type="checkbox"
            .checked=${this.platformImportConfirmed}
            @change=${i=>{this.platformImportConfirmed=i.currentTarget.checked}}
          />
          <span>
            I checked the wording, order, labels, stored values, score calculation and reverse-scored items against the source.
          </span>
        </label>
      </section>
    `}renderImportFindingList(e,t,i,n){return l`<section class=${`platform-import-finding ${t}`}>
      <h3>${e} (${i.length})</h3>
      ${i.length?l`<ul>${i.map(r=>l`<li>
            <strong>${r.title}</strong><span>${r.detail}</span>
          </li>`)}</ul>`:l`<p>${n}</p>`}
    </section>`}renderConfigurationSummary(){return l`
      <dl class="study-details configuration-review-summary">
        <div><dt>Questionnaire</dt><dd>${this.definition.name} · ${this.definition.version}</dd></div>
        <div><dt>Study</dt><dd>${this.studyId} · ${this.studyTitle}</dd></div>
        <div><dt>Task</dt><dd>${this.taskLabel}</dd></div>
        <div><dt>Participant settings</dt><dd>${this.participantAdjustmentPolicy}; voice ${this.voiceInputAvailable?"available":"off"}; recovery ${this.recoveryEnabled?"on":"off"}</dd></div>
        <div><dt>Collection</dt><dd>${this.collectionMode==="qualtrics"?`Qualtrics: ${je(this.qualtricsSurveyUrl)??"invalid URL"}`:"This browser only"}</dd></div>
      </dl>
      <p class="support-boundary">Check this summary before generating. The questionnaire definition and scoring rule cannot be edited by participants.</p>
    `}renderWizardNavigation(){const e=this.wizardStep.key==="review",t=this.wizardStep.key==="scoring"&&this.setupRoute==="imported"?"Convert and continue":this.wizardStepIndex===this.wizardSteps.length-2?"Continue to review":"Continue";return l`
      <nav class="wizard-navigation button-row" aria-label="Researcher setup steps">
        <button
          class="secondary-button large-answer-button"
          type="button"
          ?disabled=${this.wizardStepIndex===0}
          @click=${this.previousWizard}
        >Back</button>
        ${e?l`<span class="support-boundary">This is the final setup step. Generate only after checking the summary.</span>`:l`<button
              class="primary-button large-answer-button"
              type="button"
              @click=${this.continueWizard}
            >${t}</button>`}
      </nav>
    `}renderCustomQuestionnaireBuilder(e=!0){return l`
      <section
        class="custom-questionnaire-builder full-width"
        id="custom-questionnaire-builder"
        aria-labelledby="custom-questionnaire-heading"
      >
        <h3 id="custom-questionnaire-heading">Add a researcher-supplied questionnaire</h3>
        <p>
          ${e?"Choose one of three routes. Import a source-platform export, reuse a definition":"Reuse a definition"}
          previously downloaded from this platform, or build a small questionnaire manually.
          These routes accept different file types and are not interchangeable.
        </p>
        <aside class="boundary-note important-boundary">
          <p>
            <strong>Check permission and measurement validity before use.</strong>
            The platform validates structure and calculation, but it cannot decide whether a
            questionnaire is licensed, validated for the study population, or suitable for the
            research question. Free text, branching, multiple answers, custom formulas and
            executable code are deliberately not accepted.
          </p>
        </aside>

        ${e?this.renderPlatformQuestionnaireImport():$}

        <section
          class="questionnaire-add-route"
          aria-labelledby="aqp-definition-import-heading"
        >
          <h4 id="aqp-definition-import-heading">
            ${e?"2.":"1."} Reuse an AQP questionnaire definition
          </h4>
          <p>
            Choose a <code>.json</code> definition previously downloaded from this
            Accessible Questionnaire Platform. This skips source-platform conversion,
            but the definition is validated again before it is selected.
          </p>
          <label class="file-import-control">
            <strong>AQP definition JSON</strong>
            <span>
              Use an AQP definition file here—not a Qualtrics <code>.qsf</code> or
              LimeSurvey <code>.lss</code>, <code>.lsg</code> or <code>.lsq</code> export.
            </span>
            <input
              data-custom-definition-import
              type="file"
              accept=".json,application/json"
              @change=${this.importCustomDefinition}
            />
          </label>
        </section>

        <section
          class="questionnaire-add-route"
          aria-labelledby="manual-questionnaire-builder-heading"
        >
          <h4 id="manual-questionnaire-builder-heading">
            ${e?"3.":"2."} Build a questionnaire manually
          </h4>
          <p>
            No code is required. The manual builder supports
            1–${G} required single-choice items that
            share one whole-number response scale. It can calculate a reviewed mean
            or sum, including selected reverse-scored items.
          </p>

          <div class="form-grid custom-definition-fields">
          <label>
            <strong>Questionnaire name</strong>
            <span>Full participant-facing name.</span>
            <input
              data-custom-field="name"
              maxlength="120"
              .value=${this.customDraft.name}
              @input=${t=>this.updateCustomDraft("name",t.currentTarget.value)}
            />
          </label>
          <label>
            <strong>Short name</strong>
            <span>Short label used in results, for example WAI.</span>
            <input
              data-custom-field="short-name"
              maxlength="40"
              .value=${this.customDraft.shortName}
              @input=${t=>this.updateCustomDraft("shortName",t.currentTarget.value)}
            />
          </label>
          <label>
            <strong>Questionnaire version</strong>
            <span>Version of the wording and scoring definition.</span>
            <input
              data-custom-field="version"
              maxlength="40"
              .value=${this.customDraft.version}
              @input=${t=>this.updateCustomDraft("version",t.currentTarget.value)}
            />
          </label>
          <label>
            <strong>Questionnaire language</strong>
            <span>BCP 47 tag used for item text and voice recognition, for example en-GB or de.</span>
            <input
              data-custom-field="language"
              maxlength="35"
              spellcheck="false"
              .value=${this.customDraft.language}
              @input=${t=>this.updateCustomDraft("language",t.currentTarget.value)}
            />
          </label>
          <label>
            <strong>Source or authorship label</strong>
            <span>Primary source, author, or “Researcher-supplied questionnaire”.</span>
            <input
              data-custom-field="source-label"
              maxlength="240"
              .value=${this.customDraft.sourceLabel}
              @input=${t=>this.updateCustomDraft("sourceLabel",t.currentTarget.value)}
            />
          </label>
          <label class="full-width">
            <strong>Source URL (optional)</strong>
            <span>Use an HTTPS link to the primary instrument source when one is available.</span>
            <input
              data-custom-field="source-url"
              type="url"
              inputmode="url"
              maxlength="500"
              placeholder="https://example.org/questionnaire"
              .value=${this.customDraft.sourceUrl}
              @input=${t=>this.updateCustomDraft("sourceUrl",t.currentTarget.value)}
            />
          </label>
          <label class="full-width">
            <strong>Description</strong>
            <span>Short explanation shown under the questionnaire title.</span>
            <textarea
              data-custom-field="description"
              rows="3"
              maxlength="400"
              .value=${this.customDraft.description}
              @input=${t=>this.updateCustomDraft("description",t.currentTarget.value)}
            ></textarea>
          </label>
          <label class="full-width">
            <strong>Participant instruction</strong>
            <span>What participants should think about before answering.</span>
            <textarea
              data-custom-field="intro-prompt"
              rows="3"
              maxlength="400"
              .value=${this.customDraft.introPrompt}
              @input=${t=>this.updateCustomDraft("introPrompt",t.currentTarget.value)}
            ></textarea>
          </label>
          <label>
            <strong>Scale type</strong>
            <span>Controls how the shared response scale is described.</span>
            <select
              data-custom-field="scale-type"
              .value=${this.customDraft.scaleType}
              @change=${t=>this.updateCustomDraft("scaleType",t.currentTarget.value)}
            >
              <option value="agreement">Agreement</option>
              <option value="magnitude">Magnitude</option>
              <option value="semantic-differential">Semantic differential</option>
            </select>
          </label>
          <label>
            <strong>Score calculation</strong>
            <span>Mean keeps the scale range; sum adds adjusted item values.</span>
            <select
              data-custom-field="aggregation"
              .value=${this.customDraft.aggregation}
              @change=${t=>this.updateCustomDraft("aggregation",t.currentTarget.value)}
            >
              <option value="mean">Mean of item values</option>
              <option value="sum">Sum of item values</option>
            </select>
          </label>
          <label>
            <strong>Minimum response value</strong>
            <span>Whole number from 0 to 99.</span>
            <input
              data-custom-field="minimum"
              type="number"
              min="0"
              max="99"
              step="1"
              .value=${String(this.customDraft.minimum)}
              @input=${t=>this.updateCustomDraft("minimum",t.currentTarget.valueAsNumber)}
            />
          </label>
          <label>
            <strong>Maximum response value</strong>
            <span>Whole number up to 100.</span>
            <input
              data-custom-field="maximum"
              type="number"
              min="1"
              max="100"
              step="1"
              .value=${String(this.customDraft.maximum)}
              @input=${t=>this.updateCustomDraft("maximum",t.currentTarget.valueAsNumber)}
            />
          </label>
          <label>
            <strong>Response step</strong>
            <span>The range must divide exactly by this positive whole number.</span>
            <input
              data-custom-field="step"
              type="number"
              min="1"
              max="100"
              step="1"
              .value=${String(this.customDraft.step)}
              @input=${t=>this.updateCustomDraft("step",t.currentTarget.valueAsNumber)}
            />
          </label>
          <label>
            <strong>Score name</strong>
            <span>Label used on review, result and export pages.</span>
            <input
              data-custom-field="score-name"
              maxlength="120"
              .value=${this.customDraft.scoreName}
              @input=${t=>this.updateCustomDraft("scoreName",t.currentTarget.value)}
            />
          </label>
        </div>

        <fieldset class="custom-items">
          <legend>Questionnaire items</legend>
          <p>
            Each item uses the shared numeric range but may have different visible endpoint labels.
            A reverse-scored response is transformed as minimum + maximum − response before the
            mean or sum is calculated.
          </p>
          ${this.customDraft.items.map((t,i)=>this.renderCustomQuestionnaireItem(t,i))}
          <button
            class="secondary-button"
            type="button"
            ?disabled=${this.customDraft.items.length>=G}
            @click=${this.addCustomItem}
          >
            Add another item
          </button>
        </fieldset>

        <div class="button-row compact">
          <button
            class="primary-button"
            type="button"
            @click=${this.useCustomDraft}
          >
            Validate and use this questionnaire
          </button>
          <button
            class="secondary-button"
            type="button"
            @click=${this.resetCustomDraft}
          >
            Reset builder fields
          </button>
        </div>
        <p class="support-boundary">
          Editing these fields does not change the selected questionnaire until you select
          <strong>Validate and use this questionnaire</strong>.
        </p>
        <p class="support-boundary">
          After validation, the full definition is embedded in the configuration and participant
          link. Download its JSON for the study protocol. Route 2 can later reproduce the same
          items, scale and scoring rule without changing source code.
        </p>
        </section>
      </section>
    `}renderPlatformQuestionnaireImport(e=!0){const t=this.platformImportReview;return l`
      <section
        class="platform-questionnaire-import"
        aria-labelledby="platform-questionnaire-import-heading"
      >
        <h3 id="platform-questionnaire-import-heading">
          1. Import a Qualtrics or LimeSurvey export
        </h3>
        <p class="platform-import-introduction">
          Choose a Qualtrics <code>.qsf</code> survey export or a LimeSurvey
          <code>.lss</code> survey export, <code>.lsg</code> question-group export,
          or <code>.lsq</code> single-question export.
          A multi-group LSS asks you to choose one group. If that group contains
          different numeric scales, it then asks you to choose one compatible rating
          set. Questions outside that set are listed explicitly and remain in the source
          survey. The file is reviewed in this browser and is not uploaded. Nothing is
          converted until you review and confirm the result.
        </p>
        <p class="support-boundary">
          Use <strong>QSF</strong> for a Qualtrics survey, <strong>LSS</strong> for a
          complete LimeSurvey survey, or <strong>LSG</strong> for one LimeSurvey
          question group. Use <strong>LSQ</strong> only when one exported question is
          intended to become a standalone questionnaire. LimeSurvey LSA archives,
          printable files and response-data exports are not questionnaire inputs here.
        </p>
        <details class="support-boundary platform-import-guide">
          <summary><strong>Which source file should I use?</strong></summary>
          <ul>
            <li><strong>Qualtrics QSF:</strong> one complete Qualtrics survey.</li>
            <li><strong>LimeSurvey LSS:</strong> one survey; choose one group during review if needed.</li>
            <li><strong>LimeSurvey LSG:</strong> one exported question group.</li>
            <li><strong>LimeSurvey LSQ:</strong> one exported question, reviewed as a standalone questionnaire.</li>
          </ul>
          <p>
            LSA archives may contain participant data and LSL contains only labels.
            Response-data, bulk-authoring, word-processing and printable formats are
            ambiguous or incomplete for this conversion. They are identified and rejected
            with a safer native-export instruction.
          </p>
        </details>
        <div class="form-grid">
          <label>
            <strong>Source format</strong>
            <span id="platform-import-source-hint">Automatic detection is recommended.</span>
            <select
              data-platform-import-source
              aria-describedby="platform-import-source-hint"
              .value=${this.platformImportSource}
              @change=${i=>{this.platformImportSource=i.currentTarget.value,this.platformImportReview=null,this.platformImportConfirmed=!1,this.importWarningsAcknowledged=!1,this.platformImportSelectedGroupId="",this.platformImportSelectedRatingSetId="",this.platformImportContents="",this.platformImportFileName=""}}
            >
              <option value="auto">Detect from file</option>
              <option value="qualtrics-qsf">Qualtrics QSF</option>
              <option value="limesurvey-lss">LimeSurvey LSS</option>
              <option value="limesurvey-lsg">LimeSurvey LSG</option>
              <option value="limesurvey-lsq">LimeSurvey LSQ</option>
            </select>
          </label>
          <label class="file-import-control">
            <strong>Questionnaire export</strong>
            <span id="platform-import-file-hint">
              QSF, LSS, LSG or LSQ; maximum file size: 2 MB.
            </span>
            <input
              data-platform-questionnaire-import
              type="file"
              aria-describedby="platform-import-file-hint"
              accept=".qsf,.lss,.lsg,.lsq,.lsa,.lsl,.csv,.tsv,.xls,.xlsx,.vv,.txt,.doc,.docx,.rtf,.odt,.pdf,.html,.htm,.xml,.zip,.sav,.json,application/json,application/xml,text/xml"
              @change=${this.importPlatformQuestionnaire}
            />
          </label>
        </div>
        ${t&&(e||!t.canConvert||t.requiresGroupSelection||t.requiresRatingSetSelection)?this.renderPlatformQuestionnaireReview(t):$}
      </section>
    `}renderPlatformQuestionnaireReview(e){const t=(i,n,r,o)=>l`
      <section class=${`platform-import-finding ${n}`}>
        <h4>${i} (${r.length})</h4>
        ${r.length?l`<ul>
              ${r.map(a=>l`
                <li>
                  <strong>${a.title}</strong>
                  <span>${a.detail}</span>
                </li>
              `)}
            </ul>`:l`<p>${o}</p>`}
      </section>
    `;return e.requiresGroupSelection&&e.groupOptions?.length?l`
        <section
          class="platform-import-review import-selection"
          id="platform-import-review"
          tabindex="-1"
          aria-labelledby="platform-import-review-heading"
        >
          <div class="platform-import-review-heading">
            <span class="selection-icon" aria-hidden="true">→</span>
            <div>
              <h4 id="platform-import-review-heading">Choose one LimeSurvey questionnaire group</h4>
              <p><strong>${e.title}</strong> · ${e.sourceName} · ${e.fileName}</p>
            </div>
          </div>
          <p>
            This survey contains several groups. Choose the group that should become
            one standalone questionnaire. Other groups are not silently merged or removed.
          </p>
          <fieldset class="platform-import-group-selection">
            <legend>Questionnaire group</legend>
            <label>
              <strong>Group to review</strong>
              <select
                data-platform-import-group
                .value=${this.platformImportSelectedGroupId}
                @change=${i=>{this.platformImportSelectedGroupId=i.currentTarget.value}}
              >
                <option value="">Choose a group</option>
                ${e.groupOptions.map(i=>l`
                  <option value=${i.id}>
                    ${i.name} · ${i.questionCount} source question${i.questionCount===1?"":"s"} ·
                    types ${i.questionTypes.join(", ")}
                  </option>
                `)}
              </select>
            </label>
            <button
              class="primary-button"
              type="button"
              ?disabled=${!this.platformImportSelectedGroupId}
              @click=${this.reviewSelectedLimeSurveyGroup}
            >
              Review selected group
            </button>
          </fieldset>
        </section>
      `:e.requiresRatingSetSelection&&e.ratingSetOptions?.length?l`
        <section
          class="platform-import-review import-selection"
          id="platform-import-review"
          tabindex="-1"
          aria-labelledby="platform-import-review-heading"
        >
          <div class="platform-import-review-heading">
            <span class="selection-icon" aria-hidden="true">→</span>
            <div>
              <h4 id="platform-import-review-heading">Choose one compatible rating set</h4>
              <p><strong>${e.title}</strong> · ${e.sourceName} · ${e.fileName}</p>
            </div>
          </div>
          <p>
            This group contains different response scales or non-rating questions. One AQP
            questionnaire needs one reviewed numeric scale, so choose the rating set that should
            become the standalone questionnaire. Everything else remains in the source file and
            will be listed for confirmation.
          </p>
          <fieldset class="platform-import-group-selection">
            <legend>Rating set</legend>
            <label>
              <strong>Set to review</strong>
              <select
                data-platform-import-rating-set
                .value=${this.platformImportSelectedRatingSetId}
                @change=${i=>{this.platformImportSelectedRatingSetId=i.currentTarget.value}}
              >
                <option value="">Choose a rating set</option>
                ${e.ratingSetOptions.map(i=>l`
                  <option value=${i.id}>
                    ${i.name} · ${i.itemCount} item${i.itemCount===1?"":"s"} ·
                    values ${i.responseValues.join(", ")}
                  </option>
                `)}
              </select>
            </label>
            <button
              class="primary-button"
              type="button"
              ?disabled=${!this.platformImportSelectedRatingSetId}
              @click=${this.reviewSelectedLimeSurveyRatingSet}
            >
              Review selected rating set
            </button>
          </fieldset>
        </section>
      `:l`
      <section
        class=${`platform-import-review${e.canConvert?"":" import-blocked"}`}
        id="platform-import-review"
        tabindex="-1"
        aria-labelledby="platform-import-review-heading"
      >
        <div class="platform-import-review-heading">
          <span class=${e.canConvert?"success-icon":"warning-icon"} aria-hidden="true">
            ${e.canConvert?"✓":"!"}
          </span>
          <div>
            <h4 id="platform-import-review-heading">
              ${e.canConvert?"Import review ready":"Conversion blocked"}
            </h4>
            <p>
              <strong>${e.title}</strong> · ${e.sourceName} ·
              ${e.fileName}
            </p>
          </div>
        </div>

        <div class="platform-import-findings">
          ${t("Imported safely","import-safe",e.imported,"No questionnaire items were imported safely.")}
          ${t("Requires researcher confirmation","import-confirm",e.confirmations,"No additional confirmation is required.")}
          ${t("Unsupported content","import-unsupported",e.unsupported,"No unsupported content was found.")}
        </div>

        ${e.canConvert&&e.draft?l`
              <fieldset class="platform-import-confirmation">
                <legend>Confirm scoring before conversion</legend>
                <div class="form-grid">
                  <label>
                    <strong>Questionnaire language</strong>
                    <span>
                      BCP 47 language used to mark the questionnaire text. Voice input remains English:
                      participants may say a shown number in English, and may say a complete exact visible
                      answer label only when the questionnaire is English. Confirm this tag against the source.
                    </span>
                    <input
                      data-platform-import-language
                      maxlength="35"
                      spellcheck="false"
                      .value=${this.customDraft.language}
                      @input=${i=>this.updateCustomDraft("language",i.currentTarget.value)}
                    />
                  </label>
                  <label>
                    <strong>Scale description</strong>
                    <select
                      data-platform-import-scale-type
                      .value=${this.customDraft.scaleType}
                      @change=${i=>this.updateCustomDraft("scaleType",i.currentTarget.value)}
                    >
                      <option value="agreement">Agreement</option>
                      <option value="magnitude">Magnitude</option>
                      <option value="semantic-differential">Semantic differential</option>
                    </select>
                  </label>
                  <label>
                    <strong>Score calculation</strong>
                    <select
                      data-platform-import-aggregation
                      .value=${this.customDraft.aggregation}
                      @change=${i=>this.updateCustomDraft("aggregation",i.currentTarget.value)}
                    >
                      <option value="mean">Mean of reviewed item values</option>
                      <option value="sum">Sum of reviewed item values</option>
                    </select>
                  </label>
                </div>
                <fieldset class="platform-import-reverse-items">
                  <legend>Reverse-scored items</legend>
                  <p>Select an item only if the questionnaire's reviewed scoring instructions require it.</p>
                  ${this.customDraft.items.map((i,n)=>l`
                    <label>
                      <input
                        data-platform-import-reverse=${n}
                        type="checkbox"
                        .checked=${i.reverseScored}
                        @change=${r=>this.updateCustomItem(n,"reverseScored",r.currentTarget.checked)}
                      />
                      <span>${n+1}. ${i.name}: ${i.prompt}</span>
                    </label>
                  `)}
                </fieldset>
                <label class="platform-import-final-confirmation">
                  <input
                    data-platform-import-confirm
                    type="checkbox"
                    .checked=${this.platformImportConfirmed}
                    @change=${i=>{this.platformImportConfirmed=i.currentTarget.checked}}
                  />
                  <span>
                    I checked the imported wording, question order, response labels,
                    numeric values, score calculation and reverse-scored items against
                    the source questionnaire. I also understand every listed source
                    setting or display condition that is not retained.
                  </span>
                </label>
                <button
                  class="primary-button"
                  type="button"
                  ?disabled=${!this.platformImportConfirmed}
                  @click=${this.usePlatformImport}
                >
                  Convert and use this questionnaire
                </button>
              </fieldset>
            `:l`
              <p class="support-boundary">
                Correct the unsupported content in the source survey and export it
                again. The platform has not created a partial questionnaire.
              </p>
            `}
      </section>
    `}renderCustomQuestionnaireItem(e,t){return l`
      <section class="custom-item-editor" aria-labelledby=${`custom-item-${t+1}-heading`}>
        <div class="custom-item-heading">
          <h4 id=${`custom-item-${t+1}-heading`}>Item ${t+1}</h4>
          <button
            class="secondary-button"
            type="button"
            ?disabled=${this.customDraft.items.length===1}
            aria-label=${`Remove item ${t+1}`}
            @click=${()=>this.removeCustomItem(t)}
          >
            Remove item
          </button>
        </div>
        <div class="form-grid">
          <label>
            <strong>Item label</strong>
            <span>Short name shown on review and export.</span>
            <input
              data-custom-item=${t}
              data-custom-item-field="name"
              maxlength="120"
              .value=${e.name}
              @input=${i=>this.updateCustomItem(t,"name",i.currentTarget.value)}
            />
          </label>
          <label class="custom-reverse-option">
            <input
              data-custom-item=${t}
              data-custom-item-field="reverse-scored"
              type="checkbox"
              .checked=${e.reverseScored}
              @change=${i=>this.updateCustomItem(t,"reverseScored",i.currentTarget.checked)}
            />
            <span>
              <strong>Reverse this item for scoring</strong>
              <small>The displayed and stored answer is unchanged; only score calculation is reversed.</small>
            </span>
          </label>
          <label class="full-width">
            <strong>Question or statement</strong>
            <textarea
              data-custom-item=${t}
              data-custom-item-field="prompt"
              rows="3"
              maxlength="1000"
              .value=${e.prompt}
              @input=${i=>this.updateCustomItem(t,"prompt",i.currentTarget.value)}
            ></textarea>
          </label>
          <label>
            <strong>Low endpoint label</strong>
            <input
              data-custom-item=${t}
              data-custom-item-field="low-anchor"
              maxlength="80"
              .value=${e.lowAnchor}
              @input=${i=>this.updateCustomItem(t,"lowAnchor",i.currentTarget.value)}
            />
          </label>
          <label>
            <strong>High endpoint label</strong>
            <input
              data-custom-item=${t}
              data-custom-item-field="high-anchor"
              maxlength="80"
              .value=${e.highAnchor}
              @input=${i=>this.updateCustomItem(t,"highAnchor",i.currentTarget.value)}
            />
          </label>
          <label class="full-width">
            <strong>Simpler explanation (optional)</strong>
            <span>
              This support is offered only when every item has an explanation. Do not paraphrase a
              validated instrument without evidence and approval.
            </span>
            <textarea
              data-custom-item=${t}
              data-custom-item-field="simple-explanation"
              rows="2"
              maxlength="1000"
              .value=${e.simpleExplanation}
              @input=${i=>this.updateCustomItem(t,"simpleExplanation",i.currentTarget.value)}
            ></textarea>
          </label>
        </div>
      </section>
    `}updateCustomDraft(e,t){this.customDraft={...this.customDraft,[e]:t},this.platformImportReview&&(this.platformImportConfirmed=!1),this.platformImportReview&&(this.importWarningsAcknowledged=!1)}updateCustomItem(e,t,i){this.customDraft={...this.customDraft,items:this.customDraft.items.map((n,r)=>r===e?{...n,[t]:i}:n)},this.platformImportReview&&(this.platformImportConfirmed=!1),this.platformImportReview&&(this.importWarningsAcknowledged=!1)}removeCustomItem(e){this.customDraft.items.length!==1&&(this.customDraft={...this.customDraft,items:this.customDraft.items.filter((t,i)=>i!==e)})}activateCustomDefinition(e,t){this.customDefinition=e,this.instrumentId=e.id,e.supports.simplerExplanations||(this.showSimpleLanguage=!1),this.answerMode="standard",this.generatedConfig=null,this.participantUrl="";const i=t==="imported"?"imported, validated and selected":"validated and selected";this.definitionConfirmation=`${e.name} ${e.version} ${i}. Complete the study details, then generate a new configuration.`,this.configurationConfirmation="",this.message="",this.revealConductorResult("#selected-questionnaire-summary")}booleanOption(e,t,i,n=""){return l`<label class="toggle-card conductor-toggle">
      <input type="checkbox" .checked=${t} @change=${r=>i(r.currentTarget.checked)} />
      <span><strong>${e}</strong>${n?l`<small>${n}</small>`:$}</span>
    </label>`}currentSupportConfig(){return{showSimpleLanguage:this.definition.supports.simplerExplanations&&this.showSimpleLanguage,answerMode:this.definition.supports.smileyLandmarks?this.answerMode:"standard",largeText:this.largeText,audioGuidance:this.audioGuidance,recoveryEnabled:this.recoveryEnabled,participantAdjustmentPolicy:this.participantAdjustmentPolicy,voiceInputAvailable:this.voiceInputAvailable,gazeInputAvailable:this.gazeInputAvailable}}currentCollectionConfig(){if(this.collectionMode==="local")return{mode:"local"};const e=je(this.qualtricsSurveyUrl);if(!e)throw new Error("Enter a valid HTTPS Qualtrics survey or preview URL for central collection.");if(e===window.location.origin)throw new Error("The Qualtrics origin must be different from this GitHub Pages website.");return{mode:"qualtrics",parentOrigin:e}}useConfiguration(e){e.questionnaireDefinition&&(this.customDefinition=e.questionnaireDefinition),this.generatedConfig=e,this.instrumentId=e.instrumentId,this.studyId=e.studyId,this.studyTitle=e.studyTitle,this.taskLabel=e.taskLabel,this.showScoreToParticipant=e.showScoreToParticipant,this.showSimpleLanguage=e.support.showSimpleLanguage,this.answerMode=e.support.answerMode,this.largeText=e.support.largeText,this.audioGuidance=e.support.audioGuidance,this.recoveryEnabled=e.support.recoveryEnabled,this.participantAdjustmentPolicy=e.support.participantAdjustmentPolicy,this.voiceInputAvailable=e.support.voiceInputAvailable,this.gazeInputAvailable=e.support.gazeInputAvailable,this.collectionMode=e.collection.mode,this.qualtricsSurveyUrl=e.collection.mode==="qualtrics"?e.collection.parentOrigin:"",this.participantUrl=U(this.participantCode)?De(new URL("index.html",window.location.href).toString(),e,this.participantCode):""}qualtricsIframeHtml(){return!this.generatedConfig||this.generatedConfig.collection.mode!=="qualtrics"?"":Ut(this.participantUrl)}renderQualtricsSetup(){const e=this.qualtricsIframeHtml(),t=zt(this.generatedConfig?.showScoreToParticipant===!0);return l`
      <div class="qualtrics-setup" role="region" aria-labelledby="qualtrics-setup-heading">
        <h3 id="qualtrics-setup-heading">Qualtrics installation package for this configuration</h3>
        <p>
          <strong>Selected questionnaire:</strong> ${this.definition.name}
          (${this.definition.version}).
          The generated HTML contains this configuration and questionnaire ID. The JavaScript and Embedded Data
          manifest are intentionally shared by every registered questionnaire.
        </p>
        <p>
          <strong>Installation fingerprint:</strong>
          platform ${we}; Qualtrics bridge ${te}.
          Replace both the complete HTML and complete JavaScript together whenever this fingerprint changes.
        </p>
        <aside class="boundary-note important-boundary">
          <p>
            <strong>Do not upload these repository files to Qualtrics and do not paste the static HTML template unchanged.</strong>
            The first three blocks below are the required installation inputs. Only the first block contains this
            study's generated participant URL. The fourth block is optional plain text for Qualtrics' final page;
            it is not code and does not affect whether a response is saved.
          </p>
        </aside>
        <aside class="boundary-note">
          <p>
            <strong>Version 0.7 records have not been deleted.</strong>
            They remain in the existing <code>__js_ANTLX_*</code> columns. Version 0.8 writes new records to the
            questionnaire-independent <code>__js_AQP_*</code> columns and does not rewrite old rows. Keep the old
            fields until those rows have been exported and verified. Use a copied synthetic survey for the first
            Version 0.8 installation test.
          </p>
        </aside>
        <aside class="boundary-note important-boundary">
          <p>
            <strong>Check Qualtrics response anonymisation before recruitment.</strong>
            An anonymous distribution link still records IP address and approximate location by
            default. If the approved study does not require those fields, enable
            <strong>Anonymize responses</strong> in Qualtrics Survey Options before the synthetic
            test, publish the change, and confirm that a newly exported row has blank IP and
            location fields. This setting is not retroactive.
          </p>
          <p>
            <a
              href="https://www.qualtrics.com/support/survey-platform/survey-module/survey-options/survey-protection/#AnonymizeResponses"
              target="_blank"
              rel="noopener"
            >Open the official Qualtrics anonymisation guidance</a>.
          </p>
        </aside>
        <aside class="boundary-note important-boundary">
          <p>
            <strong>A rendered iframe is not a data-collection pass.</strong>
            In Preview, the status above the questionnaire must name bridge
            ${te} and say that diagnostic fields were staged. Then complete one
            <em>new</em> synthetic response and confirm that its newly dated row contains
            <code>__js_AQP_ACCEPTED = 1</code>, <code>__js_AQP_SCHEMA = 4</code> and the selected
            instrument ID. Rows collected before these fields were installed remain blank and are
            not a valid test of this package.
          </p>
        </aside>
        <ol class="qualtrics-install-steps">
          <li>
            <h4>Text/Graphic question: complete generated HTML</h4>
            <p>
              Add one Text/Graphic question on its own page. Open that question's HTML or source view, replace the
              whole question body with this block, and save it. Do not paste it into the ordinary rich-text view.
            </p>
            <label for="qualtrics-question-html"><strong>Complete question HTML</strong></label>
            <textarea
              id="qualtrics-question-html"
              data-qualtrics-asset="question-html"
              readonly
              rows="10"
              .value=${e}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${()=>this.copySetupAsset(e,"question HTML")}
            >
              Copy complete question HTML
            </button>
          </li>
          <li>
            <h4>Survey Flow: Embedded Data field names</h4>
            <p>
              Before the questionnaire block, add one Embedded Data element. Add every non-empty line below as a separate
              field name, including the <code>__js_</code> prefix, and leave each value unset. This list does not go
              into the question body.
            </p>
            <label for="qualtrics-embedded-fields">
              <strong>${Ft} Embedded Data field names</strong>
            </label>
            <textarea
              id="qualtrics-embedded-fields"
              data-qualtrics-asset="embedded-data"
              readonly
              rows="10"
              .value=${Ie.trim()}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${()=>this.copySetupAsset(Ie.trim(),"Embedded Data field list")}
            >
              Copy Embedded Data field list
            </button>
          </li>
          <li>
            <h4>Question behavior: JavaScript</h4>
            <p>
              Open JavaScript for the same Text/Graphic question. Replace the sample callback content with this
              complete script and save it. Do not add <code>&lt;script&gt;</code> tags and do not paste it into the
              question HTML.
            </p>
            <label for="qualtrics-question-javascript"><strong>Complete question JavaScript</strong></label>
            <textarea
              id="qualtrics-question-javascript"
              data-qualtrics-asset="question-javascript"
              readonly
              rows="10"
              .value=${Ae.trim()}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${()=>this.copySetupAsset(Ae.trim(),"question JavaScript")}
            >
              Copy complete question JavaScript
            </button>
          </li>
          <li>
            <h4>Optional: End of Survey plain-text message</h4>
            <p>
              This step is not required for data collection. Qualtrics' default End of Survey page is acceptable.
              To provide a clearer final confirmation, create or select a custom message and paste this as ordinary
              text. Do not add HTML, JavaScript or a redirect. If you selected Show score to participant, use this
              message if you want the score to remain visible after the automatic transition.
            </p>
            <label for="qualtrics-end-message"><strong>Optional End of Survey message</strong></label>
            <textarea
              id="qualtrics-end-message"
              data-qualtrics-asset="end-message"
              readonly
              rows="8"
              .value=${t}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${()=>this.copySetupAsset(t,"End of Survey message")}
            >
              Copy End of Survey message
            </button>
          </li>
        </ol>
        <p class="support-boundary">
          The Qualtrics editing canvas may show piped-text tokens such as
          <code>\${e://Field/__js_AQP_PARTICIPANT_CODE}</code>. That canvas is not the participant test. In Preview,
          before a response is recorded, the summary must be hidden and the configured participant iframe must be
          visible. If it is not, clear the question body and repeat step 1 in HTML or source view.
        </p>
        <p class="support-boundary">
          In Preview, the participant application must fill the browser viewport and expose one visible
          vertical scrollbar at the browser edge. A narrow inner panel, clipped content or two visible
          scrollbars means that the HTML and JavaScript are not both from this installation fingerprint;
          do not collect data from that survey.
        </p>
        <p class="support-boundary">
          After replacing the three required inputs, and after any optional message change, select
          <strong>Review and Publish</strong>. Preview one new synthetic response after publishing. Draft changes
          do not update an already active distribution link, and older recorded rows are not backfilled with new
          <code>__js_AQP_*</code> values.
        </p>
        <p>
          <a href="docs/QUALTRICS-INTEGRATION.md">Open the full Qualtrics setup and adverse-test guide</a>
        </p>
      </div>
    `}showError(e){this.errorMessage=e,this.updateComplete.then(()=>{const t=this.querySelector("#conductor-error");t&&be(t)})}revealConductorResult(e){this.updateComplete.then(()=>{const t=this.querySelector(e);t&&be(t,{block:"start"})})}};h([g()],m.prototype,"setupRoute",2);h([g()],m.prototype,"wizardStepIndex",2);h([g()],m.prototype,"scoringConfirmed",2);h([g()],m.prototype,"importWarningsAcknowledged",2);h([g()],m.prototype,"instrumentId",2);h([g()],m.prototype,"customDefinition",2);h([g()],m.prototype,"customDraft",2);h([g()],m.prototype,"customBuilderOpen",2);h([g()],m.prototype,"platformImportSource",2);h([g()],m.prototype,"platformImportReview",2);h([g()],m.prototype,"platformImportConfirmed",2);h([g()],m.prototype,"platformImportSelectedGroupId",2);h([g()],m.prototype,"platformImportSelectedRatingSetId",2);h([g()],m.prototype,"studyId",2);h([g()],m.prototype,"studyTitle",2);h([g()],m.prototype,"taskLabel",2);h([g()],m.prototype,"participantCode",2);h([g()],m.prototype,"showScoreToParticipant",2);h([g()],m.prototype,"showSimpleLanguage",2);h([g()],m.prototype,"answerMode",2);h([g()],m.prototype,"largeText",2);h([g()],m.prototype,"audioGuidance",2);h([g()],m.prototype,"recoveryEnabled",2);h([g()],m.prototype,"participantAdjustmentPolicy",2);h([g()],m.prototype,"voiceInputAvailable",2);h([g()],m.prototype,"gazeInputAvailable",2);h([g()],m.prototype,"collectionMode",2);h([g()],m.prototype,"qualtricsSurveyUrl",2);h([g()],m.prototype,"generatedConfig",2);h([g()],m.prototype,"participantUrl",2);h([g()],m.prototype,"message",2);h([g()],m.prototype,"definitionConfirmation",2);h([g()],m.prototype,"configurationConfirmation",2);h([g()],m.prototype,"errorMessage",2);h([g()],m.prototype,"completedResults",2);m=h([mt("study-conductor-app")],m);
