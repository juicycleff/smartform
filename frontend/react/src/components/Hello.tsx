import React from "react";
import { hello } from "@xraph/smartform-core";

export interface HelloProps {
  name?: string;
}

export const Hello: React.FC<HelloProps> = ({ name }) => {
  return <div>{hello(name)}</div>;
};
