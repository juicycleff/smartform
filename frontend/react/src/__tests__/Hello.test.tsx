import React from "react";
import { render, screen } from "@testing-library/react";
import { Hello } from "../components/Hello";

describe("Hello component", () => {
  it("renders with the given name", () => {
    render(<Hello name="John" />);
    expect(screen.getByText("Hello, John!")).toBeInTheDocument();
  });

  it("renders with default text when no name is given", () => {
    render(<Hello />);
    expect(screen.getByText("Hello, World!")).toBeInTheDocument();
  });
});
