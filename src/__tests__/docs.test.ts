import { describe, it, expect } from "vitest";
import { parse } from "../app/hooks/parser";
import { DOC_EXAMPLES } from "../app/docs/examples";

describe("docs examples", () => {
  for (const [name, program] of Object.entries(DOC_EXAMPLES)) {
    it(`parses the ${name} example without error`, () => {
      expect(() => parse(program)).not.toThrow();
    });
  }
});
