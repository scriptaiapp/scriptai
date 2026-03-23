import { convertJsonToVTT } from './vttHelper';

describe('convertJsonToVTT', () => {
  it('should convert subtitle array to VTT format', () => {
    const input = [
      { start: '00:00:01.000', end: '00:00:04.000', text: 'Hello' },
      { start: '00:00:05.000', end: '00:00:08.000', text: 'World' },
    ];

    const result = convertJsonToVTT(input);
    expect(result).toContain('WEBVTT');
    expect(result).toContain('00:00:01.000 --> 00:00:04.000');
    expect(result).toContain('Hello');
    expect(result).toContain('00:00:05.000 --> 00:00:08.000');
    expect(result).toContain('World');
  });

  it('should return WEBVTT header for empty array', () => {
    expect(convertJsonToVTT([])).toBe('WEBVTT\n\n');
  });

  it('should return WEBVTT header for non-array input', () => {
    expect(convertJsonToVTT(null as any)).toBe('WEBVTT\n\n');
  });

  it('should include cue numbers', () => {
    const input = [
      { start: '00:00:01.000', end: '00:00:02.000', text: 'First' },
      { start: '00:00:03.000', end: '00:00:04.000', text: 'Second' },
    ];

    const result = convertJsonToVTT(input);
    expect(result).toContain('1\n');
    expect(result).toContain('2\n');
  });
});
