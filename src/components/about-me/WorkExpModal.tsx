import { useState } from "react";
import { Input } from "@/components/ui/input";

export function WorkExpModal() {
  return (
    <div className="flex flex-col container mx-auto px-4">
      <Input placeholder="job title" />
      <Input placeholder="company" />
    </div>
  );
}
