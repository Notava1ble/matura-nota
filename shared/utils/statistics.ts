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

export function getPassRateFromDistribution(
  distribution: number[],
  threshold = 15,
): number {
  const total = sum(distribution);
  if (total === 0) return 0;

  let passing = 0;
  for (let i = threshold; i < distribution.length; i++) {
    passing += distribution[i] ?? 0;
  }
  return passing / total;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) {
    throw new Error("At least 2 values are required");
  }

  const mean = getAverage(values);

  const variance =
    values.reduce((sum, value) => {
      const diff = value - mean;
      return sum + diff * diff;
    }, 0) /
    (values.length - 1);

  return Math.sqrt(variance);
}

export function getRank(points: number, dist?: number[]) {
  if (!dist || points < 0) return 0;

  let more = 0;

  for (let i = points + 1; i < dist.length; i++) {
    more += dist[i];
  }

  return more + 1;
}

export function getPercentile(points: number, dist?: number[]) {
  if (!dist || points < 0) return 0;

  let total = 0;
  let count = 0;

  for (let i = 0; i < dist.length; i++) {
    total += dist[i];
    if (i <= points) count += dist[i];
  }

  return total === 0 ? 0 : count / total;
}

export function minMax<T>(
  arr: T[],
  selector: (item: T) => number,
): { min: T | undefined; max: T | undefined } {
  if (arr.length === 0) {
    return { min: undefined, max: undefined };
  }

  let minItem = arr[0];
  let maxItem = arr[0];
  let minValue = selector(minItem);
  let maxValue = selector(maxItem);

  for (let i = 1; i < arr.length; i++) {
    const value = selector(arr[i]);

    if (value < minValue) {
      minValue = value;
      minItem = arr[i];
    }

    if (value > maxValue) {
      maxValue = value;
      maxItem = arr[i];
    }
  }

  return { min: minItem, max: maxItem };
}
