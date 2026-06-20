import { expect, it, describe } from "vitest";
import {
  getAverage,
  sum,
  median,
  percentileRank,
  createPointDistribution,
  fillBuckets,
} from "./statistics";

describe("statistics utilities", () => {
  it("calculates averages", () => {
    expect(getAverage([6, 8, 10])).toBe(8);
    expect(getAverage([6, 8, 8, 8, 10, 1, 15])).toBe(8);
    expect(getAverage([])).toBe(0);
    expect(getAverage([0])).toBe(0);
    expect(getAverage([-1, -10, -19])).toBe(-10);
    expect(getAverage([10, 20, 0])).toBe(10);
  });

  it("sums all numbers", () => {
    expect(sum([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(55);
    expect(sum([])).toBe(0);
    expect(sum([-1, -5, 6])).toBe(0);
  });

  it("calculates medians", () => {
    expect(median([10, 6, 8])).toBe(8);
    expect(median([10, 6, 8, 4])).toBe(7);
    expect(median([])).toBe(0);
  });

  it("calculates percentile rank", () => {
    expect(percentileRank([40, 50, 60, 70, 80], 70)).toBe(80);
    expect(percentileRank([], 70)).toBe(0);
  });

  it("creates point distribution", () => {
    expect(
      createPointDistribution([0, 0, 1, 1, 1, 2, 2, 3, 3, 3, 1, 4, 5, 5], 6),
    ).toEqual([2, 4, 2, 3, 1, 2]);
  });

  it("fills the specified buckets", () => {
    expect(
      fillBuckets(
        [0, 0, 1, 1, 1, 2, 2, 3, 3, 3, 1, 4, 5, 5],
        [
          { from: 0, to: 4, count: 0 },
          { from: 5, to: 8, count: 0 },
          { from: 9, to: 13, count: 0 },
        ],
      ),
    ).toEqual([
      { from: 0, to: 4, count: 3 },
      { from: 5, to: 8, count: 10 },
      { from: 9, to: 13, count: 18 },
    ]);
  });
});
