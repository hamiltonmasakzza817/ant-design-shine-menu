import { useMemo } from 'react';
import { ComponentNode, ComponentType } from '../types';
import { useDesignerStore } from '../store/designerStore';

const PropertyPanel = () => {
  const { formSchema, selectedComponentId, actions } = useDesignerStore((state) => ({
    formSchema: state.formSchema,
    selectedComponentId: state.selectedComponentId,
    actions: state.actions,
  }));

  const selected = useMemo(
    () => findComponent(formSchema.components, selectedComponentId),
    [formSchema.components, selectedComponentId]
  );

  if (!selected) {
    return (
      <aside className="w-80 shrink-0">
        <div className="sticky top-20 p-4 bg-white border border-border rounded-xl shadow-sm text-sm text-slate-500">
          选择画布中的组件以配置属性
        </div>
      </aside>
    );
  }

  const updateProp = (updates: Record<string, unknown>) => {
    actions.updateComponent(selected.id, updates);
  };

  const updateStyle = (key: string, value: string) => {
    updateProp({ style: { ...selected.props.style, [key]: value || undefined } });
  };

  return (
    <aside className="w-80 shrink-0">
      <div className="sticky top-20 p-4 bg-white border border-border rounded-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">属性</p>
            <h3 className="text-lg font-semibold">{selected.props.label || '组件属性'}</h3>
          </div>
          <button
            type="button"
            className="text-xs text-slate-500 hover:text-accent"
            onClick={() => actions.selectComponent(null)}
          >
            关闭
          </button>
        </div>

        <div className="space-y-3">
          {supportsLabel(selected.type) && (
            <label className="block text-sm text-slate-700 space-y-1">
              <span>标签文本</span>
              <input
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                value={selected.props.label ?? ''}
                onChange={(e) => updateProp({ label: e.target.value })}
              />
            </label>
          )}

          {selected.type === ComponentType.INPUT && (
            <label className="block text-sm text-slate-700 space-y-1">
              <span>占位提示</span>
              <input
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                value={selected.props.placeholder ?? ''}
                onChange={(e) => updateProp({ placeholder: e.target.value })}
              />
            </label>
          )}

          {(selected.type === ComponentType.INPUT || selected.type === ComponentType.SELECT) && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={selected.props.required ?? false}
                onChange={(e) => updateProp({ required: e.target.checked })}
              />
              必填
            </label>
          )}

          {selected.type === ComponentType.IMAGE && (
            <label className="block text-sm text-slate-700 space-y-1">
              <span>图片 URL</span>
              <input
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                value={selected.props.src ?? ''}
                onChange={(e) => updateProp({ src: e.target.value })}
              />
            </label>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
            <div className="space-y-1">
              <span className="block">宽度</span>
              <input
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                placeholder="例如 100% 或 320px"
                value={(selected.props.style?.width as string) ?? ''}
                onChange={(e) => updateStyle('width', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <span className="block">高度</span>
              <input
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                placeholder="auto"
                value={(selected.props.style?.height as string) ?? ''}
                onChange={(e) => updateStyle('height', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <span className="block">内边距</span>
              <input
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                placeholder="12px"
                value={(selected.props.style?.padding as string) ?? ''}
                onChange={(e) => updateStyle('padding', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <span className="block">背景色</span>
              <input
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                placeholder="#fff"
                value={(selected.props.style?.backgroundColor as string) ?? ''}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => actions.updateComponent(selected.id, { ...selected.props })}
            className="w-full py-2 rounded-md bg-accent text-white text-sm font-semibold hover:opacity-90"
          >
            保存更改
          </button>
        </div>
      </div>
    </aside>
  );
};

const findComponent = (nodes: ComponentNode[], id: string | null): ComponentNode | null => {
  if (!id) return null;
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findComponent(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const supportsLabel = (type: ComponentType) =>
  type === ComponentType.INPUT ||
  type === ComponentType.SELECT ||
  type === ComponentType.BUTTON ||
  type === ComponentType.TEXT ||
  type === ComponentType.CONTAINER ||
  type === ComponentType.ROW ||
  type === ComponentType.COLUMN;

export default PropertyPanel;
