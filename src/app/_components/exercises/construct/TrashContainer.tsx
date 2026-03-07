import { forwardRef } from "react";
import { Trash2 } from "lucide-react";

type TrashContainerProps = {
  className?: string;
  isDragging?: boolean;
  isHovered?: boolean;
}



export default forwardRef<HTMLDivElement, TrashContainerProps>(function TrashContainer(props, ref) {
  const { className, isDragging, isHovered } = props

  // Determine styles based on state
  const getStyles = () => {
    if (isDragging && isHovered) {
      // Dragging and hovering over trash: danger glow
      return 'text-danger border-danger scale-103 shadow-[0_0_15px_var(--color-danger)]';
    } else if (isDragging) {
      // Dragging but not hovering: muted glow
      return 'text-muted border-muted shadow-[0_0_15px_var(--color-muted)]';
    } else {
      // Not dragging: no glow
      return 'text-muted border-muted';
    }
  };

  return (
    <div
      ref={ref}
      className={`${className} flex justify-center items-center h-100 w-30 border rounded-2xl
        transition-all duration-300 ease-out
        ${getStyles()}`}>
      <Trash2 size={32} strokeWidth={1.5}/>
    </div>
  );
});