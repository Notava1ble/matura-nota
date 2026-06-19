import { describe, expect, it } from "vitest";
import { average, median, percentileRank } from "./stats";

describe("statistics utilities", () => {
  it("calculates averages", () => {
    expect(average([6, 8, 10])).toBe(8);
    expect(average([])).toBe(0);
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
});
