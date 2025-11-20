import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { clsx } from 'clsx';
import { ComponentNode, ComponentType } from '../types';
import { useDesignerStore } from '../store/designerStore';
import ComponentCard from './ComponentCard';
import EmptyState from './EmptyState';

interface Props {
  draggingId: string | null;
}

const CanvasArea = ({ draggingId }: Props) => {
  const { components, hoverId } = useDesignerStore((state) => ({
    components: state.formSchema.components,
    hoverId: state.hoverId,
  }));

  const { setNodeRef, isOver } = useDroppable({
    id: 'root-drop',
    data: { parentId: null, index: components.length },
  });

  return (
    <section className="flex-1 min-h-[80vh] bg-white border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase text-slate-500">画布</p>
          <h2 className="text-lg font-semibold">拖拽组件到这里</h2>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={clsx('min-h-[70vh] p-2 space-y-3 rounded-lg transition-colors', {
          'bg-sky-50 border border-accent/60': isOver,
          'bg-slate-50 border border-border': !isOver,
        })}
      >
        {components.length === 0 ? (
          <EmptyState highlight={isOver} />
        ) : (
          <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {components.map((component, index) => (
              <ComponentCard
                key={component.id}
                node={component}
                index={index}
                parentId={null}
                draggingId={draggingId}
              />
            ))}
          </SortableContext>
        )}
        {draggingId && !isOver && !hoverId && (
          <div className="mt-3 text-xs text-rose-500 text-center">当前区域不支持放置，请移动到蓝色区域</div>
        )}
      </div>
    </section>
  );
};

export const isContainer = (type: ComponentType) =>
  type === ComponentType.CONTAINER || type === ComponentType.ROW || type === ComponentType.COLUMN;

export default CanvasArea;
