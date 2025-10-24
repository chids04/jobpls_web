import { useState, useEffect } from "react";
import { CVTemplate } from "@/components/cv-template/CVTemplateSelection";
import { AboutMeTemplate } from "@/components/about-me/types";

import { LS_KEY_SELECTED_ABOUT_ME_TEMPLATE_ID } from "@/components/about-me/TemplateDropdown";
import { LS_KEYS_SELECTED_CV } from "@/components/cv-template/types";

// generate page allows users to gen their cv and add a short pre-prompt

export function GeneratePage() {
  const [cv, setCv] = useState<CVTemplate>();
  const [aboutMe, setAboutMe] = useState<AboutMeTemplate>();

  useEffect(() => {
    // get the selected cv and about me from local storage
    const raw_cv = localStorage.getItem(LS_KEYS_SELECTED_CV);
    const raw_about = localStorage.getItem(
      LS_KEY_SELECTED_ABOUT_ME_TEMPLATE_ID,
    );

    if (raw_cv) {
      try {
        const cv = JSON.parse(raw_cv) as CVTemplate;
        setCv(cv);
      } catch {}
    }

    if (raw_about) {
      try {
        const aboutMe = JSON.parse(raw_about) as AboutMeTemplate;
        setAboutMe(aboutMe);
      } catch {}
    }
  }, []);

  return <div className="flex flex-col"></div>;
}
