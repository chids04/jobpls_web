import { useState, useEffect } from "react";
import { CVTemplate } from "@/components/cv-template/CVTemplateSelection";
import { AboutMeTemplate } from "@/components/about-me/types";
import { createFileRoute } from "@tanstack/react-router";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { LS_KEY_SELECTED_ABOUT_ME_TEMPLATE_ID } from "@/components/about-me/TemplateDropdown";
import { LS_KEY_TEMPLATES } from "@/components/about-me/types";
import { LS_KEYS_SELECTED_CV } from "@/components/cv-template/types";
import { Button } from "@/components/ui/button";

// generate page allows users to gen their cv and add a short pre-prompt

export const Route = createFileRoute("/generate")({
  component: GeneratePage,
});

export function GeneratePage() {
  const [cv, setCv] = useState<CVTemplate>();
  const [aboutMe, setAboutMe] = useState<AboutMeTemplate>();

  const handleGenerate = async () => {
    if (cv && aboutMe) {
      const req_body = {
        cv_name: cv.name,
        base_data: aboutMe,
      };
      const body = JSON.stringify(req_body);

      const resp = await fetch("url to be decided", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      //server responds with specific error code and we can set the loading state

      //const resp = await fetch("");
    }
  };

  useEffect(() => {
    // get the selected cv and about me from local storage
    const raw_cv = localStorage.getItem(LS_KEYS_SELECTED_CV);
    const raw_about = localStorage.getItem(
      LS_KEY_SELECTED_ABOUT_ME_TEMPLATE_ID,
    );

    if (raw_cv) {
      try {
        const cv: CVTemplate = JSON.parse(raw_cv);
        setCv(cv);
      } catch {}
    }

    if (raw_about) {
      try {
        const loaded_id: string = JSON.parse(raw_about);
        const raw_aboutme_list = localStorage.getItem(LS_KEY_TEMPLATES);

        if (!raw_aboutme_list) {
          throw Error("about me missing from local storage");
        }

        const about_list: AboutMeTemplate[] = JSON.parse(raw_aboutme_list);
        const template = about_list.find((a) => a.id == loaded_id);

        if (template) {
          setAboutMe(template);
        }
      } catch {}
    }
  }, []);

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col md:flex-row gap-5 items-center justify-center w-full">
        <Textarea className="max-w-sm" placeholder="special instructions" />

        {aboutMe && cv ? (
          <div className="flex flex-col gap-10">
            <div className="flex flex-col items-center border-b-accent border-2 p-2">
              <h1 className="text-xl">
                selected cv - <span className="font-bold">{cv.name}</span>
              </h1>
              <Link
                className="hover:text-blue-400 hover:underline"
                to="/cv-template"
              >
                click to change
              </Link>
            </div>

            <div className="flex flex-col items-center border-b-accent border-2 p-2">
              <h1 className="text-xl">
                selected about me -{" "}
                <span className="font-bold">{aboutMe.templateName}</span>
              </h1>
              <Link
                className="hover:text-blue-400 hover:underline"
                to="/about-me"
              >
                click to edit
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center bg-red-700/40 border-red-900 p-2 border-2 text-red-400">
            <h3>no templates found</h3>
            <Link className="text-blue-400 hover:underline" to="/about-me">
              click to create an about me
            </Link>
            <Link className="text-blue-400 hover:underline" to="/about-me">
              click to select a cv template
            </Link>
          </div>
        )}
      </div>
      <div className="h-fit">
        <Button>generate</Button>
      </div>
    </div>
  );
}
