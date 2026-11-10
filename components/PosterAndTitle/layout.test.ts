import { describe, expect, it } from "bun:test";

import { getPosterGrid, POSTER_GAP } from "./layout";

describe("getPosterGrid", () => {
  it("fits the measured content width, including narrow windows and sidebar layouts", () => {
    for (const available of [0, 160, 280, 350, 370, 600, 712, 990, 1400]) {
      const grid = getPosterGrid(available);
      expect(grid.columns).toBeGreaterThanOrEqual(1);
      expect(grid.width).toBeGreaterThanOrEqual(0);
      expect(grid.width).toBeLessThanOrEqual(160);
      expect(
        grid.width * grid.columns + POSTER_GAP * (grid.columns - 1),
      ).toBeCloseTo(available);
      expect(grid.height).toBe(Math.round((grid.width * 10) / 7));
    }
  });

  it("keeps three compact columns and adds columns as the view expands", () => {
    expect(getPosterGrid(370).columns).toBe(3);
    expect(getPosterGrid(712).columns).toBe(5);
    expect(getPosterGrid(990).columns).toBe(6);
  });
});
