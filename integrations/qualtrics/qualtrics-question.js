/*
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
        ' Return to the questionnaire and try again. If it keeps failing, use the download' +
        ' button on the questionnaire and tell the study conductor.',
        false
      );
      releaseFullscreenForNativeNavigation();
      sendStagingReceipt(event.source, false, submissionId || '', detail);
      // Staging can fail deterministically — an oversized record fails identically on every
      // retry — so the navigation control is restored. Without it the participant is left on
      // a page with no way to submit and no way to advance.
      question.showNextButton();
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
