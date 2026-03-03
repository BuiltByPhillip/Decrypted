import { forwardRef } from "react";

type TrashContainerProps = {
  className?: string;
  isDragging?: boolean;
}



export default forwardRef<HTMLDivElement, TrashContainerProps>(function TrashContainer(props, ref) {
  const { className, isDragging } = props

  return (
    <div className={`min-h-100 min-w-30 border border-red-500 rounded-2xl ${className}`}>

    </div>
  );
});