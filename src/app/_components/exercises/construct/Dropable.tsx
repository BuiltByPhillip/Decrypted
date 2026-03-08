"use client"

import React, { forwardRef } from "react";

type DropableProps = {
  className?: string;
  children?: React.ReactNode;
  isDragging?: boolean;
  isHovered?: boolean;
}


export default forwardRef<HTMLDivElement, DropableProps>(function Dropable(props, ref) {
  const { className, children, isDragging, isHovered } = props;

  const getStyles = () => {
    if (isDragging && isHovered) {
      return 'scale-103 shadow-[0_0_15px_var(--color-primary)]';
    }
    return '';
  };

  return (
    <div
      ref={ref}
      className={`flex flex-row justify-center items-center px-10 min-w-20 min-h-20
        transition-all duration-300 ease-out
        ${!children ? 'border-3 border-dotted border-gray' : ''}
        ${getStyles()}
        ${className ?? ''}`}
    >
      {children}
    </div>
  );
});