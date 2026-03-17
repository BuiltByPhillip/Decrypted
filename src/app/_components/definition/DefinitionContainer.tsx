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
        <div className={`pl-4 border-l border-muted/50 transition-all duration-300 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} ${className}`}>
            <div className="grid grid-cols-[auto_auto_auto] items-center gap-x-3 gap-y-2.5">
                {convertToList().map(([role, expr]) => (
                    <React.Fragment key={role}>
                        <span className="text-base font-semibold text-soft-white">{exprToString(expr)}</span>
                        <span className="text-base text-muted/40">{symbolDisplay["elem"]}</span>
                        <span className="text-base text-gray/60">{role}</span>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
