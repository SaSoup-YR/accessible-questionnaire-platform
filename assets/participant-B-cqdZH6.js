import{r as be,s as ye,a as p,i as Pe,g as Y,D as x,v as $,b as Ee,c as Te,d as Le,f as A,e as Me,h as Oe,j as qe,k as ve,l as Ne,P as Z,A as c,m as o,q as Ve,n as X,o as ee,p as Ge,t as Be,u as _e,w as Fe,x as we}from"./shared-X-3JE5Gy.js";const De="accessible-questionnaire:qualtrics-submit:v2",Ue="accessible-questionnaire:qualtrics-receipt:v2",He="accessible-questionnaire:qualtrics-parent-ready:v2",je="accessible-questionnaire:qualtrics-child-ready:v2",Qe="accessible-questionnaire:qualtrics-advance-failed:v2",R="0.8.10-q10";function We(e=window){const t=e.accessibleQuestionnaireResultSink??e.accessibleNasaTlxResultSink;return!t||typeof t.name!="string"||!t.name.trim()||typeof t.submit!="function"?null:t}function Ke(e,t=window,i=()=>{},s=()=>{}){if(e.collection.mode!=="qualtrics")return null;const n=Je(e.collection.parentOrigin,t,i,s),a=Ye(e.collection.parentOrigin,t,12e3,()=>n.getState()==="connected");return t.accessibleQuestionnaireResultSink=a,t.accessibleNasaTlxResultSink=a,{sink:a,bridge:n}}function Je(e,t=window,i=()=>{},s=()=>{}){let n="connecting",a=null;const r=(d,g)=>{n==="connected"||n==="failed"&&d!=="connected"||(n=d,i({state:n,message:g}))},l=d=>{if(d.source!==t.parent||d.origin!==e)return;const g=d.data;if(g?.type===Qe){g.bridgeBuild===R&&typeof g.error=="string"&&g.error.trim()&&s(g.error);return}if(g?.type===He){if(g.protocolVersion!==2||g.bridgeBuild!==R){r("failed",`This Qualtrics survey is using an old or incomplete bridge. Expected ${R}. Do not start this questionnaire.`);return}a!==null&&(t.clearTimeout(a),a=null),t.parent.postMessage({type:je,protocolVersion:2,bridgeBuild:R},e),r("connected",`Secure Qualtrics bridge ${R} connected.`)}};return t.addEventListener("message",l),i({state:n,message:`Checking Qualtrics bridge ${R}.`}),a=t.setTimeout(()=>{a=null,n!=="connected"&&r("failed",`The required Qualtrics bridge ${R} did not connect. Do not start this questionnaire.`)},8500),{getState:()=>n,disconnect(){a!==null&&(t.clearTimeout(a),a=null),t.removeEventListener("message",l)}}}function Ye(e,t=window,i=12e3,s=()=>!0){return{name:"UCL Qualtrics",submit(n){return t.parent===t?Promise.reject(new Error("This centrally collected questionnaire must be opened through its Qualtrics survey.")):s()?new Promise((a,r)=>{let l=!1;const d=b=>{l||(l=!0,t.clearTimeout(y),t.removeEventListener("message",g),b())},g=b=>{if(b.source!==t.parent||b.origin!==e)return;const m=b.data;if(!(!m||m.type!==Ue||m.submissionId!==n.submissionId||m.bridgeBuild!==R)){if(m.accepted!==!0){d(()=>r(new Error(typeof m.error=="string"&&m.error?m.error:"Qualtrics did not accept the response.")));return}d(()=>a({accepted:!0,submissionId:n.submissionId,receiptId:typeof m.receiptId=="string"?m.receiptId:void 0}))}},y=t.setTimeout(()=>{d(()=>r(new Error("Qualtrics did not acknowledge the response in time.")))},i);t.addEventListener("message",g),t.parent.postMessage({type:De,bridgeBuild:R,record:n},e)}):Promise.reject(new Error(`Qualtrics bridge ${R} is not connected. The response remains in the local backup.`))}}}async function Ze(e,t,i=15e3){let s;const n=new Promise((r,l)=>{s=setTimeout(()=>l(new Error("The study platform did not acknowledge the staged response in time.")),i)});let a;try{a=await Promise.race([t.submit(e),n])}finally{s!==void 0&&clearTimeout(s)}if(!a||a.accepted!==!0||a.submissionId!==e.submissionId||a.receiptId!==void 0&&typeof a.receiptId!="string")throw new Error("The study platform returned an invalid submission receipt.");return a}const j=new Map([["zero",0],["five",5],["one zero",10],["ten",10],["fifteen",15],["twenty",20],["twenty five",25],["thirty",30],["thirty five",35],["forty",40],["forty five",45],["fifty",50],["fifty five",55],["sixty",60],["sixty five",65],["seventy",70],["seventy five",75],["eighty",80],["eighty five",85],["ninety",90],["ninety five",95],["one zero zero",100],["one hundred",100],["hundred",100]]),V=new Map([["zero","0"],["oh","0"],["one","1"],["two","2"],["three","3"],["four","4"],["five","5"],["six","6"],["seven","7"],["eight","8"],["nine","9"]]),E=new Map([["won",1],["to",2],["too",2],["tree",3],["free",3],["for",4],["fore",4],["fife",5],["ate",8]]),te=["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"],ie=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];function Se(e){if(e<20)return te[e];if(e===100)return"one hundred";const t=Math.floor(e/10),i=e%10;return i===0?ie[t]:`${ie[t]} ${te[i]}`}for(let e=0;e<=100;e+=1){j.set(Se(e),e);const t=String(e).split("").map(i=>[...V].find(([,s])=>s===i)?.[0]).filter(i=>!!i).join(" ");t&&j.set(t,e)}const Q=new Set([...V.keys(),"ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety","hundred"]),W=/\b(?:not|note|knot|naught|nought|no|nope|nah|never|cannot|cancel|neither|except|without|minus|negative|skip|avoid|exclude|reject|instead|rather|unsure|uncertain|maybe|perhaps|mistake|wrong)\b|\b(?:(?:anything|everything)\s+but|other\s+than|don\s+t|can\s+t|won\s+t|wouldn\s+t|shouldn\s+t|isn\s+t|wasn\s+t)\b/,$e={mental:["mental demand","mental"],physical:["physical demand","physical"],temporal:["temporal demand","temporal","time pressure"],performance:["performance"],effort:["effort"],frustration:["frustration"]};function M(e){return e.toLowerCase().replace(/[-–—]/g," ").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim()}function Xe(e,t,i,s=!0){const n=[],a=[];for(const r of t){const l=Number.isInteger(r)&&r>=0&&r<=100?Se(r):String(r);if(n.push(String(r),l,`number ${l}`,`not ${l}`),a.push(`option ${l}`,`rating ${l}`,`value ${l}`,`answer ${l}`,`choice ${l}`),s){const d=e.responseLabels?.[String(r)];d?.trim()&&(n.push(d.trim()),a.push(`answer ${d.trim()}`,`choose ${d.trim()}`))}}return s&&(n.push(e.lowAnchor,e.highAnchor,...e.voiceLowAliases??[],...e.voiceHighAliases??[]),i.length===5&&n.push("middle","midpoint",`closer to ${e.lowAnchor}`,`closer to ${e.highAnchor}`)),[...new Set([...n,...a].map(r=>r.trim()).filter(Boolean))]}function et(e){return[...new Set(e.flatMap(t=>typeof t!="string"?[t.name,t.id.replace(/[-_]/g," ")]:$e[t]??[t.replace(/[-_]/g," ")]).map(t=>t.trim()).filter(Boolean))]}function Ce(e){return W.test(M(e))}function Re(e,t){const i=e.map(a=>a.trim()).filter(Boolean);if(i.length===0)return null;const s=i.map((a,r)=>({transcript:a,value:t(a),index:r}));if(s.some(({transcript:a,value:r})=>r===null&&Ce(a)))return null;const n=s.filter(a=>a.value!==null);return n.length===0?null:{transcript:n[0].transcript,value:n[0].value}}function se(e,t){return new Set([e,...t??[]].map(M).filter(Boolean))}function K(e){return e.replace(/^(?:(?:i\s+)?(?:choose|select|pick)|(?:my\s+)?answer(?:\s+is)?|(?:the\s+)?(?:number|option|rating|value|response|choice)(?:\s+is)?)\s+/,"").trim()}function ne(e){return e.replace(/\bdis\s+a\s+gr(?:ay|ey)\b/g,"disagree").replace(/\ba\s+gr(?:ay|ey)\b/g,"agree").replace(/\bstrong\s+lee\b/g,"strongly").replace(/\bdisagreed\b/g,"disagree").replace(/\bagreed\b/g,"agree").replace(/^neither\s+(.+)\s+or\s+(.+)$/,"neither $1 nor $2")}function tt(e,t,i){const s=K(e),n=se(t.lowAnchor,t.voiceLowAliases).has(s),a=se(t.highAnchor,t.voiceHighAliases).has(s);if(!(!n&&!a))return n&&a?null:n?i[0]:i.at(-1)??null}function it(e,t,i){if(!t.responseLabels)return;const s=ne(K(e)),n=i.filter(a=>ne(M(t.responseLabels?.[String(a)]??""))===s);if(n.length!==0)return n.length===1?n[0]:null}function st(e,t){const i=K(e),s=i.split(" ").filter(Boolean);if(s.length===0||!s.every(r=>/^(?:100|[0-9]{1,2})$/.test(r)||Q.has(r)||E.has(r)))return;const a=Ie(i,t,!0);return a.length!==1||a[0]===null?null:a[0]}function Ie(e,t,i=!1){const s=e.split(" ").filter(Boolean),n=[];for(const a of s)if(/^(?:100|[0-9]{1,2})$/.test(a)){const r=Number(a);n.push(t.includes(r)?r:null)}for(let a=0;a<s.length;){if(!Q.has(s[a])&&!(i&&E.has(s[a]))){a+=1;continue}const r=[];for(;a<s.length&&(Q.has(s[a])||i&&E.has(s[a]));)r.push(s[a]),a+=1;const l=r.length===1&&V.has(r[0])?Number(V.get(r[0])):r.length===1&&E.has(r[0])?E.get(r[0]):j.get(r.join(" "));n.push(l!==void 0&&t.includes(l)?l:null)}return n}function ae(e){return e?.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")}function z(e,t){return e.find(i=>i.position===t)?.value}function nt(e,t,i){const s=/\b(middle|midpoint|centre|center)\b/.test(e),n=ae(t.voiceLowAliases),a=ae(t.voiceHighAliases);if(!n||!a||i.length!==5)return;const r=`(?:${n})`,l=`(?:${a})`,d=new RegExp(`\\bclose(?:r)?\\s+(?:to|too)\\s+${r}\\b`).test(e),g=new RegExp(`\\bclose(?:r)?\\s+(?:to|too)\\s+${l}\\b`).test(e),y=t.voiceLowAliases?.includes("low")===!0&&e==="hello",b=new RegExp(`\\b${r}\\b`).test(e)||y,m=new RegExp(`\\b${l}\\b`).test(e);if(d||g)return[s,d,g].filter(Boolean).length!==1||d&&m||g&&b?null:d?z(i,"closer-low")??null:z(i,"closer-high")??null;if([s,b,m].some(Boolean))return[s,b,m].filter(Boolean).length!==1?null:s?z(i,"middle")??null:b?z(i,"low")??null:z(i,"high")??null}function at(e,t,i=be,s=ye){const n=M(e);if(!n)return null;const a=it(n,t,i);if(a!==void 0)return a;const r=tt(n,t,i);if(r!==void 0)return r;if(W.test(n))return null;const l=nt(n,t,s),d=st(n,i);if(d!==void 0)return d===null||l===null||l!==void 0&&l!==d?null:d;if(l===null)return null;if(l!==void 0){const g=Ie(n,i);return g.length===0?l:g.length!==1||g[0]===null||g[0]!==l?null:l}return null}function rt(e,t){const i=M(e);if(!i||W.test(i))return null;const s=t.map(n=>{const a=typeof n=="string"?n:n.id;return(typeof n=="string"?$e[a]??[a.replace(/[-_]/g," ")]:[n.name.toLowerCase(),a.replace(/[-_]/g," ")]).some(l=>i===l||i.includes(l))?a:null}).filter(n=>!!n);return s.length===1?s[0]:null}function ot(e,t,i=be,s=ye){return Re(e,n=>at(n,t,i,s))}function lt(e,t){return Re(e,i=>rt(i,t))}const dt="command";function G(e,t){return{langs:[e],processLocally:!0,...t?{quality:dt}:{}}}async function ct(e,t){if(!e.available)return null;try{return await e.available(G(t,!0))}catch{try{return await e.available(G(t,!1))}catch{return null}}}async function ut(e,t){if(!e.install)return!1;try{return await e.install(G(t,!0))}catch{try{return await e.install(G(t,!1))}catch{return!1}}}function _(e,t){return e.lang=t,"processLocally"in e&&(e.processLocally=!1),{action:"start",mode:"remote",lang:t,message:"Listening for one answer using the browser speech service."}}async function ht(e,t,i=!0,s="en-GB",n="en-US"){if(!i||!e?.available||!("processLocally"in t))return _(t,s);const a=[...new Set([s,n])];for(const r of a){const l=await ct(e,r);if(l===null)return _(t,s);if(l==="unavailable")continue;if(l==="available")return t.lang=r,t.processLocally=!0,{action:"start",mode:"local",lang:r,message:`Listening for one answer using on-device English recognition (${r}).`};if(l==="downloading")return t.lang=r,t.processLocally=!0,{action:"wait",mode:"downloading",lang:r,message:`The browser is still downloading its on-device English speech model (${r}). No answer was selected. Start voice input again when the download finishes, or use a visible answer button.`};if(await ut(e,r))return t.lang=r,t.processLocally=!0,{action:"wait",mode:"installed",lang:r,message:`The on-device English speech model (${r}) is ready. No answer was selected. Start voice input again, or use a visible answer button.`}}return _(t,s)}const B="3.5.3",pt=`https://cdn.jsdelivr.net/npm/webgazer@${B}/dist/webgazer.js`,gt=`https://cdn.jsdelivr.net/npm/webgazer@${B}/dist/mediapipe/face_mesh`,mt="sha384-N9TfYQEjUGiaDcITkzB/MtVHEfF2JtTWCwHG8NUhjOSvJ8zObGwfebHUFLBS+4Rb";let P=null;function re(e){return e.protocol==="https:"||e.hostname==="localhost"||e.hostname==="127.0.0.1"}function ft(e=document){return window.webgazer?Promise.resolve(window.webgazer):P||(P=new Promise((t,i)=>{const s=e.querySelector("#webgazer-loader"),n=s??e.createElement("script"),a=()=>{window.webgazer?t(window.webgazer):i(new Error("WebGazer loaded without exposing its browser API."))};n.addEventListener("load",a,{once:!0}),n.addEventListener("error",()=>{n.remove(),i(new Error("WebGazer could not be downloaded. Check the connection and content-blocking settings."))},{once:!0}),s||(n.id="webgazer-loader",n.src=pt,n.integrity=mt,n.crossOrigin="anonymous",n.referrerPolicy="no-referrer",e.head.append(n))}).catch(t=>{throw P=null,t}),P)}class oe{constructor(t){this.durationMs=t,this.key=null,this.startedAt=0}update(t,i){if(!t)return this.reset(),{progress:0,activated:!1};if(t!==this.key)return this.key=t,this.startedAt=i,{progress:0,activated:!1};const s=Math.min(1,Math.max(0,(i-this.startedAt)/this.durationMs));return s>=1?(this.reset(),{progress:1,activated:!0}):{progress:s,activated:!1}}reset(){this.key=null,this.startedAt=0}}var bt=Object.defineProperty,yt=Object.getOwnPropertyDescriptor,h=(e,t,i,s)=>{for(var n=s>1?void 0:s?yt(t,i):t,a=e.length-1,r;a>=0;a--)(r=e[a])&&(n=(s?r(t,i,n):r(n))||n);return s&&n&&bt(t,i,n),n};function F(e){return e.trim().toLocaleLowerCase().split("-")[0]==="en"}const O=[{x:12,y:12},{x:50,y:12},{x:88,y:12},{x:12,y:50},{x:50,y:50},{x:88,y:50},{x:12,y:88},{x:50,y:88},{x:88,y:88}],k=3;function D(e){const t=ve(e);for(let i=t.length-1;i>0;i-=1){const s=Math.floor(Math.random()*(i+1));[t[i],t[s]]=[t[s],t[i]]}return t}let u=class extends Pe{constructor(){super(...arguments),this.stage="intro",this.ratingIndex=0,this.pairIndex=0,this.pairOrder=D(Y(x)),this.pairResponses={},this.ratings={},this.ratingInputRoutes={},this.pairInputRoutes={},this.supportChanges=[],this.answerMode="standard",this.showSimpleLanguage=!1,this.largeText=!1,this.recoveryEnabled=!1,this.resumeSummaryVisible=!1,this.savedSession=null,this.savedSessionProblem="",this.recoveredCompletedRecord=null,this.readingAloud=!1,this.readAloudUsed=!1,this.audioGuidance=!1,this.audioStatusMessage="",this.interruptionSummaryShown=!1,this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null,this.errorMessage="",this.statusMessage="",this.result=null,this.gazeState="off",this.gazeMessage="",this.gazeCalibrationIndex=0,this.gazeCalibrationRepetition=0,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeUsed=!1,this.gazeActionCount=0,this.studyConfig=null,this.configurationError="",this.participantCode="",this.participantCodeError="",this.participantCodeRestoredForTab=!1,this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.startedAt="",this.submittedRecord=null,this.completionSavedLocally=!1,this.completionStagedByBridge=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1,this.browserStorageFailed=!1,this.submittingResult=!1,this.hostBridgeState="not-required",this.hostBridgeMessage="",this.hiddenAt=null,this.recognition=null,this.webgazer=null,this.gazeCandidateElement=null,this.gazePendingElement=null,this.gazeActivationInProgress=!1,this.speechRequestId=0,this.savedSessionAnnouncementKey="",this.configurationApplied=!1,this.prefilledParticipantCode="",this.invalidParticipantParameter=!1,this.reviewReturnFocusIndex=null,this.installedResultSink=null,this.gazeCandidateTracker=new oe(1e3),this.gazeConfirmationTracker=new oe(1200),this.repeatSavedSessionOffer=()=>{this.savedSession&&(this.readAloudUsed=!0,this.speakText(this.savedSessionOfferSpeech(this.savedSession)))},this.setParticipantCode=e=>{this.participantCode=e.currentTarget.value.trim(),this.invalidParticipantParameter=!1,this.participantCodeRestoredForTab=!1,this.participantCodeError=this.participantCode&&!$(this.participantCode)?"Use 1–32 letters, numbers, hyphens or underscores, starting with a letter or number.":"",this.savedSession=null,this.savedSessionProblem="",this.recoveredCompletedRecord=null,$(this.participantCode)?(this.rememberParticipantCodeForTab(),this.findSavedSession(),this.findCompletedBackup()):this.forgetParticipantCodeForTab()},this.setAudioGuidance=e=>{const t=e.currentTarget.checked;this.recordSupportChange("automatic-audio",this.audioGuidance,t),this.audioGuidance=t,this.invalidatePendingSubmission(),this.audioGuidance?this.speakText("Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open."):this.stopReading(),this.persistProgress()},this.startQuestionnaire=()=>{if(this.configurationError){this.showError(this.configurationError);return}if(this.studyConfig?.collection.mode==="qualtrics"&&this.hostBridgeState!=="connected"){this.showError(this.hostBridgeMessage||"The secure Qualtrics result connection is not ready. Do not start this questionnaire.");return}if(this.studyConfig){if(this.participantCode=this.participantCode.trim(),!$(this.participantCode)){this.participantCodeError="Enter the valid pseudonymous participant code supplied by the study conductor.",this.showError(this.participantCodeError);return}this.rememberParticipantCodeForTab()}this.startedAt=new Date().toISOString(),this.stage="ratings",this.ratingIndex=0,this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.reviewReturnFocusIndex=null,this.clearError(),this.persistProgress(),this.focusHeading()},this.goBack=()=>{if(this.stopReading(),this.clearVoiceAnswer(),this.stage==="ratings"&&this.editingRatingFromReview){const e=this.reviewReturnFocusIndex??this.ratingIndex;this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.stage="review",this.clearError(),this.persistProgress(),this.focusReviewItem(e,`${this.dimensions[e].name} edit cancelled. Original answer kept.`);return}else this.stage==="ratings"&&this.ratingIndex>0?this.ratingIndex-=1:this.stage==="pairs"&&(this.pairIndex>0?this.pairIndex-=1:(this.stage="ratings",this.ratingIndex=this.dimensions.length-1));this.clearError(),this.persistProgress(),this.focusHeading()},this.returnToRatings=()=>{this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.reviewReturnFocusIndex=null,this.stage="ratings",this.ratingIndex=this.dimensions.length-1,this.persistProgress(),this.focusHeading()},this.returnToPairs=()=>{this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.reviewReturnFocusIndex=null,this.stage="pairs",this.pairIndex=this.pairOrder.length-1,this.persistProgress(),this.focusHeading()},this.submitResponses=async()=>{if(!this.submittingResult)try{(!this.result||!this.submittedRecord)&&(this.result=Ee(this.definition,this.ratings,this.pairResponses),this.submittedRecord=Te({config:this.effectiveStudyConfig(),participantCode:this.studyConfig?this.participantCode:"DEMO",startedAt:this.startedAt||new Date().toISOString(),pairPresentationOrder:this.pairOrder.map(({id:t})=>t),pairwiseChoices:this.pairResponses,result:this.result,supportMetadata:this.currentSupportMetadata()}));const e=this.studyConfig?We():null;if(this.completionSavedLocally=this.studyConfig?Le(this.submittedRecord):!1,this.completionStagedByBridge=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1,this.browserStorageFailed=!1,this.studyConfig&&!this.completionSavedLocally){this.browserStorageFailed=!0,this.showError("The browser could not save the completed record. The study platform has not been contacted. Your answers remain reviewable. Retry saving, change an answer, or download a JSON or CSV backup before leaving this page.");return}if(e){this.submittingResult=!0,this.statusMessage=`Submitting responses to ${e.name}.`;try{await Ze(this.submittedRecord,e),this.completionStagedByBridge=!0}catch(t){this.hostSubmissionFailed=!0,this.browserStorageFailed=!1;const i=t instanceof Error?t.message:"The study platform did not accept the response.";this.showError(`${i} Your answers remain on this page. Retry submission, return to an answer, or use a backup button below.`);return}finally{this.submittingResult=!1}}this.dispatchEvent(new CustomEvent("questionnaire-complete",{detail:this.submittedRecord,bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("nasa-tlx-complete",{detail:this.submittedRecord,bubbles:!0,composed:!0})),this.stage="complete",(!this.studyConfig||this.completionSavedLocally)&&this.clearSavedProgress(),this.stopGazeInputInternal(!1),this.clearError(),this.completionStagedByBridge||this.focusHeading()}catch(e){this.submittingResult=!1,this.showError(e instanceof Error?e.message:"Responses could not be calculated.")}},this.downloadResultJson=()=>{this.submittedRecord&&this.downloadRecordJson(this.submittedRecord)},this.downloadResultCsv=()=>{this.submittedRecord&&this.downloadRecordCsv(this.submittedRecord)},this.restart=()=>{this.stopReading(!1),this.stopGazeInputInternal(!1),this.releaseRecognition(),this.clearSavedProgress(),this.forgetParticipantCodeForTab(),this.stage="intro",this.ratingIndex=0,this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.reviewReturnFocusIndex=null,this.pairIndex=0,this.pairOrder=D(this.definition),this.pairResponses={},this.ratings={},this.ratingInputRoutes={},this.pairInputRoutes={},this.supportChanges=[],this.resumeSummaryVisible=!1,this.savedSession=null,this.recoveredCompletedRecord=null,this.result=null,this.submittedRecord=null,this.completionSavedLocally=!1,this.completionStagedByBridge=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1,this.browserStorageFailed=!1,this.submittingResult=!1,this.startedAt="",this.participantCodeError="",this.participantCodeRestoredForTab=!1,this.studyConfig&&(this.participantCode=this.prefilledParticipantCode),this.errorMessage="",this.voiceState="idle",this.pendingVoiceAnswer=null,this.audioGuidance=!1,this.audioStatusMessage="",this.gazeUsed=!1,this.gazeActionCount=0,this.applyConfiguredSupport(),this.statusMessage="A new questionnaire has started.",window.scrollTo({top:0,behavior:"smooth"})},this.toggleReadAloud=()=>{if(this.readingAloud){this.stopReading(!0);return}this.speakText(this.currentStepSpeech())},this.startGazeInput=async()=>{if(!re(window.location)){this.gazeState="error",this.gazeMessage="Gaze input requires an HTTPS-hosted page or localhost.",this.announceAutomatic(this.gazeMessage);return}this.gazeState="loading",this.gazeMessage="Loading the pinned WebGazer library. Webcam permission will be requested next.";try{const e=await ft();if(!e.detectCompatibility())throw new Error("This browser does not expose a compatible webcam API.");this.webgazer=e,e.params.faceMeshSolutionPath=gt,e.saveDataAcrossSessions(!1),await e.clearData(),e.showVideoPreview(!0),e.showFaceOverlay(!0),e.showFaceFeedbackBox(!0),e.showPredictionPoints(!1),e.setGazeListener(t=>this.handleGazePoint(t)),await e.begin(),e.removeMouseEventListeners(),await this.showGazePositioningStep("Camera started. Position your face, then continue to calibration.")}catch(e){this.gazeState="error",this.gazeMessage=e instanceof Error?`Gaze setup did not start: ${e.message}`:"Gaze setup did not start. Use another answer route.",this.announceAutomatic(this.gazeMessage),this.releaseGazeResources()}},this.restartGazeCalibration=async()=>{this.webgazer&&(this.cancelGazeProposal(),await this.webgazer.clearData(),await this.showGazePositioningStep("Recalibration started. Check your position before continuing."))},this.beginGazeCalibration=()=>{this.webgazer&&(this.restoreWebGazerPreviewContainer(),this.webgazer.showVideoPreview(!1),this.webgazer.showFaceOverlay(!1),this.webgazer.showFaceFeedbackBox(!1),this.webgazer.showPredictionPoints(!1),this.gazeCalibrationIndex=0,this.gazeCalibrationRepetition=0,this.gazeState="calibrating",this.gazeMessage="Camera preview hidden. Complete all 27 calibration samples.",this.announceAutomatic(this.gazeMessage),this.updateComplete.then(()=>this.querySelector(".calibration-point")?.focus()))},this.recordCalibrationPoint=e=>{if(!this.webgazer||this.gazeState!=="calibrating")return;const t=e.currentTarget.getBoundingClientRect();if(this.webgazer.recordScreenPosition(t.left+t.width/2,t.top+t.height/2,"click"),this.gazeCalibrationRepetition<k-1){this.gazeCalibrationRepetition+=1;return}if(this.gazeCalibrationIndex<O.length-1){this.gazeCalibrationIndex+=1,this.gazeCalibrationRepetition=0;return}this.gazeCalibrationRepetition=k,this.gazeState="ready",this.gazeUsed=!0,this.gazeMessage="Calibration complete. A red gaze dot is visible. Look at a large answer or navigation control for one second.",this.webgazer.showVideoPreview(!1),this.webgazer.showFaceOverlay(!1),this.webgazer.showFaceFeedbackBox(!1),this.webgazer.showPredictionPoints(!0),this.statusMessage="Gaze-assisted answering is ready.",this.announceAutomatic(this.statusMessage)},this.confirmGazeProposal=()=>{const e=this.gazePendingElement;if(!e)return;const t=this.gazePendingLabel;this.gazePendingElement=null,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeConfirmationTracker.reset(),this.gazeActivationInProgress=!0;try{e.click(),this.gazeActionCount+=1,this.gazeUsed=!0,this.statusMessage=`${t} activated by confirmed gaze.`}finally{this.gazeActivationInProgress=!1}},this.cancelGazeProposal=()=>{this.gazePendingElement=null,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeConfirmationTracker.reset(),this.statusMessage="Gaze proposal cancelled."},this.stopGazeInput=()=>{this.stopGazeInputInternal(!0)},this.confirmVoiceAnswer=()=>{const e=this.pendingVoiceAnswer;if(!e)return;let t="";if(e.context==="rating"){const i=this.dimensions[this.ratingIndex],s=e.value;this.selectRating(i.id,s,"voice"),t=this.answerMode==="smiley"&&this.smileyLandmarks.some(a=>a.value===s)?`smiley-${i.id}-${s}`:`rating-${i.id}-${s}`}else{const i=this.pairOrder[this.pairIndex],s=e.value;this.selectPair(i.id,s,"voice"),t=`${i.id}-${s}`}this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null,this.updateComplete.then(()=>this.querySelector(`#${t}`)?.focus())},this.clearVoiceAnswer=()=>{this.releaseRecognition(),this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null},this.handleVisibilityChange=()=>{if(document.hidden){this.hiddenAt=Date.now();return}this.hiddenAt&&this.recoveryEnabled&&this.isInProgress()&&(this.resumeSummaryVisible=!0,this.interruptionSummaryShown=!0,this.statusMessage="Welcome back. A summary of your saved position is available.",this.updateComplete.then(()=>{this.querySelector("#resume-heading")?.focus(),this.announceAutomatic(this.resumeSummarySpeech())})),this.hiddenAt=null},this.handleParticipantStudyHashChange=()=>{new URLSearchParams(window.location.hash.startsWith("#")?window.location.hash.slice(1):window.location.hash).has("study")&&this.reloadForParticipantStudyLink()},this.handleSkipToCurrentQuestion=e=>{e.preventDefault(),this.updateComplete.then(()=>{const t=this.querySelector("#question-panel");if(!t)return;const i=t.querySelector("h2")??t;i.hasAttribute("tabindex")||(i.tabIndex=-1),A(i,{block:"start",onReveal:()=>this.requestParentReveal(i)})})},this.dismissResumeSummary=()=>{this.resumeSummaryVisible=!1,this.statusMessage=`Continuing at ${this.currentPositionDescription()}.`,this.focusHeading()},this.restoreSavedSession=()=>{const e=this.savedSession;e&&(this.stage=e.stage,this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.reviewReturnFocusIndex=null,this.ratingIndex=e.ratingIndex,this.pairIndex=e.pairIndex,this.pairOrder=e.pairOrder,this.pairResponses=e.pairResponses,this.ratings=e.ratings,this.ratingInputRoutes=e.ratingInputRoutes,this.pairInputRoutes=e.pairInputRoutes,this.supportChanges=e.supportChanges,this.startedAt=e.startedAt,this.canAdjustAllSupport?(this.answerMode=e.support.answerMode,this.showSimpleLanguage=e.support.showSimpleLanguage,this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance):(this.applyConfiguredSupport(),this.canAdjustPresentationSupport&&(this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance)),this.recoveryEnabled=!0,this.savedSession=null,this.savedSessionProblem="",this.savedSessionAnnouncementKey="",this.resumeSummaryVisible=!0,this.interruptionSummaryShown=!0,this.updateComplete.then(()=>{this.querySelector("#resume-heading")?.focus(),this.announceAutomatic(this.resumeSummarySpeech())}))},this.eraseSavedSession=()=>{this.clearSavedProgress(),this.savedSession=null,this.savedSessionProblem="",this.savedSessionAnnouncementKey="",this.statusMessage="Saved answers erased."}}connectedCallback(){super.connectedCallback(),this.loadStudyConfiguration(),document.addEventListener("visibilitychange",this.handleVisibilityChange),window.addEventListener("hashchange",this.handleParticipantStudyHashChange),queueMicrotask(()=>{this.restoreParticipantCodeForTab(),this.findSavedSession(),this.findCompletedBackup(),this.participantCodeRestoredForTab&&!this.savedSession&&this.recoveredCompletedRecord&&this.updateComplete.then(()=>{const e=this.querySelector("#completed-backup-heading");e&&A(e,{block:"start",onReveal:()=>this.requestParentReveal(e)})})})}disconnectedCallback(){document.removeEventListener("visibilitychange",this.handleVisibilityChange),window.removeEventListener("hashchange",this.handleParticipantStudyHashChange),this.installedResultSink?.bridge.disconnect(),this.installedResultSink=null,this.stopReading(!1),this.releaseRecognition(),this.stopGazeInputInternal(!1),super.disconnectedCallback()}createRenderRoot(){return this}loadStudyConfiguration(){if(this.configurationApplied)return;this.configurationApplied=!0;const e=new URLSearchParams(window.location.hash.startsWith("#")?window.location.hash.slice(1):window.location.hash),t=Me(window.location.hash);if(e.has("study")&&!t){this.configurationError="This participant link contains an invalid or incompatible study configuration. Ask the study conductor for a new link.";return}if(!t)return;this.studyConfig=t;const i=e.get("participant"),s=Oe(window.location.hash);if(s?(this.prefilledParticipantCode=s,this.participantCode=s):i&&(this.invalidParticipantParameter=!0,this.participantCodeError="The participant code in this link is invalid. Enter the approved pseudonymous code manually or ask the study conductor for a new link."),this.pairOrder=D(this.definition),this.applyConfiguredSupport(),t.collection.mode==="qualtrics"){if(window.parent===window){this.configurationError="This centrally collected questionnaire must be opened from the approved Qualtrics survey link. Ask the study conductor for that link.";return}if(document.referrer)try{if(new URL(document.referrer).origin!==t.collection.parentOrigin){this.configurationError="This questionnaire was embedded by an unexpected website. Ask the study conductor for the approved Qualtrics survey link.";return}}catch{this.configurationError="The embedding website could not be verified. Ask the study conductor for the approved Qualtrics survey link.";return}this.hostBridgeState="connecting",this.installedResultSink=Ke(t,window,({state:n,message:a})=>{this.hostBridgeState=n,this.hostBridgeMessage=a},n=>{this.remoteRecordingUnconfirmed=!0,this.statusMessage=n,this.announceAutomatic(this.currentStepSpeech()),this.updateComplete.then(()=>{const a=this.querySelector("#remote-recording-error");a&&A(a,{block:"start",onReveal:()=>this.requestParentReveal(a)})})})}}applyConfiguredSupport(){const e=this.studyConfig?.support;e&&(this.showSimpleLanguage=e.showSimpleLanguage,this.answerMode=e.answerMode,this.largeText=e.largeText,this.audioGuidance=e.audioGuidance,this.recoveryEnabled=e.recoveryEnabled)}get definition(){const e=this.studyConfig?.instrumentId??x;return qe(e,this.studyConfig?.questionnaireDefinition)}get dimensions(){return this.definition.items}get pairs(){return ve(this.definition)}get ratingValues(){return Ne(this.definition)}get smileyLandmarks(){return this.definition.landmarks??[]}get isResearcherSuppliedDefinition(){return!!this.studyConfig?.questionnaireDefinition}get dimensionById(){return new Map(this.dimensions.map(e=>[e.id,e]))}get canAdjustAllSupport(){return!this.studyConfig||this.studyConfig.support.participantAdjustmentPolicy==="participant-choice"}get canAdjustPresentationSupport(){return!this.studyConfig||this.studyConfig.support.participantAdjustmentPolicy==="presentation-only"||this.studyConfig.support.participantAdjustmentPolicy==="participant-choice"}get voiceInputAvailable(){return!this.studyConfig||this.studyConfig.support.voiceInputAvailable}get gazeInputAvailable(){return!this.studyConfig||this.studyConfig.support.gazeInputAvailable}render(){return o`
      <a class="skip-link" href="#question-panel" @click=${this.handleSkipToCurrentQuestion}
        >Skip to the current question</a
      >
      <main class=${`app-shell${this.largeText?" large-text":""}`} id="main-content">
        <p class="sr-only" aria-live="polite" aria-atomic="true">${this.statusMessage}</p>
        <header class="app-header">
          <p class="eyebrow">Accessible questionnaire platform · Version ${Z}</p>
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
    `}renderStage(){switch(this.stage){case"intro":return this.renderIntro();case"ratings":return this.renderRating();case"pairs":return this.renderPair();case"review":return this.renderReview();case"complete":return this.renderComplete()}}renderIntro(){const e=this.definition.id===x?"Start the six ratings":`Start the ${this.dimensions.length} items`;return o`
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
    `:c}renderSupportSettings(e,t){const i=`support-${e}`,s="speechSynthesis"in window&&"SpeechSynthesisUtterance"in window;return o`
      <fieldset class="support-settings">
        <legend>${t==="all"?"Accessibility support options":"Display and recovery preferences"}</legend>

        ${t==="all"&&this.definition.supports.simplerExplanations?o`<label class="toggle-card" for=${`${i}-simple`}>
            <input
              id=${`${i}-simple`}
              type="checkbox"
              .checked=${this.showSimpleLanguage}
              @change=${n=>this.setSimpleLanguage(n)}
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
            ?disabled=${!s}
            @change=${this.setAudioGuidance}
          />
          <span>
            <strong>Read new questions and feedback aloud</strong>
            <small>${s?"Default off. Leave this off when a screen reader is already speaking.":"Built-in audio is unavailable in this browser."}</small>
          </span>
        </label>

        <label class="toggle-card" for=${`${i}-recovery`}>
          <input
            id=${`${i}-recovery`}
            type="checkbox"
            .checked=${this.recoveryEnabled}
            @change=${n=>this.setRecovery(n)}
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
    `}renderGazeSetup(){if(!this.gazeInputAvailable)return c;const e=re(window.location),t=this.gazeState==="loading"||this.gazeState==="positioning"||this.gazeState==="calibrating"||this.gazeState==="ready";return o`
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
            <li>WebGazer ${B} is loaded only after you start this feature; its code and face model come from jsDelivr.</li>
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
    `}renderGazeCalibration(){const e=O[this.gazeCalibrationIndex],t=this.gazeCalibrationIndex*k+this.gazeCalibrationRepetition,i=O.length*k;return o`
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
            aria-label=${`Calibration point ${this.gazeCalibrationIndex+1} of ${O.length}, sample ${this.gazeCalibrationRepetition+1} of ${k}`}
            @click=${this.recordCalibrationPoint}
          >
            ${this.gazeCalibrationIndex+1}
            <span>${this.gazeCalibrationRepetition+1}/${k}</span>
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
    `}renderFullRatingScale(e,t){const i=this.definition.scale.type==="semantic-differential",s=!!e.responseLabels;return o`
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
        <div class=${`rating-grid${i?" semantic-differential-grid":s?" fully-labelled-rating-grid":""}`}>
          ${this.ratingValues.map(n=>{const a=`rating-${e.id}-${n}`,r=this.ratingOptionLabel(e,n),l=this.visibleResponseLabel(e,n);return o`
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
                  value=${n}
                  .required=${n===this.definition.scale.minimum}
                  .checked=${t===n}
                  aria-label=${r}
                  @change=${()=>this.selectRating(e.id,n,"standard-scale")}
                />
                <span class="rating-option-content">
                  ${i?o`<span class="semantic-position-dot" aria-hidden="true"></span>`:o`<strong>${n}</strong>`}
                  ${l?o`<small lang=${this.definition.language} dir="auto">${l}</small>`:c}
                </span>
                ${t===n?o`<span class="selected-marker selected-check" aria-hidden="true">✓</span>`:c}
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
          ${this.smileyLandmarks.map(({value:i,cue:s})=>{const n=`smiley-${e.id}-${i}`;return o`
              <label
                class="smiley-option"
                for=${n}
                data-gaze-target
                data-gaze-label=${`${i} for ${e.name}`}
              >
                <input
                  id=${n}
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
                  <span class="smiley-face" aria-hidden="true">${s}</span>
                  <strong>${i}</strong>
                  <small>${this.landmarkLabel(e,i)}</small>
                  ${t===i?o`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:c}
                </span>
              </label>
            `})}
        </div>
      </fieldset>
    `}renderPair(){const e=this.pairOrder[this.pairIndex],t=this.dimensionById.get(e.left),i=this.dimensionById.get(e.right),s=this.pairResponses[e.id];return o`
      <section class="panel" id="question-panel" aria-labelledby="pair-heading">
        <p class="step-label">Comparison ${this.pairIndex+1} of ${this.pairOrder.length}</p>
        <h2 id="pair-heading">${this.definition.pairwise.prompt}</h2>
        <p class="pair-instruction">
          ${this.definition.pairwise.instruction}
        </p>

        ${this.renderPairHelp(t,i)}
        <fieldset class="choice-fieldset">
          <legend>Choose one factor</legend>
          ${this.renderPairChoice(e.id,t,s===t.id)}
          ${this.renderPairChoice(e.id,i,s===i.id)}
        </fieldset>

        ${this.renderVoiceInput("pair",t,i)}
        ${this.renderNavigation(!0,"pair")}
      </section>
    `}renderPairChoice(e,t,i){const s=`${e}-${t.id}`;return o`
      <label
        class="choice-card"
        for=${s}
        data-gaze-target
        data-gaze-label=${t.name}
      >
        <input
          id=${s}
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
    `:c}renderVoiceInput(e,t,i){if(!this.voiceInputAvailable)return c;const s=!!(window.SpeechRecognition??window.webkitSpeechRecognition),n=this.pendingVoiceAnswer?.context===e,a=e==="rating"?this.ratingVoicePrompt(t):`Say “${t.name}” or “${i.name}”.`;return o`
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
            ?disabled=${!s||this.voiceState==="listening"}
            @click=${()=>this.startVoiceInput(e,t,i)}
          >
            ${this.voiceState==="listening"?"Listening…":"Start voice input"}
          </button>
          ${s?c:o`<p role="status">
                Built-in voice recognition is unavailable in this browser. System voice control can still activate
                the visible buttons by name.
              </p>`}
          ${this.voiceMessage?o`<p role="status" aria-live="polite" aria-atomic="true">${this.voiceMessage}</p>`:c}
          ${n&&this.pendingVoiceAnswer?o`
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
    `}renderNavigation(e,t){const i=t==="rating"&&this.ratingIndex===this.dimensions.length-1,s=t==="pair"&&this.pairIndex===this.pairOrder.length-1,n=t==="rating"&&this.editingRatingFromReview?"Save change and return to review":i?this.pairOrder.length?"Continue to comparisons":"Review responses":s?"Review responses":"Next question",a=t==="rating"&&this.editingRatingFromReview?"Cancel change and return to review":"Previous question";return o`
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
          data-gaze-label=${n}
          @click=${()=>this.goNext(t)}
        >
          ${n}
        </button>
      </div>
    `}renderReview(){return o`
      <section class="panel" id="question-panel" aria-labelledby="review-heading">
        <h2 id="review-heading">Review your responses</h2>
        <p>Check every response before calculating the ${this.definition.scoring.scoreName.toLowerCase()}.</p>

        ${(this.hostSubmissionFailed||this.browserStorageFailed)&&this.submittedRecord?o`
              <section class="submission-recovery" aria-labelledby="submission-recovery-heading">
                <h3 id="submission-recovery-heading">
                  ${this.browserStorageFailed?"The browser could not save the completed record":"The study platform has not confirmed this response"}
                </h3>
                <p>
                  ${this.browserStorageFailed?"The study platform has not been contacted. Your answers remain reviewable on this page. Retry saving, change an answer, or download a backup before leaving.":"Your answers remain reviewable on this page. Retry submission, change an answer, or download a backup before leaving."}
                </p>
                ${this.completionSavedLocally?o`<p>A complete backup is also stored in this browser on this device.</p>`:o`<p>
                      This browser could not store a completed backup. Download JSON or CSV before leaving this page.
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
                ${this.pairOrder.map(e=>{const t=this.dimensionById.get(e.left),i=this.dimensionById.get(e.right),s=this.dimensionById.get(this.pairResponses[e.id]);return o`<li>${t.name} or ${i.name}: <strong>${s.name}</strong></li>`})}
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
            data-gaze-label=${this.browserStorageFailed?"Retry saving and submitting responses":this.hostSubmissionFailed?"Retry submission":"Calculate and submit responses"}
            ?disabled=${this.submittingResult}
            @click=${this.submitResponses}
          >
            ${this.submittingResult?"Submitting responses…":this.browserStorageFailed?"Retry saving and submitting responses":this.hostSubmissionFailed?"Retry submission":"Calculate and submit responses"}
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
    `}announceSavedSessionOffer(e){const t=`${e.configId}:${e.participantCode}:${e.savedAt}`;if(this.savedSessionAnnouncementKey===t)return;this.savedSessionAnnouncementKey=t;const i=this.savedSessionOfferSpeech(e);this.statusMessage="",this.updateComplete.then(()=>{const s=this.savedSession;if(!s||s.savedAt!==e.savedAt||s.configId!==e.configId||s.participantCode!==e.participantCode)return;const n=this.querySelector("#saved-session-offer");n&&A(n,{block:"center",forceCoordinateScroll:!0,onReveal:()=>this.requestParentReveal(n)}),window.setTimeout(()=>{const a=this.savedSession;!this.isConnected||!a||a.savedAt!==e.savedAt||a.configId!==e.configId||a.participantCode!==e.participantCode||(this.statusMessage=i,this.audioGuidance&&this.speakText(i))},650)})}savedSessionOfferSpeech(e){return`Saved questionnaire found. ${Object.keys(e.ratings).length+Object.keys(e.pairResponses).length} of ${this.dimensions.length+this.pairs.length} responses are saved in this browser. Resume saved questionnaire. Erase saved answers.`}renderSavedSessionOffer(){if(!this.savedSession)return c;const e=Object.keys(this.savedSession.ratings).length+Object.keys(this.savedSession.pairResponses).length;return o`
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
    `}setSimpleLanguage(e){const t=e.currentTarget.checked;this.recordSupportChange("simpler-explanations",this.showSimpleLanguage,t),this.showSimpleLanguage=t,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(t?this.currentSimpleExplanationSpeech():this.isResearcherSuppliedDefinition?"Simpler explanations are off. The questionnaire item wording remains available.":"Simpler explanations are off. The official questionnaire wording remains available.")}recordSupportChange(e,t,i){!this.studyConfig||t===i||this.stage==="complete"||(this.supportChanges=[...this.supportChanges,{setting:e,from:t,to:i,stage:this.stage,changedAt:new Date().toISOString()}])}setAnswerMode(e){e==="smiley"&&!this.definition.supports.smileyLandmarks||(this.recordSupportChange("answer-mode",this.answerMode,e),this.answerMode=e,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(e==="smiley"?"Smiley landmark answer format selected. Each rating offers five labelled values, with the full precise scale available on request.":`Standard answer format selected. Each rating uses ${this.ratingValues.length} values from ${this.definition.scale.minimum} to ${this.definition.scale.maximum} in steps of ${this.definition.scale.step}.`))}setLargeText(e){this.recordSupportChange("text-size",this.largeText?"large":"standard",e?"large":"standard"),this.largeText=e,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(`${e?"Large":"Standard"} text selected.`)}setRecovery(e){const t=e.currentTarget.checked;this.recordSupportChange("interruption-recovery",this.recoveryEnabled,t),this.recoveryEnabled=t,this.invalidatePendingSubmission(),this.recoveryEnabled?(this.rememberParticipantCodeForTab(),this.persistProgress()):(this.forgetParticipantCodeForTab(),this.clearSavedProgress()),this.announceAutomatic(t?"Interruption recovery is on. Incomplete answers will be stored in this browser.":"Interruption recovery is off. The saved in-progress copy has been removed.")}landmarkLabel(e,t){const i=this.smileyLandmarks.find(s=>s.value===t)?.position;return i==="low"?e.lowAnchor:i==="closer-low"?`Closer to ${e.lowAnchor}`:i==="middle"?"Middle":i==="closer-high"?`Closer to ${e.highAnchor}`:i==="high"?e.highAnchor:String(t)}ratingValueLabel(e,t){const i=e.responseLabels?.[String(t)];return i&&i!==String(t)?i:t===this.definition.scale.minimum?e.lowAnchor:t===this.definition.scale.maximum?e.highAnchor:null}visibleResponseLabel(e,t){const i=e.responseLabels?.[String(t)];if(!i||i===String(t))return null;const s=t===this.definition.scale.minimum?e.lowAnchor:t===this.definition.scale.maximum?e.highAnchor:null,n=a=>a.replace(/\s+/g," ").trim();return s&&n(i)===n(s)?null:i}ratingOptionLabel(e,t){if(this.definition.scale.type==="semantic-differential"){const s=this.ratingValues.indexOf(t)+1,n=this.ratingValueLabel(e,t);return n?`Position ${s} of ${this.ratingValues.length}, ${n}, for ${e.name}`:`Position ${s} of ${this.ratingValues.length}, between ${e.lowAnchor} and ${e.highAnchor}, for ${e.name}`}const i=this.ratingValueLabel(e,t);return i?`${t}, ${i}, for ${e.name}`:`${t} for ${e.name}`}ratingVoicePrompt(e){if(this.answerMode!=="smiley"){const n=`For the clearest recognition, say “number ${this.ratingValues[Math.min(3,this.ratingValues.length-1)]}”, using any value shown from ${this.definition.scale.minimum} to ${this.definition.scale.maximum} in steps of ${this.definition.scale.step}. Other numbers are not rounded or guessed.`;return this.ratingValues.flatMap(r=>{const l=e.responseLabels?.[String(r)];return l?[`${r}, ${l}`]:[]}).length>0&&F(this.definition.language)?`${n} You may instead say one complete visible answer label.`:this.definition.scale.type==="magnitude"?n:`${n} You may instead say the exact visible endpoint label: ${e.lowAnchor} or ${e.highAnchor}.`}const t=this.smileyLandmarks.map(({value:s})=>this.landmarkLabel(e,s)),i=this.smileyLandmarks.map(({value:s})=>s);return`For the most reliable voice input, say one shown value: ${i.slice(0,-1).join(", ")}, or ${i.at(-1)}. You may instead say one visible label: ${t.slice(0,-1).join(", ")}, or ${t.at(-1)}. On a phone, use the number if a short label such as Low is not recognised.`}ratingVoiceAnswerLabel(e,t){const i=this.answerMode==="smiley"&&this.smileyLandmarks.some(n=>n.value===t),s=this.ratingValueLabel(e,t);return i?`${this.landmarkLabel(e,t)}, value ${t}, for ${e.name}`:s?`${s}, value ${t}, for ${e.name}`:`${t} for ${e.name}`}ratingRouteLabel(e){const t=this.ratingInputRoutes[e];return t==="smiley-landmark"?"smiley landmark":t==="voice"?"voice, confirmed":t==="gaze-standard-scale"?"gaze, standard scale, confirmed":t==="gaze-smiley-landmark"?"gaze, smiley landmark, confirmed":"full scale"}reviewRatingLabel(e){const t=this.ratings[e.id];if(t===void 0)return"No answer";const i=this.ratingValueLabel(e,t);if(this.definition.scale.type==="semantic-differential"){const s=`Position ${this.ratingValues.indexOf(t)+1} of ${this.ratingValues.length}`;return i?`${s} — ${i}`:s}return i?`${t} — ${i}`:String(t)}reviewRatingScaleContextText(e){const t=this.ratings[e.id];return t===void 0||this.ratingValueLabel(e,t)?null:this.definition.scale.type==="semantic-differential"?`Scale endpoints: ${e.lowAnchor} to ${e.highAnchor}`:`Scale: ${this.definition.scale.minimum} — ${e.lowAnchor} to ${this.definition.scale.maximum} — ${e.highAnchor}`}renderReviewRatingScaleContext(e){return this.reviewRatingScaleContextText(e)?this.definition.scale.type==="semantic-differential"?o`<span class="review-scale-context">
        Scale endpoints:
        <span lang=${this.definition.language} dir="auto">${e.lowAnchor}</span>
        to
        <span lang=${this.definition.language} dir="auto">${e.highAnchor}</span>
      </span>`:o`<span class="review-scale-context">
      Scale: ${this.definition.scale.minimum} —
      <span lang=${this.definition.language} dir="auto">${e.lowAnchor}</span>
      to ${this.definition.scale.maximum} —
      <span lang=${this.definition.language} dir="auto">${e.highAnchor}</span>
    </span>`:c}reviewRatingAccessibleLabel(e){const t=this.reviewRatingLabel(e),i=this.reviewRatingScaleContextText(e);return i?`${t}. ${i}`:t}selectRating(e,t,i){i!=="voice"&&this.voiceState!=="idle"&&this.clearVoiceAnswer();const s=this.gazeActivationInProgress?i==="smiley-landmark"?"gaze-smiley-landmark":"gaze-standard-scale":i;if(this.editingRatingFromReview){const l=this.reviewRatingEdit;if(!l||l.itemId!==e||l.itemIndex!==this.ratingIndex){this.showError("This review edit is no longer valid. Return to the review and open the answer again.");return}this.reviewRatingEdit={...l,pendingValue:t,pendingInputRoute:s}}else this.invalidatePendingSubmission(),this.ratings={...this.ratings,[e]:t},this.ratingInputRoutes={...this.ratingInputRoutes,[e]:s};this.clearError();const n=this.dimensionById.get(e),a=this.answerMode==="smiley"&&this.smileyLandmarks.some(l=>l.value===t),r=this.ratingValueLabel(n,t);this.statusMessage=a?`${n.name}, ${this.landmarkLabel(n,t)}, value ${t}, selected.`:r?`${n.name}, ${r}, value ${t}, selected.`:`${n.name}, ${t}, selected.`,this.announceAutomatic(this.statusMessage),this.editingRatingFromReview||this.persistProgress()}selectPair(e,t,i){i!=="voice"&&this.voiceState!=="idle"&&this.clearVoiceAnswer(),this.invalidatePendingSubmission();const s=this.gazeActivationInProgress?"gaze":i;this.pairResponses={...this.pairResponses,[e]:t},this.pairInputRoutes={...this.pairInputRoutes,[e]:s},this.clearError(),this.statusMessage=`${this.dimensionById.get(t).name} selected.`,this.announceAutomatic(this.statusMessage),this.persistProgress()}goNext(e){if(this.stopReading(),this.clearVoiceAnswer(),e==="rating"){const t=this.dimensions[this.ratingIndex],i=this.editingRatingFromReview?this.reviewRatingEdit:null;if((i?.itemId===t.id?i.pendingValue:this.ratings[t.id])===void 0){this.showError(`Choose a rating for ${t.name} before continuing.`);return}if(this.editingRatingFromReview){if(!i||i.itemId!==t.id||i.itemIndex!==this.ratingIndex){this.showError("This review edit is no longer valid. Return to the review and open the answer again.");return}const n=this.reviewReturnFocusIndex??this.ratingIndex,a=i.pendingValue!==i.originalValue||i.pendingInputRoute!==i.originalInputRoute;if(a){this.invalidatePendingSubmission(),this.ratings={...this.ratings,[t.id]:i.pendingValue};const r={...this.ratingInputRoutes};i.pendingInputRoute===void 0?delete r[t.id]:r[t.id]=i.pendingInputRoute,this.ratingInputRoutes=r}this.editingRatingFromReview=!1,this.reviewRatingEdit=null,this.stage="review",this.clearError(),this.persistProgress(),this.focusReviewItem(n,a?`${this.dimensions[n].name} answer updated.`:`${this.dimensions[n].name} answer unchanged.`);return}this.ratingIndex<this.dimensions.length-1?this.ratingIndex+=1:this.pairOrder.length?(this.stage="pairs",this.pairIndex=0):this.stage="review"}else{const t=this.pairOrder[this.pairIndex];if(!this.pairResponses[t.id]){this.showError("Choose which factor contributed more to workload before continuing.");return}this.pairIndex<this.pairOrder.length-1?this.pairIndex+=1:this.stage="review"}this.clearError(),this.persistProgress(),this.focusHeading()}editRatingFromReview(e){const t=this.dimensions[e],i=this.ratings[t.id];if(i===void 0){this.showError(`${t.name} has no saved answer to edit.`);return}this.editingRatingFromReview=!0,this.reviewRatingEdit={itemIndex:e,itemId:t.id,originalValue:i,originalInputRoute:this.ratingInputRoutes[t.id],pendingValue:i,pendingInputRoute:this.ratingInputRoutes[t.id]},this.reviewReturnFocusIndex=e,this.stage="ratings",this.ratingIndex=e,this.focusHeading()}focusReviewItem(e,t){this.updateComplete.then(()=>{const i=this.querySelector(`#review-item-${e+1}`);if(this.reviewReturnFocusIndex=null,!i){this.focusHeading();return}A(i,{block:"center",onReveal:()=>this.requestParentReveal(i)}),this.statusMessage=`${t} ${this.reviewRatingAccessibleLabel(this.dimensions[e])}`,this.announceAutomatic(this.statusMessage)})}effectiveStudyConfig(){return this.studyConfig?this.studyConfig:{schemaVersion:4,configId:"demo-config",createdAt:this.startedAt||new Date().toISOString(),prototypeVersion:Z,instrumentId:this.definition.id,definitionHash:Ve(this.definition),studyId:"DEMO",studyTitle:"Technical demonstration",taskLabel:"a task completed before the questionnaire",showScoreToParticipant:!0,support:{showSimpleLanguage:!1,answerMode:"standard",largeText:!1,audioGuidance:!1,recoveryEnabled:!1,participantAdjustmentPolicy:"presentation-only",voiceInputAvailable:!0,gazeInputAvailable:!0},collection:{mode:"local"}}}currentSupportMetadata(){return{simplerExplanationsShownAtSubmission:this.showSimpleLanguage,largeTextUsedAtSubmission:this.largeText,answerModeAtSubmission:this.answerMode,recoveryEnabledAtSubmission:this.recoveryEnabled,interruptionSummaryShown:this.interruptionSummaryShown,readAloudUsed:this.readAloudUsed,automaticAudioGuidanceEnabledAtSubmission:this.audioGuidance,gazeUsed:this.gazeUsed,gazeActionCount:this.gazeActionCount,gazeEngine:this.gazeUsed?`WebGazer ${B}`:null,ratingInputRoutes:this.ratingInputRoutes,pairInputRoutes:this.pairInputRoutes,supportChanges:[...this.supportChanges]}}downloadRecordJson(e){X(`${ee(e)}.json`,JSON.stringify(e,null,2),"application/json")}downloadRecordCsv(e){X(`${ee(e)}.csv`,`\uFEFF${Ge([e])}`,"text/csv")}invalidatePendingSubmission(){this.submittedRecord&&this.completionSavedLocally&&!this.completionStagedByBridge&&Be(this.submittedRecord.submissionId),this.result=null,this.submittedRecord=null,this.completionSavedLocally=!1,this.completionStagedByBridge=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1,this.browserStorageFailed=!1}announceAutomatic(e){this.audioGuidance&&e.trim()&&this.speakText(e)}speakOpenedHelp(e,t){e.currentTarget.open&&this.announceAutomatic(t)}speakText(e){if(!("speechSynthesis"in window)||!("SpeechSynthesisUtterance"in window)){this.audioStatusMessage="Built-in audio is unavailable in this browser. External screen readers can still read the page.";return}const t=window.speechSynthesis,i=this.readingAloud||t.speaking||t.pending||t.paused,s=++this.speechRequestId,n=new SpeechSynthesisUtterance(e);n.lang="en-GB",n.rate=1,n.pitch=1,n.volume=1,n.onend=()=>{s===this.speechRequestId&&(this.readingAloud=!1,this.audioStatusMessage="Spoken guidance finished.")},n.onerror=r=>{if(s!==this.speechRequestId)return;this.readingAloud=!1;const l=r.error?` (${r.error})`:"";this.audioStatusMessage=`No audio was played because the browser reported a speech error${l}. Check the device volume and try the button again.`};const a=()=>{if(s===this.speechRequestId)try{t.speak(n),this.readingAloud=!0,this.readAloudUsed=!0,this.audioStatusMessage="Playing spoken guidance."}catch{this.readingAloud=!1,this.audioStatusMessage="Built-in audio could not start in this browser. Check the device volume and try the button again."}};i?(t.cancel(),window.setTimeout(a,0)):a()}stopReading(e=!1){this.speechRequestId+=1,"speechSynthesis"in window&&window.speechSynthesis.cancel(),this.readingAloud=!1,e&&(this.audioStatusMessage="Spoken guidance stopped.")}currentStepSpeech(){if(this.stage==="intro"){const t=this.studyConfig?`Think about ${this.studyConfig.taskLabel}.`:"",i=this.answerMode==="smiley"?"The rating format uses five labelled smiley landmarks. A precise scale is available on request.":`The rating format uses ${this.ratingValues.length} values from ${this.definition.scale.minimum} to ${this.definition.scale.maximum}.`,s=this.pairs.length?` Then make ${this.pairs.length} pairwise comparisons.`:"";return`Before you begin. ${this.definition.introPrompt} ${t} Answer ${this.dimensions.length} items. ${i}${s} Finally review and submit.`}if(this.stage==="ratings"){const t=this.dimensions[this.ratingIndex],i=this.showSimpleLanguage&&t.simpleExplanation?` Simpler explanation: ${t.simpleExplanation}`:"",s=this.answerMode==="smiley"?`Choose a smiley landmark: ${this.smileyLandmarks.map(({value:n})=>`${this.landmarkLabel(t,n)}, value ${n}`).join("; ")}. A more precise value is available on the full scale.`:`Rate from ${this.definition.scale.minimum}, ${t.lowAnchor}, to ${this.definition.scale.maximum}, ${t.highAnchor}, in steps of ${this.definition.scale.step}.`;return`Rating ${this.ratingIndex+1} of ${this.dimensions.length}. ${t.name}. Official item: ${t.prompt}.${i} ${s}`}if(this.stage==="pairs"){const t=this.pairOrder[this.pairIndex],i=this.dimensionById.get(t.left),s=this.dimensionById.get(t.right),n=this.showSimpleLanguage?` In simpler words, ${this.definition.pairwise.simplePrompt} ${i.name}: ${i.shortMeaning}. ${s.name}: ${s.shortMeaning}.`:"";return`Comparison ${this.pairIndex+1} of ${this.pairOrder.length}. ${this.definition.pairwise.prompt} ${this.definition.pairwise.instruction} Choose ${i.name} or ${s.name}.${n}`}return this.stage==="review"?`Review ${this.dimensions.length} item responses${this.pairs.length?` and ${this.pairs.length} comparisons`:""} before submitting.`:this.studyConfig&&this.remoteRecordingUnconfirmed?this.statusMessage.trim()||"Qualtrics could not confirm this response. Reconnect to the internet, then select Next to try again. Keep this page open or download one backup before closing it.":this.studyConfig&&this.completionStagedByBridge?"Waiting for Qualtrics. Keep this page open.":this.result?`Responses calculated.${!this.studyConfig||this.studyConfig.showScoreToParticipant?` ${this.result.scoreName}: ${this.result.primaryScore.toFixed(2)} out of ${this.result.scoreMaximum}.`:""} JSON and CSV backup buttons are available on this page.`:"Responses calculated."}currentSimpleExplanationSpeech(){if(this.stage==="ratings"){const e=this.dimensions[this.ratingIndex];return e.simpleExplanation?`Simpler explanation for ${e.name}. ${e.simpleExplanation} Use the ${this.isResearcherSuppliedDefinition?"declared":"official"} scale when choosing your response.`:"This questionnaire definition does not provide reworded item text."}if(this.stage==="pairs"){const e=this.pairOrder[this.pairIndex],t=this.dimensionById.get(e.left),i=this.dimensionById.get(e.right);return`In simpler words, ${this.definition.pairwise.simplePrompt} ${t.name}: ${t.shortMeaning}. ${i.name}: ${i.shortMeaning}.`}return"Simpler explanations are on. Official questionnaire wording remains visible."}resumeSummarySpeech(){return`Welcome back. ${this.completedCount()} of ${this.dimensions.length+this.pairs.length} responses completed. Last saved response: ${this.lastSavedDescription()}. Current position: ${this.currentPositionDescription()}. Next action: ${this.nextActionDescription()}`}async showGazePositioningStep(e){this.webgazer&&(this.restoreWebGazerPreviewContainer(),this.webgazer.showPredictionPoints(!1),this.webgazer.showVideoPreview(!0),this.webgazer.showFaceOverlay(!0),this.webgazer.showFaceFeedbackBox(!0),this.gazeState="positioning",this.gazeMessage=e,this.announceAutomatic(this.gazeMessage),await this.updateComplete,this.mountWebGazerPreview(),this.querySelector("#gaze-positioning-heading")?.focus())}mountWebGazerPreview(){const e=this.querySelector(".gaze-camera-preview-slot"),t=document.querySelector("#webgazerVideoContainer");!e||!t||(t.setAttribute("aria-hidden","true"),e.append(t))}restoreWebGazerPreviewContainer(){const e=document.querySelector("#webgazerVideoContainer");e&&e.parentElement!==document.body&&document.body.append(e)}handleGazePoint(e){if(this.gazeState!=="ready"||!e){this.resetGazeHover();return}const t=this.elementsAtGazePoint(e);if(this.gazePendingElement){const r=t.map(g=>g.closest("[data-gaze-confirm], [data-gaze-cancel]")).find(g=>g!==null)??null,l=r?.hasAttribute("data-gaze-confirm")?"confirm":r?.hasAttribute("data-gaze-cancel")?"cancel":null,d=this.gazeConfirmationTracker.update(l,performance.now());this.gazeDwellProgress=d.progress,d.activated&&l==="confirm"&&this.confirmGazeProposal(),d.activated&&l==="cancel"&&this.cancelGazeProposal();return}const i=t.map(r=>r.closest("[data-gaze-target]")).find(r=>r!==null)??null,s=i&&!i.matches(":disabled")?i:null;s!==this.gazeCandidateElement&&(this.resetGazeHover(),this.gazeCandidateElement=s);const n=s?.dataset.gazeLabel??s?.textContent?.trim()??null,a=this.gazeCandidateTracker.update(n,performance.now());this.setGazeHover(s,a.progress),s&&a.activated&&(this.gazePendingElement=s,this.gazePendingLabel=n??"selected control",this.gazeDwellProgress=0,this.resetGazeHover(),this.statusMessage=`${this.gazePendingLabel} proposed by gaze. Confirm or cancel.`,this.announceAutomatic(this.statusMessage))}elementsAtGazePoint(e){if(typeof document.elementsFromPoint=="function")return document.elementsFromPoint(e.x,e.y).filter(i=>i instanceof HTMLElement);const t=document.elementFromPoint(e.x,e.y);return t instanceof HTMLElement?[t]:[]}setGazeHover(e,t){this.gazeCandidateElement=e,this.gazeDwellProgress=t,e&&(e.classList.add("gaze-hover"),e.style.setProperty("--gaze-progress",`${t*100}%`))}resetGazeHover(){this.gazeCandidateTracker.reset(),this.gazeCandidateElement&&(this.gazeCandidateElement.classList.remove("gaze-hover"),this.gazeCandidateElement.style.removeProperty("--gaze-progress")),this.gazeCandidateElement=null,this.gazePendingElement||(this.gazeDwellProgress=0)}stopGazeInputInternal(e){const t=this.gazeState!=="off"||this.webgazer!==null;this.cancelGazeProposal(),this.resetGazeHover(),this.restoreWebGazerPreviewContainer(),this.releaseGazeResources(),this.gazeState="off",this.gazeMessage="Gaze input and camera stopped.",e&&t&&this.announceAutomatic(this.gazeMessage)}releaseGazeResources(){const e=this.webgazer;if(e){this.restoreWebGazerPreviewContainer();try{e.clearGazeListener()}catch{}try{e.removeMouseEventListeners()}catch{}try{e.stopVideo()}catch{}try{e.end()}catch{}Promise.resolve(e.clearData()).catch(()=>{}),this.webgazer=null}}async startVoiceInput(e,t,i,s=!0,n=!0){this.stopReading();const a=window.SpeechRecognition??window.webkitSpeechRecognition;if(!a)return;this.releaseRecognition(),this.pendingVoiceAnswer=null,this.voiceMessage="Preparing voice input.",this.voiceState="listening";const r=new a;this.recognition=r;const l=a===window.SpeechRecognition?a:void 0;let d;if(n&&l?.available&&"processLocally"in r?d=await ht(l,r,!0):(r.lang="en-GB","processLocally"in r&&(r.processLocally=!1),d={action:"start",mode:"remote",lang:"en-GB",message:"Listening for one answer using the browser speech service."}),this.recognition!==r)return;if(d.action==="wait"){this.releaseRecognition(r),this.showVoiceNotice(d.message);return}this.voiceMessage=d.message;const g=d.mode==="local";r.continuous=!1,r.interimResults=!1;const y=s?this.configureVoiceHints(r,e,t,i):!1;r.maxAlternatives=5,r.onresult=b=>{if(this.recognition!==r)return;const m=b.results[0],f=[];for(let w=0;m&&w<m.length;w+=1){const C=m[w]?.transcript?.trim();C&&f.push(C)}if(e==="rating"){const w=ot(f,t,this.ratingValues,this.smileyLandmarks),C=F(this.definition.language)||w&&new RegExp("\\p{Number}|\\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\\b","iu").test(w.transcript)?w:null;if(C){this.releaseRecognition(r);const J=this.ratingVoiceAnswerLabel(t,C.value);this.pendingVoiceAnswer={context:e,transcript:C.transcript,value:C.value,label:J},this.voiceState="pending",this.voiceMessage=`Proposed answer: ${J}. Confirm only if the heard words and proposed answer match what you intended; otherwise try again.`,this.announceAutomatic(this.voiceMessage),this.updateComplete.then(()=>this.querySelector("[data-voice-confirm]")?.focus());return}}else{const w=lt(f,[t,i]);if(w){this.releaseRecognition(r);const C=this.dimensionById.get(w.value).name;this.pendingVoiceAnswer={context:e,transcript:w.transcript,value:w.value,label:C},this.voiceState="pending",this.voiceMessage=`Proposed answer: ${C}. Confirm only if the heard words and proposed answer match what you intended; otherwise try again.`,this.announceAutomatic(this.voiceMessage),this.updateComplete.then(()=>this.querySelector("[data-voice-confirm]")?.focus());return}}this.releaseRecognition(r);const v=f.find(w=>Ce(w))??f[0],S=v?` I heard “${v}”.`:"";this.showVoiceNotice(e==="rating"?`No answer was selected.${S} Try a short command such as “number four”, or use a visible answer button.`:`No answer was selected.${S} Say ${t.name} or ${i.name}, or use a visible answer button.`)},r.onerror=b=>{if(this.recognition===r){if(this.releaseRecognition(r),b.error==="phrases-not-supported"&&y){this.startVoiceInput(e,t,i,!1,n);return}if(b.error==="language-not-supported"&&g&&n){this.startVoiceInput(e,t,i,s,!1);return}this.showVoiceNotice(this.voiceRecognitionErrorMessage(b.error))}},r.onend=()=>{this.recognition===r&&(this.recognition=null,this.voiceState==="listening"&&this.showVoiceNotice("No answer was selected. Try again, or use a visible answer button."))};try{r.start()}catch{this.releaseRecognition(r),this.showVoiceNotice("Voice input is unavailable in this browser context. Use a visible answer button.")}}configureVoiceHints(e,t,i,s){const n=window.SpeechRecognitionPhrase;if(!n||!("phrases"in e))return!1;const a=t==="rating"?Xe(i,this.ratingValues,this.smileyLandmarks,F(this.definition.language)):et([i,s]);try{return e.phrases=a.slice(0,120).map(r=>new n(r,4)),!0}catch{return!1}}voiceRecognitionErrorMessage(e){switch(e){case"not-allowed":case"service-not-allowed":return"Microphone or speech-service permission was not granted. Allow microphone access, or use the visible answer buttons.";case"language-not-supported":case"language-unavailable":return"English voice input is unavailable in this browser. Use a visible answer button.";case"no-speech":return"No speech was detected. Try again after the microphone starts listening, or use the visible answer buttons.";case"audio-capture":return"No working microphone was available. Check the selected microphone, or use the visible answer buttons.";case"network":return"The browser speech service could not connect. Check the network, try again, or use the visible answer buttons.";case"aborted":return"Voice input stopped before a result was returned. Try again, or use the visible answer buttons.";case"phrases-not-supported":return"Voice input is unavailable in this browser. Try again, or use a visible answer button.";default:return`Voice input is unavailable${e?` (${e})`:""}. Try again, or use a visible answer button.`}}showVoiceNotice(e){this.voiceState="error",this.voiceMessage=e,this.announceAutomatic(e)}releaseRecognition(e=this.recognition){if(e){this.recognition===e&&(this.recognition=null),e.onresult=null,e.onerror=null,e.onend=null;try{e.stop()}catch{}}}reloadForParticipantStudyLink(){window.location.reload()}currentProgressStorageKey(){const e=this.studyConfig?this.participantCode:"DEMO";return $(e)?_e(this.studyConfig?.configId??"demo-config",e):null}currentTabParticipantCodeKey(){return this.studyConfig?`accessible-questionnaire-v0.8-tab-participant:${this.studyConfig.configId}`:null}currentTabParticipantBindingKey(){return this.studyConfig?`accessible-questionnaire-v0.8-tab-participant-binding:${this.studyConfig.configId}`:null}rememberParticipantCodeForTab(e=!1){const t=this.currentTabParticipantCodeKey();if(!(!t||!this.recoveryEnabled||!$(this.participantCode)))try{if(sessionStorage.setItem(t,this.participantCode),e){const i=this.currentTabParticipantBindingKey();if(i){const s={version:1,linkParticipantCode:this.prefilledParticipantCode||null,activeParticipantCode:this.participantCode};sessionStorage.setItem(i,JSON.stringify(s))}}}catch{}}forgetParticipantCodeForTab(){const e=this.currentTabParticipantCodeKey();if(e)try{sessionStorage.removeItem(e);const t=this.currentTabParticipantBindingKey();t&&sessionStorage.removeItem(t)}catch{}}restoreParticipantCodeForTab(){const e=this.currentTabParticipantCodeKey();if(!(!e||!this.recoveryEnabled||this.invalidParticipantParameter))try{const t=this.currentTabParticipantBindingKey(),i=t?sessionStorage.getItem(t):null;if(i)try{const n=JSON.parse(i),a=this.prefilledParticipantCode||null;if(n.version===1&&(n.linkParticipantCode===null||typeof n.linkParticipantCode=="string"&&$(n.linkParticipantCode))&&typeof n.activeParticipantCode=="string"&&$(n.activeParticipantCode)&&typeof n.activeParticipantCode=="string"&&n.linkParticipantCode===a){this.participantCode!==n.activeParticipantCode&&(this.participantCode=n.activeParticipantCode,this.participantCodeRestoredForTab=!0,this.statusMessage="Participant code restored for this tab. Checking for interrupted answers.");return}}catch{}if($(this.participantCode))return;const s=sessionStorage.getItem(e);if(!s||!$(s))return;this.participantCode=s,this.participantCodeRestoredForTab=!0,this.statusMessage="Participant code restored for this tab. Checking for interrupted answers."}catch{}}persistProgress(){if(!this.recoveryEnabled||!this.isInProgress())return;const e=this.currentProgressStorageKey();if(!e)return;const t={version:4,instrumentId:this.definition.id,questionnaireDefinition:this.definition,savedAt:Date.now(),startedAt:this.startedAt||new Date().toISOString(),configId:this.studyConfig?.configId??"demo-config",participantCode:this.studyConfig?this.participantCode:"DEMO",stage:this.stage,ratingIndex:this.ratingIndex,pairIndex:this.pairIndex,pairOrder:this.pairOrder,pairResponses:this.pairResponses,ratings:this.ratings,ratingInputRoutes:this.ratingInputRoutes,pairInputRoutes:this.pairInputRoutes,supportChanges:this.supportChanges,support:{answerMode:this.answerMode,showSimpleLanguage:this.showSimpleLanguage,largeText:this.largeText,audioGuidance:this.audioGuidance}};try{localStorage.setItem(e,JSON.stringify(t)),this.rememberParticipantCodeForTab(!0)}catch{this.statusMessage="Progress could not be saved by this browser.",this.announceAutomatic(this.statusMessage)}}applySavedRecoveryPresentation(e){this.canAdjustPresentationSupport&&(this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance)}findSavedSession(){const e=this.currentProgressStorageKey();if(!e)return;this.savedSessionProblem="";let t=null;try{let i=localStorage.getItem(e);if(!i&&this.definition.id===x){const a=this.studyConfig?this.participantCode:"DEMO";$(a)&&(t=`accessible-nasa-tlx-v0.7-progress:${this.studyConfig?.configId??"demo-config"}:${a}`,i=localStorage.getItem(t))}if(!i)return;const s=JSON.parse(i),n=this.normaliseSavedSession(s);if(this.validSavedSession(n)){if(t)localStorage.setItem(e,JSON.stringify(n)),localStorage.removeItem(t);else if(s&&typeof s=="object"&&!("questionnaireDefinition"in s))try{localStorage.setItem(e,JSON.stringify(n))}catch{}this.savedSession=n,this.savedSessionProblem="",this.applySavedRecoveryPresentation(n),this.announceSavedSessionOffer(n)}else t?this.savedSessionProblem="An older saved copy does not match this questionnaire and was not changed or deleted. Start this questionnaire again below.":(this.savedSessionProblem="The saved copy does not match this questionnaire and was not used. Start this questionnaire again below.",this.clearSavedProgress())}catch{t?this.savedSessionProblem="An older saved copy could not be read and was not changed or deleted. Start this questionnaire again below.":(this.savedSessionProblem="The saved copy could not be read and was not used. Start this questionnaire again below.",this.clearSavedProgress())}}normaliseSavedSession(e){if(!e||typeof e!="object")return null;const t=e;if(t.version===4){if("questionnaireDefinition"in t)return t;const i=Y(t.instrumentId);return!i||i.id!==this.definition.id?null:{...t,questionnaireDefinition:i}}return t.version!==3||this.definition.id!==x?null:{...t,version:4,instrumentId:x,questionnaireDefinition:this.definition}}findCompletedBackup(){if(!this.studyConfig||!$(this.participantCode))return;const e=Fe().filter(t=>t.study.configId===this.studyConfig.configId&&t.participantCode===this.participantCode);this.recoveredCompletedRecord=e.at(-1)??null}validSavedSession(e){if(e?.version!==4||e.instrumentId!==this.definition.id||JSON.stringify(e.questionnaireDefinition)!==JSON.stringify(this.definition)||e.configId!==(this.studyConfig?.configId??"demo-config")||e.participantCode!==(this.studyConfig?this.participantCode:"DEMO")||!Number.isFinite(e.savedAt)||typeof e.startedAt!="string"||!["ratings","pairs","review"].includes(e.stage)||!Number.isInteger(e.ratingIndex)||e.ratingIndex<0||e.ratingIndex>=this.dimensions.length||!Number.isInteger(e.pairIndex)||e.pairIndex<0||e.pairIndex>=Math.max(1,this.pairs.length)||e.stage==="pairs"&&this.pairs.length===0||!Array.isArray(e.pairOrder)||!Array.isArray(e.supportChanges)||!e.ratings||typeof e.ratings!="object"||!e.pairResponses||typeof e.pairResponses!="object"||!e.ratingInputRoutes||typeof e.ratingInputRoutes!="object"||!e.pairInputRoutes||typeof e.pairInputRoutes!="object"||!e.support||typeof e.support!="object"||!["standard","smiley"].includes(e.support.answerMode)||typeof e.support.showSimpleLanguage!="boolean"||typeof e.support.largeText!="boolean"||e.support.audioGuidance!==void 0&&typeof e.support.audioGuidance!="boolean")return!1;const t=new Set(this.dimensions.map(({id:a})=>a)),i=new Set(this.ratingValues);if(Object.entries(e.ratings).some(([a,r])=>!t.has(a)||typeof r!="number"||!i.has(r))||Object.entries(e.ratingInputRoutes).some(([a,r])=>!t.has(a)||typeof r!="string"||!["standard-scale","smiley-landmark","voice","gaze-standard-scale","gaze-smiley-landmark"].includes(r)))return!1;const s=new Map(this.pairs.map(a=>[a.id,a])),n=new Set;for(const a of e.pairOrder){const r=s.get(a?.id);if(!r||r.left!==a.left||r.right!==a.right||n.has(a.id))return!1;n.add(a.id)}return!(n.size!==s.size||Object.entries(e.pairResponses).some(([a,r])=>{const l=s.get(a);return!l||r!==l.left&&r!==l.right})||Object.entries(e.pairInputRoutes).some(([a,r])=>!s.has(a)||typeof r!="string"||!["standard-choice","voice","gaze"].includes(r)))}clearSavedProgress(){const e=this.currentProgressStorageKey();if(e)try{localStorage.removeItem(e)}catch{}}isInProgress(){return this.stage==="ratings"||this.stage==="pairs"||this.stage==="review"}completedCount(){return Object.keys(this.ratings).length+Object.keys(this.pairResponses).length}lastSavedDescription(){if(this.stage==="ratings"){const e=this.ratings[this.dimensions[this.ratingIndex].id]!==void 0?this.ratingIndex:this.ratingIndex-1;return e>=0?`${this.dimensions[e].name} rating`:"No response yet"}return this.stage==="pairs"?this.pairResponses[this.pairOrder[this.pairIndex].id]?`Comparison ${this.pairIndex+1}`:this.pairIndex>0?`Comparison ${this.pairIndex}`:`${this.dimensions.at(-1)?.name??"Final item"} rating`:this.pairs.length?`Comparison ${this.pairs.length}`:`${this.dimensions.at(-1)?.name??"Final item"} rating`}currentPositionDescription(){return this.stage==="ratings"?`Rating ${this.ratingIndex+1} of ${this.dimensions.length}: ${this.dimensions[this.ratingIndex].name}`:this.stage==="pairs"?`Comparison ${this.pairIndex+1} of ${this.pairOrder.length}`:this.stage==="review"?"Review responses":"Questionnaire introduction"}nextActionDescription(){if(this.stage==="ratings")return`Choose or check the ${this.dimensions[this.ratingIndex].name} rating, then select Next.`;if(this.stage==="pairs"){const e=this.pairOrder[this.pairIndex];return`Choose ${this.dimensionById.get(e.left).name} or ${this.dimensionById.get(e.right).name}, then select Next.`}return"Check the saved answers, then submit or return to a question."}showError(e){this.errorMessage=e,this.updateComplete.then(()=>{const t=this.querySelector("#error-summary");t&&(A(t,{block:"start",forceCoordinateScroll:!0,onReveal:()=>this.requestParentReveal(t)}),this.announceAutomatic(`There is a problem. ${e}`))})}requestParentReveal(e){}clearError(){this.errorMessage=""}focusHeading(e=!0){this.updateComplete.then(()=>{window.scrollTo({top:0});const t=this.querySelector("#question-panel h2");t&&(t.tabIndex=-1,t.focus(),this.statusMessage=t.textContent?.trim()??"",e&&this.audioGuidance&&this.speakText(this.currentStepSpeech()))})}};h([p()],u.prototype,"stage",2);h([p()],u.prototype,"ratingIndex",2);h([p()],u.prototype,"pairIndex",2);h([p()],u.prototype,"pairOrder",2);h([p()],u.prototype,"pairResponses",2);h([p()],u.prototype,"ratings",2);h([p()],u.prototype,"ratingInputRoutes",2);h([p()],u.prototype,"pairInputRoutes",2);h([p()],u.prototype,"supportChanges",2);h([p()],u.prototype,"answerMode",2);h([p()],u.prototype,"showSimpleLanguage",2);h([p()],u.prototype,"largeText",2);h([p()],u.prototype,"recoveryEnabled",2);h([p()],u.prototype,"resumeSummaryVisible",2);h([p()],u.prototype,"savedSession",2);h([p()],u.prototype,"savedSessionProblem",2);h([p()],u.prototype,"recoveredCompletedRecord",2);h([p()],u.prototype,"readingAloud",2);h([p()],u.prototype,"readAloudUsed",2);h([p()],u.prototype,"audioGuidance",2);h([p()],u.prototype,"audioStatusMessage",2);h([p()],u.prototype,"interruptionSummaryShown",2);h([p()],u.prototype,"voiceState",2);h([p()],u.prototype,"voiceMessage",2);h([p()],u.prototype,"pendingVoiceAnswer",2);h([p()],u.prototype,"errorMessage",2);h([p()],u.prototype,"statusMessage",2);h([p()],u.prototype,"result",2);h([p()],u.prototype,"gazeState",2);h([p()],u.prototype,"gazeMessage",2);h([p()],u.prototype,"gazeCalibrationIndex",2);h([p()],u.prototype,"gazeCalibrationRepetition",2);h([p()],u.prototype,"gazePendingLabel",2);h([p()],u.prototype,"gazeDwellProgress",2);h([p()],u.prototype,"gazeUsed",2);h([p()],u.prototype,"gazeActionCount",2);h([p()],u.prototype,"studyConfig",2);h([p()],u.prototype,"configurationError",2);h([p()],u.prototype,"participantCode",2);h([p()],u.prototype,"participantCodeError",2);h([p()],u.prototype,"participantCodeRestoredForTab",2);h([p()],u.prototype,"editingRatingFromReview",2);h([p()],u.prototype,"reviewRatingEdit",2);h([p()],u.prototype,"startedAt",2);h([p()],u.prototype,"submittedRecord",2);h([p()],u.prototype,"completionSavedLocally",2);h([p()],u.prototype,"completionStagedByBridge",2);h([p()],u.prototype,"remoteRecordingUnconfirmed",2);h([p()],u.prototype,"hostSubmissionFailed",2);h([p()],u.prototype,"browserStorageFailed",2);h([p()],u.prototype,"submittingResult",2);h([p()],u.prototype,"hostBridgeState",2);h([p()],u.prototype,"hostBridgeMessage",2);u=h([we("accessible-nasa-tlx")],u);let le=class extends u{};le=h([we("accessible-questionnaire")],le);const de="aqp-accessibility-announcer",vt=7e3;let I=null,q=null,N=null;function wt(e){Object.assign(e.style,{border:"0",clip:"rect(0 0 0 0)",clipPath:"inset(50%)",height:"1px",margin:"-1px",overflow:"hidden",padding:"0",position:"absolute",width:"1px",whiteSpace:"nowrap"})}function ce(e){const t=document.createElement("div");return t.dataset.aqpAnnouncementPriority=e,t.setAttribute("role","log"),t.setAttribute("aria-live",e),t.setAttribute("aria-relevant","additions"),t}function L(){if(I?.isConnected&&q?.isConnected&&N?.isConnected)return I;const e=document.getElementById(de);return e&&e.remove(),I=document.createElement("div"),I.id=de,I.dataset.aqpAccessibilityAnnouncer="true",wt(I),N=ce("assertive"),q=ce("polite"),I.append(N,q),document.body.prepend(I),I}function St(e,t="assertive",i=vt){if(!e.trim())return;L();const s=t==="assertive"?N:q;if(!s)return;const n=document.createElement("div");n.textContent=e,s.append(n),window.setTimeout(()=>n.remove(),i)}typeof document<"u"&&(document.body?L():document.addEventListener("DOMContentLoaded",L,{once:!0}));const $t=15e3,Ae=650,Ct="Voice input stopped. No answer was changed. Try again, or use a visible answer button.",ue="No speech was detected. Voice input stopped. Try again, or use a visible answer button. No answer was changed.",Rt="No speech was detected before the listening time limit. Voice input stopped. Try again, or use a visible answer button. No answer was changed.";function T(e,t){const i=e[t];i!=null&&(window.clearTimeout(i),e[t]=null)}function he(e){T(e,"__rf06VoiceWatchdogTimerId"),T(e,"__rf06ListeningAnnouncementTimerId"),T(e,"__rf06VoiceNoticeTimerId")}function It(e,t){T(e,"__rf06ListeningAnnouncementTimerId"),e.__rf06MessageChannel="status",e.voiceMessage="",e.__rf06ListeningAnnouncementTimerId=window.setTimeout(()=>{e.__rf06ListeningAnnouncementTimerId=null,!(e.recognition!==t||e.voiceState!=="listening")&&(e.voiceMessage="Listening for one answer.")},Ae)}function U(e,t){T(e,"__rf06VoiceNoticeTimerId"),e.__rf06MessageChannel="error",e.voiceState="error",e.voiceMessage="",e.__rf06VoiceNoticeTimerId=window.setTimeout(()=>{e.__rf06VoiceNoticeTimerId=null,!(e.recognition||e.voiceState!=="error")&&(e.showVoiceNotice(t),e.updateComplete.then(()=>{St(t,"assertive")}))},Ae)}function At(e){e.voiceState==="listening"&&(e.releaseRecognition(),e.pendingVoiceAnswer=null,e.__rf06MessageChannel="status",e.showVoiceNotice(Ct),e.updateComplete.then(()=>{e.querySelector("[data-voice-start]")?.focus()}))}function xt(){L();const e=u.prototype;if(e.__rf06Installed)return;e.__rf06Installed=!0;const t=e.startVoiceInput,i=e.releaseRecognition;e.renderVoiceInput=function(n,a,r){if(!this.voiceInputAvailable)return c;const l=!!(window.SpeechRecognition??window.webkitSpeechRecognition),d=this.pendingVoiceAnswer?.context===n,g=n==="rating"?this.ratingVoicePrompt(a):`Say “${a.name}” or “${r.name}”.`,y=this.__rf06MessageChannel==="error"&&!!this.voiceMessage;return o`
      <details class="voice-input" .open=${this.voiceState!=="idle"}>
        <summary>Answer this question by voice</summary>
        <div class="voice-input-content">
          <p>${g}</p>
          <p class="support-boundary">
            Voice input uses English recognition. Say one shown number in English. For an English questionnaire,
            you may instead say one complete visible answer label. When the browser supports contextual speech
            hints, the current visible answers are supplied to improve recognition. Non-English answer labels are
            not recognised. Voice is optional, this prototype does not store audio, and the visible answer buttons
            remain available. While listening, you can stop the attempt at any time.
          </p>
          <div class="button-row compact">
            <button
              class="secondary-button large-answer-button"
              type="button"
              data-voice-start
              ?disabled=${!l||this.voiceState==="listening"}
              @click=${()=>this.startVoiceInput(n,a,r)}
            >
              ${this.voiceState==="listening"?"Listening…":"Start voice input"}
            </button>
            ${this.voiceState==="listening"?o`<button
                  class="secondary-button large-answer-button"
                  type="button"
                  data-voice-stop
                  @click=${()=>At(this)}
                >
                  Stop voice input
                </button>`:c}
          </div>
          ${l?c:o`<p role="status">
                Built-in voice recognition is unavailable in this browser. System voice control can still activate
                the visible buttons by name.
              </p>`}
          <p class="voice-status" role="status" aria-live="polite" aria-atomic="true">
            ${y?"":this.voiceMessage}
          </p>
          <p class="voice-error" ?hidden=${!y}>
            ${y?this.voiceMessage:""}
          </p>
          ${d&&this.pendingVoiceAnswer?o`
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
    `},e.releaseRecognition=function(n=this.recognition){he(this),i.call(this,n)},e.startVoiceInput=function(n,a,r,l=!0){L(),he(this),t.call(this,n,a,r,l);const d=this.recognition;if(!d||this.voiceState!=="listening")return;It(this,d);const g=d.onerror;d.onerror=y=>{if(this.recognition===d){if(this.voiceState==="listening"&&(y.error==="no-speech"||y.error==="aborted")){this.releaseRecognition(d),U(this,ue);return}g?.(y)}},d.onend=()=>{this.recognition===d&&this.voiceState==="listening"&&(this.releaseRecognition(d),U(this,ue))},this.__rf06VoiceWatchdogTimerId=window.setTimeout(()=>{this.__rf06VoiceWatchdogTimerId=null,!(this.recognition!==d||this.voiceState!=="listening")&&(this.releaseRecognition(d),U(this,Rt))},$t)}}xt();const kt=typeof globalThis.Element<"u"&&typeof globalThis.Document<"u",H=globalThis.__bypassNativeAriaNotify===!0;if(kt&&(H||!("ariaNotify"in Element.prototype)||!("ariaNotify"in Document.prototype))){let e=function(m){return new Promise(f=>setTimeout(f,m))},t=`${Date.now()}`;try{t=crypto.randomUUID()}catch{}const i=Symbol(),s=`polite-live-region-${t}`,n=`assertive-live-region-${t}`;class a{constructor({element:f,message:v,priority:S="normal"}){this.priority="normal",this.element=f,this.message=v,this.priority=S}#e(){const f=typeof globalThis.CSS<"u"&&typeof globalThis.CSS.supports=="function"&&globalThis.CSS.supports("selector(:modal)"),v=this.element.ownerDocument.querySelector(f?":modal":"dialog[open]");return this.element.isConnected&&!this.element.closest("[inert]")&&(v?.contains(this.element)??!0)}async announce(){if(!this.#e())return;let f=this.element.closest("dialog")||this.element.closest("[role='dialog']")||this.element.getRootNode();(!f||f instanceof Document)&&(f=document.body);const v=this.priority==="high"?n:s;let S=f.querySelector(v);S||(S=document.createElement(v),f.append(S)),await e(250),S.handleMessage(i,this.message)}}const r=new class{#e=[];#t;enqueue(f){if(f.priority==="high"){const v=this.#e.findLastIndex(S=>S.priority==="high");this.#e.splice(v+1,0,f)}else this.#e.push(f);this.#t||this.#i()}async#i(){this.#t=this.#e.shift(),this.#t&&(await this.#t.announce(),this.#t=null,this.#i())}};class l extends HTMLElement{#e=this.attachShadow({mode:"closed"});connectedCallback(){this.ariaAtomic="true",this.style.marginLeft="-1px",this.style.marginTop="-1px",this.style.position="absolute",this.style.width="1px",this.style.height="1px",this.style.overflow="hidden",this.style.clipPath="rect(0 0 0 0)",this.style.overflowWrap="normal"}handleMessage(f=null,v=""){i===f&&(this.#e.textContent===v&&(v+=" "),this.#e.textContent=v)}}class d extends l{connectedCallback(){this.ariaLive="polite",super.connectedCallback()}}class g extends l{connectedCallback(){this.ariaLive="assertive",super.connectedCallback()}}customElements.define(s,d),customElements.define(n,g);const y=function(m,{priority:f="normal"}={}){r.enqueue(new a({element:this,message:m,priority:f}))};(H||!("ariaNotify"in Element.prototype))&&Object.defineProperty(Element.prototype,"ariaNotify",{configurable:!0,writable:!0,value:y});const b=function(m,{priority:f="normal"}={}){r.enqueue(new a({element:this.documentElement,message:m,priority:f}))};(H||!("ariaNotify"in Document.prototype))&&Object.defineProperty(Document.prototype,"ariaNotify",{configurable:!0,writable:!0,value:b})}const zt=400,Pt="Large text selected.",Et="Standard text selected.",Tt="Interruption recovery is on. Incomplete answers will be stored in this browser.",Lt="Interruption recovery is off. The saved in-progress copy has been removed.",xe="Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open.",ke="Built-in audio guidance is off. New questions and feedback will not be spoken automatically.";function Mt(e){return e.closest(".support-settings")?e.closest(".text-size-control")?e.type!=="radio"||!e.checked?null:e.value==="large"?Pt:Et:e.id.endsWith("-recovery")&&e.type==="checkbox"?e.checked?Tt:Lt:e.id.endsWith("-audio")&&e.type==="checkbox"?e.checked?xe:ke:null:null}function pe(e,t,i){const s=e.closest("label");if(!s)return;const n=[...s.childNodes].find(r=>r.nodeType===Node.TEXT_NODE&&r.textContent?.trim()===t),a=n?.textContent;a&&(n.textContent=a.replace(t,i)),e.setAttribute("aria-label",i)}function Ot(e,t,i,s){if(!e.isConnected||!t.isConnected||e.__rf09NotificationGeneration!==s)return;const n=t.ariaNotify;typeof n=="function"&&n.call(t,i,{priority:"normal"})}function qt(e,t,i){e.__rf09NotificationTimerId!==null&&e.__rf09NotificationTimerId!==void 0&&(window.clearTimeout(e.__rf09NotificationTimerId),e.__rf09NotificationTimerId=null);const s=(e.__rf09NotificationGeneration??0)+1;e.__rf09NotificationGeneration=s,e.__rf09NotificationTimerId=window.setTimeout(()=>{e.__rf09NotificationTimerId=null,Ot(e,t,i,s)},zt)}function ze(e,t,i){e.__rf09SupportStatusMessage=i,e.requestUpdate(),qt(e,t,i)}function Nt(e){const t="speechSynthesis"in window?window.speechSynthesis:null;return!!(e.readingAloud||t?.speaking||t?.pending||t?.paused)}function Vt(e,t){t.dataset.rf09AudioInterceptor!=="true"&&(t.dataset.rf09AudioInterceptor="true",t.addEventListener("change",i=>{i.stopImmediatePropagation();const s=t.checked,n=e.audioGuidance;e.recordSupportChange("automatic-audio",n,s),(!s||Nt(e))&&e.stopReading(!1),e.audioGuidance=s,e.invalidatePendingSubmission(),e.persistProgress(),ze(e,t,s?xe:ke)},{capture:!0}))}function Gt(e){for(const t of e.querySelectorAll("[data-rf09-support-setting-region]")){const i=t.querySelector("[data-rf09-support-feedback]");if(i?.id)for(const s of t.querySelectorAll(".support-settings input"))s.setAttribute("aria-controls",i.id),s.id.endsWith("-audio")&&s.type==="checkbox"&&Vt(e,s)}for(const t of e.querySelectorAll('.text-size-control input[type="radio"][value="standard"]'))pe(t,"Standard","Standard text");for(const t of e.querySelectorAll('.text-size-control input[type="radio"][value="large"]'))pe(t,"Large","Large text")}function Bt(e,t){const i=t.target;if(!(i instanceof HTMLInputElement)||!e.contains(i)||i.id.endsWith("-audio")&&i.type==="checkbox")return;const s=Mt(i);s&&ze(e,i,s)}let ge=!1;function _t(){if(ge)return;ge=!0;const e=u.prototype,t=e.renderSupportSettings;e.renderSupportSettings=function(s,n){const a=this.__rf09SupportStatusMessage??"",r=`rf09-${s}-support-feedback`;return this.updateComplete.then(()=>Gt(this)),o`
      <div
        class="rf09-support-setting-region"
        data-rf09-support-setting-region=${s}
        @change=${l=>Bt(this,l)}
      >
        ${t.call(this,s,n)}
        <p
          id=${r}
          class="support-setting-feedback"
          data-rf09-support-feedback
          ?hidden=${!a}
        >${a}</p>
      </div>
    `}}_t();const me=Symbol.for("aqp.rf04.saved-session-recovery.installed");function fe(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function Ft(e,t,i,s){const n=e.findIndex(({id:r})=>!fe(i,r));if(n>=0)return{stage:"ratings",ratingIndex:n};const a=t.findIndex(({id:r})=>!fe(s,r));return a>=0?{stage:"pairs",pairIndex:a}:{stage:"review"}}function Dt(e){const t=e.savedSession;if(!t)return;e.editingRatingFromReview=!1,e.reviewRatingEdit=null,e.reviewReturnFocusIndex=null,e.pairOrder=t.pairOrder,e.pairResponses=t.pairResponses,e.ratings=t.ratings,e.ratingInputRoutes=t.ratingInputRoutes,e.pairInputRoutes=t.pairInputRoutes,e.supportChanges=t.supportChanges,e.startedAt=t.startedAt,e.canAdjustAllSupport?(e.answerMode=t.support.answerMode,e.showSimpleLanguage=t.support.showSimpleLanguage,e.largeText=t.support.largeText,e.audioGuidance=!!t.support.audioGuidance):(e.applyConfiguredSupport(),e.canAdjustPresentationSupport&&(e.largeText=t.support.largeText,e.audioGuidance=!!t.support.audioGuidance));const i=Ft(e.dimensions,e.pairOrder,e.ratings,e.pairResponses);e.stage=i.stage,i.ratingIndex!==void 0&&(e.ratingIndex=i.ratingIndex),i.pairIndex!==void 0&&(e.pairIndex=i.pairIndex),e.recoveryEnabled=!0,e.savedSession=null,e.savedSessionProblem="",e.savedSessionAnnouncementKey="",e.resumeSummaryVisible=!0,e.interruptionSummaryShown=!0,e.statusMessage=`Saved questionnaire resumed at ${e.currentPositionDescription()}.`,e.focusHeading()}function Ut(e){const t=e.target;if(!(t instanceof Element))return;const i=t.closest("#resume-saved-questionnaire");if(!i)return;const s=i.closest("accessible-nasa-tlx, accessible-questionnaire");s?.savedSession&&(e.preventDefault(),e.stopImmediatePropagation(),Dt(s))}function Ht(){const e=customElements.get("accessible-nasa-tlx");if(!e)throw new Error("RF-04 recovery policy requires accessible-nasa-tlx to be registered first.");const t=e.prototype;t[me]||(t.announceSavedSessionOffer=function(s){const n=`${s.configId}:${s.participantCode}:${s.savedAt}`;if(this.savedSessionAnnouncementKey===n)return;this.savedSessionAnnouncementKey=n;const a=this.savedSessionOfferSpeech(s);this.statusMessage="",this.updateComplete.then(()=>{const r=this.savedSession;if(!r||r.savedAt!==s.savedAt||r.configId!==s.configId||r.participantCode!==s.participantCode)return;const l=this.querySelector("#resume-saved-questionnaire");l&&A(l,{block:"center",forceCoordinateScroll:!0,onReveal:()=>this.requestParentReveal(l)}),window.setTimeout(()=>{const d=this.savedSession;!this.isConnected||!d||d.savedAt!==s.savedAt||d.configId!==s.configId||d.participantCode!==s.participantCode||(this.statusMessage=a,this.audioGuidance&&this.speakText(a))},650)})},document.addEventListener("click",Ut,!0),t[me]=!0)}Ht();
