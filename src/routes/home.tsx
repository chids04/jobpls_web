import { createFileRoute } from "@tanstack/react-router";
import { AboutMeTemplate } from "@/lib/types";
import { AboutMeCarousel } from "@/components/home/AboutMeCarousel";
import { useEffect, useState } from "react";
import axios from "axios";
import { ImageWithPreview } from "@/components/ui/image-preview";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";

import { ArrowBigDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockJobDesc2 =
  "We're seeking a passionate and skilled Software Engineer to join our innovative team. You will be instrumental in designing, developing...";
export const Route = createFileRoute("/home")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [mockAboutMe, setMockAboutMe] = useState<AboutMeTemplate[]>([]);

  useEffect(() => {
    const getMockData = async () => {
      try {
        const response = await axios.get("/home_data/mock_aboutme.json");
        setMockAboutMe(response.data as AboutMeTemplate[]);
      } catch (e) {
        if (axios.isAxiosError(e)) {
          console.log(e);
        }
      }
    };

    getMockData();
  }, []);

  return (
    <div className="container mx-auto p-10 flex flex-col items-center">
      <h1 className="text-5xl font-bold text-center py-20">
        make the job search less painful
      </h1>

      <ArrowBigDown className="w-10 h-10" />

      <h1 className="text-4xl py-20 text-center">
        store different templates to apply for a wide range of jobs
      </h1>

      <AboutMeCarousel templates={mockAboutMe} />

      <div className="my-10"></div>

      <ArrowBigDown className="w-10 h-10" />

      <h1 className="text-2xl py-20 text-center">
        select specific CV templates to suit your style
      </h1>

      <div className="flex flex-col items-center justify-center lg:flex-row gap-2">
        <ImageWithPreview
          src="/general_template.webp"
          alt=""
          className="rounded-lg max-w-md w-full"
        />

        <ImageWithPreview
          src="/tech_template.webp"
          alt=""
          className="rounded-lg max-w-md w-full"
        />
      </div>

      <div className="m-10"></div>

      <ArrowBigDown className="w-10 h-10" />

      <h1 className="text-2xl py-10 text-center">enter a job description</h1>
      <Textarea
        className="w-full max-h-40"
        contentEditable={false}
        placeholder={mockJobDesc2}
        readOnly={true}
      ></Textarea>

      <div className="m-10"></div>

      <ArrowBigDown className="w-10 h-10" />

      <h1 className="text-2xl p-10 text-center">
        recieve a personalised cv and cover letter in seconds
      </h1>
      <div className="flex flex-col items-center justify-center lg:flex-row gap-2">
        <ImageWithPreview
          src="/mock_resume_gen.webp"
          alt=""
          className="rounded-lg max-w-md w-full"
        />

        <ImageWithPreview
          src="/mock_cover_gen.webp"
          alt=""
          className="rounded-lg max-w-md w-full"
        />
      </div>

      <div className="m-10"></div>

      <Button
        onClick={() => navigate({ to: "/about-me" })}
        className="text-4xl p-10 border-2"
      >
        get started!
      </Button>
    </div>
  );
}
