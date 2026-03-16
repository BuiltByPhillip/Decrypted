import Button from "~/components/Button";
import { CircleQuestionMark } from "lucide-react";

type HintProps = {
  hint: string;
}

export default function Hint({hint}: HintProps) {

  return (
    <div className="flex items-center">
      <Button variant="ghost" className="flex items-center px-2">
        <CircleQuestionMark size={25} />
        <span className="pl-1">Hint</span>
      </Button>
    </div>

  );
}