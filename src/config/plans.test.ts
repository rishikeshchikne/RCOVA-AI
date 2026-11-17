import { describe, expect, it } from "vitest";
import { getPlan } from "./plans";

describe("plans", () => {
  it("Free is ₹0 with 100 welcome credits", () => {
    expect(getPlan("free")).toMatchObject({ priceMonthly: 0, credits: 100 });
  });
  it("Pro is ₹199/month with 2,000 monthly credits", () => {
    expect(getPlan("pro")).toMatchObject({ priceMonthly: 199, credits: 2000 });
  });
  it("Ultra is ₹499/month with 6,000 monthly credits", () => {
    expect(getPlan("ultra")).toMatchObject({ priceMonthly: 499, credits: 6000 });
  });
});
