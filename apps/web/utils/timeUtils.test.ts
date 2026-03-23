import { timeToSeconds, secondsToTime } from './timeUtils';

describe('timeToSeconds', () => {
  it('should convert valid time string to seconds', () => {
    expect(timeToSeconds('00:00:00.000')).toBe(0);
    expect(timeToSeconds('00:00:01.000')).toBe(1);
    expect(timeToSeconds('00:01:00.000')).toBe(60);
    expect(timeToSeconds('01:00:00.000')).toBe(3600);
    expect(timeToSeconds('01:30:45.500')).toBe(5445.5);
  });

  it('should return 0 for invalid input', () => {
    expect(timeToSeconds('')).toBe(0);
    expect(timeToSeconds('invalid')).toBe(0);
    expect(timeToSeconds('00:00')).toBe(0);
  });

  it('should return 0 for null/undefined', () => {
    expect(timeToSeconds(null as unknown as string)).toBe(0);
    expect(timeToSeconds(undefined as unknown as string)).toBe(0);
  });
});

describe('secondsToTime', () => {
  it('should convert seconds to time string', () => {
    expect(secondsToTime(0)).toBe('00:00:00.000');
    expect(secondsToTime(1)).toBe('00:00:01.000');
    expect(secondsToTime(60)).toBe('00:01:00.000');
    expect(secondsToTime(3600)).toBe('01:00:00.000');
    expect(secondsToTime(3661.5)).toBe('01:01:01.500');
  });

  it('should handle fractional seconds', () => {
    const result = secondsToTime(1.5);
    expect(result).toBe('00:00:01.500');
  });

  it('should handle large values', () => {
    const result = secondsToTime(86400);
    expect(result).toBe('24:00:00.000');
  });
});
