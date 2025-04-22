import React from "react";
import { render, screen } from "@testing-library/react";
import { Debug } from "../components/Debug";

describe("Hello component", () => {
  it("renders with the given name", () => {
    render(<Debug name="John" />);
    expect(screen.getByText("Hello, John!")).toBeInTheDocument();
  });

  it("renders with default text when no name is given", () => {
    render(<Debug />);
    expect(screen.getByText("Hello, World!")).toBeInTheDocument();
  });
});
