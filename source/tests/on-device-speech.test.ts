import { describe, expect, it, vi } from 'vitest';
import {
  preparePreferredSpeechRecognitionRoute,
  type OnDeviceSpeechRecognitionProvider,
  type SpeechRecognitionAvailabilityOptions,
} from '../src/on-device-speech';

function recognition() {
  return {
    lang: '',
    processLocally: false,
  };
}

describe('RF-07 on-device speech route preparation', () => {
  it('prefers the documented en-US dictation-capable local model', async () => {
    const available = vi.fn(async (options: SpeechRecognitionAvailabilityOptions) => {
      expect(options).toEqual({
        langs: ['en-US'],
        processLocally: true,
        quality: 'dictation',
      });
      return 'available' as const;
    });
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available },
      target,
    );

    expect(result).toEqual({
      action: 'start',
      mode: 'local',
      lang: 'en-US',
      quality: 'dictation',
      message:
        'Listening for one answer using on-device English recognition (en-US, dictation-quality model).',
    });
    expect(target).toEqual({ lang: 'en-US', processLocally: true });
    expect(available).toHaveBeenCalledOnce();
  });

  it('uses an en-GB dictation-capable local fallback when en-US is unavailable', async () => {
    const available = vi.fn(async (options: SpeechRecognitionAvailabilityOptions) =>
      options.langs[0] === 'en-US' ? 'unavailable' as const : 'available' as const);
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available },
      target,
    );

    expect(available.mock.calls.map(([options]) => options)).toEqual([
      { langs: ['en-US'], processLocally: true, quality: 'dictation' },
      { langs: ['en-GB'], processLocally: true, quality: 'dictation' },
    ]);
    expect(result).toMatchObject({
      action: 'start',
      mode: 'local',
      lang: 'en-GB',
      quality: 'dictation',
    });
    expect(target).toEqual({ lang: 'en-GB', processLocally: true });
  });

  it('installs a downloadable dictation pack after explicit Start but does not start recognition', async () => {
    const available = vi.fn(async (_options: SpeechRecognitionAvailabilityOptions) =>
      'downloadable' as const);
    const install = vi.fn(async (options: SpeechRecognitionAvailabilityOptions) => {
      expect(options).toEqual({
        langs: ['en-US'],
        processLocally: true,
        quality: 'dictation',
      });
      return true;
    });
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available, install },
      target,
    );

    expect(result).toEqual({
      action: 'wait',
      mode: 'installed',
      lang: 'en-US',
      quality: 'dictation',
      message:
        'The on-device English dictation model (en-US) is ready. ' +
        'No answer was selected. Start voice input again, or use a visible answer button.',
    });
    expect(target).toEqual({ lang: 'en-US', processLocally: true });
    expect(install).toHaveBeenCalledOnce();
  });

  it('does not issue a duplicate install while a dictation pack is downloading', async () => {
    const available = vi.fn(async (_options: SpeechRecognitionAvailabilityOptions) =>
      'downloading' as const);
    const install = vi.fn(async (_options: SpeechRecognitionAvailabilityOptions) => true);
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available, install },
      target,
    );

    expect(result).toMatchObject({
      action: 'wait',
      mode: 'downloading',
      lang: 'en-US',
      quality: 'dictation',
    });
    expect(result.message).toContain('still downloading');
    expect(install).not.toHaveBeenCalled();
  });

  it('does not silently downgrade to a quality-less command pack', async () => {
    const available = vi.fn(async (_options: SpeechRecognitionAvailabilityOptions) => {
      throw new TypeError('quality is not implemented');
    });
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available },
      target,
    );

    expect(available).toHaveBeenCalledOnce();
    expect(result).toEqual({
      action: 'start',
      mode: 'remote',
      lang: 'en-GB',
      message: 'Listening for one answer using the browser speech service.',
    });
    expect(target).toEqual({ lang: 'en-GB', processLocally: false });
  });

  it('continues to en-GB when en-US dictation installation fails', async () => {
    const available = vi.fn(async (options: SpeechRecognitionAvailabilityOptions) =>
      options.langs[0] === 'en-US' ? 'downloadable' as const : 'available' as const);
    const install = vi.fn(async (_options: SpeechRecognitionAvailabilityOptions) => false);
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available, install } satisfies OnDeviceSpeechRecognitionProvider,
      target,
    );

    expect(install).toHaveBeenCalledOnce();
    expect(result).toMatchObject({
      action: 'start',
      mode: 'local',
      lang: 'en-GB',
      quality: 'dictation',
    });
    expect(target).toEqual({ lang: 'en-GB', processLocally: true });
  });

  it('continues to en-GB when the en-US install call throws', async () => {
    const available = vi.fn(async (options: SpeechRecognitionAvailabilityOptions) =>
      options.langs[0] === 'en-US' ? 'downloadable' as const : 'available' as const);
    const install = vi.fn(async (_options: SpeechRecognitionAvailabilityOptions) => {
      throw new DOMException('installation blocked', 'NotAllowedError');
    });
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available, install },
      target,
    );

    expect(result).toMatchObject({ mode: 'local', lang: 'en-GB', quality: 'dictation' });
    expect(target).toEqual({ lang: 'en-GB', processLocally: true });
  });

  it('falls back to remote en-GB when no dictation-capable local model exists', async () => {
    const available = vi.fn(async (_options: SpeechRecognitionAvailabilityOptions) =>
      'unavailable' as const);
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available },
      target,
    );

    expect(result).toEqual({
      action: 'start',
      mode: 'remote',
      lang: 'en-GB',
      message: 'Listening for one answer using the browser speech service.',
    });
    expect(target).toEqual({ lang: 'en-GB', processLocally: false });
    expect(available).toHaveBeenCalledTimes(2);
    expect(available.mock.calls.every(([options]) => options.quality === 'dictation')).toBe(true);
  });

  it('falls back safely when the static API is blocked or throws', async () => {
    const available = vi.fn(async (_options: SpeechRecognitionAvailabilityOptions) => {
      throw new DOMException('blocked', 'NotAllowedError');
    });
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available },
      target,
    );

    expect(available).toHaveBeenCalledOnce();
    expect(result.mode).toBe('remote');
    expect(target).toEqual({ lang: 'en-GB', processLocally: false });
  });

  it('preserves the established remote route when the local API is absent or disabled', async () => {
    const targetWithoutProperty = { lang: '' };
    const absent = await preparePreferredSpeechRecognitionRoute(
      undefined,
      targetWithoutProperty,
    );
    expect(absent.mode).toBe('remote');
    expect(targetWithoutProperty.lang).toBe('en-GB');

    const available = vi.fn(async (_options: SpeechRecognitionAvailabilityOptions) =>
      'available' as const);
    const target = recognition();
    const disabled = await preparePreferredSpeechRecognitionRoute(
      { available },
      target,
      false,
    );
    expect(disabled.mode).toBe('remote');
    expect(available).not.toHaveBeenCalled();
    expect(target).toEqual({ lang: 'en-GB', processLocally: false });
  });
});
