import { parseSRT } from './srtUtils';

describe('parseSRT', () => {
  it('should parse valid SRT content', () => {
    const srt = `1
00:00:01,000 --> 00:00:04,000
Hello world

2
00:00:05,000 --> 00:00:08,000
Second subtitle`;

    const result = parseSRT(srt);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      start: '00:00:01.000',
      end: '00:00:04.000',
      text: 'Hello world',
    });
    expect(result[1]).toEqual({
      start: '00:00:05.000',
      end: '00:00:08.000',
      text: 'Second subtitle',
    });
  });

  it('should handle multiline subtitle text', () => {
    const srt = `1
00:00:01,000 --> 00:00:04,000
Line one
Line two`;

    const result = parseSRT(srt);
    expect(result).toHaveLength(1);
    expect(result[0]!.text).toBe('Line one\nLine two');
  });

  it('should return empty array for empty input', () => {
    expect(parseSRT('')).toEqual([]);
  });

  it('should skip malformed blocks', () => {
    const srt = `1
bad timestamp
Some text

2
00:00:01,000 --> 00:00:02,000
Good subtitle`;

    const result = parseSRT(srt);
    expect(result).toHaveLength(1);
    expect(result[0]!.text).toBe('Good subtitle');
  });

  it('should replace commas with dots in timestamps', () => {
    const srt = `1
00:00:01,500 --> 00:00:02,750
Test`;

    const result = parseSRT(srt);
    expect(result[0]!.start).toBe('00:00:01.500');
    expect(result[0]!.end).toBe('00:00:02.750');
  });
});
