import { forwardRef } from "react";
import { Trash2 } from "lucide-react";

type TrashContainerProps = {
  className?: string;
  isDragging?: boolean;
}



export default forwardRef<HTMLDivElement, TrashContainerProps>(function TrashContainer(props, ref) {
  const { className, isDragging } = props

  return (
    <div
      ref={ref}
      className={`${className} flex justify-center items-center min-h-100 min-w-30 border rounded-2xl
        text-muted border-muted
        hover:text-danger hover:border-danger hover:-translate-y-1 hover:shadow-[0_0_15px_var(--color-danger)] 
        transition-all duration-300 ease-out
        ${isDragging ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <Trash2 size={32} strokeWidth={1.5}/>
    </div>
  );
});