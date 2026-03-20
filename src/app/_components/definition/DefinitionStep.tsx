import type {Definition, Expr} from "~/app/hooks/parser";
import type {SelectedDefinitions} from "~/app/exercise/page";
import {DefinitionList} from "~/app/_components/definition/Definition";
import DefinitionsPicker from "~/app/_components/definition/DefinitionsPicker";
import DefinitionsConstruct from "~/app/_components/definition/DefinitionsConstruct";

type DefinitionStepProps = {
    definitions: Definition[];
    onSelect: (role: string, symbol: Expr) => void;
    selected: SelectedDefinitions;
}


export default function DefinitionStep({ definitions, onSelect, selected }: DefinitionStepProps) {
    const type = definitions[0]?.type
    
    switch (type) {
        case "select":
            return <DefinitionsPicker definitions={definitions} onSelect={onSelect} selected={selected}/>;
        case "construct":
            return <DefinitionsConstruct definitions={definitions} onSelect={onSelect} selected={selected}/>
        default:
            throw new Error(`Unsupported type ${type}`);
    }
}