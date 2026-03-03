"use client"

import React, { forwardRef } from "react";

type DropableProps = {
  className?: string;
  children?: React.ReactNode;
}


export default forwardRef<HTMLDivElement, DropableProps>(function Dropable(props, ref) {
  const { className, children } = props;

  return (
    <div
      ref={ref}
      className={`flex flex-row justify-center items-center px-10 min-w-20 min-h-20 ${!children ? 'border-3 border-dotted border-gray' : ''} ${className ?? ''}`}
    >
      {children}
    </div>
  );
});