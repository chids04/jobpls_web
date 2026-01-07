import { GoogleGenAI } from "@google/genai";
import { Resume, ResumeDataSchema } from "./schemas";
import { CV_Type } from "./pdf_gen";

import * as z from "zod";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function personaliseCV(
  resume: Resume,
  job_desc: string,
  special_instr: string,
  cv_type: CV_Type,
) {
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
      prompt = TECH_CV_PROMPT;
      sysInstr = GENERAL_CV_SYS_INSTR;
  }

  prompt = prompt
    .replace("{CV}", JSON.stringify(resume))
    .replace("{JOB_DESC}", job_desc)
    .replace("{SPECIAL_INSTR}", special_instr);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: sysInstr,
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(ResumeDataSchema),
    },
  });

  console.log(response);

  if (response.text == undefined) {
    throw new Error("failed to generate llm response");
  }

  const generatedResume = ResumeDataSchema.parse(JSON.parse(response.text));

  console.log(generatedResume);
}

const GENERAL_CV_SYS_INSTR = String.raw`
"You are an expert CV writing assistant for general employment roles (retail, warehouse, hospitality, admin). You generate tailored, professional CVs by analyzing candidate work history and job descriptions. You must use concise British English, straight to the point, dont over use words like "particularly", "extremely", "keen". Talk in the tone of a smart first class graduate but not an English professor. You must return ONLY raw JSON with no markdown formatting, no code blocks, no backticks. You must ensure that the JSON returned is able to be parsed immediately by the serde rust crate, error-free.All Values must be strings, all arrays of strings must be represented as comma seperated strings.
`;

const GENERAL_CV_PROMPT = String.raw`
  Generate a JSON object to populate a general employment CV template. Analyse the BASE_CV_DATA and JOB_DESCRIPTION to create professional, relevant content that highlights transferable skills and work ethic. Dont use personal projects as work experience

## Core Principles

1. **Relevance First**: Highlight work experience and skills most relevant to the target role
2. **Transferable Skills**: Emphasize reliability, teamwork, customer service, attention to detail, and work ethic
3. **Natural Keywords**: Use terminology from the job description naturally throughout
4. **Professional Tone**: Clear, professional British English suitable for non-technical roles
5. **Conciseness**: Must fit on a single A4 page

## JSON Structure

Generate a JSON object with these exact keys:

### Contact & Summary
- **SUMMARY**: 2-3 sentences highlighting work ethic, key skills, and motivation. Link to the job requirements. (Max 60 words)

### Skills
- **SKILLS**: Comma-separated string of relevant skills. Re-order skills from BASE_CV_DATA to prioritize those most relevant to the job. Include both hard skills (e.g., "Forklift Operation", "Cash Handling") and soft skills (e.g., "Teamwork", "Customer Service"). (Max 15 skills)

### Work Experience (Select most relevant 4 jobs from BASE_CV_DATA)

**Job 1 (Most relevant/recent):**
- **J1_TITLE**: Job title
- **J1_DATES**: Employment dates (format: "Mon YYYY – Mon YYYY")
- **J1_COMPANY**: Company name
- **J1_LOCATION**: City, UK
- **J1_B1**: First bullet point - start with action verb, focus on achievement or responsibility relevant to target role (Max 25 words)
- **J1_B2**: Second bullet point - quantify where possible, show impact (Max 25 words)

**Job 2:**
- **J2_TITLE**: Job title
- **J2_DATES**: Employment dates
- **J2_COMPANY**: Company name
- **J2_LOCATION**: City, UK
- **J2_B1**: First bullet point (Max 25 words)
- **J2_B2**: Second bullet point (Max 25 words)

**Job 3:**
- **J3_TITLE**: Job title
- **J3_DATES**: Employment dates
- **J3_COMPANY**: Company name
- **J3_LOCATION**: City, UK
- **J3_B1**: First bullet point (Max 25 words)
- **J3_B2**: Second bullet point (Max 25 words)

## Selection & Writing Guidelines

**Job Selection**: Choose the 3 most relevant jobs from BASE_CV_DATA. Prioritize:
1. Jobs with similar duties to the target role
2. Recent positions (last 2-3 years)
3. Roles demonstrating progression or diverse skills

**Bullet Point Guidelines**:
- Start with strong action verbs: Managed, Operated, Maintained, Processed, Handled, Achieved, Ensured, Delivered, Organised, Collaborated
- Be specific: Include numbers, percentages, or quantities where available
- Focus on achievements and responsibilities relevant to the target role
- Demonstrate reliability, work ethic, attention to detail, and team contribution
- Use past tense for previous roles

**Skills Guidelines**:
- Prioritize skills mentioned in the job description
- Include a mix of technical skills (e.g., "Till Operation", "Stock Management", "GDPR Compliance") and soft skills (e.g., "Time Management", "Problem Solving")
- Use industry-standard terminology
- Keep as comma-separated string, not an array

**Summary Guidelines**:
- Mention work ethic, reliability, and key strengths
- Reference the type of role or industry if relevant
- Show enthusiasm and readiness to contribute
- Avoid clichés - be specific about capabilities

---

## BASE_CV_DATA:
{CV}

---

## JOB_DESCRIPTION:
{JOB_DESC}

---
`;

const TECH_CV_SYS_INSTR = String.raw`

Rules:
Read BASE_CV_DATA and JOB_DESCRIPTION.
Pick the most relevant education, work, and projects for the role.
Write short, clear text in natural British English with a confident graduate tone.
Output one JSON object only — no markdown, comments, explanations
All values must be strings. Lists should be comma-separated strings.
Keep the same key names and structure.
Leave values empty ("") if there’s no data.
Avoid long sentences, filler words, or repeated phrases.
Do not use words like “particularly”, “drawn”, “compelling”, or anything that sounds forced.
Keep it factual, specific, and easy to read. One A4 page max.
";
`;

const TECH_CV_PROMPT = String.raw`
Create a JSON object to fill the CV template below. Use BASE_CV_DATA and JOB_DESCRIPTION to generate short, relevant, British-English content in a confident graduate tone. Ensure that instructions stated in EXTRA_NOTES are followed

Ensure that the cv details are relevant for the attached job description, dont hallucinate, but you can overexaggerate what i actually did at work etc, to sound better and more relevant for the role at hand, we need to get hired

---
## Core Rules

1. **Relevance**: Prioritise skills, experience, and projects that directly match the job.
2. **Keywords**: Integrate job terms naturally.
3. **Conciseness**: Fit all output within one A4 page.
4. **Voice**: Human-written, clear, professional tone.
---
Below is the interface of the output

### header - JSON Object
- **full_name**
- **email**
- **github**
- **residency**

### summary - JSON Object
- **about_me**: 3–4 sentences linking experience and skills to job needs (≤ 60 words).

### tech_skills - JSON Object
- **languages**  Comma seperated string
- **frameworks** Comma seperated string
- **developer_tools** Comma seperated string

### education (1–3 entries) - JSON List of objects
Each entry uses:
- **title** – degree or qualification
- **grade**
- **name**
- **dates** – date object ISO 8601 format {
    start: YYYY-MM-DD
    end: YYYY-MM-DD (or "Ongoing")
}
- **location** – city/country
- **modules** comma seperated string, select most relevant, max 5

### projects (1–3 entries) - JSON List of objects
Each entry uses:
- **title** – project title
- **languages** – up to 3 languages/tools (comma-separated string)
- **url** – link or empty
- **b1**, **b2** – short bullets (≤ 20 words) describing outcome and tech use

### work_exp (1–3 entries) - JSON List of objects
Each entry uses:
- **title** – job title
- **company** – company name
- **dates** – date object {
    start: YYYY-MM-DD
    end: YYYY-MM-DD (or "Ongoing" if date in the future)
}
- **b1**, **b2** – concise quantified achievements (≤ 20 words)

---

## Selection Rules

- **Projects**: Pick 2–3 most relevant or highest-impact. Sort by most relevant first
- **Work Experience**: Pick 2–3 most relevant or most recent. Sort by most recent first
- **Education**: Include up to 3, prioritising highest level or most relevant. Sort by most recent first

---

## Writing Rules

- Start bullets with strong verbs (Built, Implemented, Designed, Optimised).
- Mention concrete tools and results.
- Quantify impact when possible (e.g. “Improved load time by 40%”).
- Avoid filler terms (“detail-oriented”, “team player”).

---

## BASE_CV_DATA:
{CV}
---

## JOB_DESCRIPTION:
{JOB_DESC}

## EXTRA NOTES:
{SPECIAL_INSTR}

---

Generate **valid JSON only**, no markdown, comments, or explanations."#;
`;
