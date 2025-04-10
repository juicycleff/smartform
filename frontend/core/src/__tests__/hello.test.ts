import { hello } from "../hello";

describe("hello", () => {
  it("should return hello with the given name", () => {
    expect(hello("John")).toBe("Hello, John!");
  });

  it("should return hello world when no name is given", () => {
    expect(hello()).toBe("Hello, World!");
  });
});
