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

export type QAMessage = {
  role: "user" | "assistant";
  text: string;
};

export const sendQuestion = async (
  apiKey: string,
  prompt: string,
  systemInstruction: string,
) => {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { systemInstruction },
  });

  return response;
};

const ASK_ASSISTANT_SYS_INSTR = String.raw`
You are a friendly job-application assistant. A candidate is completing a job application and needs quick, accurate answers to application or interview questions.
Base your answers on the JOB DESCRIPTION and, when provided, the candidate's GENERATED DOCUMENTS (their CV and cover letter as JSON).
Rules:
- Answer concisely and directly, in a few short paragraphs at most.
- Ground every claim in the provided context. Never invent facts about the candidate or the company that are not present.
- If the context is insufficient to answer well, say what is missing and suggest a safe, generic phrasing the candidate could use.
- Keep the candidate's tone professional and aligned with the role.
Return plain text only, no markdown headers.
`;

export const buildQuestionPrompt = (
  jobDesc: string,
  docsJson: string | null,
  history: QAMessage[],
  question: string,
): [string, string] => {
  const historyBlock =
    history.length === 0
      ? "none"
      : history.map((m) => `${m.role}: ${m.text}`).join("\n\n");

  const docsBlock = docsJson
    ? `\n\n## GENERATED DOCUMENTS (candidate's CV / cover letter as JSON):\n${docsJson}`
    : "";

  const prompt = `## JOB DESCRIPTION:\n${jobDesc}${docsBlock}\n\n## CONVERSATION SO FAR:\n${historyBlock}\n\n## QUESTION:\n${question}`;

  return [prompt, ASK_ASSISTANT_SYS_INSTR];
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

## Company Name
- Set 'company_name' to the hiring company's name extracted from the JOB_DESCRIPTION. Always fill this even if no cover letter is wanted. If no company can be identified, use "the Company".

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
Generate a JSON object for a CV and Cover Letter using BASE_CV_DATA and JOB_DESCRIPTION.
Ensure instructions in EXTRA_NOTES are followed before all other instructions below.

Use the JOB_DESCRIPTION to ensure that the object properties in the generated JSON is relevant for the job.
Ensure the 'about me' json property is closely relevant for the role and links the CV with the job description.
Do not hallucinate any data but make achievements sound better than they are. You should sound passionate about the role but dont overuse technical jargon. The returned data must read like a human wrote it and not an AI with perfect British Engligh.
Ensure that the data returned will go well in a CV and will stand out amongst others.


## CV Guidelines
- **Selection**: Pick 1-3 most relevant education entries, 1-3 projects, and 1-3 work experiences. Sort by most recent/relevant first.
- **Modules**: For education, select max 5 most relevant modules.
- **Bullets**: Start with strong verbs (Built, Implemented, Designed). Max 2 bullets per entry (≤ 20 words each). Mention the role being applied for in both the CV and cover letter
- **Quantify**: Mention concrete tools and results (e.g., "Improved load time by 40%").

## Company Name
- Set 'company_name' to the hiring company's name extracted from the JOB_DESCRIPTION. Always fill this even if no cover letter is wanted. If no company can be identified, use "the Company".

## Cover Letter Guidelines
- **Authenticity**: Maintain a formal yet human tone. Sound like a confident graduate
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
