import { GoogleGenAI } from "@google/genai";
import { GenerationOutputSchema, Resume, ResumeDataSchema } from "./schemas";

import * as z from "zod";
import { CV_Type } from "./types";

export const createPrompt = (
  resume: Resume,
  job_desc: string,
  special_instr: string,
  cv_type: CV_Type,
) => {
  let prompt;
  let sysInstr;

  switch (cv_type) {
    case CV_Type.TechCV:
      prompt = TECH_CV_PROMPT;
      sysInstr = TECH_CV_SYS_INSTR;
      break;
    case CV_Type.GeneralCV:
      prompt = GENERAL_CV_PROMPT;
      sysInstr = GENERAL_CV_SYS_INSTR;
      break;
    default:
      prompt = GENERAL_CV_PROMPT;
      sysInstr = GENERAL_CV_SYS_INSTR;
  }

  prompt = prompt
    .replace("{CV}", JSON.stringify(resume))
    .replace("{JOB_DESC}", job_desc)
    .replace("{SPECIAL_INSTR}", special_instr);

  return [prompt, sysInstr];
};

export const sendPrompt = async (
  apiKey: string,
  prompt: string,
  systemInstruction: string,
) => {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(GenerationOutputSchema),
    },
  });

  return response;
};

export async function formatPDF(
  apiKey: string,
  data: ArrayBuffer,
  mimeType: string,
) {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          mimeType,
          //@ts-ignore
          data: new Uint8Array(data).toBase64(),
        },
      },
      {
        text: TEMPLATE_FORMAT_PROMPT,
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(ResumeDataSchema),
    },
  });

  return response;
}

const TEMPLATE_FORMAT_PROMPT = String.raw`
  Extract the details from the provided document(s) into the output schema defined in the prompt. Fields that you are not able to infer you may leave as an empty value. The output schema must be able to be immediatley parsed into the respective zod type of the output schema
`;

const GENERAL_CV_SYS_INSTR = String.raw`
You are an expert recruitment assistant for general employment roles (retail, hospitality, admin).
Tone: Concise British English. Professional, smart graduate tone.
Avoid AI-cliches: Do not use "particularly", "extremely", "keen", "drawn", "compelling", "immense", "aligns".
Formatting: Return ONLY raw JSON. No markdown, no code blocks, no backticks. Ensure the JSON is valid and immediately parseable.
Rules: Use industry-standard terminology. All values must be strings; arrays of strings should be comma-separated if specified.
`;

const GENERAL_CV_PROMPT = String.raw`
Generate a JSON object for a CV and Cover Letter. Analyse BASE_CV_DATA and JOB_DESCRIPTION to highlight transferable skills and work ethic.

## CV Guidelines
- **Selection**: Choose the 3 most relevant/recent jobs from BASE_CV_DATA.
- **Bullets**: Start with action verbs (Managed, Operated, Maintained). Max 2 bullets per job. Quantify impact where possible.
- **Skills**: Max 15 relevant skills as a comma-separated string.
- **Summary**: 2-3 sentences linking experience to job requirements (Max 60 words).
- **Conciseness**: Must fit on a single A4 page.

## Cover Letter Guidelines
- **Company-Specific**: Explain WHY this specific company and role.
- **Complementary**: Add personality/context to achievements; do not just repeat the CV.
- **Conciseness**: Max 4 paragraphs. Must fit on one A4 page.

---
## BASE_CV_DATA:
{CV}

---
## JOB_DESCRIPTION:
{JOB_DESC}
---
`;

const TECH_CV_SYS_INSTR = String.raw`
You are an expert technical recruitment assistant.
Tone: Concise British English. Confident graduate tone.
Avoid AI-cliches: Do not use "particularly", "extremely", "keen", "drawn", "compelling", "immense", "aligns", "passionate", "seamlessly".
Formatting: Return ONLY raw JSON. No markdown, no code blocks, no backticks. Ensure the JSON is valid and immediately parseable.
Rules: Factual, specific, and easy to read. One A4 page max per document.
`;

const TECH_CV_PROMPT = String.raw`
Generate a JSON object for a CV and Cover Letter using BASE_CV_DATA and JOB_DESCRIPTION. Ensure instructions in EXTRA_NOTES are followed.

## CV Guidelines
- **Selection**: Pick 1-3 most relevant education entries, 1-3 projects, and 1-3 work experiences. Sort by most recent/relevant first.
- **Modules**: For education, select max 5 most relevant modules.
- **Bullets**: Start with strong verbs (Built, Implemented, Designed). Max 2 bullets per entry (≤ 20 words each).
- **Quantify**: Mention concrete tools and results (e.g., "Improved load time by 40%").

## Cover Letter Guidelines
- **Authenticity**: Maintain a formal yet human tone.
- **Company-Specific**: Demonstrate understanding of the company's work or values.
- **Conciseness**: Max 4 paragraphs. Must fit on one A4 page.

---
## BASE_CV_DATA:
{CV}
---
## JOB_DESCRIPTION:
{JOB_DESC}

## EXTRA NOTES:
{SPECIAL_INSTR}
---
`;
