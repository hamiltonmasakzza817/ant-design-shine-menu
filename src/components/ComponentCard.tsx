import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { clsx } from 'clsx';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ComponentNode } from '../types';
import { isContainer } from './CanvasArea';
import { useDesignerStore } from '../store/designerStore';
import ComponentPreview from './ComponentPreview';

interface Props {
  node: ComponentNode;
  parentId: string | null;
  index: number;
  draggingId: string | null;
}

const ComponentCard = ({ node, parentId, index, draggingId }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    data: { parentId, index, origin: 'canvas', type: node.type, id: node.id },
  });
  const { actions, selectedComponentId, hoverId } = useDesignerStore((state) => ({
    actions: state.actions,
    selectedComponentId: state.selectedComponentId,
    hoverId: state.hoverId,
  }));

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { setNodeRef: dropRef, isOver } = useDroppable({
    id: `drop-${node.id}`,
    data: { parentId: node.id, index: node.children?.length ?? 0 },
  });

  const wrapperClass = clsx('dashed-box', {
    'border-2 border-accent/80': isDragging || draggingId === node.id,
    hovered: isOver || hoverId === node.id,
    'ring-2 ring-accent/40': selectedComponentId === node.id,
  });

  return (
    <div style={style} ref={setNodeRef} {...attributes} {...listeners}>
      <div
        className={wrapperClass}
        onClick={(e) => {
          e.stopPropagation();
          actions.selectComponent(node.id);
        }}
      >
        <ComponentPreview node={node} />
        {isContainer(node.type) && (
          <div ref={dropRef} className="p-2 bg-slate-50 rounded-lg space-y-2">
            {node.children && node.children.length > 0 ? (
              <SortableContext items={node.children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {node.children.map((child, childIndex) => (
                  <ComponentCard
                    key={child.id}
                    node={child}
                    parentId={node.id}
                    index={childIndex}
                    draggingId={draggingId}
                  />
                ))}
              </SortableContext>
            ) : (
              <p className="text-xs text-slate-400 text-center py-3">将组件拖入该容器</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentCard;
