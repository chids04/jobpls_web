import { $typst } from "@myriaddreamin/typst.ts";

import { Education, Project, Experience, GenerationOutput } from "./schemas";
import {
  COVER_TEMPLATE,
  EDU_TEMPLATE,
  EMAIL_TEMPLATE,
  EXPERIENCE_TEMPLATE,
  GENERAL_TEMPLATE_1,
  GITHUB_TEMPLATE,
  HEADER_TEMPLATE,
  PARAGRAPH_TEMPLATE,
  PROJECT_TEMPLATE,
  SKILLS_TEMPLATE,
  TECH_TEMPLATE_1,
} from "./templates";
import { CV_Type } from "./types";

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

// some constants for spacing
const BULLET_SPACING = "#v(0.1em)";
const PROJECT_SPACING = "#v(0.2em)";

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
    .replaceAll("#", String.raw`\#`)
    .replaceAll("@", String.raw`\@`)
    .replaceAll("$", String.raw`\$`)
    .replaceAll("_", String.raw`\_`)
    .replaceAll("[", String.raw`\[`)
    .replaceAll("]", String.raw`\]`)
    .replaceAll("<", String.raw`\<`);
};

// can re use structs from rust end

export function escapeFields(template: GenerationOutput) {
  template.full_name = template.full_name?.escapeWith(typstEscaper);
  template.email = template.email?.escapeWith(typstEscaper);
  template.residency = template.residency?.escapeWith(typstEscaper);
  if (template.github) {
    template.github = template.github.escapeWith(typstEscaper);
  }

  template.about_me = template.about_me?.escapeWith(typstEscaper);

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
    e.title = e.title?.escapeWith(typstEscaper);
    e.grade = e.grade?.escapeWith(typstEscaper);
    e.name = e.name?.escapeWith(typstEscaper);
    e.location = e.location?.escapeWith(typstEscaper);
    if (e.modules) {
      e.modules = e.modules.map((s) => s.escapeWith(typstEscaper));
    }
  });

  template.projects?.forEach((p) => {
    p.title = p.title?.escapeWith(typstEscaper);
    p.b1 = p.b1?.escapeWith(typstEscaper);
    p.b2 = p.b2?.escapeWith(typstEscaper);
    p.url = p.url?.escapeWith(typstEscaper);
    p.languages = p.languages?.map((s) => s.escapeWith(typstEscaper));
  });

  template.work_exp?.forEach((w) => {
    w.title = w.title?.escapeWith(typstEscaper);
    w.company = w.company?.escapeWith(typstEscaper);
    w.b1 = w.b1?.escapeWith(typstEscaper);
    w.b2 = w.b2?.escapeWith(typstEscaper);
  });

  template.hiring_manager = template.hiring_manager.escapeWith(typstEscaper);

  template.company_name = template.company_name.escapeWith(typstEscaper);
  template.salutation = template.salutation.escapeWith(typstEscaper);
  template.paragraphs = template.paragraphs.map((s) =>
    s.escapeWith(typstEscaper),
  );
}

// prettier-ignore
export const genCV = async (template: GenerationOutput, cv_type: CV_Type) => {
  escapeFields(template);

  // both templates have an education and work experience section
  const mailToEmail = template.email?.replaceAll(String("\\"), "");
  const emailSection = template.email ? EMAIL_TEMPLATE
    .replace("{EMAIL}", template.email ?? "")
    .replace("{EMAILTO}", mailToEmail ?? "") : "";

  const aboutMeSection = template.about_me
    ? typstHeader("ABOUT ME", template.about_me)
    : "";
  const education_str =
    template.education?.map((e) => typstEducation(e)).join(PROJECT_SPACING) ??
    "";
  const educationSection = template.education
    ? typstHeader("EDUCATION", education_str)
    : "";
  const work_exp =
    template.work_exp?.map((e) => typstExperience(e)).join(PROJECT_SPACING) ??
    "";
  const workSection = template.work_exp
    ? typstHeader("WORK EXPERIENCE", work_exp)
    : "";

  let cv_typst;


  switch (cv_type) {
    case CV_Type.TechCV:
      const proj_str =
        template.projects?.map((p) => typstProject(p)).join(PROJECT_SPACING) ??
        "";

      const projSection = template.projects
        ? typstHeader("PROJECTS", proj_str)
        : "";


      const githubSection = template.github ? GITHUB_TEMPLATE
        .replaceAll("{GITHUB}",template.github) : "";

      //
      const skills: string[] = [];

      template.languages &&
        skills.push(typstSkills("LANGUAGES:", template.languages.join(", ")));

      template.frameworks &&
        skills.push(typstSkills("FRAMEWORKS:", template.frameworks.join(", ")));

      template.developer_tools &&
        skills.push(
          typstSkills("DEVELOPER TOOLS:", template.developer_tools.join(", ")),
        );

      const skillsContent = skills.join(BULLET_SPACING);

      const skillsSection = skills.length > 0 ? typstHeader("TECHNICAL SKILLS", skillsContent) : "";

      // prettier-ignore
      cv_typst = TECH_TEMPLATE_1
        .replace("{FULL_NAME}", template.full_name ?? "")
        .replace("{EMAIL}", emailSection)
        .replace("{GITHUB}", githubSection)
        .replace("{RESIDENCY}", template.residency ?? "")
        .replace("{ABOUT_ME}", aboutMeSection)
        .replace("{SKILLS}", skillsSection)
        .replace("{EDUCATION}", educationSection)
        .replace("{PROJECTS}", projSection)
        .replace("{WORK}", workSection)

      break;

    case CV_Type.GeneralCV:
      cv_typst = GENERAL_TEMPLATE_1.replaceAll(
        "{FULL_NAME}",
        template.full_name ?? "",
      )
        .replace("{EMAIL}", emailSection)
        .replaceAll("{RESIDENCY}", template.residency ?? "")
        .replaceAll("{ABOUT_ME}", aboutMeSection)
        .replaceAll("{EDUCATION}", educationSection)
        .replaceAll("{WORK}", workSection);

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
    template.full_name ?? "",
  )
    .replaceAll("{EMAIL}", template.email ?? "")
    .replace("{DATE}", date)
    .replace("{PARAGRAPHS}", paragraph_str)
    .replace("{SALUTATION}", template.salutation)
    .replace("{HIRING_MANAGER}", template.hiring_manager)
    .replace("{COMPANY_NAME}", template.company_name);

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
  return EDU_TEMPLATE.replace("{EDU_TITLE}", e.title ?? "")
    .replace("{EDU_GRADE}", e.grade ?? "")
    .replace("{EDU_YEAR}", `${e.start_date} - ${e.end_date}`)
    .replace("{EDU_NAME}", e.name ?? "")
    .replace("{EDU_LOCATION}", e.location ?? "")
    .replace("{EDU_MODULES}", e.modules?.join(", ") ?? "");
};

const typstProject = (p: Project) => {
  return PROJECT_TEMPLATE.replace("{P_N}", p.title ?? "")
    .replace("{P_TECH}", p.languages?.join(", ") ?? "")
    .replaceAll("{P_URL}", p.url ?? "")
    .replace("{P_B1}", p.b1 ?? "")
    .replace("{P_B2}", p.b2 ?? "");
};

const typstExperience = (w: Experience) => {
  return EXPERIENCE_TEMPLATE.replace("{J_T}", w.title ?? "")
    .replace("{J_C}", w.company ?? "")
    .replace("{J_D}", `${w.start_date} - ${w.end_date}`)
    .replace("{J_B1}", w.b1 ?? "")
    .replace("{J_B2}", w.b2 ?? "");
};

const typstHeader = (header: string, content: string) => {
  return HEADER_TEMPLATE.replace("{HEADER}", header).replace(
    "{CONTENT}",
    content,
  );
};

const typstSkills = (title: string, content: string) => {
  return SKILLS_TEMPLATE.replace("{TITLE}", title).replace(
    "{CONTENT}",
    content,
  );
};
