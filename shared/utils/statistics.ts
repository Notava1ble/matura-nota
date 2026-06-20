export function sum(nums: number[]) {
  return nums.reduce((acc, curr) => acc + curr, 0);
}

export function getAverage(nums: number[]) {
  const avg = sum(nums) / nums.length;
}

export function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
  }

  return sorted[midpoint];
}

export function percentileRank(values: number[], value: number): number {
  if (values.length === 0) {
    return 0;
  }

  const belowOrEqual = values.filter((item) => item <= value).length;
  return Math.round((belowOrEqual / values.length) * 100);
}

export function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat("sq-AL", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}
