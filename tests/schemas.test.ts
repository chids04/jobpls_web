import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ResumeDataSchema } from "../src/lib/schemas";

const here = dirname(fileURLToPath(import.meta.url));
const loadFixture = (name: string) =>
  JSON.parse(readFileSync(join(here, "fixtures", name), "utf-8"));

describe("ResumeDataSchema.safeParse", () => {
  it("accepts a fully populated resume and preserves arrays", () => {
    const input = loadFixture("complete.json");
    const result = ResumeDataSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.full_name).toBe("Jane Doe");
    expect(result.data.email).toBe("jane@example.com");
    expect(result.data.education).toHaveLength(2);
    expect(result.data.projects).toHaveLength(2);
    expect(result.data.work_exp).toHaveLength(2);
    expect(result.data.work_exp?.[1].end_date).toBe("Ongoing");
    expect(result.data.education?.[0].start_date).toBe("09/2018");
  });

  it("fills defaults when most fields are omitted", () => {
    const input = loadFixture("minimal.json");
    const result = ResumeDataSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.full_name).toBe("John Smith");
    expect(result.data.email).toBe("");
    expect(result.data.about_me).toBe("");
    expect(result.data.education).toBeUndefined();
    expect(result.data.projects).toBeUndefined();
    expect(result.data.work_exp).toBeUndefined();
  });

  it("recovers from invalid dates and missing fields in education", () => {
    const input = loadFixture("incomplete-education.json");
    const result = ResumeDataSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const edu = result.data.education!;
    expect(edu).toHaveLength(4);

    // Entry 0: only title supplied — other fields default to ""
    expect(edu[0].title).toBe("BSc Maths");
    expect(edu[0].name).toBe("");
    expect(edu[0].start_date).toBe("");
    expect(edu[0].end_date).toBe("");
    expect(edu[0].modules).toEqual([]);

    // Entry 1: invalid MM/YYYY and bogus end_date both caught to ""
    expect(edu[1].start_date).toBe("");
    expect(edu[1].end_date).toBe("");

    // Entry 2: completely empty object → all defaults
    expect(edu[2].title).toBe("");
    expect(edu[2].grade).toBe("");

    // Entry 3: bad start_date caught, valid "Ongoing" preserved
    expect(edu[3].start_date).toBe("");
    expect(edu[3].end_date).toBe("Ongoing");
  });

  it("recovers from missing/invalid fields in work experience", () => {
    const input = loadFixture("incomplete-work-exp.json");
    const result = ResumeDataSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const work = result.data.work_exp!;
    expect(work).toHaveLength(4);

    expect(work[0].title).toBe("Engineer");
    expect(work[0].company).toBe("");
    expect(work[0].start_date).toBe("");
    expect(work[0].end_date).toBe("");

    expect(work[1].company).toBe("Acme");
    expect(work[1].start_date).toBe("");

    expect(work[2].end_date).toBe("Ongoing");
    expect(work[2].title).toBe("");

    // Bad end_date "99/9999" should be caught to ""
    expect(work[3].end_date).toBe("");
    expect(work[3].start_date).toBe("06/2020");
  });

  it("preserves strings containing quotes, backslashes, newlines, unicode and emoji", () => {
    const input = loadFixture("unescaped-chars.json");
    const result = ResumeDataSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.full_name).toBe('O\'Brien "Bob" Müller');
    expect(result.data.about_me).toContain("🚀");
    expect(result.data.about_me).toContain("café résumé");
    expect(result.data.about_me).toContain("C:\\Users\\bob");
    expect(result.data.about_me).toContain("\n");

    const edu0 = result.data.education![0];
    expect(edu0.title).toBe('B.Sc. "Computer" Science');
    expect(edu0.modules).toContain("<script>alert(1)</script>");

    const proj0 = result.data.projects![0];
    expect(proj0.title).toBe("Path\\To\\Project");
    expect(proj0.languages).toEqual(["C++", "C#"]);
    expect(proj0.url).toBe("https://example.com/?q=a&b=c");

    const work0 = result.data.work_exp![0];
    expect(work0.company).toBe("Müller & Söhne");
    expect(work0.b2).toContain("🎉");
  });

  it("fails when a field has a type that cannot be recovered", () => {
    const result = ResumeDataSchema.safeParse({ education: "not an array" });
    expect(result.success).toBe(false);
  });
});
