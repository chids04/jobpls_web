import { $typst } from "@myriaddreamin/typst.ts";

import {
  Education,
  ResumeData,
  Project,
  Experience,
  displayDate,
  CoverLetterData,
  dateString,
} from "./types";
import {
  COVER_PARA,
  COVER_TEMPLATE,
  EDU_TEMPLATE,
  EXPERIENCE_TEMPLATE,
  GENERAL_TEMPLATE_1,
  PROJECT_TEMPLATE,
  TECH_TEMPLATE_1,
} from "./templates";

// i think this we will eventually move to its own interface
// so that all different kinds of subscriptions can be managed

declare global {
  interface String {
    escapeWith(escaper: (s: string) => string): string;
  }
}

if (!String.prototype.escapeWith) {
  String.prototype.escapeWith = function (
    escaper: (s: string) => string,
  ): string {
    return escaper(this.toString());
  };
}

const typstEscaper = (text: string): string => {
  return text
    .replaceAll("#", `\\#`)
    .replaceAll("@", `\\@`)
    .replaceAll("$", `\\$`)
    .replaceAll("_", `\\_`)
    .replaceAll("[", `\\[`)
    .replaceAll("]", `\\]`)
    .replaceAll("<", `\\<`);
};

export enum CV_Type {
  TechCV,
  GeneralCV,
}

// i will download these binaries  myself in prod, and will server it statiically
$typst.setCompilerInitOptions({
  getModule: () =>
    "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm",
});
$typst.setRendererInitOptions({
  getModule: () =>
    "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm",
});

// can re use structs from rust end

function escapeResumeFields(resume: ResumeData) {
  resume.header.full_name = resume.header.full_name.escapeWith(typstEscaper);
  resume.header.email = resume.header.email.escapeWith(typstEscaper);
  resume.header.residency = resume.header.residency.escapeWith(typstEscaper);
  if (resume.header.github) {
    resume.header.github = resume.header.github.escapeWith(typstEscaper);
  }

  resume.summary.about_me = resume.summary.about_me.escapeWith(typstEscaper);

  if (resume.tech_skills) {
    resume.tech_skills.languages = resume.tech_skills.languages.map((s) =>
      s.escapeWith(typstEscaper),
    );
    resume.tech_skills.frameworks = resume.tech_skills.frameworks.map((s) =>
      s.escapeWith(typstEscaper),
    );
    resume.tech_skills.developer_tools = resume.tech_skills.developer_tools.map(
      (s) => s.escapeWith(typstEscaper),
    );
  }

  resume.education?.forEach((e) => {
    e.title = e.title.escapeWith(typstEscaper);
    e.grade = e.grade.escapeWith(typstEscaper);
    e.name = e.name.escapeWith(typstEscaper);
    e.location = e.location.escapeWith(typstEscaper);
    if (e.modules) {
      e.modules = e.modules.map((s) => s.escapeWith(typstEscaper));
    }
  });

  resume.projects?.forEach((p) => {
    p.title = p.title.escapeWith(typstEscaper);
    p.b1 = p.b1.escapeWith(typstEscaper);
    p.b2 = p.b2.escapeWith(typstEscaper);
    p.url = p.url.escapeWith(typstEscaper);
    p.languages = p.languages.map((s) => s.escapeWith(typstEscaper));
  });

  resume.work_exp?.forEach((w) => {
    w.title = w.title.escapeWith(typstEscaper);
    w.company = w.company.escapeWith(typstEscaper);
    w.b1 = w.b1.escapeWith(typstEscaper);
    w.b2 = w.b2.escapeWith(typstEscaper);
  });
}

export const genCV = async (template: ResumeData, cv_type: CV_Type) => {
  // this i need to clean up into a more well defined interface
  // maybe create a base class for a template and then different templates can inherit from this base type
  escapeResumeFields(template);

  const education_str =
    template.education?.map((e) => typstEducation(e)).join("\n") ?? "";

  const work_exp =
    template.work_exp?.map((e) => typstExperience(e)).join("\n") ?? "";

  let resume_typst;

  switch (cv_type) {
    case CV_Type.TechCV:
      const proj_str =
        template.projects?.map((p) => typstProject(p)).join("\n") ?? "";

      resume_typst = TECH_TEMPLATE_1.replaceAll(
        "{FULL_NAME}",
        template.header.full_name,
      )
        .replaceAll(`{EMAIL}`, template.header.email)
        .replaceAll("{GITHUB}", template.header.github ?? "")
        .replaceAll("{RESIDENCY}", template.header.residency)
        .replaceAll("{ABOUT_ME}", template.summary.about_me)

        .replaceAll(
          "{LANGUAGES}",
          template.tech_skills?.languages.join(",") ?? "",
        )
        .replaceAll(
          "{FRAMEWORKS}",
          template.tech_skills?.frameworks.join(",") ?? "",
        )
        .replaceAll(
          "{DEVELOPER_TOOLS}",
          template.tech_skills?.developer_tools.join(",") ?? "",
        )
        .replaceAll("//{EDU_SECTION}", education_str)
        .replaceAll("//{PROJ_SECTION}", proj_str)
        .replaceAll("//{WORK_SECTION}", work_exp);
      break;

    case CV_Type.GeneralCV:
      resume_typst = GENERAL_TEMPLATE_1.replaceAll(
        "{FULL_NAME}",
        template.header.full_name,
      )
        .replaceAll("{EMAIL}", template.header.email)
        .replaceAll("{RESIDENCY}", template.header.residency)
        .replaceAll("{ABOUT_ME}", template.summary.about_me)
        .replaceAll("//{EDU_SECTION}", education_str)
        .replaceAll("//{WORK_SECTION}", work_exp);
  }

  const pdf = await $typst.pdf({ mainContent: resume_typst });

  return pdf;
};

const genCover = async (coverData: CoverLetterData, resume: ResumeData) => {
  // here the resume data that we get should already have been processed by llm

  const current_date = dateString(new Date());
  const paragraphs = coverData.paragraphs
    .map((p) => typstCoverPara(p))
    .join("\n");

  const cover_typst = COVER_TEMPLATE.replaceAll(
    "{FULL_NAME}",
    resume.header.full_name,
  )
    .replace("{E_MAIL}", resume.header.email)
    .replace("{DATE}", current_date)
    .replace("{PARAGRAPHS}", paragraphs)
    .replace("{SALUTATION}", coverData.salutation)
    .replace("{HIRING_MANAGER}", coverData.hiring_manager)
    .replace("{COMPANY_NAME}", coverData.company_name);

  const pdf = await $typst.pdf({ mainContent: COVER_TEMPLATE });

  return pdf;
};

const typstCoverPara = (paragraph: string) => {
  return COVER_PARA.replace("{PARA}", paragraph);
};

const typstEducation = (e: Education) => {
  return EDU_TEMPLATE.replace("{EDU_TITLE}", e.title)
    .replace("{EDU_GRADE}", e.grade)
    .replace("{EDU_YEAR}", displayDate(e.dates))
    .replace("{EDU_NAME}", e.name)
    .replace("{EDU_LOCATION}", e.location)
    .replace("{EDU_MODULES}", e.modules?.join(",") ?? "");
};

const typstProject = (p: Project) => {
  return PROJECT_TEMPLATE.replace("{P_N}", p.title)
    .replace("{P_TECH}", p.languages.join(", "))
    .replaceAll("{P_URL}", p.url)
    .replace("{P_B1}", p.b1)
    .replace("{P_B2}", p.b2);
};

const typstExperience = (w: Experience) => {
  return EXPERIENCE_TEMPLATE.replace("{J_T}", w.title)
    .replace("{J_C}", w.company)
    .replace("{J_D}", displayDate(w.dates))
    .replace("{J_B1}", w.b1)
    .replace("{J_B2}", w.b2);
};
