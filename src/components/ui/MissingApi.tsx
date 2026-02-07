import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

interface MissingApiProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function MissingApi({ isOpen, setIsOpen }: MissingApiProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Missing Gemini API key</AlertDialogTitle>
          <AlertDialogDescription>
            <span>
              <Link
                to="/account"
                className="text-blue-600 underline underline-offset-4 hover:text-blue-800 cursor-pointer"
              >
                click here
              </Link>
            </span>{" "}
            to add the missing api key
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
