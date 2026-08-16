import{r as J,s as Y,a as u,t as Z,i as ae,g as G,D as $,v as b,b as re,c as oe,d as le,f as S,e as de,h as ce,j as he,k as X,l as ue,P as V,A as c,m as o,q as pe,n as F,o as D,p as ge,u as me,w as fe,x as be}from"./shared-BYbRkO1_.js";const ye="accessible-questionnaire:qualtrics-submit:v2",ve="accessible-questionnaire:qualtrics-receipt:v2",we="accessible-questionnaire:qualtrics-parent-ready:v2",$e="accessible-questionnaire:qualtrics-child-ready:v2",Se="accessible-questionnaire:qualtrics-advance-failed:v2",v="0.8.9-q9";function Ce(e=window){const t=e.accessibleQuestionnaireResultSink??e.accessibleNasaTlxResultSink;return!t||typeof t.name!="string"||!t.name.trim()||typeof t.submit!="function"?null:t}function Re(e,t=window,i=()=>{},n=()=>{}){if(e.collection.mode!=="qualtrics")return null;const s=ze(e.collection.parentOrigin,t,i,n),a=Ie(e.collection.parentOrigin,t,12e3,()=>s.getState()==="connected");return t.accessibleQuestionnaireResultSink=a,t.accessibleNasaTlxResultSink=a,{sink:a,bridge:s}}function ze(e,t=window,i=()=>{},n=()=>{}){let s="connecting",a=null;const r=(m,p)=>{s==="connected"||s==="failed"&&m!=="connected"||(s=m,i({state:s,message:p}))},l=m=>{if(m.source!==t.parent||m.origin!==e)return;const p=m.data;if(p?.type===Se){p.bridgeBuild===v&&typeof p.error=="string"&&p.error.trim()&&n(p.error);return}if(p?.type===we){if(p.protocolVersion!==2||p.bridgeBuild!==v){r("failed",`This Qualtrics survey is using an old or incomplete bridge. Expected ${v}. Do not start this questionnaire.`);return}a!==null&&(t.clearTimeout(a),a=null),t.parent.postMessage({type:$e,protocolVersion:2,bridgeBuild:v},e),r("connected",`Secure Qualtrics bridge ${v} connected.`)}};return t.addEventListener("message",l),i({state:s,message:`Checking Qualtrics bridge ${v}.`}),a=t.setTimeout(()=>{a=null,s!=="connected"&&r("failed",`The required Qualtrics bridge ${v} did not connect. Do not start this questionnaire.`)},8500),{getState:()=>s,disconnect(){a!==null&&(t.clearTimeout(a),a=null),t.removeEventListener("message",l)}}}function Ie(e,t=window,i=12e3,n=()=>!0){return{name:"UCL Qualtrics",submit(s){return t.parent===t?Promise.reject(new Error("This centrally collected questionnaire must be opened through its Qualtrics survey.")):n()?new Promise((a,r)=>{let l=!1;const m=f=>{l||(l=!0,t.clearTimeout(w),t.removeEventListener("message",p),f())},p=f=>{if(f.source!==t.parent||f.origin!==e)return;const g=f.data;if(!(!g||g.type!==ve||g.submissionId!==s.submissionId||g.bridgeBuild!==v)){if(g.accepted!==!0){m(()=>r(new Error(typeof g.error=="string"&&g.error?g.error:"Qualtrics did not accept the response.")));return}m(()=>a({accepted:!0,submissionId:s.submissionId,receiptId:typeof g.receiptId=="string"?g.receiptId:void 0}))}},w=t.setTimeout(()=>{m(()=>r(new Error("Qualtrics did not acknowledge the response in time.")))},i);t.addEventListener("message",p),t.parent.postMessage({type:ye,bridgeBuild:v,record:s},e)}):Promise.reject(new Error(`Qualtrics bridge ${v} is not connected. The response remains in the local backup.`))}}}async function xe(e,t,i=15e3){let n;const s=new Promise((r,l)=>{n=setTimeout(()=>l(new Error("The study platform did not acknowledge the staged response in time.")),i)});let a;try{a=await Promise.race([t.submit(e),s])}finally{n!==void 0&&clearTimeout(n)}if(!a||a.accepted!==!0||a.submissionId!==e.submissionId||a.receiptId!==void 0&&typeof a.receiptId!="string")throw new Error("The study platform returned an invalid submission receipt.");return a}const L=new Map([["zero",0],["five",5],["one zero",10],["ten",10],["fifteen",15],["twenty",20],["twenty five",25],["thirty",30],["thirty five",35],["forty",40],["forty five",45],["fifty",50],["fifty five",55],["sixty",60],["sixty five",65],["seventy",70],["seventy five",75],["eighty",80],["eighty five",85],["ninety",90],["ninety five",95],["one zero zero",100],["one hundred",100],["hundred",100]]),A=new Map([["zero","0"],["oh","0"],["one","1"],["two","2"],["three","3"],["four","4"],["five","5"],["six","6"],["seven","7"],["eight","8"],["nine","9"]]),I=new Map([["won",1],["to",2],["too",2],["tree",3],["free",3],["for",4],["fore",4],["fife",5],["ate",8]]),N=["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"],U=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];function ee(e){if(e<20)return N[e];if(e===100)return"one hundred";const t=Math.floor(e/10),i=e%10;return i===0?U[t]:`${U[t]} ${N[i]}`}for(let e=0;e<=100;e+=1){L.set(ee(e),e);const t=String(e).split("").map(i=>[...A].find(([,n])=>n===i)?.[0]).filter(i=>!!i).join(" ");t&&L.set(t,e)}const M=new Set([...A.keys(),"ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety","hundred"]),B=/\b(?:not|note|knot|naught|nought|no|nope|nah|never|cannot|cancel|neither|except|without|minus|negative|skip|avoid|exclude|reject|instead|rather|unsure|uncertain|maybe|perhaps|mistake|wrong)\b|\b(?:(?:anything|everything)\s+but|other\s+than|don\s+t|can\s+t|won\s+t|wouldn\s+t|shouldn\s+t|isn\s+t|wasn\s+t)\b/,te={mental:["mental demand","mental"],physical:["physical demand","physical"],temporal:["temporal demand","temporal","time pressure"],performance:["performance"],effort:["effort"],frustration:["frustration"]};function x(e){return e.toLowerCase().replace(/[-–—]/g," ").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim()}function ke(e,t,i,n=!0){const s=[];for(const a of t){const r=Number.isInteger(a)&&a>=0&&a<=100?ee(a):String(a);if(s.push(String(a),r,`number ${r}`,`option ${r}`,`rating ${r}`,`value ${r}`,`answer ${r}`,`choice ${r}`),n){const l=e.responseLabels?.[String(a)];l?.trim()&&s.push(l.trim(),`answer ${l.trim()}`,`choose ${l.trim()}`)}}return n&&(s.push(e.lowAnchor,e.highAnchor,...e.voiceLowAliases??[],...e.voiceHighAliases??[]),i.length===5&&s.push("middle","midpoint",`closer to ${e.lowAnchor}`,`closer to ${e.highAnchor}`)),[...new Set(s.map(a=>a.trim()).filter(Boolean))]}function Ae(e){return[...new Set(e.flatMap(t=>typeof t!="string"?[t.name,t.id.replace(/[-_]/g," ")]:te[t]??[t.replace(/[-_]/g," ")]).map(t=>t.trim()).filter(Boolean))]}function ie(e){return B.test(x(e))}function se(e,t){const i=e.map(a=>a.trim()).filter(Boolean);if(i.length===0)return null;const n=i.map((a,r)=>({transcript:a,value:t(a),index:r}));if(n.some(({transcript:a,value:r})=>r===null&&ie(a)))return null;const s=n.filter(a=>a.value!==null);return s.length===0?null:{transcript:s[0].transcript,value:s[0].value}}function j(e,t){return new Set([e,...t??[]].map(x).filter(Boolean))}function q(e){return e.replace(/^(?:(?:i\s+)?(?:choose|select|pick)|(?:my\s+)?answer(?:\s+is)?|(?:the\s+)?(?:number|option|rating|value|response|choice)(?:\s+is)?)\s+/,"").trim()}function H(e){return e.replace(/\bdis\s+a\s+gr(?:ay|ey)\b/g,"disagree").replace(/\ba\s+gr(?:ay|ey)\b/g,"agree").replace(/\bstrong\s+lee\b/g,"strongly").replace(/\bdisagreed\b/g,"disagree").replace(/\bagreed\b/g,"agree").replace(/^neither\s+(.+)\s+or\s+(.+)$/,"neither $1 nor $2")}function Pe(e,t,i){const n=q(e),s=j(t.lowAnchor,t.voiceLowAliases).has(n),a=j(t.highAnchor,t.voiceHighAliases).has(n);if(!(!s&&!a))return s&&a?null:s?i[0]:i.at(-1)??null}function Ee(e,t,i){if(!t.responseLabels)return;const n=H(q(e)),s=i.filter(a=>H(x(t.responseLabels?.[String(a)]??""))===n);if(s.length!==0)return s.length===1?s[0]:null}function Te(e,t){const i=q(e),n=i.split(" ").filter(Boolean);if(n.length===0||!n.every(r=>/^(?:100|[0-9]{1,2})$/.test(r)||M.has(r)||I.has(r)))return;const a=ne(i,t,!0);return a.length!==1||a[0]===null?null:a[0]}function ne(e,t,i=!1){const n=e.split(" ").filter(Boolean),s=[];for(const a of n)if(/^(?:100|[0-9]{1,2})$/.test(a)){const r=Number(a);s.push(t.includes(r)?r:null)}for(let a=0;a<n.length;){if(!M.has(n[a])&&!(i&&I.has(n[a]))){a+=1;continue}const r=[];for(;a<n.length&&(M.has(n[a])||i&&I.has(n[a]));)r.push(n[a]),a+=1;const l=r.length===1&&A.has(r[0])?Number(A.get(r[0])):r.length===1&&I.has(r[0])?I.get(r[0]):L.get(r.join(" "));s.push(l!==void 0&&t.includes(l)?l:null)}return s}function Q(e){return e?.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")}function R(e,t){return e.find(i=>i.position===t)?.value}function Le(e,t,i){const n=/\b(middle|midpoint|centre|center)\b/.test(e),s=Q(t.voiceLowAliases),a=Q(t.voiceHighAliases);if(!s||!a||i.length!==5)return;const r=`(?:${s})`,l=`(?:${a})`,m=new RegExp(`\\bclose(?:r)?\\s+(?:to|too)\\s+${r}\\b`).test(e),p=new RegExp(`\\bclose(?:r)?\\s+(?:to|too)\\s+${l}\\b`).test(e),w=t.voiceLowAliases?.includes("low")===!0&&e==="hello",f=new RegExp(`\\b${r}\\b`).test(e)||w,g=new RegExp(`\\b${l}\\b`).test(e);if(m||p)return[n,m,p].filter(Boolean).length!==1||m&&g||p&&f?null:m?R(i,"closer-low")??null:R(i,"closer-high")??null;if([n,f,g].some(Boolean))return[n,f,g].filter(Boolean).length!==1?null:n?R(i,"middle")??null:f?R(i,"low")??null:R(i,"high")??null}function Me(e,t,i=J,n=Y){const s=x(e);if(!s)return null;const a=Ee(s,t,i);if(a!==void 0)return a;const r=Pe(s,t,i);if(r!==void 0)return r;if(B.test(s))return null;const l=Le(s,t,n),m=Te(s,i);if(m!==void 0)return m===null||l===null||l!==void 0&&l!==m?null:m;if(l===null)return null;if(l!==void 0){const p=ne(s,i);return p.length===0?l:p.length!==1||p[0]===null||p[0]!==l?null:l}return null}function Be(e,t){const i=x(e);if(!i||B.test(i))return null;const n=t.map(s=>{const a=typeof s=="string"?s:s.id;return(typeof s=="string"?te[a]??[a.replace(/[-_]/g," ")]:[s.name.toLowerCase(),a.replace(/[-_]/g," ")]).some(l=>i===l||i.includes(l))?a:null}).filter(s=>!!s);return n.length===1?n[0]:null}function qe(e,t,i=J,n=Y){return se(e,s=>Me(s,t,i,n))}function Oe(e,t){return se(e,i=>Be(i,t))}const P="3.5.3",Ge=`https://cdn.jsdelivr.net/npm/webgazer@${P}/dist/webgazer.js`,Ve=`https://cdn.jsdelivr.net/npm/webgazer@${P}/dist/mediapipe/face_mesh`,Fe="sha384-N9TfYQEjUGiaDcITkzB/MtVHEfF2JtTWCwHG8NUhjOSvJ8zObGwfebHUFLBS+4Rb";let z=null;function _(e){return e.protocol==="https:"||e.hostname==="localhost"||e.hostname==="127.0.0.1"}function De(e=document){return window.webgazer?Promise.resolve(window.webgazer):z||(z=new Promise((t,i)=>{const n=e.querySelector("#webgazer-loader"),s=n??e.createElement("script"),a=()=>{window.webgazer?t(window.webgazer):i(new Error("WebGazer loaded without exposing its browser API."))};s.addEventListener("load",a,{once:!0}),s.addEventListener("error",()=>{s.remove(),i(new Error("WebGazer could not be downloaded. Check the connection and content-blocking settings."))},{once:!0}),n||(s.id="webgazer-loader",s.src=Ge,s.integrity=Fe,s.crossOrigin="anonymous",s.referrerPolicy="no-referrer",e.head.append(s))}).catch(t=>{throw z=null,t}),z)}class W{constructor(t){this.durationMs=t,this.key=null,this.startedAt=0}update(t,i){if(!t)return this.reset(),{progress:0,activated:!1};if(t!==this.key)return this.key=t,this.startedAt=i,{progress:0,activated:!1};const n=Math.min(1,Math.max(0,(i-this.startedAt)/this.durationMs));return n>=1?(this.reset(),{progress:1,activated:!0}):{progress:n,activated:!1}}reset(){this.key=null,this.startedAt=0}}var Ne=Object.defineProperty,Ue=Object.getOwnPropertyDescriptor,h=(e,t,i,n)=>{for(var s=n>1?void 0:n?Ue(t,i):t,a=e.length-1,r;a>=0;a--)(r=e[a])&&(s=(n?r(t,i,s):r(s))||s);return n&&s&&Ne(t,i,s),s};function E(e){return e.trim().toLocaleLowerCase().split("-")[0]==="en"}const k=[{x:12,y:12},{x:50,y:12},{x:88,y:12},{x:12,y:50},{x:50,y:50},{x:88,y:50},{x:12,y:88},{x:50,y:88},{x:88,y:88}],C=3;function T(e){const t=X(e);for(let i=t.length-1;i>0;i-=1){const n=Math.floor(Math.random()*(i+1));[t[i],t[n]]=[t[n],t[i]]}return t}let d=class extends ae{constructor(){super(...arguments),this.stage="intro",this.ratingIndex=0,this.pairIndex=0,this.pairOrder=T(G($)),this.pairResponses={},this.ratings={},this.ratingInputRoutes={},this.pairInputRoutes={},this.supportChanges=[],this.answerMode="standard",this.showSimpleLanguage=!1,this.largeText=!1,this.recoveryEnabled=!1,this.resumeSummaryVisible=!1,this.savedSession=null,this.savedSessionProblem="",this.recoveredCompletedRecord=null,this.readingAloud=!1,this.readAloudUsed=!1,this.audioGuidance=!1,this.audioStatusMessage="",this.interruptionSummaryShown=!1,this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null,this.errorMessage="",this.statusMessage="",this.result=null,this.gazeState="off",this.gazeMessage="",this.gazeCalibrationIndex=0,this.gazeCalibrationRepetition=0,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeUsed=!1,this.gazeActionCount=0,this.studyConfig=null,this.configurationError="",this.participantCode="",this.participantCodeError="",this.participantCodeRestoredForTab=!1,this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.startedAt="",this.submittedRecord=null,this.completionSavedLocally=!1,this.completionStagedByBridge=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1,this.submittingResult=!1,this.hostBridgeState="not-required",this.hostBridgeMessage="",this.hiddenAt=null,this.recognition=null,this.webgazer=null,this.gazeCandidateElement=null,this.gazePendingElement=null,this.gazeActivationInProgress=!1,this.speechRequestId=0,this.savedSessionAnnouncementKey="",this.configurationApplied=!1,this.prefilledParticipantCode="",this.invalidParticipantParameter=!1,this.reviewReturnFocusIndex=null,this.installedResultSink=null,this.gazeCandidateTracker=new W(1e3),this.gazeConfirmationTracker=new W(1200),this.repeatSavedSessionOffer=()=>{this.savedSession&&(this.readAloudUsed=!0,this.speakText(this.savedSessionOfferSpeech(this.savedSession)))},this.setParticipantCode=e=>{this.participantCode=e.currentTarget.value.trim(),this.invalidParticipantParameter=!1,this.participantCodeRestoredForTab=!1,this.participantCodeError=this.participantCode&&!b(this.participantCode)?"Use 1–32 letters, numbers, hyphens or underscores, starting with a letter or number.":"",this.savedSession=null,this.savedSessionProblem="",this.recoveredCompletedRecord=null,b(this.participantCode)?(this.rememberParticipantCodeForTab(),this.findSavedSession(),this.findCompletedBackup()):this.forgetParticipantCodeForTab()},this.setAudioGuidance=e=>{const t=e.currentTarget.checked;this.recordSupportChange("automatic-audio",this.audioGuidance,t),this.audioGuidance=t,this.invalidatePendingSubmission(),this.audioGuidance?this.speakText("Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open."):this.stopReading(),this.persistProgress()},this.startQuestionnaire=()=>{if(this.configurationError){this.showError(this.configurationError);return}if(this.studyConfig?.collection.mode==="qualtrics"&&this.hostBridgeState!=="connected"){this.showError(this.hostBridgeMessage||"The secure Qualtrics result connection is not ready. Do not start this questionnaire.");return}if(this.studyConfig){if(this.participantCode=this.participantCode.trim(),!b(this.participantCode)){this.participantCodeError="Enter the valid pseudonymous participant code supplied by the study conductor.",this.showError(this.participantCodeError);return}this.rememberParticipantCodeForTab()}this.startedAt=new Date().toISOString(),this.stage="ratings",this.ratingIndex=0,this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.reviewReturnFocusIndex=null,this.clearError(),this.persistProgress(),this.focusHeading()},this.goBack=()=>{if(this.stopReading(),this.clearVoiceAnswer(),this.stage==="ratings"&&this.editingRatingFromReview){const e=this.reviewReturnFocusIndex??this.ratingIndex;this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.stage="review",this.clearError(),this.persistProgress(),this.focusReviewItem(e,`${this.dimensions[e].name} edit cancelled. Original answer kept.`);return}else this.stage==="ratings"&&this.ratingIndex>0?this.ratingIndex-=1:this.stage==="pairs"&&(this.pairIndex>0?this.pairIndex-=1:(this.stage="ratings",this.ratingIndex=this.dimensions.length-1));this.clearError(),this.persistProgress(),this.focusHeading()},this.returnToRatings=()=>{this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.reviewReturnFocusIndex=null,this.stage="ratings",this.ratingIndex=this.dimensions.length-1,this.persistProgress(),this.focusHeading()},this.returnToPairs=()=>{this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.reviewReturnFocusIndex=null,this.stage="pairs",this.pairIndex=this.pairOrder.length-1,this.persistProgress(),this.focusHeading()},this.submitResponses=async()=>{if(!this.submittingResult)try{(!this.result||!this.submittedRecord)&&(this.result=re(this.definition,this.ratings,this.pairResponses),this.submittedRecord=oe({config:this.effectiveStudyConfig(),participantCode:this.studyConfig?this.participantCode:"DEMO",startedAt:this.startedAt||new Date().toISOString(),pairPresentationOrder:this.pairOrder.map(({id:t})=>t),pairwiseChoices:this.pairResponses,result:this.result,supportMetadata:this.currentSupportMetadata()}));const e=this.studyConfig?Ce():null;if(this.completionSavedLocally=this.studyConfig?le(this.submittedRecord):!1,this.completionStagedByBridge=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1,e){this.submittingResult=!0,this.statusMessage=`Submitting responses to ${e.name}.`;try{await xe(this.submittedRecord,e),this.completionStagedByBridge=!0}catch(t){this.hostSubmissionFailed=!0;const i=t instanceof Error?t.message:"The study platform did not accept the response.";this.showError(`${i} Your answers remain on this page. Retry submission, return to an answer, or use a backup button below.`);return}finally{this.submittingResult=!1}}this.dispatchEvent(new CustomEvent("questionnaire-complete",{detail:this.submittedRecord,bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("nasa-tlx-complete",{detail:this.submittedRecord,bubbles:!0,composed:!0})),this.stage="complete",(!this.studyConfig||this.completionSavedLocally)&&this.clearSavedProgress(),this.stopGazeInputInternal(!1),this.clearError(),this.completionStagedByBridge||this.focusHeading()}catch(e){this.submittingResult=!1,this.showError(e instanceof Error?e.message:"Responses could not be calculated.")}},this.downloadResultJson=()=>{this.submittedRecord&&this.downloadRecordJson(this.submittedRecord)},this.downloadResultCsv=()=>{this.submittedRecord&&this.downloadRecordCsv(this.submittedRecord)},this.restart=()=>{this.stopReading(!1),this.stopGazeInputInternal(!1),this.releaseRecognition(),this.clearSavedProgress(),this.forgetParticipantCodeForTab(),this.stage="intro",this.ratingIndex=0,this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.reviewReturnFocusIndex=null,this.pairIndex=0,this.pairOrder=T(this.definition),this.pairResponses={},this.ratings={},this.ratingInputRoutes={},this.pairInputRoutes={},this.supportChanges=[],this.resumeSummaryVisible=!1,this.savedSession=null,this.recoveredCompletedRecord=null,this.result=null,this.submittedRecord=null,this.completionSavedLocally=!1,this.completionStagedByBridge=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1,this.submittingResult=!1,this.startedAt="",this.participantCodeError="",this.participantCodeRestoredForTab=!1,this.studyConfig&&(this.participantCode=this.prefilledParticipantCode),this.errorMessage="",this.voiceState="idle",this.pendingVoiceAnswer=null,this.audioGuidance=!1,this.audioStatusMessage="",this.gazeUsed=!1,this.gazeActionCount=0,this.applyConfiguredSupport(),this.statusMessage="A new questionnaire has started.",window.scrollTo({top:0,behavior:"smooth"})},this.toggleReadAloud=()=>{if(this.readingAloud){this.stopReading(!0);return}this.speakText(this.currentStepSpeech())},this.startGazeInput=async()=>{if(!_(window.location)){this.gazeState="error",this.gazeMessage="Gaze input requires an HTTPS-hosted page or localhost.",this.announceAutomatic(this.gazeMessage);return}this.gazeState="loading",this.gazeMessage="Loading the pinned WebGazer library. Webcam permission will be requested next.";try{const e=await De();if(!e.detectCompatibility())throw new Error("This browser does not expose a compatible webcam API.");this.webgazer=e,e.params.faceMeshSolutionPath=Ve,e.saveDataAcrossSessions(!1),await e.clearData(),e.showVideoPreview(!0),e.showFaceOverlay(!0),e.showFaceFeedbackBox(!0),e.showPredictionPoints(!1),e.setGazeListener(t=>this.handleGazePoint(t)),await e.begin(),e.removeMouseEventListeners(),await this.showGazePositioningStep("Camera started. Position your face, then continue to calibration.")}catch(e){this.gazeState="error",this.gazeMessage=e instanceof Error?`Gaze setup did not start: ${e.message}`:"Gaze setup did not start. Use another answer route.",this.announceAutomatic(this.gazeMessage),this.releaseGazeResources()}},this.restartGazeCalibration=async()=>{this.webgazer&&(this.cancelGazeProposal(),await this.webgazer.clearData(),await this.showGazePositioningStep("Recalibration started. Check your position before continuing."))},this.beginGazeCalibration=()=>{this.webgazer&&(this.restoreWebGazerPreviewContainer(),this.webgazer.showVideoPreview(!1),this.webgazer.showFaceOverlay(!1),this.webgazer.showFaceFeedbackBox(!1),this.webgazer.showPredictionPoints(!1),this.gazeCalibrationIndex=0,this.gazeCalibrationRepetition=0,this.gazeState="calibrating",this.gazeMessage="Camera preview hidden. Complete all 27 calibration samples.",this.announceAutomatic(this.gazeMessage),this.updateComplete.then(()=>this.querySelector(".calibration-point")?.focus()))},this.recordCalibrationPoint=e=>{if(!this.webgazer||this.gazeState!=="calibrating")return;const t=e.currentTarget.getBoundingClientRect();if(this.webgazer.recordScreenPosition(t.left+t.width/2,t.top+t.height/2,"click"),this.gazeCalibrationRepetition<C-1){this.gazeCalibrationRepetition+=1;return}if(this.gazeCalibrationIndex<k.length-1){this.gazeCalibrationIndex+=1,this.gazeCalibrationRepetition=0;return}this.gazeCalibrationRepetition=C,this.gazeState="ready",this.gazeUsed=!0,this.gazeMessage="Calibration complete. A red gaze dot is visible. Look at a large answer or navigation control for one second.",this.webgazer.showVideoPreview(!1),this.webgazer.showFaceOverlay(!1),this.webgazer.showFaceFeedbackBox(!1),this.webgazer.showPredictionPoints(!0),this.statusMessage="Gaze-assisted answering is ready.",this.announceAutomatic(this.statusMessage)},this.confirmGazeProposal=()=>{const e=this.gazePendingElement;if(!e)return;const t=this.gazePendingLabel;this.gazePendingElement=null,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeConfirmationTracker.reset(),this.gazeActivationInProgress=!0;try{e.click(),this.gazeActionCount+=1,this.gazeUsed=!0,this.statusMessage=`${t} activated by confirmed gaze.`}finally{this.gazeActivationInProgress=!1}},this.cancelGazeProposal=()=>{this.gazePendingElement=null,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeConfirmationTracker.reset(),this.statusMessage="Gaze proposal cancelled."},this.stopGazeInput=()=>{this.stopGazeInputInternal(!0)},this.confirmVoiceAnswer=()=>{const e=this.pendingVoiceAnswer;if(!e)return;let t="";if(e.context==="rating"){const i=this.dimensions[this.ratingIndex],n=e.value;this.selectRating(i.id,n,"voice"),t=this.answerMode==="smiley"&&this.smileyLandmarks.some(a=>a.value===n)?`smiley-${i.id}-${n}`:`rating-${i.id}-${n}`}else{const i=this.pairOrder[this.pairIndex],n=e.value;this.selectPair(i.id,n,"voice"),t=`${i.id}-${n}`}this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null,this.updateComplete.then(()=>this.querySelector(`#${t}`)?.focus())},this.clearVoiceAnswer=()=>{this.releaseRecognition(),this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null},this.handleVisibilityChange=()=>{if(document.hidden){this.hiddenAt=Date.now();return}this.hiddenAt&&this.recoveryEnabled&&this.isInProgress()&&(this.resumeSummaryVisible=!0,this.interruptionSummaryShown=!0,this.statusMessage="Welcome back. A summary of your saved position is available.",this.updateComplete.then(()=>{this.querySelector("#resume-heading")?.focus(),this.announceAutomatic(this.resumeSummarySpeech())})),this.hiddenAt=null},this.handleParticipantStudyHashChange=()=>{new URLSearchParams(window.location.hash.startsWith("#")?window.location.hash.slice(1):window.location.hash).has("study")&&this.reloadForParticipantStudyLink()},this.handleSkipToCurrentQuestion=e=>{e.preventDefault(),this.updateComplete.then(()=>{const t=this.querySelector("#question-panel");if(!t)return;const i=t.querySelector("h2")??t;i.hasAttribute("tabindex")||(i.tabIndex=-1),S(i,{block:"start",onReveal:()=>this.requestParentReveal(i)})})},this.dismissResumeSummary=()=>{this.resumeSummaryVisible=!1,this.statusMessage=`Continuing at ${this.currentPositionDescription()}.`,this.focusHeading()},this.restoreSavedSession=()=>{const e=this.savedSession;e&&(this.stage=e.stage,this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.reviewReturnFocusIndex=null,this.ratingIndex=e.ratingIndex,this.pairIndex=e.pairIndex,this.pairOrder=e.pairOrder,this.pairResponses=e.pairResponses,this.ratings=e.ratings,this.ratingInputRoutes=e.ratingInputRoutes,this.pairInputRoutes=e.pairInputRoutes,this.supportChanges=e.supportChanges,this.startedAt=e.startedAt,this.canAdjustAllSupport?(this.answerMode=e.support.answerMode,this.showSimpleLanguage=e.support.showSimpleLanguage,this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance):(this.applyConfiguredSupport(),this.canAdjustPresentationSupport&&(this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance)),this.recoveryEnabled=!0,this.savedSession=null,this.savedSessionProblem="",this.savedSessionAnnouncementKey="",this.resumeSummaryVisible=!0,this.interruptionSummaryShown=!0,this.updateComplete.then(()=>{this.querySelector("#resume-heading")?.focus(),this.announceAutomatic(this.resumeSummarySpeech())}))},this.eraseSavedSession=()=>{this.clearSavedProgress(),this.savedSession=null,this.savedSessionProblem="",this.savedSessionAnnouncementKey="",this.statusMessage="Saved answers erased."}}connectedCallback(){super.connectedCallback(),this.loadStudyConfiguration(),document.addEventListener("visibilitychange",this.handleVisibilityChange),window.addEventListener("hashchange",this.handleParticipantStudyHashChange),queueMicrotask(()=>{this.restoreParticipantCodeForTab(),this.findSavedSession(),this.findCompletedBackup(),this.participantCodeRestoredForTab&&!this.savedSession&&this.recoveredCompletedRecord&&this.updateComplete.then(()=>{const e=this.querySelector("#completed-backup-heading");e&&S(e,{block:"start",onReveal:()=>this.requestParentReveal(e)})})})}disconnectedCallback(){document.removeEventListener("visibilitychange",this.handleVisibilityChange),window.removeEventListener("hashchange",this.handleParticipantStudyHashChange),this.installedResultSink?.bridge.disconnect(),this.installedResultSink=null,this.stopReading(!1),this.releaseRecognition(),this.stopGazeInputInternal(!1),super.disconnectedCallback()}createRenderRoot(){return this}loadStudyConfiguration(){if(this.configurationApplied)return;this.configurationApplied=!0;const e=new URLSearchParams(window.location.hash.startsWith("#")?window.location.hash.slice(1):window.location.hash),t=de(window.location.hash);if(e.has("study")&&!t){this.configurationError="This participant link contains an invalid or incompatible study configuration. Ask the study conductor for a new link.";return}if(!t)return;this.studyConfig=t;const i=e.get("participant"),n=ce(window.location.hash);if(n?(this.prefilledParticipantCode=n,this.participantCode=n):i&&(this.invalidParticipantParameter=!0,this.participantCodeError="The participant code in this link is invalid. Enter the approved pseudonymous code manually or ask the study conductor for a new link."),this.pairOrder=T(this.definition),this.applyConfiguredSupport(),t.collection.mode==="qualtrics"){if(window.parent===window){this.configurationError="This centrally collected questionnaire must be opened from the approved Qualtrics survey link. Ask the study conductor for that link.";return}if(document.referrer)try{if(new URL(document.referrer).origin!==t.collection.parentOrigin){this.configurationError="This questionnaire was embedded by an unexpected website. Ask the study conductor for the approved Qualtrics survey link.";return}}catch{this.configurationError="The embedding website could not be verified. Ask the study conductor for the approved Qualtrics survey link.";return}this.hostBridgeState="connecting",this.installedResultSink=Re(t,window,({state:s,message:a})=>{this.hostBridgeState=s,this.hostBridgeMessage=a},s=>{this.remoteRecordingUnconfirmed=!0,this.statusMessage=s,this.announceAutomatic(this.currentStepSpeech()),this.updateComplete.then(()=>{const a=this.querySelector("#remote-recording-error");a&&S(a,{block:"start",onReveal:()=>this.requestParentReveal(a)})})})}}applyConfiguredSupport(){const e=this.studyConfig?.support;e&&(this.showSimpleLanguage=e.showSimpleLanguage,this.answerMode=e.answerMode,this.largeText=e.largeText,this.audioGuidance=e.audioGuidance,this.recoveryEnabled=e.recoveryEnabled)}get definition(){const e=this.studyConfig?.instrumentId??$;return he(e,this.studyConfig?.questionnaireDefinition)}get dimensions(){return this.definition.items}get pairs(){return X(this.definition)}get ratingValues(){return ue(this.definition)}get smileyLandmarks(){return this.definition.landmarks??[]}get isResearcherSuppliedDefinition(){return!!this.studyConfig?.questionnaireDefinition}get dimensionById(){return new Map(this.dimensions.map(e=>[e.id,e]))}get canAdjustAllSupport(){return!this.studyConfig||this.studyConfig.support.participantAdjustmentPolicy==="participant-choice"}get canAdjustPresentationSupport(){return!this.studyConfig||this.studyConfig.support.participantAdjustmentPolicy==="presentation-only"||this.studyConfig.support.participantAdjustmentPolicy==="participant-choice"}get voiceInputAvailable(){return!this.studyConfig||this.studyConfig.support.voiceInputAvailable}get gazeInputAvailable(){return!this.studyConfig||this.studyConfig.support.gazeInputAvailable}render(){return o`
      <a class="skip-link" href="#question-panel" @click=${this.handleSkipToCurrentQuestion}
        >Skip to the current question</a
      >
      <main class=${`app-shell${this.largeText?" large-text":""}`} id="main-content">
        <p class="sr-only" aria-live="polite" aria-atomic="true">${this.statusMessage}</p>
        <header class="app-header">
          <p class="eyebrow">Accessible questionnaire platform · Version ${V}</p>
          <h1 lang=${this.definition.language} dir="auto">${this.definition.name}</h1>
          <p class="subtitle" lang=${this.definition.language} dir="auto">${this.definition.description}</p>
        </header>

        ${this.resumeSummaryVisible?this.renderResumeSummary():c}
        ${this.stage!=="intro"&&this.stage!=="complete"?this.renderProgress():c}
        ${this.stage!=="intro"&&this.stage!=="complete"?this.renderInQuestionSupport():c}
        ${this.gazePendingElement?this.renderGazeConfirmation():c}
        ${this.errorMessage?o`<div class="error-summary" role="alert" tabindex="-1" id="error-summary">
              <h2>There is a problem</h2>
              <p>${this.errorMessage}</p>
            </div>`:c}

        ${this.renderStage()}
      </main>
      ${this.gazeState==="positioning"?this.renderGazePositioning():c}
      ${this.gazeState==="calibrating"?this.renderGazeCalibration():c}
    `}renderInQuestionSupport(){return this.studyConfig&&!this.canAdjustAllSupport&&!this.canAdjustPresentationSupport?c:o`
      ${this.studyConfig?this.canAdjustAllSupport?o`<details class="support-toolbar">
              <summary>Adjust accessibility support (optional)</summary>
              <p>
                The study conductor has already prepared usable starting settings. You may change optional support if it
                helps you complete the questionnaire; every change is recorded separately from your scored answers.
              </p>
              ${this.renderSupportSettings("toolbar","all")}
            </details>`:this.canAdjustPresentationSupport?o`<details class="support-toolbar">
              <summary>Adjust display, audio or recovery (optional)</summary>
              <p>
                The study answer presentation and simpler-explanation setting remain fixed. You do not need to
                change these optional preferences to continue.
              </p>
              ${this.renderSupportSettings("toolbar","presentation-only")}
            </details>`:c:o`<details class="support-toolbar">
            <summary>Adjust accessibility support (optional)</summary>
            ${this.renderSupportSettings("toolbar","all")}
          </details>`}
      ${this.renderGazeSetup()}
    `}renderStage(){switch(this.stage){case"intro":return this.renderIntro();case"ratings":return this.renderRating();case"pairs":return this.renderPair();case"review":return this.renderReview();case"complete":return this.renderComplete()}}renderIntro(){const e=this.definition.id===$?"Start the six ratings":`Start the ${this.dimensions.length} items`;return o`
      <section class="panel" id="question-panel" aria-labelledby="intro-heading">
        <h2 id="intro-heading">Before you begin</h2>
        ${this.configurationError?o`<div class="error-summary" role="alert"><h3>Study link problem</h3><p>${this.configurationError}</p></div>`:c}
        ${this.studyConfig?.collection.mode==="qualtrics"&&this.hostBridgeState!=="connected"?o`<div
              class=${this.hostBridgeState==="failed"?"error-summary":"study-context"}
              role=${this.hostBridgeState==="failed"?"alert":"status"}
            >
              <h3>${this.hostBridgeState==="failed"?"Qualtrics connection problem":"Checking secure result collection"}</h3>
              <p>${this.hostBridgeMessage}</p>
              <p>The questionnaire cannot start until the matching collection bridge is connected.</p>
            </div>`:c}
        ${this.renderStudyContext()}
        ${this.savedSession?this.renderSavedSessionOffer():c}
        ${this.savedSessionProblem?o`<aside class="error-summary" role="status" aria-labelledby="saved-session-problem-heading">
              <h3 id="saved-session-problem-heading">Saved progress could not be restored</h3>
              <p>${this.savedSessionProblem}</p>
            </aside>`:c}
        ${this.recoveredCompletedRecord?this.renderCompletedBackupOffer():c}
        <p lang=${this.definition.language} dir="auto">${this.definition.introPrompt}</p>
        <p>
          Answer ${this.dimensions.length} item${this.dimensions.length===1?"":"s"}${this.pairs.length?` and ${this.pairs.length} comparison${this.pairs.length===1?"":"s"}`:""}, review every answer, then submit.
        </p>

        <details class="support-toolbar participant-support-setup">
          <summary>Accessibility and audio options (optional)</summary>
          <p>
            Screen readers can use the page headings, labels and status messages. Built-in audio is a separate option.
          </p>
          ${this.studyConfig?this.renderConfiguredSupportSummary():c}
          ${this.studyConfig?this.canAdjustAllSupport?this.renderSupportSettings("intro","all"):this.canAdjustPresentationSupport?this.renderSupportSettings("intro","presentation-only"):c:this.renderSupportSettings("intro","all")}
          ${this.renderReadAloudControl()}
          ${this.renderGazeSetup()}
          <p class="support-boundary">
            ${this.definition.officialContentNotice} Optional support use is recorded separately from scored answers.
          </p>
        </details>

        <button
          class="primary-button large-answer-button"
          type="button"
          data-gaze-target
          data-gaze-label=${e}
          ?disabled=${!!this.configurationError||this.studyConfig?.collection.mode==="qualtrics"&&this.hostBridgeState!=="connected"}
          @click=${this.startQuestionnaire}
        >
          ${e}
        </button>
      </section>
    `}renderStudyContext(){return this.studyConfig?o`
      <aside class="study-context" aria-labelledby="study-context-heading">
        <h3 id="study-context-heading">${this.studyConfig.studyTitle}</h3>
        <p>Think about: <strong>${this.studyConfig.taskLabel}</strong></p>
        <label class="participant-code-field" for="participant-code">
          <strong>Pseudonymous participant code</strong>
          <span>The link normally fills this in. If it is blank, use the code provided by the study conductor. Do not enter your name or email.</span>
          <input
            id="participant-code"
            name="participant-code"
            type="text"
            maxlength="32"
            autocomplete="off"
            spellcheck="false"
            .value=${this.participantCode}
            aria-describedby="participant-code-help"
            aria-invalid=${this.participantCodeError?"true":"false"}
            @input=${this.setParticipantCode}
          />
        </label>
        <p id="participant-code-help" class=${this.participantCodeError?"field-error":"support-boundary"}>
          ${this.participantCodeError||(this.recoveryEnabled?"You may correct the code. If this page reloads in the same tab, the code is restored so interrupted answers can be found.":"Letters, numbers, hyphens and underscores only; maximum 32 characters.")}
        </p>
        ${this.participantCodeRestoredForTab?o`<p class="restored-code-note" role="status">
              Participant code restored for this tab. It will be forgotten when this tab is closed.
            </p>`:c}
      </aside>
    `:o`<aside class="study-context demo-context">
        <h3>Demonstration mode</h3>
        <p>This page is a technical demonstration. It does not upload answers or act as a remote research-data system.</p>
      </aside>`}renderConfiguredSupportSummary(){const e=this.studyConfig?.support;return e?o`
      <aside class="configured-support" aria-labelledby="configured-support-heading">
        <h3 id="configured-support-heading">Support prepared by the study conductor</h3>
        <p>You do not need to configure the questionnaire before starting.</p>
        <ul>
          ${this.definition.supports.simplerExplanations?o`<li>${e.showSimpleLanguage?"Simpler explanations shown":"Optional simpler help hidden"}</li>`:o`<li>Official item wording only; no reworded item support is enabled for this instrument</li>`}
          <li>
            ${e.answerMode==="smiley"?"Smiley landmark rating view":`Standard ${this.ratingValues.length}-value rating scale`}
          </li>
          <li>${e.largeText?"Large text":"Standard text size"}</li>
          <li>${e.recoveryEnabled?"Interruption recovery on":"Interruption recovery off"}</li>
          <li>${e.voiceInputAvailable?"Confirmed voice input available":"Built-in voice input not included"}</li>
          <li>${e.gazeInputAvailable?"Experimental gaze input available":"Experimental gaze input not included"}</li>
        </ul>
        <p>
          ${e.participantAdjustmentPolicy==="participant-choice"?"The starting settings are already applied. You may optionally change any support control shown below. Each change is recorded separately from your answers.":e.participantAdjustmentPolicy==="presentation-only"?"You may optionally change text size, automatic spoken guidance or interruption recovery. The answer presentation and simpler-explanation setting remain fixed.":"The prepared settings remain fixed for this study. You can still use any answer route that the study conductor made available."}
        </p>
      </aside>
    `:c}renderSupportSettings(e,t){const i=`support-${e}`,n="speechSynthesis"in window&&"SpeechSynthesisUtterance"in window;return o`
      <fieldset class="support-settings">
        <legend>${t==="all"?"Accessibility support options":"Display and recovery preferences"}</legend>

        ${t==="all"&&this.definition.supports.simplerExplanations?o`<label class="toggle-card" for=${`${i}-simple`}>
            <input
              id=${`${i}-simple`}
              type="checkbox"
              .checked=${this.showSimpleLanguage}
              @change=${s=>this.setSimpleLanguage(s)}
            />
            <span>
              <strong>Show simpler explanations</strong>
              <small>
                ${this.isResearcherSuppliedDefinition?"The questionnaire item remains visible once, without being duplicated inside the help.":"The official item remains visible once, without being duplicated inside the help."}
              </small>
            </span>
          </label>`:c}

        ${t==="all"&&this.definition.supports.smileyLandmarks?o`<fieldset class="answer-mode-control">
            <legend>Rating answer format</legend>
            <label for=${`${i}-standard-answer`}>
              <input
                id=${`${i}-standard-answer`}
                type="radio"
                name=${`${i}-answer-mode`}
                value="standard"
                .checked=${this.answerMode==="standard"}
                @change=${()=>this.setAnswerMode("standard")}
              />
              <span>
                <strong>Standard ${this.ratingValues.length}-value scale</strong>
                <small>Official ${this.definition.shortName} response values.</small>
              </span>
              ${this.answerMode==="standard"?o`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:c}
            </label>
            <label for=${`${i}-smiley-answer`}>
              <input
                id=${`${i}-smiley-answer`}
                type="radio"
                name=${`${i}-answer-mode`}
                value="smiley"
                .checked=${this.answerMode==="smiley"}
                @change=${()=>this.setAnswerMode("smiley")}
              />
              <span>
                <strong>Smiley landmarks</strong>
                <small>Experimental five-value view; the precise scale is available only on request.</small>
              </span>
              ${this.answerMode==="smiley"?o`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:c}
            </label>
          </fieldset>`:c}

        <fieldset class="text-size-control">
          <legend>Text size</legend>
          <label for=${`${i}-standard-text`}>
            <input
              id=${`${i}-standard-text`}
              type="radio"
              name=${`${i}-text-size`}
              value="standard"
              .checked=${!this.largeText}
              @change=${()=>this.setLargeText(!1)}
            />
            Standard
          </label>
          <label for=${`${i}-large-text`}>
            <input
              id=${`${i}-large-text`}
              type="radio"
              name=${`${i}-text-size`}
              value="large"
              .checked=${this.largeText}
              @change=${()=>this.setLargeText(!0)}
            />
            Large
          </label>
        </fieldset>

        <label class="toggle-card" for=${`${i}-audio`}>
          <input
            id=${`${i}-audio`}
            type="checkbox"
            .checked=${this.audioGuidance}
            ?disabled=${!n}
            @change=${this.setAudioGuidance}
          />
          <span>
            <strong>Read new questions and feedback aloud</strong>
            <small>${n?"Default off. Leave this off when a screen reader is already speaking.":"Built-in audio is unavailable in this browser."}</small>
          </span>
        </label>

        <label class="toggle-card" for=${`${i}-recovery`}>
          <input
            id=${`${i}-recovery`}
            type="checkbox"
            .checked=${this.recoveryEnabled}
            @change=${s=>this.setRecovery(s)}
          />
          <span>
            <strong>Save progress and show a return summary</strong>
            <small>Stores incomplete answers only in this browser so an interruption or reload can be recovered.</small>
          </span>
        </label>
      </fieldset>
    `}renderReadAloudControl(){const e="speechSynthesis"in window&&"SpeechSynthesisUtterance"in window;return o`
      <div class="quick-support audio-guidance" role="group" aria-label="Built-in audio guidance">
        <div>
          <strong>Built-in audio guidance (produces sound)</strong>
          <p>
            This is separate from screen-reader compatibility. Leave automatic audio off when using NVDA or VoiceOver
            to avoid two voices speaking at once.
          </p>
        </div>
        <button
          class="secondary-button large-answer-button"
          type="button"
          ?disabled=${!e}
          @click=${this.toggleReadAloud}
        >
          ${this.readingAloud?"Stop speech":"Hear a summary of this step"}
        </button>
        ${this.audioStatusMessage?o`<p class="audio-status" role="status" aria-atomic="true">${this.audioStatusMessage}</p>`:c}
        <small>Automatic spoken guidance is ${this.audioGuidance?"on":"off"}.</small>
        <small>
          ${e?"Uses the browser speech-synthesis voice; no audio is recorded.":"Built-in audio is unavailable in this browser. External screen readers can still use the semantic page."}
        </small>
      </div>
    `}renderCompletionReadAloudControl(){const e="speechSynthesis"in window&&"SpeechSynthesisUtterance"in window;return o`
      <div class="quick-support audio-guidance completion-audio" role="group" aria-label="Result audio guidance">
        <button
          class="secondary-button large-answer-button"
          type="button"
          ?disabled=${!e}
          @click=${this.toggleReadAloud}
        >
          ${this.readingAloud?"Stop speech":"Hear the result summary"}
        </button>
        ${this.audioStatusMessage?o`<p class="audio-status" role="status" aria-atomic="true">${this.audioStatusMessage}</p>`:c}
        <small>
          ${e?"Uses the browser speech-synthesis voice; no audio is recorded.":"Built-in audio is unavailable in this browser. External screen readers can still read the result."}
        </small>
      </div>
    `}renderGazeSetup(){if(!this.gazeInputAvailable)return c;const e=_(window.location),t=this.gazeState==="loading"||this.gazeState==="positioning"||this.gazeState==="calibrating"||this.gazeState==="ready";return o`
      <details class="gaze-setup" .open=${this.gazeState!=="off"}>
        <summary>Gaze-assisted answering with WebGazer (experimental)</summary>
        <div class="gaze-setup-content">
          <p>
            Uses the webcam to estimate where you look. After calibration, look at a large answer or navigation control
            for one second to propose it, then look at the separate Confirm control for 1.2 seconds. Looking alone never submits immediately.
          </p>
          <ul>
            <li>Requires webcam permission and an HTTPS website or localhost; it is not available from the downloaded file.</li>
            <li>Video is processed in this browser and is not stored by this questionnaire.</li>
            <li>WebGazer ${P} is loaded only after you start this feature; its code and face model come from jsDelivr.</li>
            <li>The camera preview is shown only while you position your face. It is hidden before calibration and answering.</li>
            <li>Webcam gaze estimation can be inaccurate and needs recalibration. Standard, keyboard and voice controls remain available.</li>
          </ul>
          ${e?c:o`<p class="gaze-warning" role="status">
                Gaze input requires the future HTTPS-hosted demo. Continue using the other answer routes in this downloaded file.
              </p>`}
          <div class="button-row compact">
            ${t?o`<button class="secondary-button large-answer-button" type="button" @click=${this.stopGazeInput}>
                  Stop gaze and camera
                </button>`:o`<button
                  class="secondary-button large-answer-button"
                  type="button"
                  ?disabled=${!e}
                  @click=${this.startGazeInput}
                >
                  ${this.gazeState==="error"?"Try gaze setup again":"Start camera and calibration"}
                </button>`}
            ${this.gazeState==="ready"?o`<button class="secondary-button" type="button" @click=${this.restartGazeCalibration}>
                  Recalibrate
                </button>`:c}
          </div>
          ${this.gazeMessage?o`<p class="gaze-status" role="status">${this.gazeMessage}</p>`:c}
        </div>
      </details>
    `}renderGazePositioning(){return o`
      <div class="gaze-positioning" role="dialog" aria-modal="true" aria-labelledby="gaze-positioning-heading">
        <section class="gaze-positioning-card">
          <h2 id="gaze-positioning-heading" tabindex="-1">Position your camera</h2>
          <p>
            Centre your face in the preview and keep the device steady. This preview is for positioning only and will
            disappear before calibration.
          </p>
          <div
            class="gaze-camera-preview-slot"
            role="img"
            aria-label="Live camera positioning preview"
          ></div>
          <p class="gaze-positioning-tip">
            Make sure your whole face is visible, the lighting is even and your eyes are not covered. On a phone or
            tablet, place the device on a stable support if possible.
          </p>
          <div class="button-row gaze-positioning-actions">
            <button class="primary-button large-answer-button" type="button" @click=${this.beginGazeCalibration}>
              Continue to calibration
            </button>
            <button class="secondary-button large-answer-button" type="button" @click=${this.stopGazeInput}>
              Cancel gaze setup
            </button>
          </div>
        </section>
      </div>
    `}renderGazeCalibration(){const e=k[this.gazeCalibrationIndex],t=this.gazeCalibrationIndex*C+this.gazeCalibrationRepetition,i=k.length*C;return o`
      <div class="gaze-calibration" role="dialog" aria-modal="true" aria-labelledby="gaze-calibration-heading">
        <div class="gaze-calibration-instructions">
          <h2 id="gaze-calibration-heading">Gaze calibration</h2>
          <p>Keep your head steady. Look at the numbered target, then click it or press Enter/Space three times.</p>
          <p><strong>${t} of ${i}</strong> calibration samples completed.</p>
          <button class="secondary-button" type="button" @click=${this.stopGazeInput}>Cancel gaze setup</button>
        </div>
        <div class="gaze-calibration-field">
          <button
            class="calibration-point"
            type="button"
            style=${`left: clamp(3rem, ${e.x}%, calc(100% - 3rem)); top: clamp(3rem, ${e.y}%, calc(100% - 3rem))`}
            aria-label=${`Calibration point ${this.gazeCalibrationIndex+1} of ${k.length}, sample ${this.gazeCalibrationRepetition+1} of ${C}`}
            @click=${this.recordCalibrationPoint}
          >
            ${this.gazeCalibrationIndex+1}
            <span>${this.gazeCalibrationRepetition+1}/${C}</span>
          </button>
        </div>
      </div>
    `}renderGazeConfirmation(){return o`
      <aside class="gaze-confirmation" aria-labelledby="gaze-confirmation-heading">
        <h2 id="gaze-confirmation-heading">Gaze proposal</h2>
        <p>You looked at: <strong>${this.gazePendingLabel}</strong></p>
        <p>Look at Confirm for 1.2 seconds, or cancel. This second step prevents an ordinary glance from becoming an answer.</p>
        <div class="gaze-confirmation-actions">
          <button
            class="primary-button large-answer-button gaze-confirm-target"
            type="button"
            data-gaze-confirm
            style=${`--gaze-progress: ${this.gazeDwellProgress*100}%`}
            @click=${this.confirmGazeProposal}
          >
            Confirm ${this.gazePendingLabel}
          </button>
          <button
            class="secondary-button large-answer-button gaze-cancel-target"
            type="button"
            data-gaze-cancel
            style=${`--gaze-progress: ${this.gazeDwellProgress*100}%`}
            @click=${this.cancelGazeProposal}
          >
            Cancel gaze proposal
          </button>
        </div>
      </aside>
    `}renderProgress(){const e=Object.keys(this.ratings).length+Object.keys(this.pairResponses).length,t=this.dimensions.length+this.pairOrder.length,i=this.stage==="ratings"?"Ratings":this.stage==="pairs"?"Comparisons":"Review";return o`
      <nav class="progress-card" aria-label="Questionnaire progress">
        <p><strong>${i}:</strong> ${e} of ${t} responses completed</p>
        <progress max=${t} value=${e}>${e} of ${t}</progress>
      </nav>
    `}renderRating(){const e=this.dimensions[this.ratingIndex],t=this.editingRatingFromReview&&this.reviewRatingEdit?.itemId===e.id?this.reviewRatingEdit.pendingValue:this.ratings[e.id];return o`
      <section class="panel" id="question-panel" aria-labelledby="rating-heading">
        <p class="step-label">Rating ${this.ratingIndex+1} of ${this.dimensions.length}</p>
        <h2 id="rating-heading" lang=${this.definition.language} dir="auto">${e.name}</h2>
        <p class="official-definition">
          <strong>${this.isResearcherSuppliedDefinition?"Questionnaire item":this.pairs.length?"Official definition":"Official item"}:</strong>
          <span lang=${this.definition.language} dir="auto">${e.prompt}</span>
        </p>

        ${this.definition.supports.simplerExplanations?this.showSimpleLanguage?o`<aside class="simple-language-panel" aria-label="Simpler explanation">
              <p class="support-label">Simpler explanation</p>
              <p>${e.simpleExplanation}</p>
              <p class="support-boundary">
                Use the declared response scale when choosing your response.
              </p>
            </aside>`:o`<details
              class="optional-explanation"
              @toggle=${i=>this.speakOpenedHelp(i,`Simpler explanation for ${e.name}. ${e.simpleExplanation}`)}
            >
              <summary>Show a simpler explanation</summary>
              <div class="explanation-block">
                <p>${e.simpleExplanation}</p>
                <p class="support-boundary">
                  This help does not replace the questionnaire item.
                </p>
              </div>
            </details>`:c}

        ${this.answerMode==="smiley"&&this.definition.supports.smileyLandmarks?o`
              ${this.renderSmileyResponse(e,t)}
              <details class="precision-scale">
                <summary>Choose a more precise value on the full scale</summary>
                ${this.renderFullRatingScale(e,t)}
              </details>
            `:this.renderFullRatingScale(e,t)}

        ${this.renderVoiceInput("rating",e)}
        ${this.renderNavigation(this.ratingIndex>0,"rating")}
      </section>
    `}renderFullRatingScale(e,t){const i=this.definition.scale.type==="semantic-differential",n=!!e.responseLabels;return o`
      <fieldset class="rating-fieldset">
        <legend>
          ${i?o`Choose one position for
                <span lang=${this.definition.language} dir="auto">${e.name}</span>, from
                <span lang=${this.definition.language} dir="auto">${e.lowAnchor}</span> to
                <span lang=${this.definition.language} dir="auto">${e.highAnchor}</span>`:o`Choose one answer for
                <span lang=${this.definition.language} dir="auto">${e.name}</span>:
                ${this.definition.scale.minimum} is
                <span lang=${this.definition.language} dir="auto">${e.lowAnchor}</span>;
                ${this.definition.scale.maximum} is
                <span lang=${this.definition.language} dir="auto">${e.highAnchor}</span>`}
        </legend>
        <div class="rating-anchors" aria-hidden="true">
          <span>${i?c:`${this.definition.scale.minimum} — `}<span lang=${this.definition.language} dir="auto">${e.lowAnchor}</span></span>
          <span>${i?c:`${this.definition.scale.maximum} — `}<span lang=${this.definition.language} dir="auto">${e.highAnchor}</span></span>
        </div>
        <div class=${`rating-grid${i?" semantic-differential-grid":n?" fully-labelled-rating-grid":""}`}>
          ${this.ratingValues.map(s=>{const a=`rating-${e.id}-${s}`,r=this.ratingOptionLabel(e,s),l=this.visibleResponseLabel(e,s);return o`
              <label
                class="rating-option"
                for=${a}
                data-gaze-target
                data-gaze-label=${r}
              >
                <input
                  id=${a}
                  type="radio"
                  name=${`rating-${e.id}`}
                  value=${s}
                  .required=${s===this.definition.scale.minimum}
                  .checked=${t===s}
                  aria-label=${r}
                  @change=${()=>this.selectRating(e.id,s,"standard-scale")}
                />
                <span class="rating-option-content">
                  ${i?o`<span class="semantic-position-dot" aria-hidden="true"></span>`:o`<strong>${s}</strong>`}
                  ${l?o`<small lang=${this.definition.language} dir="auto">${l}</small>`:c}
                </span>
                ${t===s?o`<span class="selected-marker selected-check" aria-hidden="true">✓</span>`:c}
              </label>
            `})}
        </div>
      </fieldset>
    `}renderSmileyResponse(e,t){return o`
      <fieldset class="smiley-response">
        <legend>Rate ${e.name} with a smiley landmark</legend>
        <p id=${`smiley-help-${e.id}`}>
          Each face is one official value. Facial expression may imply good or bad, so this route is experimental.
        </p>
        <div class="smiley-grid">
          ${this.smileyLandmarks.map(({value:i,cue:n})=>{const s=`smiley-${e.id}-${i}`;return o`
              <label
                class="smiley-option"
                for=${s}
                data-gaze-target
                data-gaze-label=${`${i} for ${e.name}`}
              >
                <input
                  id=${s}
                  type="radio"
                  name=${`smiley-${e.id}`}
                  value=${i}
                  .required=${i===this.smileyLandmarks[0]?.value}
                  .checked=${t===i}
                  aria-label=${`${i}, ${this.landmarkLabel(e,i)}, for ${e.name}`}
                  aria-describedby=${`smiley-help-${e.id}`}
                  @change=${()=>this.selectRating(e.id,i,"smiley-landmark")}
                />
                <span class="smiley-option-content">
                  <span class="smiley-face" aria-hidden="true">${n}</span>
                  <strong>${i}</strong>
                  <small>${this.landmarkLabel(e,i)}</small>
                  ${t===i?o`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:c}
                </span>
              </label>
            `})}
        </div>
      </fieldset>
    `}renderPair(){const e=this.pairOrder[this.pairIndex],t=this.dimensionById.get(e.left),i=this.dimensionById.get(e.right),n=this.pairResponses[e.id];return o`
      <section class="panel" id="question-panel" aria-labelledby="pair-heading">
        <p class="step-label">Comparison ${this.pairIndex+1} of ${this.pairOrder.length}</p>
        <h2 id="pair-heading">${this.definition.pairwise.prompt}</h2>
        <p class="pair-instruction">
          ${this.definition.pairwise.instruction}
        </p>

        ${this.renderPairHelp(t,i)}
        <fieldset class="choice-fieldset">
          <legend>Choose one factor</legend>
          ${this.renderPairChoice(e.id,t,n===t.id)}
          ${this.renderPairChoice(e.id,i,n===i.id)}
        </fieldset>

        ${this.renderVoiceInput("pair",t,i)}
        ${this.renderNavigation(!0,"pair")}
      </section>
    `}renderPairChoice(e,t,i){const n=`${e}-${t.id}`;return o`
      <label
        class="choice-card"
        for=${n}
        data-gaze-target
        data-gaze-label=${t.name}
      >
        <input
          id=${n}
          type="radio"
          name=${e}
          value=${t.id}
          required
          .checked=${i}
          @change=${()=>this.selectPair(e,t.id,"standard-choice")}
        />
        <span>
          <strong>${t.name}</strong>
          ${this.showSimpleLanguage?o`<small>${t.shortMeaning}</small>`:c}
        </span>
        ${i?o`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:c}
      </label>
    `}renderPairHelp(e,t){return this.definition.supports.simplerExplanations?this.showSimpleLanguage?o`<p class="simple-pair-prompt">In simpler words: ${this.definition.pairwise.simplePrompt}</p>`:o`
      <details
        class="optional-explanation pair-help"
        @toggle=${i=>this.speakOpenedHelp(i,`Simpler explanations. ${e.name}: ${e.simpleExplanation} ${t.name}: ${t.simpleExplanation}`)}
      >
        <summary>Need help with these factor names?</summary>
        <div class="explanation-grid">
          ${[e,t].map(i=>o`
              <div class="explanation-block">
                <h3>${i.name}</h3>
                <p>${i.simpleExplanation}</p>
              </div>
            `)}
        </div>
      </details>
    `:c}renderVoiceInput(e,t,i){if(!this.voiceInputAvailable)return c;const n=!!(window.SpeechRecognition??window.webkitSpeechRecognition),s=this.pendingVoiceAnswer?.context===e,a=e==="rating"?this.ratingVoicePrompt(t):`Say “${t.name}” or “${i.name}”.`;return o`
      <details class="voice-input" .open=${this.voiceState!=="idle"}>
        <summary>Answer this question by voice</summary>
        <div class="voice-input-content">
          <p>${a}</p>
          <p class="support-boundary">
            Voice input uses English recognition. Say one shown number in English. For an English questionnaire,
            you may instead say one complete visible answer label. When the browser supports contextual speech
            hints, the current visible answers are supplied to improve recognition. Non-English answer labels are
            not recognised. Voice is optional, this prototype does not store audio, and the visible answer buttons
            remain available.
          </p>
          <button
            class="secondary-button large-answer-button"
            type="button"
            data-voice-start
            ?disabled=${!n||this.voiceState==="listening"}
            @click=${()=>this.startVoiceInput(e,t,i)}
          >
            ${this.voiceState==="listening"?"Listening…":"Start voice input"}
          </button>
          ${n?c:o`<p role="status">
                Built-in voice recognition is unavailable in this browser. System voice control can still activate
                the visible buttons by name.
              </p>`}
          ${this.voiceMessage?o`<p role="status" aria-live="polite" aria-atomic="true">${this.voiceMessage}</p>`:c}
          ${s&&this.pendingVoiceAnswer?o`
                <div class="voice-confirmation">
                  <p>I heard: <strong lang=${this.definition.language} dir="auto">${this.pendingVoiceAnswer.transcript}</strong></p>
                  <p>Proposed answer: <strong lang=${this.definition.language} dir="auto">${this.pendingVoiceAnswer.label}</strong></p>
                  <p>
                    <strong>Check before confirming:</strong> continue only if both lines match what you intended.
                    Speech recognition can omit a word.
                  </p>
                  <div class="button-row compact">
                    <button
                      class="primary-button large-answer-button"
                      type="button"
                      data-voice-confirm
                      @click=${this.confirmVoiceAnswer}
                    >
                      Confirm ${this.pendingVoiceAnswer.label}
                    </button>
                    <button class="secondary-button" type="button" @click=${this.clearVoiceAnswer}>Try again</button>
                  </div>
                </div>
              `:c}
        </div>
      </details>
    `}renderNavigation(e,t){const i=t==="rating"&&this.ratingIndex===this.dimensions.length-1,n=t==="pair"&&this.pairIndex===this.pairOrder.length-1,s=t==="rating"&&this.editingRatingFromReview?"Save change and return to review":i?this.pairOrder.length?"Continue to comparisons":"Review responses":n?"Review responses":"Next question",a=t==="rating"&&this.editingRatingFromReview?"Cancel change and return to review":"Previous question";return o`
      <div class="button-row">
        <button
          class="secondary-button large-answer-button"
          type="button"
          data-gaze-target
          data-gaze-label=${a}
          ?disabled=${!e&&!this.editingRatingFromReview}
          @click=${this.goBack}
        >
          ${a}
        </button>
        <button
          class="primary-button large-answer-button"
          type="button"
          data-gaze-target
          data-gaze-label=${s}
          @click=${()=>this.goNext(t)}
        >
          ${s}
        </button>
      </div>
    `}renderReview(){return o`
      <section class="panel" id="question-panel" aria-labelledby="review-heading">
        <h2 id="review-heading">Review your responses</h2>
        <p>Check every response before calculating the ${this.definition.scoring.scoreName.toLowerCase()}.</p>

        ${this.hostSubmissionFailed&&this.submittedRecord?o`
              <section class="submission-recovery" aria-labelledby="submission-recovery-heading">
                <h3 id="submission-recovery-heading">The study platform has not confirmed this response</h3>
                <p>
                  Your answers remain available on this page. You can retry submission, return to an answer,
                  or save a backup now.
                </p>
                ${this.completionSavedLocally?o`<p>A complete backup is also stored in this browser on this device.</p>`:o`<p>
                      This browser could not store a backup. Download JSON or CSV before leaving this page.
                    </p>`}
                <div class="button-row compact">
                  <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultJson}>
                    Download JSON backup
                  </button>
                  <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultCsv}>
                    Download CSV backup
                  </button>
                </div>
              </section>
            `:c}

        <h3>Item responses</h3>
        <div class="review-ratings">
          ${this.dimensions.map((e,t)=>o`
              <section
                class="review-rating-card"
                id=${`review-item-${t+1}`}
                role="group"
                tabindex="-1"
                aria-labelledby=${`review-item-label-${t+1}`}
                aria-describedby=${`review-item-answer-${t+1}`}
              >
                <h4 class="review-rating-label" id=${`review-item-label-${t+1}`}>
                  <strong>${e.name}</strong>
                  <span class="review-item-prompt" lang=${this.definition.language} dir="auto">
                    ${e.prompt}
                  </span>
                </h4>
                <div class="review-rating-answer">
                  <p id=${`review-item-answer-${t+1}`}>
                    <strong>Selected answer: ${this.reviewRatingLabel(e)}</strong>
                    ${this.renderReviewRatingScaleContext(e)}
                  </p>
                  <small>Input route: ${this.ratingRouteLabel(e.id)}</small>
                  <button
                    class="secondary-button large-answer-button"
                    type="button"
                    data-gaze-target
                    data-gaze-label=${`Change item ${t+1} answer`}
                    aria-label=${`Change item ${t+1} answer. ${e.name}. Current answer: ${this.reviewRatingAccessibleLabel(e)}`}
                    @click=${()=>this.editRatingFromReview(t)}
                  >
                    Change item ${t+1} answer
                  </button>
                </div>
              </section>
            `)}
        </div>

        ${this.pairOrder.length?o`<h3>Pairwise comparisons</h3>
              <ol class="review-list">
                ${this.pairOrder.map(e=>{const t=this.dimensionById.get(e.left),i=this.dimensionById.get(e.right),n=this.dimensionById.get(this.pairResponses[e.id]);return o`<li>${t.name} or ${i.name}: <strong>${n.name}</strong></li>`})}
              </ol>`:c}

        <div class="button-row review-actions">
          <button
            class="secondary-button large-answer-button"
            type="button"
            data-gaze-target
            data-gaze-label="Return to ratings"
            @click=${this.returnToRatings}
          >
            Return to ratings
          </button>
          ${this.pairOrder.length?o`<button
                class="secondary-button large-answer-button"
                type="button"
                data-gaze-target
                data-gaze-label="Return to comparisons"
                @click=${this.returnToPairs}
              >
                Return to comparisons
              </button>`:c}
          <button
            class="primary-button large-answer-button"
            type="button"
            data-gaze-target
            data-gaze-label="Calculate and submit responses"
            ?disabled=${this.submittingResult}
            @click=${this.submitResponses}
          >
            ${this.submittingResult?"Submitting responses…":"Calculate and submit responses"}
          </button>
        </div>
      </section>
    `}renderComplete(){if(!this.result||!this.submittedRecord)return c;const e=!this.studyConfig||this.studyConfig.showScoreToParticipant;return o`
      <section class="panel confirmation" id="question-panel" aria-labelledby="complete-heading">
        <h2 id="complete-heading">${this.studyConfig&&this.completionStagedByBridge&&!this.remoteRecordingUnconfirmed?"Submitting response":this.studyConfig?"Result prepared":"Responses calculated"}</h2>
        ${e?o`<p class="score">
              ${this.result.scoreName}:
              <strong>${this.result.primaryScore.toFixed(2)}</strong>
              out of ${this.result.scoreMaximum}
            </p>`:o`<p>Your responses have been prepared. The study configuration does not display the calculated score on the participant page.</p>`}
        ${this.studyConfig?this.remoteRecordingUnconfirmed?o`<div
                class="error-summary"
                id="remote-recording-error"
                role="alert"
                tabindex="-1"
              >
                <h3>Qualtrics did not confirm this response</h3>
                <p>
                  The completed answers are still available in the backup on this device, but the
                  Qualtrics completion page did not open. Reconnect to the internet, keep or download
                  one backup, and use the restored Qualtrics Next button to try the submission again.
                </p>
                <p>Tell the study conductor if the Qualtrics completion page still does not appear.</p>
              </div>`:this.completionStagedByBridge?o`<div class="save-status">
                <h3>Waiting for Qualtrics</h3>
                <p>The survey page received the response data. Keep this page open while Qualtrics continues.</p>
                ${this.completionSavedLocally?c:o`<p>
                      This browser could not keep a backup copy. If the Qualtrics completion page does not
                      appear, use the JSON or CSV backup button below before closing the page.
                    </p>`}
              </div>`:this.completionSavedLocally?o`<div class="save-status" role="status">
                <h3>Saved on this device</h3>
                <p>
                  The completed record is stored only in this browser. It has not been sent to GitHub or to a server.
                  The study conductor must export it from the study setup page before browser data are cleared.
                </p>
              </div>`:o`<div class="error-summary" role="alert">
                <h3>The browser could not save the completed record</h3>
                <p>Use the JSON or CSV backup button below and give the file to the study conductor through the approved study procedure.</p>
              </div>`:o`<p>No response, audio or webcam video has been uploaded. Demonstration results are not retained after this page is closed.</p>`}
        <p>Support and input-route metadata remain separate from the questionnaire score.</p>
        ${!this.studyConfig||!this.completionStagedByBridge||this.remoteRecordingUnconfirmed?this.renderCompletionReadAloudControl():c}
        ${this.studyConfig?c:o`<details>
              <summary>Show the complete result record</summary>
              <pre>${JSON.stringify(this.submittedRecord,null,2)}</pre>
            </details>`}
        ${this.studyConfig&&this.completionStagedByBridge?o`<aside class="submission-fallback" aria-labelledby="submission-fallback-heading">
              <h3 id="submission-fallback-heading">If this page does not continue</h3>
              <p>
                Wait for the error instructions. If an error appears, keep this page open or use one backup
                button before closing it.
              </p>
              <div class="button-row compact">
                <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultJson}>
                  Download JSON backup
                </button>
                <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultCsv}>
                  Download CSV backup
                </button>
              </div>
            </aside>`:o`<div class="button-row compact">
              <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultJson}>
                Download JSON backup
              </button>
              <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultCsv}>
                Download CSV backup
              </button>
              ${this.studyConfig?c:o`<button class="secondary-button large-answer-button" type="button" @click=${this.restart}>Start again</button>`}
            </div>`}
        ${this.studyConfig?this.completionStagedByBridge&&!this.remoteRecordingUnconfirmed?c:o`<p>
              <strong>Participant:</strong>
              ${this.remoteRecordingUnconfirmed?"reconnect to the internet and use the restored Qualtrics Next button. Keep or download a backup until the Qualtrics completion page appears.":"please return the device or completion notice to the study conductor."}
            </p>`:c}
      </section>
    `}announceSavedSessionOffer(e){const t=`${e.configId}:${e.participantCode}:${e.savedAt}`;if(this.savedSessionAnnouncementKey===t)return;this.savedSessionAnnouncementKey=t;const i=this.savedSessionOfferSpeech(e);this.statusMessage="",this.updateComplete.then(()=>{const n=this.savedSession;if(!n||n.savedAt!==e.savedAt||n.configId!==e.configId||n.participantCode!==e.participantCode)return;const s=this.querySelector("#saved-session-offer");s&&S(s,{block:"center",forceCoordinateScroll:!0,onReveal:()=>this.requestParentReveal(s)}),window.setTimeout(()=>{const a=this.savedSession;!this.isConnected||!a||a.savedAt!==e.savedAt||a.configId!==e.configId||a.participantCode!==e.participantCode||(this.statusMessage=i,this.audioGuidance&&this.speakText(i))},650)})}savedSessionOfferSpeech(e){return`Saved questionnaire found. ${Object.keys(e.ratings).length+Object.keys(e.pairResponses).length} of ${this.dimensions.length+this.pairs.length} responses are saved in this browser. Resume saved questionnaire. Erase saved answers.`}renderSavedSessionOffer(){if(!this.savedSession)return c;const e=Object.keys(this.savedSession.ratings).length+Object.keys(this.savedSession.pairResponses).length;return o`
      <aside
        id="saved-session-offer"
        class="saved-session"
        role="region"
        tabindex="-1"
        aria-labelledby="saved-session-heading"
        aria-describedby="saved-session-count saved-session-actions"
      >
        <h3 id="saved-session-heading">Saved questionnaire found</h3>
        <p id="saved-session-count">
          ${e} of ${this.dimensions.length+this.pairs.length} responses are saved in this browser.
        </p>
        <p id="saved-session-actions">
          Resume saved questionnaire. Erase saved answers.
        </p>
        <div class="button-row compact">
          <button
            id="resume-saved-questionnaire"
            class="primary-button large-answer-button"
            type="button"
            aria-describedby="saved-session-count saved-session-actions"
            @click=${this.restoreSavedSession}
          >
            Resume saved questionnaire
          </button>
          <button class="secondary-button" type="button" @click=${this.repeatSavedSessionOffer}>
            Hear saved-progress message
          </button>
          <button class="secondary-button" type="button" @click=${this.eraseSavedSession}>Erase saved answers</button>
        </div>
      </aside>
    `}renderCompletedBackupOffer(){const e=this.recoveredCompletedRecord;return e?o`
      <aside class="saved-session completed-backup" aria-labelledby="completed-backup-heading">
        <h3 id="completed-backup-heading" tabindex="-1">A completed backup was found on this device</h3>
        <p>
          Submission <strong>${e.submissionId}</strong> was prepared for this participant code.
          This local copy does not prove that Qualtrics recorded the response.
        </p>
        <p>
          Do not repeat the questionnaire unless the study conductor asks you to. Keep or download
          this backup so the response can be checked safely.
        </p>
        <div class="button-row compact">
          <button
            class="primary-button large-answer-button"
            type="button"
            @click=${()=>this.downloadRecordJson(e)}
          >
            Download recovered JSON
          </button>
          <button
            class="secondary-button large-answer-button"
            type="button"
            @click=${()=>this.downloadRecordCsv(e)}
          >
            Download recovered CSV
          </button>
        </div>
      </aside>
    `:c}renderResumeSummary(){return o`
      <aside class="resume-summary" aria-labelledby="resume-heading">
        <h2 id="resume-heading" tabindex="-1">Welcome back — here is where you stopped</h2>
        <dl class="resume-details">
          <div><dt>Completed</dt><dd>${this.completedCount()} of ${this.dimensions.length+this.pairs.length} responses</dd></div>
          <div><dt>Last saved response</dt><dd>${this.lastSavedDescription()}</dd></div>
          <div><dt>Current position</dt><dd>${this.currentPositionDescription()}</dd></div>
          <div><dt>Next action</dt><dd>${this.nextActionDescription()}</dd></div>
        </dl>
        <p>Your current answers are saved in this browser.</p>
        <div class="button-row compact">
          <button class="primary-button large-answer-button" type="button" @click=${this.dismissResumeSummary}>
            Continue from here
          </button>
          <button class="secondary-button" type="button" @click=${this.restart}>
            Erase answers and start again
          </button>
        </div>
      </aside>
    `}setSimpleLanguage(e){const t=e.currentTarget.checked;this.recordSupportChange("simpler-explanations",this.showSimpleLanguage,t),this.showSimpleLanguage=t,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(t?this.currentSimpleExplanationSpeech():this.isResearcherSuppliedDefinition?"Simpler explanations are off. The questionnaire item wording remains available.":"Simpler explanations are off. The official questionnaire wording remains available.")}recordSupportChange(e,t,i){!this.studyConfig||t===i||this.stage==="complete"||(this.supportChanges=[...this.supportChanges,{setting:e,from:t,to:i,stage:this.stage,changedAt:new Date().toISOString()}])}setAnswerMode(e){e==="smiley"&&!this.definition.supports.smileyLandmarks||(this.recordSupportChange("answer-mode",this.answerMode,e),this.answerMode=e,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(e==="smiley"?"Smiley landmark answer format selected. Each rating offers five labelled values, with the full precise scale available on request.":`Standard answer format selected. Each rating uses ${this.ratingValues.length} values from ${this.definition.scale.minimum} to ${this.definition.scale.maximum} in steps of ${this.definition.scale.step}.`))}setLargeText(e){this.recordSupportChange("text-size",this.largeText?"large":"standard",e?"large":"standard"),this.largeText=e,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(`${e?"Large":"Standard"} text selected.`)}setRecovery(e){const t=e.currentTarget.checked;this.recordSupportChange("interruption-recovery",this.recoveryEnabled,t),this.recoveryEnabled=t,this.invalidatePendingSubmission(),this.recoveryEnabled?(this.rememberParticipantCodeForTab(),this.persistProgress()):(this.forgetParticipantCodeForTab(),this.clearSavedProgress()),this.announceAutomatic(t?"Interruption recovery is on. Incomplete answers will be stored in this browser.":"Interruption recovery is off. The saved in-progress copy has been removed.")}landmarkLabel(e,t){const i=this.smileyLandmarks.find(n=>n.value===t)?.position;return i==="low"?e.lowAnchor:i==="closer-low"?`Closer to ${e.lowAnchor}`:i==="middle"?"Middle":i==="closer-high"?`Closer to ${e.highAnchor}`:i==="high"?e.highAnchor:String(t)}ratingValueLabel(e,t){const i=e.responseLabels?.[String(t)];return i&&i!==String(t)?i:t===this.definition.scale.minimum?e.lowAnchor:t===this.definition.scale.maximum?e.highAnchor:null}visibleResponseLabel(e,t){const i=e.responseLabels?.[String(t)];if(!i||i===String(t))return null;const n=t===this.definition.scale.minimum?e.lowAnchor:t===this.definition.scale.maximum?e.highAnchor:null,s=a=>a.replace(/\s+/g," ").trim();return n&&s(i)===s(n)?null:i}ratingOptionLabel(e,t){if(this.definition.scale.type==="semantic-differential"){const n=this.ratingValues.indexOf(t)+1,s=this.ratingValueLabel(e,t);return s?`Position ${n} of ${this.ratingValues.length}, ${s}, for ${e.name}`:`Position ${n} of ${this.ratingValues.length}, between ${e.lowAnchor} and ${e.highAnchor}, for ${e.name}`}const i=this.ratingValueLabel(e,t);return i?`${t}, ${i}, for ${e.name}`:`${t} for ${e.name}`}ratingVoicePrompt(e){if(this.answerMode!=="smiley"){const s=`For the clearest recognition, say “number ${this.ratingValues[Math.min(3,this.ratingValues.length-1)]}”, using any value shown from ${this.definition.scale.minimum} to ${this.definition.scale.maximum} in steps of ${this.definition.scale.step}. Other numbers are not rounded or guessed.`;return this.ratingValues.flatMap(r=>{const l=e.responseLabels?.[String(r)];return l?[`${r}, ${l}`]:[]}).length>0&&E(this.definition.language)?`${s} You may instead say one complete visible answer label.`:this.definition.scale.type==="magnitude"?s:`${s} You may instead say the exact visible endpoint label: ${e.lowAnchor} or ${e.highAnchor}.`}const t=this.smileyLandmarks.map(({value:n})=>this.landmarkLabel(e,n)),i=this.smileyLandmarks.map(({value:n})=>n);return`For the most reliable voice input, say one shown value: ${i.slice(0,-1).join(", ")}, or ${i.at(-1)}. You may instead say one visible label: ${t.slice(0,-1).join(", ")}, or ${t.at(-1)}. On a phone, use the number if a short label such as Low is not recognised.`}ratingVoiceAnswerLabel(e,t){const i=this.answerMode==="smiley"&&this.smileyLandmarks.some(s=>s.value===t),n=this.ratingValueLabel(e,t);return i?`${this.landmarkLabel(e,t)}, value ${t}, for ${e.name}`:n?`${n}, value ${t}, for ${e.name}`:`${t} for ${e.name}`}ratingRouteLabel(e){const t=this.ratingInputRoutes[e];return t==="smiley-landmark"?"smiley landmark":t==="voice"?"voice, confirmed":t==="gaze-standard-scale"?"gaze, standard scale, confirmed":t==="gaze-smiley-landmark"?"gaze, smiley landmark, confirmed":"full scale"}reviewRatingLabel(e){const t=this.ratings[e.id];if(t===void 0)return"No answer";const i=this.ratingValueLabel(e,t);if(this.definition.scale.type==="semantic-differential"){const n=`Position ${this.ratingValues.indexOf(t)+1} of ${this.ratingValues.length}`;return i?`${n} — ${i}`:n}return i?`${t} — ${i}`:String(t)}reviewRatingScaleContextText(e){const t=this.ratings[e.id];return t===void 0||this.ratingValueLabel(e,t)?null:this.definition.scale.type==="semantic-differential"?`Scale endpoints: ${e.lowAnchor} to ${e.highAnchor}`:`Scale: ${this.definition.scale.minimum} — ${e.lowAnchor} to ${this.definition.scale.maximum} — ${e.highAnchor}`}renderReviewRatingScaleContext(e){return this.reviewRatingScaleContextText(e)?this.definition.scale.type==="semantic-differential"?o`<span class="review-scale-context">
        Scale endpoints:
        <span lang=${this.definition.language} dir="auto">${e.lowAnchor}</span>
        to
        <span lang=${this.definition.language} dir="auto">${e.highAnchor}</span>
      </span>`:o`<span class="review-scale-context">
      Scale: ${this.definition.scale.minimum} —
      <span lang=${this.definition.language} dir="auto">${e.lowAnchor}</span>
      to ${this.definition.scale.maximum} —
      <span lang=${this.definition.language} dir="auto">${e.highAnchor}</span>
    </span>`:c}reviewRatingAccessibleLabel(e){const t=this.reviewRatingLabel(e),i=this.reviewRatingScaleContextText(e);return i?`${t}. ${i}`:t}selectRating(e,t,i){i!=="voice"&&this.voiceState!=="idle"&&this.clearVoiceAnswer();const n=this.gazeActivationInProgress?i==="smiley-landmark"?"gaze-smiley-landmark":"gaze-standard-scale":i;if(this.editingRatingFromReview){const l=this.reviewRatingEdit;if(!l||l.itemId!==e||l.itemIndex!==this.ratingIndex){this.showError("This review edit is no longer valid. Return to the review and open the answer again.");return}this.reviewRatingEdit={...l,pendingValue:t,pendingInputRoute:n}}else this.invalidatePendingSubmission(),this.ratings={...this.ratings,[e]:t},this.ratingInputRoutes={...this.ratingInputRoutes,[e]:n};this.clearError();const s=this.dimensionById.get(e),a=this.answerMode==="smiley"&&this.smileyLandmarks.some(l=>l.value===t),r=this.ratingValueLabel(s,t);this.statusMessage=a?`${s.name}, ${this.landmarkLabel(s,t)}, value ${t}, selected.`:r?`${s.name}, ${r}, value ${t}, selected.`:`${s.name}, ${t}, selected.`,this.announceAutomatic(this.statusMessage),this.editingRatingFromReview||this.persistProgress()}selectPair(e,t,i){i!=="voice"&&this.voiceState!=="idle"&&this.clearVoiceAnswer(),this.invalidatePendingSubmission();const n=this.gazeActivationInProgress?"gaze":i;this.pairResponses={...this.pairResponses,[e]:t},this.pairInputRoutes={...this.pairInputRoutes,[e]:n},this.clearError(),this.statusMessage=`${this.dimensionById.get(t).name} selected.`,this.announceAutomatic(this.statusMessage),this.persistProgress()}goNext(e){if(this.stopReading(),this.clearVoiceAnswer(),e==="rating"){const t=this.dimensions[this.ratingIndex],i=this.editingRatingFromReview?this.reviewRatingEdit:null;if((i?.itemId===t.id?i.pendingValue:this.ratings[t.id])===void 0){this.showError(`Choose a rating for ${t.name} before continuing.`);return}if(this.editingRatingFromReview){if(!i||i.itemId!==t.id||i.itemIndex!==this.ratingIndex){this.showError("This review edit is no longer valid. Return to the review and open the answer again.");return}const s=this.reviewReturnFocusIndex??this.ratingIndex,a=i.pendingValue!==i.originalValue||i.pendingInputRoute!==i.originalInputRoute;if(a){this.invalidatePendingSubmission(),this.ratings={...this.ratings,[t.id]:i.pendingValue};const r={...this.ratingInputRoutes};i.pendingInputRoute===void 0?delete r[t.id]:r[t.id]=i.pendingInputRoute,this.ratingInputRoutes=r}this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.stage="review",this.clearError(),this.persistProgress(),this.focusReviewItem(s,a?`${this.dimensions[s].name} answer updated.`:`${this.dimensions[s].name} answer unchanged.`);return}this.ratingIndex<this.dimensions.length-1?this.ratingIndex+=1:this.pairOrder.length?(this.stage="pairs",this.pairIndex=0):this.stage="review"}else{const t=this.pairOrder[this.pairIndex];if(!this.pairResponses[t.id]){this.showError("Choose which factor contributed more to workload before continuing.");return}this.pairIndex<this.pairOrder.length-1?this.pairIndex+=1:this.stage="review"}this.clearError(),this.persistProgress(),this.focusHeading()}editRatingFromReview(e){const t=this.dimensions[e],i=this.ratings[t.id];if(i===void 0){this.showError(`${t.name} has no saved answer to edit.`);return}this.editingRatingFromReview=!0,this.reviewRatingEdit={itemIndex:e,itemId:t.id,originalValue:i,originalInputRoute:this.ratingInputRoutes[t.id],pendingValue:i,pendingInputRoute:this.ratingInputRoutes[t.id]},this.reviewReturnFocusIndex=e,this.stage="ratings",this.ratingIndex=e,this.focusHeading()}focusReviewItem(e,t){this.updateComplete.then(()=>{const i=this.querySelector(`#review-item-${e+1}`);if(this.reviewReturnFocusIndex=null,!i){this.focusHeading();return}S(i,{block:"center",onReveal:()=>this.requestParentReveal(i)}),this.statusMessage=`${t} ${this.reviewRatingAccessibleLabel(this.dimensions[e])}`,this.announceAutomatic(this.statusMessage)})}effectiveStudyConfig(){return this.studyConfig?this.studyConfig:{schemaVersion:4,configId:"demo-config",createdAt:this.startedAt||new Date().toISOString(),prototypeVersion:V,instrumentId:this.definition.id,definitionHash:pe(this.definition),studyId:"DEMO",studyTitle:"Technical demonstration",taskLabel:"a task completed before the questionnaire",showScoreToParticipant:!0,support:{showSimpleLanguage:!1,answerMode:"standard",largeText:!1,audioGuidance:!1,recoveryEnabled:!1,participantAdjustmentPolicy:"presentation-only",voiceInputAvailable:!0,gazeInputAvailable:!0},collection:{mode:"local"}}}currentSupportMetadata(){return{simplerExplanationsShownAtSubmission:this.showSimpleLanguage,largeTextUsedAtSubmission:this.largeText,answerModeAtSubmission:this.answerMode,recoveryEnabledAtSubmission:this.recoveryEnabled,interruptionSummaryShown:this.interruptionSummaryShown,readAloudUsed:this.readAloudUsed,automaticAudioGuidanceEnabledAtSubmission:this.audioGuidance,gazeUsed:this.gazeUsed,gazeActionCount:this.gazeActionCount,gazeEngine:this.gazeUsed?`WebGazer ${P}`:null,ratingInputRoutes:this.ratingInputRoutes,pairInputRoutes:this.pairInputRoutes,supportChanges:[...this.supportChanges]}}downloadRecordJson(e){F(`${D(e)}.json`,JSON.stringify(e,null,2),"application/json")}downloadRecordCsv(e){F(`${D(e)}.csv`,`\uFEFF${ge([e])}`,"text/csv")}invalidatePendingSubmission(){this.submittedRecord&&this.completionSavedLocally&&!this.completionStagedByBridge&&me(this.submittedRecord.submissionId),this.result=null,this.submittedRecord=null,this.completionSavedLocally=!1,this.completionStagedByBridge=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1}announceAutomatic(e){this.audioGuidance&&e.trim()&&this.speakText(e)}speakOpenedHelp(e,t){e.currentTarget.open&&this.announceAutomatic(t)}speakText(e){if(!("speechSynthesis"in window)||!("SpeechSynthesisUtterance"in window)){this.audioStatusMessage="Built-in audio is unavailable in this browser. External screen readers can still read the page.";return}const t=window.speechSynthesis,i=this.readingAloud||t.speaking||t.pending||t.paused,n=++this.speechRequestId,s=new SpeechSynthesisUtterance(e);s.lang="en-GB",s.rate=1,s.pitch=1,s.volume=1,s.onend=()=>{n===this.speechRequestId&&(this.readingAloud=!1,this.audioStatusMessage="Spoken guidance finished.")},s.onerror=r=>{if(n!==this.speechRequestId)return;this.readingAloud=!1;const l=r.error?` (${r.error})`:"";this.audioStatusMessage=`No audio was played because the browser reported a speech error${l}. Check the device volume and try the button again.`};const a=()=>{if(n===this.speechRequestId)try{t.speak(s),this.readingAloud=!0,this.readAloudUsed=!0,this.audioStatusMessage="Playing spoken guidance."}catch{this.readingAloud=!1,this.audioStatusMessage="Built-in audio could not start in this browser. Check the device volume and try the button again."}};i?(t.cancel(),window.setTimeout(a,0)):a()}stopReading(e=!1){this.speechRequestId+=1,"speechSynthesis"in window&&window.speechSynthesis.cancel(),this.readingAloud=!1,e&&(this.audioStatusMessage="Spoken guidance stopped.")}currentStepSpeech(){if(this.stage==="intro"){const t=this.studyConfig?`Think about ${this.studyConfig.taskLabel}.`:"",i=this.answerMode==="smiley"?"The rating format uses five labelled smiley landmarks. A precise scale is available on request.":`The rating format uses ${this.ratingValues.length} values from ${this.definition.scale.minimum} to ${this.definition.scale.maximum}.`,n=this.pairs.length?` Then make ${this.pairs.length} pairwise comparisons.`:"";return`Before you begin. ${this.definition.introPrompt} ${t} Answer ${this.dimensions.length} items. ${i}${n} Finally review and submit.`}if(this.stage==="ratings"){const t=this.dimensions[this.ratingIndex],i=this.showSimpleLanguage&&t.simpleExplanation?` Simpler explanation: ${t.simpleExplanation}`:"",n=this.answerMode==="smiley"?`Choose a smiley landmark: ${this.smileyLandmarks.map(({value:s})=>`${this.landmarkLabel(t,s)}, value ${s}`).join("; ")}. A more precise value is available on the full scale.`:`Rate from ${this.definition.scale.minimum}, ${t.lowAnchor}, to ${this.definition.scale.maximum}, ${t.highAnchor}, in steps of ${this.definition.scale.step}.`;return`Rating ${this.ratingIndex+1} of ${this.dimensions.length}. ${t.name}. Official item: ${t.prompt}.${i} ${n}`}if(this.stage==="pairs"){const t=this.pairOrder[this.pairIndex],i=this.dimensionById.get(t.left),n=this.dimensionById.get(t.right),s=this.showSimpleLanguage?` In simpler words, ${this.definition.pairwise.simplePrompt} ${i.name}: ${i.shortMeaning}. ${n.name}: ${n.shortMeaning}.`:"";return`Comparison ${this.pairIndex+1} of ${this.pairOrder.length}. ${this.definition.pairwise.prompt} ${this.definition.pairwise.instruction} Choose ${i.name} or ${n.name}.${s}`}return this.stage==="review"?`Review ${this.dimensions.length} item responses${this.pairs.length?` and ${this.pairs.length} comparisons`:""} before submitting.`:this.studyConfig&&this.remoteRecordingUnconfirmed?this.statusMessage.trim()||"Qualtrics could not confirm this response. Reconnect to the internet, then select Next to try again. Keep this page open or download one backup before closing it.":this.studyConfig&&this.completionStagedByBridge?"Waiting for Qualtrics. Keep this page open.":this.result?`Responses calculated.${!this.studyConfig||this.studyConfig.showScoreToParticipant?` ${this.result.scoreName}: ${this.result.primaryScore.toFixed(2)} out of ${this.result.scoreMaximum}.`:""} JSON and CSV backup buttons are available on this page.`:"Responses calculated."}currentSimpleExplanationSpeech(){if(this.stage==="ratings"){const e=this.dimensions[this.ratingIndex];return e.simpleExplanation?`Simpler explanation for ${e.name}. ${e.simpleExplanation} Use the ${this.isResearcherSuppliedDefinition?"declared":"official"} scale when choosing your response.`:"This questionnaire definition does not provide reworded item text."}if(this.stage==="pairs"){const e=this.pairOrder[this.pairIndex],t=this.dimensionById.get(e.left),i=this.dimensionById.get(e.right);return`In simpler words, ${this.definition.pairwise.simplePrompt} ${t.name}: ${t.shortMeaning}. ${i.name}: ${i.shortMeaning}.`}return"Simpler explanations are on. Official questionnaire wording remains visible."}resumeSummarySpeech(){return`Welcome back. ${this.completedCount()} of ${this.dimensions.length+this.pairs.length} responses completed. Last saved response: ${this.lastSavedDescription()}. Current position: ${this.currentPositionDescription()}. Next action: ${this.nextActionDescription()}`}async showGazePositioningStep(e){this.webgazer&&(this.restoreWebGazerPreviewContainer(),this.webgazer.showPredictionPoints(!1),this.webgazer.showVideoPreview(!0),this.webgazer.showFaceOverlay(!0),this.webgazer.showFaceFeedbackBox(!0),this.gazeState="positioning",this.gazeMessage=e,this.announceAutomatic(this.gazeMessage),await this.updateComplete,this.mountWebGazerPreview(),this.querySelector("#gaze-positioning-heading")?.focus())}mountWebGazerPreview(){const e=this.querySelector(".gaze-camera-preview-slot"),t=document.querySelector("#webgazerVideoContainer");!e||!t||(t.setAttribute("aria-hidden","true"),e.append(t))}restoreWebGazerPreviewContainer(){const e=document.querySelector("#webgazerVideoContainer");e&&e.parentElement!==document.body&&document.body.append(e)}handleGazePoint(e){if(this.gazeState!=="ready"||!e){this.resetGazeHover();return}const t=this.elementsAtGazePoint(e);if(this.gazePendingElement){const r=t.map(p=>p.closest("[data-gaze-confirm], [data-gaze-cancel]")).find(p=>p!==null)??null,l=r?.hasAttribute("data-gaze-confirm")?"confirm":r?.hasAttribute("data-gaze-cancel")?"cancel":null,m=this.gazeConfirmationTracker.update(l,performance.now());this.gazeDwellProgress=m.progress,m.activated&&l==="confirm"&&this.confirmGazeProposal(),m.activated&&l==="cancel"&&this.cancelGazeProposal();return}const i=t.map(r=>r.closest("[data-gaze-target]")).find(r=>r!==null)??null,n=i&&!i.matches(":disabled")?i:null;n!==this.gazeCandidateElement&&(this.resetGazeHover(),this.gazeCandidateElement=n);const s=n?.dataset.gazeLabel??n?.textContent?.trim()??null,a=this.gazeCandidateTracker.update(s,performance.now());this.setGazeHover(n,a.progress),n&&a.activated&&(this.gazePendingElement=n,this.gazePendingLabel=s??"selected control",this.gazeDwellProgress=0,this.resetGazeHover(),this.statusMessage=`${this.gazePendingLabel} proposed by gaze. Confirm or cancel.`,this.announceAutomatic(this.statusMessage))}elementsAtGazePoint(e){if(typeof document.elementsFromPoint=="function")return document.elementsFromPoint(e.x,e.y).filter(i=>i instanceof HTMLElement);const t=document.elementFromPoint(e.x,e.y);return t instanceof HTMLElement?[t]:[]}setGazeHover(e,t){this.gazeCandidateElement=e,this.gazeDwellProgress=t,e&&(e.classList.add("gaze-hover"),e.style.setProperty("--gaze-progress",`${t*100}%`))}resetGazeHover(){this.gazeCandidateTracker.reset(),this.gazeCandidateElement&&(this.gazeCandidateElement.classList.remove("gaze-hover"),this.gazeCandidateElement.style.removeProperty("--gaze-progress")),this.gazeCandidateElement=null,this.gazePendingElement||(this.gazeDwellProgress=0)}stopGazeInputInternal(e){const t=this.gazeState!=="off"||this.webgazer!==null;this.cancelGazeProposal(),this.resetGazeHover(),this.restoreWebGazerPreviewContainer(),this.releaseGazeResources(),this.gazeState="off",this.gazeMessage="Gaze input and camera stopped.",e&&t&&this.announceAutomatic(this.gazeMessage)}releaseGazeResources(){const e=this.webgazer;if(e){this.restoreWebGazerPreviewContainer();try{e.clearGazeListener()}catch{}try{e.removeMouseEventListeners()}catch{}try{e.stopVideo()}catch{}try{e.end()}catch{}Promise.resolve(e.clearData()).catch(()=>{}),this.webgazer=null}}startVoiceInput(e,t,i,n=!0){this.stopReading();const s=window.SpeechRecognition??window.webkitSpeechRecognition;if(!s)return;this.releaseRecognition(),this.pendingVoiceAnswer=null,this.voiceMessage="Listening for one answer.",this.voiceState="listening";const a=new s;this.recognition=a,a.lang="en-GB",a.continuous=!1,a.interimResults=!1;const r=n?this.configureVoiceHints(a,e,t,i):!1;a.maxAlternatives=5,a.onresult=l=>{if(this.recognition!==a)return;const m=l.results[0],p=[];for(let g=0;m&&g<m.length;g+=1){const y=m[g]?.transcript?.trim();y&&p.push(y)}if(e==="rating"){const g=qe(p,t,this.ratingValues,this.smileyLandmarks),y=E(this.definition.language)||g&&new RegExp("\\p{Number}|\\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\\b","iu").test(g.transcript)?g:null;if(y){this.releaseRecognition(a);const O=this.ratingVoiceAnswerLabel(t,y.value);this.pendingVoiceAnswer={context:e,transcript:y.transcript,value:y.value,label:O},this.voiceState="pending",this.voiceMessage=`Proposed answer: ${O}. Confirm only if the heard words and proposed answer match what you intended; otherwise try again.`,this.announceAutomatic(this.voiceMessage),this.updateComplete.then(()=>this.querySelector("[data-voice-confirm]")?.focus());return}}else{const g=Oe(p,[t,i]);if(g){this.releaseRecognition(a);const y=this.dimensionById.get(g.value).name;this.pendingVoiceAnswer={context:e,transcript:g.transcript,value:g.value,label:y},this.voiceState="pending",this.voiceMessage=`Proposed answer: ${y}. Confirm only if the heard words and proposed answer match what you intended; otherwise try again.`,this.announceAutomatic(this.voiceMessage),this.updateComplete.then(()=>this.querySelector("[data-voice-confirm]")?.focus());return}}this.releaseRecognition(a);const w=p.find(g=>ie(g))??p[0],f=w?` I heard “${w}”.`:"";this.showVoiceNotice(e==="rating"?`No answer was selected.${f} Try a short command such as “number four”, or use a visible answer button.`:`No answer was selected.${f} Say ${t.name} or ${i.name}, or use a visible answer button.`)},a.onerror=l=>{if(this.recognition===a){if(this.releaseRecognition(a),l.error==="phrases-not-supported"&&r){this.startVoiceInput(e,t,i,!1);return}this.showVoiceNotice(this.voiceRecognitionErrorMessage(l.error))}},a.onend=()=>{this.recognition===a&&(this.recognition=null,this.voiceState==="listening"&&this.showVoiceNotice("No answer was selected. Try again, or use a visible answer button."))};try{a.start()}catch{this.releaseRecognition(a),this.showVoiceNotice("Voice input is unavailable in this browser context. Use a visible answer button.")}}configureVoiceHints(e,t,i,n){const s=window.SpeechRecognitionPhrase;if(!s||!("phrases"in e))return!1;const a=t==="rating"?ke(i,this.ratingValues,this.smileyLandmarks,E(this.definition.language)):Ae([i,n]);try{return e.phrases=a.slice(0,120).map(r=>new s(r,4)),!0}catch{return!1}}voiceRecognitionErrorMessage(e){switch(e){case"not-allowed":case"service-not-allowed":return"Microphone or speech-service permission was not granted. Allow microphone access, or use the visible answer buttons.";case"language-not-supported":case"language-unavailable":return"English voice input is unavailable in this browser. Use a visible answer button.";case"no-speech":return"No speech was detected. Try again after the microphone starts listening, or use the visible answer buttons.";case"audio-capture":return"No working microphone was available. Check the selected microphone, or use the visible answer buttons.";case"network":return"The browser speech service could not connect. Check the network, try again, or use the visible answer buttons.";case"aborted":return"Voice input stopped before a result was returned. Try again, or use the visible answer buttons.";case"phrases-not-supported":return"Voice input is unavailable in this browser. Try again, or use a visible answer button.";default:return`Voice input is unavailable${e?` (${e})`:""}. Try again, or use a visible answer button.`}}showVoiceNotice(e){this.voiceState="error",this.voiceMessage=e,this.announceAutomatic(e)}releaseRecognition(e=this.recognition){if(e){this.recognition===e&&(this.recognition=null),e.onresult=null,e.onerror=null,e.onend=null;try{e.stop()}catch{}}}reloadForParticipantStudyLink(){window.location.reload()}currentProgressStorageKey(){const e=this.studyConfig?this.participantCode:"DEMO";return b(e)?fe(this.studyConfig?.configId??"demo-config",e):null}currentTabParticipantCodeKey(){return this.studyConfig?`accessible-questionnaire-v0.8-tab-participant:${this.studyConfig.configId}`:null}currentTabParticipantBindingKey(){return this.studyConfig?`accessible-questionnaire-v0.8-tab-participant-binding:${this.studyConfig.configId}`:null}rememberParticipantCodeForTab(e=!1){const t=this.currentTabParticipantCodeKey();if(!(!t||!this.recoveryEnabled||!b(this.participantCode)))try{if(sessionStorage.setItem(t,this.participantCode),e){const i=this.currentTabParticipantBindingKey();if(i){const n={version:1,linkParticipantCode:this.prefilledParticipantCode||null,activeParticipantCode:this.participantCode};sessionStorage.setItem(i,JSON.stringify(n))}}}catch{}}forgetParticipantCodeForTab(){const e=this.currentTabParticipantCodeKey();if(e)try{sessionStorage.removeItem(e);const t=this.currentTabParticipantBindingKey();t&&sessionStorage.removeItem(t)}catch{}}restoreParticipantCodeForTab(){const e=this.currentTabParticipantCodeKey();if(!(!e||!this.recoveryEnabled||this.invalidParticipantParameter))try{const t=this.currentTabParticipantBindingKey(),i=t?sessionStorage.getItem(t):null;if(i)try{const s=JSON.parse(i),a=this.prefilledParticipantCode||null;if(s.version===1&&(s.linkParticipantCode===null||typeof s.linkParticipantCode=="string"&&b(s.linkParticipantCode))&&typeof s.activeParticipantCode=="string"&&b(s.activeParticipantCode)&&typeof s.activeParticipantCode=="string"&&s.linkParticipantCode===a){this.participantCode!==s.activeParticipantCode&&(this.participantCode=s.activeParticipantCode,this.participantCodeRestoredForTab=!0,this.statusMessage="Participant code restored for this tab. Checking for interrupted answers.");return}}catch{}if(b(this.participantCode))return;const n=sessionStorage.getItem(e);if(!n||!b(n))return;this.participantCode=n,this.participantCodeRestoredForTab=!0,this.statusMessage="Participant code restored for this tab. Checking for interrupted answers."}catch{}}persistProgress(){if(!this.recoveryEnabled||!this.isInProgress())return;const e=this.currentProgressStorageKey();if(!e)return;const t={version:4,instrumentId:this.definition.id,questionnaireDefinition:this.definition,savedAt:Date.now(),startedAt:this.startedAt||new Date().toISOString(),configId:this.studyConfig?.configId??"demo-config",participantCode:this.studyConfig?this.participantCode:"DEMO",stage:this.stage,ratingIndex:this.ratingIndex,pairIndex:this.pairIndex,pairOrder:this.pairOrder,pairResponses:this.pairResponses,ratings:this.ratings,ratingInputRoutes:this.ratingInputRoutes,pairInputRoutes:this.pairInputRoutes,supportChanges:this.supportChanges,support:{answerMode:this.answerMode,showSimpleLanguage:this.showSimpleLanguage,largeText:this.largeText,audioGuidance:this.audioGuidance}};try{localStorage.setItem(e,JSON.stringify(t)),this.rememberParticipantCodeForTab(!0)}catch{this.statusMessage="Progress could not be saved by this browser.",this.announceAutomatic(this.statusMessage)}}applySavedRecoveryPresentation(e){this.canAdjustPresentationSupport&&(this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance)}findSavedSession(){const e=this.currentProgressStorageKey();if(!e)return;this.savedSessionProblem="";let t=null;try{let i=localStorage.getItem(e);if(!i&&this.definition.id===$){const a=this.studyConfig?this.participantCode:"DEMO";b(a)&&(t=`accessible-nasa-tlx-v0.7-progress:${this.studyConfig?.configId??"demo-config"}:${a}`,i=localStorage.getItem(t))}if(!i)return;const n=JSON.parse(i),s=this.normaliseSavedSession(n);if(this.validSavedSession(s)){if(t)localStorage.setItem(e,JSON.stringify(s)),localStorage.removeItem(t);else if(n&&typeof n=="object"&&!("questionnaireDefinition"in n))try{localStorage.setItem(e,JSON.stringify(s))}catch{}this.savedSession=s,this.savedSessionProblem="",this.applySavedRecoveryPresentation(s),this.announceSavedSessionOffer(s)}else t?this.savedSessionProblem="An older saved copy does not match this questionnaire and was not changed or deleted. Start this questionnaire again below.":(this.savedSessionProblem="The saved copy does not match this questionnaire and was not used. Start this questionnaire again below.",this.clearSavedProgress())}catch{t?this.savedSessionProblem="An older saved copy could not be read and was not changed or deleted. Start this questionnaire again below.":(this.savedSessionProblem="The saved copy could not be read and was not used. Start this questionnaire again below.",this.clearSavedProgress())}}normaliseSavedSession(e){if(!e||typeof e!="object")return null;const t=e;if(t.version===4){if("questionnaireDefinition"in t)return t;const i=G(t.instrumentId);return!i||i.id!==this.definition.id?null:{...t,questionnaireDefinition:i}}return t.version!==3||this.definition.id!==$?null:{...t,version:4,instrumentId:$,questionnaireDefinition:this.definition}}findCompletedBackup(){if(!this.studyConfig||!b(this.participantCode))return;const e=be().filter(t=>t.study.configId===this.studyConfig.configId&&t.participantCode===this.participantCode);this.recoveredCompletedRecord=e.at(-1)??null}validSavedSession(e){if(e?.version!==4||e.instrumentId!==this.definition.id||JSON.stringify(e.questionnaireDefinition)!==JSON.stringify(this.definition)||e.configId!==(this.studyConfig?.configId??"demo-config")||e.participantCode!==(this.studyConfig?this.participantCode:"DEMO")||!Number.isFinite(e.savedAt)||typeof e.startedAt!="string"||!["ratings","pairs","review"].includes(e.stage)||!Number.isInteger(e.ratingIndex)||e.ratingIndex<0||e.ratingIndex>=this.dimensions.length||!Number.isInteger(e.pairIndex)||e.pairIndex<0||e.pairIndex>=Math.max(1,this.pairs.length)||e.stage==="pairs"&&this.pairs.length===0||!Array.isArray(e.pairOrder)||!Array.isArray(e.supportChanges)||!e.ratings||typeof e.ratings!="object"||!e.pairResponses||typeof e.pairResponses!="object"||!e.ratingInputRoutes||typeof e.ratingInputRoutes!="object"||!e.pairInputRoutes||typeof e.pairInputRoutes!="object"||!e.support||typeof e.support!="object"||!["standard","smiley"].includes(e.support.answerMode)||typeof e.support.showSimpleLanguage!="boolean"||typeof e.support.largeText!="boolean"||e.support.audioGuidance!==void 0&&typeof e.support.audioGuidance!="boolean")return!1;const t=new Set(this.dimensions.map(({id:a})=>a)),i=new Set(this.ratingValues);if(Object.entries(e.ratings).some(([a,r])=>!t.has(a)||typeof r!="number"||!i.has(r))||Object.entries(e.ratingInputRoutes).some(([a,r])=>!t.has(a)||typeof r!="string"||!["standard-scale","smiley-landmark","voice","gaze-standard-scale","gaze-smiley-landmark"].includes(r)))return!1;const n=new Map(this.pairs.map(a=>[a.id,a])),s=new Set;for(const a of e.pairOrder){const r=n.get(a?.id);if(!r||r.left!==a.left||r.right!==a.right||s.has(a.id))return!1;s.add(a.id)}return!(s.size!==n.size||Object.entries(e.pairResponses).some(([a,r])=>{const l=n.get(a);return!l||r!==l.left&&r!==l.right})||Object.entries(e.pairInputRoutes).some(([a,r])=>!n.has(a)||typeof r!="string"||!["standard-choice","voice","gaze"].includes(r)))}clearSavedProgress(){const e=this.currentProgressStorageKey();if(e)try{localStorage.removeItem(e)}catch{}}isInProgress(){return this.stage==="ratings"||this.stage==="pairs"||this.stage==="review"}completedCount(){return Object.keys(this.ratings).length+Object.keys(this.pairResponses).length}lastSavedDescription(){if(this.stage==="ratings"){const e=this.ratings[this.dimensions[this.ratingIndex].id]!==void 0?this.ratingIndex:this.ratingIndex-1;return e>=0?`${this.dimensions[e].name} rating`:"No response yet"}return this.stage==="pairs"?this.pairResponses[this.pairOrder[this.pairIndex].id]?`Comparison ${this.pairIndex+1}`:this.pairIndex>0?`Comparison ${this.pairIndex}`:`${this.dimensions.at(-1)?.name??"Final item"} rating`:this.pairs.length?`Comparison ${this.pairs.length}`:`${this.dimensions.at(-1)?.name??"Final item"} rating`}currentPositionDescription(){return this.stage==="ratings"?`Rating ${this.ratingIndex+1} of ${this.dimensions.length}: ${this.dimensions[this.ratingIndex].name}`:this.stage==="pairs"?`Comparison ${this.pairIndex+1} of ${this.pairOrder.length}`:this.stage==="review"?"Review responses":"Questionnaire introduction"}nextActionDescription(){if(this.stage==="ratings")return`Choose or check the ${this.dimensions[this.ratingIndex].name} rating, then select Next.`;if(this.stage==="pairs"){const e=this.pairOrder[this.pairIndex];return`Choose ${this.dimensionById.get(e.left).name} or ${this.dimensionById.get(e.right).name}, then select Next.`}return"Check the saved answers, then submit or return to a question."}showError(e){this.errorMessage=e,this.updateComplete.then(()=>{const t=this.querySelector("#error-summary");t&&(S(t,{block:"start",forceCoordinateScroll:!0,onReveal:()=>this.requestParentReveal(t)}),this.announceAutomatic(`There is a problem. ${e}`))})}requestParentReveal(e){}clearError(){this.errorMessage=""}focusHeading(e=!0){this.updateComplete.then(()=>{window.scrollTo({top:0});const t=this.querySelector("#question-panel h2");t&&(t.tabIndex=-1,t.focus(),this.statusMessage=t.textContent?.trim()??"",e&&this.audioGuidance&&this.speakText(this.currentStepSpeech()))})}};h([u()],d.prototype,"stage",2);h([u()],d.prototype,"ratingIndex",2);h([u()],d.prototype,"pairIndex",2);h([u()],d.prototype,"pairOrder",2);h([u()],d.prototype,"pairResponses",2);h([u()],d.prototype,"ratings",2);h([u()],d.prototype,"ratingInputRoutes",2);h([u()],d.prototype,"pairInputRoutes",2);h([u()],d.prototype,"supportChanges",2);h([u()],d.prototype,"answerMode",2);h([u()],d.prototype,"showSimpleLanguage",2);h([u()],d.prototype,"largeText",2);h([u()],d.prototype,"recoveryEnabled",2);h([u()],d.prototype,"resumeSummaryVisible",2);h([u()],d.prototype,"savedSession",2);h([u()],d.prototype,"savedSessionProblem",2);h([u()],d.prototype,"recoveredCompletedRecord",2);h([u()],d.prototype,"readingAloud",2);h([u()],d.prototype,"readAloudUsed",2);h([u()],d.prototype,"audioGuidance",2);h([u()],d.prototype,"audioStatusMessage",2);h([u()],d.prototype,"interruptionSummaryShown",2);h([u()],d.prototype,"voiceState",2);h([u()],d.prototype,"voiceMessage",2);h([u()],d.prototype,"pendingVoiceAnswer",2);h([u()],d.prototype,"errorMessage",2);h([u()],d.prototype,"statusMessage",2);h([u()],d.prototype,"result",2);h([u()],d.prototype,"gazeState",2);h([u()],d.prototype,"gazeMessage",2);h([u()],d.prototype,"gazeCalibrationIndex",2);h([u()],d.prototype,"gazeCalibrationRepetition",2);h([u()],d.prototype,"gazePendingLabel",2);h([u()],d.prototype,"gazeDwellProgress",2);h([u()],d.prototype,"gazeUsed",2);h([u()],d.prototype,"gazeActionCount",2);h([u()],d.prototype,"studyConfig",2);h([u()],d.prototype,"configurationError",2);h([u()],d.prototype,"participantCode",2);h([u()],d.prototype,"participantCodeError",2);h([u()],d.prototype,"participantCodeRestoredForTab",2);h([u()],d.prototype,"editingRatingFromReview",2);h([u()],d.prototype,"reviewRatingEdit",2);h([u()],d.prototype,"startedAt",2);h([u()],d.prototype,"submittedRecord",2);h([u()],d.prototype,"completionSavedLocally",2);h([u()],d.prototype,"completionStagedByBridge",2);h([u()],d.prototype,"remoteRecordingUnconfirmed",2);h([u()],d.prototype,"hostSubmissionFailed",2);h([u()],d.prototype,"submittingResult",2);h([u()],d.prototype,"hostBridgeState",2);h([u()],d.prototype,"hostBridgeMessage",2);d=h([Z("accessible-nasa-tlx")],d);let K=class extends d{};K=h([Z("accessible-questionnaire")],K);
