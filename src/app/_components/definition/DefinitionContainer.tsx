import React, {useEffect, useState} from "react";
import {type Expr, symbolDisplay} from "~/app/hooks/parser";
import {exprToString} from "~/app/hooks/expr";

type DefinitionContainerProps = {
    selected: Map<string, Expr> // Map<Role, Expression>
    className?: string;
}


/**
 * A container that showcases the user selected definitions,
 * @param selected - The definitions that the user has selected in the definition step.
 * @param className - Tailwind classes for styling applied to the outer div.
 * @constructor
 */
export default function DefinitionContainer({ selected, className }: DefinitionContainerProps) {
    const [visible, setVisible] = useState(false);

    function convertToList() {
        return Array.from(selected.entries())
    }

    useEffect(() => {
        if (selected.size > 0) {
            requestAnimationFrame(() => setVisible(true));
        }
    }, [selected.size > 0]);

    if (selected.size === 0) return null;

    return (
        <div className={`min-w-40 min-h-40 border-2 border-muted rounded-2xl p-4 bg-dark/40 transition-all duration-300 ease-out ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2"} ${className}`}>
            <span className="font-bold text-xl text-muted select-none">Definitions</span>
            <div className={`grid grid-cols-[auto_1fr_2fr] pt-2 text-muted`}>
                {convertToList().map(([role, expr]) => (
                    <React.Fragment key={role}>
                        <span className="text-left">{exprToString(expr)}</span>
                        <span className="text-center">{symbolDisplay["elem"]}</span>
                        <span className="text-left">{role}</span>
                    </React.Fragment>
                ))}
            </div>
        </div>

    );
}
