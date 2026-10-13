export type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';

export const TIME_RANGES: TimeRange[] = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'ALL'];

export const getFromTimestampForRange = (range: TimeRange, latestTimestamp: number): number => {
  const ONE_DAY = 86400;

  switch (range) {
    case '1D':
      return latestTimestamp - ONE_DAY;
    case '5D':
      return latestTimestamp - 5 * ONE_DAY;
    case '1M':
      return latestTimestamp - 30 * ONE_DAY;
    case '3M':
      return latestTimestamp - 90 * ONE_DAY;
    case '6M':
      return latestTimestamp - 180 * ONE_DAY;
    case '1Y':
      return latestTimestamp - 365 * ONE_DAY;
    case '5Y':
      return latestTimestamp - 5 * 365 * ONE_DAY;
    case 'ALL':
    default:
      return 0;
  }
};
