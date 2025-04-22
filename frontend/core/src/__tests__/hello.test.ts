import { types } from "../index";

describe("hello", () => {
  it("should return hello with the given name", () => {
    expect(types("John")).toBe("Hello, John!");
  });

  it("should return hello world when no name is given", () => {
    expect(types()).toBe("Hello, World!");
  });
});
