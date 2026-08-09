const excludedPublicQuestionnaireFiles = new Map([
  [
    'user-experience-questionnaire-short.questionnaire.json',
    'no archived permission covers public repository and deployment redistribution',
  ],
]);

export function assertPublicQuestionnaireInventory(filenames) {
  for (const filename of filenames) {
    const reason = excludedPublicQuestionnaireFiles.get(filename);
    if (reason) {
      throw new Error(`Refusing to publish ${filename}: ${reason}.`);
    }
  }
}
