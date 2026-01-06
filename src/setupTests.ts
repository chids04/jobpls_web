import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Ensure single React instance
import React from "react";
(globalThis as any).React = React;

afterEach(() => {
  cleanup();
});
