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
      className={`${className} flex justify-center items-center h-100 w-30 border rounded-2xl
        text-muted border-muted
        hover:text-danger hover:border-danger hover:scale-103 hover:shadow-[0_0_15px_var(--color-danger)] 
        transition-all duration-300 ease-out`}>
      <Trash2 size={32} strokeWidth={1.5}/>
    </div>
  );
});