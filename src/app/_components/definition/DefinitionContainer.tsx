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
        <div className={`min-w-40 min-h-60 border-2 border-muted rounded-2xl p-4 ${className}`}>
            <span className="font-bold text-xl text-muted select-none">Your Definitions</span>
            <div className={`grid grid-cols-[2fr_1fr_auto] pt-2 text-muted`}>
                {convertToList().map(([role, expr]) => (
                    <React.Fragment key={role}>
                        <span className="text-left">{role}</span>
                        <span className="text-center">{symbolDisplay["elem"]}</span>
                        <span className="text-right">{exprToString(expr)}</span>
                    </React.Fragment>
                ))}
            </div>
        </div>
        
    );
}