import DragAndDrop from "~/app/_components/exercises/construct/dragAndDrop";
import type { Definition, Expr, PaletteItem } from "~/app/hooks/parser";
import type {SelectedDefinitions} from "~/app/exercise/page";


type DefinitionsConstructProps = {
    definitions: Definition[];
    onSelect: (role: string, symbol: Expr) => void;
    selected: SelectedDefinitions;
}

export default function DefinitionsConstruct({ definitions, onSelect, selected }: DefinitionsConstructProps) {
    
    return (
        <DragAndDrop/>
    );
}