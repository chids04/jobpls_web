import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ProjectModalProps {
  onClose: () => void;
}

export function ProjectModal({ onClose }: ProjectModalProps) {
  const [projectDetails, setProjectDetails] = useState({
    projectName: "",
    dateFrom: "",
    dateTo: "",
    info1: "",
    info2: "",
    url: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProjectDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving project details:", projectDetails);
    // You would typically send this data to an API or parent component here
    onClose(); // Close the modal after saving
  };

  return (
    <div className="flex flex-col gap-4 max-w-md p-8 bg-zinc-800 border-zinc-500 border-2 rounded-lg">
      <Input
        placeholder="project name"
        name="projectName"
        value={projectDetails.projectName}
        onChange={handleChange}
      />
      <div className="flex flex-row gap-2">
        <Input
          placeholder="date from"
          name="dateFrom"
          value={projectDetails.dateFrom}
          onChange={handleChange}
        />
        <Input
          placeholder="date to"
          name="dateTo"
          value={projectDetails.dateTo}
          onChange={handleChange}
        />
      </div>
      <Textarea
        placeholder="info 1"
        className="w-full"
        name="info1"
        value={projectDetails.info1}
        onChange={handleChange}
      />
      <Textarea
        placeholder="info 2"
        className="w-full"
        name="info2"
        value={projectDetails.info2}
        onChange={handleChange}
      />
      <Input
        placeholder="url"
        type="url"
        name="url"
        value={projectDetails.url}
        onChange={handleChange}
      />
      <Button type="button" onClick={handleSave}>
        save
      </Button>
    </div>
  );
}
