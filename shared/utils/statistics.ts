import { PointBucket } from "@shared/types/types";

export function sum(nums: number[]): number {
  return nums.reduce((acc, curr) => acc + curr, 0);
}

export function getAverage(nums: number[]): number {
  if (nums.length === 0) return 0;
  return sum(nums) / nums.length;
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

export function createPointDistribution(
  points: number[],
  length: number,
): number[] {
  const arr = Array(length).fill(0);
  points.forEach((p) => (arr[p] = arr[p] + 1));

  return arr;
}

export function fillBuckets(
  pointDistribution: number[],
  buckets: PointBucket[],
): PointBucket[] {
  return buckets.map((bucket) => {
    let count = 0;

    for (let i = bucket.from; i <= bucket.to; i++) {
      count += pointDistribution[i] ?? 0;
    }

    return {
      ...bucket,
      count,
    };
  });
}
