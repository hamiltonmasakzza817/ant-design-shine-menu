import { useDraggable } from '@dnd-kit/core';
import { clsx } from 'clsx';
import { ComponentType, DragMeta } from '../types';

interface Props {
  label: string;
  description: string;
  type: ComponentType;
}

const DraggablePaletteItem = ({ label, description, type }: Props) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}-${label}`,
    data: { origin: 'panel', type } satisfies DragMeta,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={clsx(
        'border border-border rounded-lg p-3 bg-white shadow-sm hover:border-accent hover:shadow transition cursor-grab',
        { 'border-accent shadow-md scale-[1.01]': isDragging }
      )}
    >
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
};

export default DraggablePaletteItem;
