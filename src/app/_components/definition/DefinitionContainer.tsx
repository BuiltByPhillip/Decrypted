import React from "react";
import {type Expr, symbolDisplay} from "~/app/hooks/parser";
import {exprToString} from "~/app/hooks/expr";

type DefinitionContainerProps = {
    selected: Map<string, Expr> // Map<Role, Expression>
    className?: string;
}



export default function DefinitionContainer({ selected, className }: DefinitionContainerProps) {
    
    function convertToList() {
        return Array.from(selected.entries())
    }

    if (selected.size === 0) return null;

    return (
        <div className={`grid grid-cols-[1fr_auto_auto] justify-items-start min-w-60 min-h-100 border-2 transition delay-200 border-muted rounded-2xl ${className} p-4 text-muted`}>
            {convertToList().map(([role, expr]) => (
                <React.Fragment key={role}>
                    <span className="font-bold">{role}</span>
                    <span>{symbolDisplay["elem"]}</span>
                    <span>{exprToString(expr)}</span>
                </React.Fragment>
            ))}
        </div>
    );
}