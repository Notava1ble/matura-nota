import { expect, it, describe } from "vitest";
import {
  getAverage,
  sum,
  median,
  createPointDistribution,
  fillBuckets,
  getPassRateFromDistribution,
  getRank,
  getPercentile,
  minMax,
  standardDeviation,
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

  it("calculates pass rate from distribution", () => {
    const dist = [10, 20, 30, 40];
    expect(getPassRateFromDistribution(dist, 2)).toBeCloseTo(0.7);
  });

  it("calculates sample standard deviation", () => {
    expect(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.1381);
  });

  it("throws when fewer than two values are provided", () => {
    expect(() => standardDeviation([1])).toThrow(
      "At least 2 values are required",
    );
  });

  it("returns the number of people ahead plus one", () => {
    const dist = [10, 20, 30, 40];
    expect(getRank(2, dist)).toBe(41);
    expect(getRank(3, dist)).toBe(1);
  });

  it("returns zero for missing distributions or negative points in rank", () => {
    const dist = [10, 20, 30, 40];
    expect(getRank(2)).toBe(0);
    expect(getRank(-1, dist)).toBe(0);
  });

  it("calculates the percentile up to the given score", () => {
    const dist = [10, 20, 30, 40];
    expect(getPercentile(1, dist)).toBeCloseTo(0.3);
    expect(getPercentile(3, dist)).toBeCloseTo(1);
  });

  it("returns zero for missing distributions or negative points in percentile", () => {
    const dist = [10, 20, 30, 40];
    expect(getPercentile(1)).toBe(0);
    expect(getPercentile(-1, dist)).toBe(0);
  });

  it("finds the minimum and maximum items", () => {
    const items = [
      { name: "b", score: 12 },
      { name: "a", score: 4 },
      { name: "c", score: 20 },
    ];

    expect(minMax(items, (item) => item.score)).toEqual({
      min: { name: "a", score: 4 },
      max: { name: "c", score: 20 },
    });
  });

  it("returns undefined values for an empty array", () => {
    expect(minMax([], (item: { score: number }) => item.score)).toEqual({
      min: undefined,
      max: undefined,
    });
  });
});
