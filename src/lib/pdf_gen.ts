import { $typst } from "@myriaddreamin/typst.ts";

import {
  Education,
  Project,
  Experience,
  Resume,
} from "./schemas";
import {
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

function escapeResumeFields(resume: Resume) {
  resume.full_name = resume.full_name.escapeWith(typstEscaper);
  resume.email = resume.email.escapeWith(typstEscaper);
  resume.residency = resume.residency.escapeWith(typstEscaper);
  if (resume.github) {
    resume.github = resume.github.escapeWith(typstEscaper);
  }

  resume.about_me = resume.about_me.escapeWith(typstEscaper);

  if (resume.languages) {
    resume.languages = resume.languages.map((s) =>
      s.escapeWith(typstEscaper),
    );
  }
  if (resume.frameworks) {
    resume.frameworks = resume.frameworks.map((s) =>
      s.escapeWith(typstEscaper),
    );
  }
  if (resume.developer_tools) {
    resume.developer_tools = resume.developer_tools.map(
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

export const genCV = async (template: Resume, cv_type: CV_Type) => {
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
        template.full_name,
      )
        .replaceAll(`{EMAIL}`, template.email)
        .replaceAll("{GITHUB}", template.github ?? "")
        .replaceAll("{RESIDENCY}", template.residency)
        .replaceAll("{ABOUT_ME}", template.about_me)

        .replaceAll(
          "{LANGUAGES}",
          template.languages?.join(",") ?? "",
        )
        .replaceAll(
          "{FRAMEWORKS}",
          template.frameworks?.join(",") ?? "",
        )
        .replaceAll(
          "{DEVELOPER_TOOLS}",
          template.developer_tools?.join(",") ?? "",
        )
        .replaceAll("//{EDU_SECTION}", education_str)
        .replaceAll("//{PROJ_SECTION}", proj_str)
        .replaceAll("//{WORK_SECTION}", work_exp);
      break;

    case CV_Type.GeneralCV:
      resume_typst = GENERAL_TEMPLATE_1.replaceAll(
        "{FULL_NAME}",
        template.full_name,
      )
        .replaceAll("{EMAIL}", template.email)
        .replaceAll("{RESIDENCY}", template.residency)
        .replaceAll("{SUMMARY}", template.about_me)
        .replaceAll("//{EDU_SECTION}", education_str)
        .replaceAll("//{WORK_SECTION}", work_exp);
  }

  const pdf = await $typst.pdf({ mainContent: resume_typst! });

  return pdf;
};

const typstEducation = (e: Education) => {
  return EDU_TEMPLATE.replace("{EDU_TITLE}", e.title)
    .replace("{EDU_GRADE}", e.grade)
    .replace("{EDU_YEAR}", `${e.start_date} - ${e.end_date}`)
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
    .replace("{J_D}", `${w.start_date} - ${w.end_date}`)
    .replace("{J_B1}", w.b1)
    .replace("{J_B2}", w.b2);
};
