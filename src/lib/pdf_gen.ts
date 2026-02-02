import { $typst } from "@myriaddreamin/typst.ts";

import {
  Education,
  Project,
  Experience,
  Resume,
  GenerationOutput,
} from "./schemas";
import {
  COVER_TEMPLATE,
  EDU_TEMPLATE,
  EXPERIENCE_TEMPLATE,
  GENERAL_TEMPLATE_1,
  PARAGRAPH_TEMPLATE,
  PROJECT_TEMPLATE,
  TECH_TEMPLATE_1,
} from "./templates";
import { setDefaultAutoSelectFamily } from "node:net";

// i will download these binaries  myself in prod, and will server it statiically
$typst.setCompilerInitOptions({
  getModule: () =>
    "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm",
});
$typst.setRendererInitOptions({
  getModule: () =>
    "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm",
});

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
    .replaceAll("@", String.raw`\@`)
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

// can re use structs from rust end

function escapeFields(template: GenerationOutput) {
  template.full_name = template.full_name.escapeWith(typstEscaper);
  template.email = template.email.escapeWith(typstEscaper);
  template.residency = template.residency.escapeWith(typstEscaper);
  if (template.github) {
    template.github = template.github.escapeWith(typstEscaper);
  }

  template.about_me = template.about_me.escapeWith(typstEscaper);

  if (template.languages) {
    template.languages = template.languages.map((s) =>
      s.escapeWith(typstEscaper),
    );
  }
  if (template.frameworks) {
    template.frameworks = template.frameworks.map((s) =>
      s.escapeWith(typstEscaper),
    );
  }
  if (template.developer_tools) {
    template.developer_tools = template.developer_tools.map((s) =>
      s.escapeWith(typstEscaper),
    );
  }

  template.education?.forEach((e) => {
    e.title = e.title.escapeWith(typstEscaper);
    e.grade = e.grade.escapeWith(typstEscaper);
    e.name = e.name.escapeWith(typstEscaper);
    e.location = e.location.escapeWith(typstEscaper);
    if (e.modules) {
      e.modules = e.modules.map((s) => s.escapeWith(typstEscaper));
    }
  });

  template.projects?.forEach((p) => {
    p.title = p.title.escapeWith(typstEscaper);
    p.b1 = p.b1.escapeWith(typstEscaper);
    p.b2 = p.b2.escapeWith(typstEscaper);
    p.url = p.url.escapeWith(typstEscaper);
    p.languages = p.languages.map((s) => s.escapeWith(typstEscaper));
  });

  template.work_exp?.forEach((w) => {
    w.title = w.title.escapeWith(typstEscaper);
    w.company = w.company.escapeWith(typstEscaper);
    w.b1 = w.b1.escapeWith(typstEscaper);
    w.b2 = w.b2.escapeWith(typstEscaper);
  });

  template.hiring_manager = template.hiring_manager.escapeWith(typstEscaper);

  template.company_name = template.company_name.escapeWith(typstEscaper);
  template.salutation = template.salutation.escapeWith(typstEscaper);
  template.paragraphs = template.paragraphs.map((s) =>
    s.escapeWith(typstEscaper),
  );
}

export const genCV = async (template: GenerationOutput, cv_type: CV_Type) => {
  escapeFields(template);

  const education_str =
    template.education?.map((e) => typstEducation(e)).join("\n") ?? "";

  const work_exp =
    template.work_exp?.map((e) => typstExperience(e)).join("\n") ?? "";

  let cv_typst;

  switch (cv_type) {
    case CV_Type.TechCV:
      const proj_str =
        template.projects?.map((p) => typstProject(p)).join("\n") ?? "";

      cv_typst = TECH_TEMPLATE_1.replaceAll("{FULL_NAME}", template.full_name)
        .replaceAll(`{EMAIL}`, template.email)
        .replaceAll("{GITHUB}", template.github ?? "")
        .replaceAll("{RESIDENCY}", template.residency)
        .replaceAll("{ABOUT_ME}", template.about_me)

        .replaceAll("{LANGUAGES}", template.languages?.join(", ") ?? "")
        .replaceAll("{FRAMEWORKS}", template.frameworks?.join(", ") ?? "")
        .replaceAll(
          "{DEVELOPER_TOOLS}",
          template.developer_tools?.join(", ") ?? "",
        )
        .replaceAll("//{EDU_SECTION}", education_str)
        .replaceAll("//{PROJ_SECTION}", proj_str)
        .replaceAll("//{WORK_SECTION}", work_exp);
      break;

    case CV_Type.GeneralCV:
      cv_typst = GENERAL_TEMPLATE_1.replaceAll(
        "{FULL_NAME}",
        template.full_name,
      )
        .replaceAll("{EMAIL}", template.email)
        .replaceAll("{RESIDENCY}", template.residency)
        .replaceAll("{SUMMARY}", template.about_me)
        .replaceAll("//{EDU_SECTION}", education_str)
        .replaceAll("//{WORK_SECTION}", work_exp);
  }

  const pdf = await $typst.pdf({ mainContent: cv_typst });

  return pdf;
};

export const genCover = async (template: GenerationOutput) => {
  const paragraph_str = template.paragraphs
    .map((p) => PARAGRAPH_TEMPLATE.replace("{PARA}", p))
    .join("\n");

  const date = coverDateFormat(new Date());

  const cover_typst = COVER_TEMPLATE.replaceAll(
    "{FULL_NAME}",
    template.full_name,
  )
    .replaceAll("{EMAIL}", template.email)
    .replace("{DATE}", date)
    .replace("{PARAGRAPHS}", paragraph_str)
    .replace("{SALUTATION}", template.salutation)
    .replace("{HIRING_MANAGER}", template.hiring_manager)
    .replace("{COMPANY_NAME}", template.company_name);

  console.log(cover_typst);

  const pdf = await $typst.pdf({ mainContent: cover_typst });

  return pdf;
};

function getOrdinalSuffix(day: number) {
  if (day > 3 && day < 21) return "th"; // Handles 11th, 12th, 13th
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function coverDateFormat(date: Date) {
  const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    date,
  );
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    date,
  );
  const dayOfMonth = date.getDate();
  const ordinalSuffix = getOrdinalSuffix(dayOfMonth);

  return `${dayName} ${dayOfMonth}${ordinalSuffix} ${monthName}`;
}

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
