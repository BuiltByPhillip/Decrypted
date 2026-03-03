import { forwardRef } from "react";
import { Trash2 } from "lucide-react";

type TrashContainerProps = {
  className?: string;
  isDragging?: boolean;
}



export default forwardRef<HTMLDivElement, TrashContainerProps>(function TrashContainer(props, ref) {
  const { className, isDragging } = props

  if (!isDragging) return <div></div>

  return (
    <div
      ref={ref}
      className={`${className} transition min-h-100 min-w-30 border border-red-500 rounded-2xl ${isDragging ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <Trash2 />
    </div>
  );
});