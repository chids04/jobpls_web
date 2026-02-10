import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { useTemplateStore } from "@/store/useStore";

export function DocGenOptions() {
  const { docGenOptions, setDocGenOptions } = useTemplateStore();

  return (
    <FieldSet>
      <FieldLegend variant="label">document options</FieldLegend>
      <FieldGroup className="gap-3">
        <Field orientation="horizontal">
          <Checkbox
            id="cv-checkbox"
            name="cv-checkbox"
            checked={docGenOptions.hasCV}
            onCheckedChange={(checked) =>
              setDocGenOptions({ ...docGenOptions, hasCV: !!checked })
            }
          />
          <FieldLabel htmlFor="cv-checkbox" className="font-normal">
            create cv
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="cover-checkbox"
            name="cover-checkbox"
            checked={docGenOptions.hasCover}
            onCheckedChange={(checked) =>
              setDocGenOptions({ ...docGenOptions, hasCover: !!checked })
            }
          />
          <FieldLabel htmlFor="cover-checkbox" className="font-normal">
            create cover letter
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
