import Button from "~/components/Button";
import { CircleQuestionMark } from "lucide-react";

type HintProps = {
  hint: string | null;
  className?: string;
}

export default function Hint({ hint, className}: HintProps) {

  return (
    <div className={`flex items-center ${className}`}>
      <Button variant="ghostMuted" className="flex items-center px-2">
        <CircleQuestionMark size={25} />
        <span className="pl-1">Help</span>
      </Button>
    </div>

  );
}