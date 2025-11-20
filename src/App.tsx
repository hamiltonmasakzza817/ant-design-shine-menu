import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useMemo } from 'react';
import CanvasArea from './components/CanvasArea';
import ComponentPanel from './components/ComponentPanel';
import PropertyPanel from './components/PropertyPanel';
import { createComponent, useDesignerStore } from './store/designerStore';
import { DragMeta } from './types';

const App = () => {
  const { formSchema, draggingId, actions } = useDesignerStore((state) => ({
    formSchema: state.formSchema,
    draggingId: state.draggingId,
    actions: state.actions,
  }));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    })
  );

  const dropIndexFallback = useMemo(() => formSchema.components.length, [formSchema.components.length]);

  const handleDragStart = (event: DragStartEvent) => {
    const meta = event.active.data.current as DragMeta | undefined;
    if (!meta) return;
    actions.setHoverId(null);
    actions.setDraggingId(meta.id ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    actions.setHoverId(event.over?.id?.toString() ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const meta = event.active.data.current as DragMeta | undefined;
    const overData = event.over?.data.current as { parentId: string | null; index: number } | undefined;
    actions.setHoverId(null);
    actions.setDraggingId(null);

    if (!meta || !event.over) return;

    if (meta.origin === 'panel') {
      const node = createComponent(meta.type);
      actions.addComponent(node, overData?.parentId ?? null, overData?.index ?? dropIndexFallback);
      return;
    }

    if (meta.origin === 'canvas' && meta.id && overData) {
      actions.moveComponent(meta.id, overData.parentId, overData.index);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="min-h-screen bg-canvas text-slate-800">
        <header className="px-6 py-4 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <p className="text-xs uppercase text-slate-500">表单设计器</p>
            <h1 className="text-2xl font-semibold">可视化构建</h1>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => actions.reset()}
              className="px-4 py-2 rounded-md text-sm bg-white border border-border hover:border-accent hover:text-accent"
            >
              重置画布
            </button>
          </div>
        </header>

        <div className="flex gap-4 px-6 py-4 items-start">
          <CanvasArea draggingId={draggingId} />
          <PropertyPanel />
          <ComponentPanel />
        </div>
      </div>
    </DndContext>
  );
};

export default App;
