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
  it('uses an available local en-GB command model', async () => {
    const available = vi.fn(async (options: SpeechRecognitionAvailabilityOptions) => {
      expect(options).toEqual({
        langs: ['en-GB'],
        processLocally: true,
        quality: 'command',
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
      lang: 'en-GB',
      message: 'Listening for one answer using on-device English recognition (en-GB).',
    });
    expect(target).toEqual({ lang: 'en-GB', processLocally: true });
    expect(available).toHaveBeenCalledOnce();
  });

  it('uses the documented Chrome en-US local fallback when en-GB is unavailable', async () => {
    const available = vi.fn(async (options: SpeechRecognitionAvailabilityOptions) =>
      options.langs[0] === 'en-GB' ? 'unavailable' as const : 'available' as const);
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available },
      target,
    );

    expect(available.mock.calls.map(([options]) => options.langs[0])).toEqual([
      'en-GB',
      'en-US',
    ]);
    expect(result.mode).toBe('local');
    expect(result.lang).toBe('en-US');
    expect(target).toEqual({ lang: 'en-US', processLocally: true });
  });

  it('installs a downloadable pack after the explicit Start action but does not start recognition', async () => {
    const available = vi.fn(async () => 'downloadable' as const);
    const install = vi.fn(async (options: SpeechRecognitionAvailabilityOptions) => {
      expect(options).toEqual({
        langs: ['en-GB'],
        processLocally: true,
        quality: 'command',
      });
      return true;
    });
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available, install },
      target,
    );

    expect(result.action).toBe('wait');
    expect(result.mode).toBe('installed');
    expect(result.message).toContain('Start voice input again');
    expect(target).toEqual({ lang: 'en-GB', processLocally: true });
    expect(install).toHaveBeenCalledOnce();
  });

  it('does not issue a duplicate install while the browser reports downloading', async () => {
    const available = vi.fn(async () => 'downloading' as const);
    const install = vi.fn(async () => true);
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available, install },
      target,
    );

    expect(result.action).toBe('wait');
    expect(result.mode).toBe('downloading');
    expect(result.message).toContain('still downloading');
    expect(install).not.toHaveBeenCalled();
  });

  it('retries older implementations without the quality option', async () => {
    const available = vi.fn(async (options: SpeechRecognitionAvailabilityOptions) => {
      if ('quality' in options) throw new TypeError('quality is not implemented');
      return 'available' as const;
    });
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available },
      target,
    );

    expect(available).toHaveBeenCalledTimes(2);
    expect(available.mock.calls[0][0].quality).toBe('command');
    expect(available.mock.calls[1][0].quality).toBeUndefined();
    expect(result.mode).toBe('local');
    expect(target.processLocally).toBe(true);
  });

  it('retries an older install implementation without the quality option', async () => {
    const available = vi.fn(async () => 'downloadable' as const);
    const install = vi.fn(async (options: SpeechRecognitionAvailabilityOptions) => {
      if ('quality' in options) throw new TypeError('quality is not implemented');
      return true;
    });
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available, install },
      target,
    );

    expect(install).toHaveBeenCalledTimes(2);
    expect(install.mock.calls[0][0].quality).toBe('command');
    expect(install.mock.calls[1][0].quality).toBeUndefined();
    expect(result.mode).toBe('installed');
  });

  it('falls back to remote en-GB when local recognition is unavailable', async () => {
    const available = vi.fn(async () => 'unavailable' as const);
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
  });

  it('falls back safely when the static API is blocked or throws', async () => {
    const available = vi.fn(async () => {
      throw new DOMException('blocked', 'NotAllowedError');
    });
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available },
      target,
    );

    expect(available).toHaveBeenCalledTimes(2);
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

    const available = vi.fn(async () => 'available' as const);
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

  it('continues to the fallback locale when one pack installation fails', async () => {
    const available = vi.fn(async (options: SpeechRecognitionAvailabilityOptions) =>
      options.langs[0] === 'en-GB' ? 'downloadable' as const : 'available' as const);
    const install = vi.fn(async () => false);
    const target = recognition();

    const result = await preparePreferredSpeechRecognitionRoute(
      { available, install } satisfies OnDeviceSpeechRecognitionProvider,
      target,
    );

    expect(install).toHaveBeenCalledOnce();
    expect(result.mode).toBe('local');
    expect(result.lang).toBe('en-US');
    expect(target).toEqual({ lang: 'en-US', processLocally: true });
  });
});
