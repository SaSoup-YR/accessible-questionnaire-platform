# Plain-language and instrument-wording boundary

## Rule used by AQP

1. AQP uses plain, concise wording for its own navigation, instructions, validation
   errors and recovery messages.
2. A built-in scored questionnaire displays its sourced item statements unchanged.
   AQP does not silently substitute author-written paraphrases.
3. A researcher may create a custom definition containing supplemental explanations
   when they have the authority and methodological justification to do so. The
   original scored statement remains visible, the explanation is marked as support,
   the definition receives a different SHA-256 fingerprint, and support use is stored
   in the result provenance.
4. AQP makes no claim that responses collected with supplemental wording are
   psychometrically equivalent to responses collected without it. That is an
   empirical question for the specific instrument, wording and population.

## Why this is the consistent rule

Plain language is an access need: W3C guidance recommends common, clear words and
short blocks of text. That supports simplifying AQP's own interface. It does not by
itself establish that replacing the scored wording of a validated instrument
preserves its measurement properties. The platform therefore separates interface
language from instrument content and gives a researcher an explicit, traceable route
for approved supplemental help.

This replaces the earlier inconsistent position in which NASA-TLX included
author-written simplifications while SUS and UEQ-S did not.

## Sources

- W3C, *Use Clear Words*,
  https://www.w3.org/WAI/WCAG2/supplemental/patterns/o3p01-clear-words/
- W3C, *Clear Content*,
  https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/
