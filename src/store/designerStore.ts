import { nanoid } from './nanoid';
import { create } from 'zustand';
import { ComponentNode, ComponentProps, ComponentType, FormSchema } from '../types';

interface DesignerState {
  formSchema: FormSchema;
  selectedComponentId: string | null;
  propertyPanelOpen: boolean;
  draggingId: string | null;
  hoverId: string | null;
  actions: {
    addComponent: (component: ComponentNode, targetId?: string | null, index?: number) => void;
    updateComponent: (componentId: string, updates: Partial<ComponentProps>) => void;
    moveComponent: (
      componentId: string,
      targetParentId: string | null,
      targetIndex: number
    ) => void;
    selectComponent: (componentId: string | null) => void;
    setDraggingId: (id: string | null) => void;
    setHoverId: (id: string | null) => void;
    reset: () => void;
  };
}

const createDefaultSchema = (): FormSchema => ({
  id: 'form-1',
  name: '新表单',
  components: [],
});

const removeNode = (
  nodes: ComponentNode[],
  id: string
): { removed: ComponentNode | null; list: ComponentNode[] } => {
  const list = nodes
    .map((n) => {
      if (n.id === id) return null;
      if (n.children) {
        const result = removeNode(n.children, id);
        if (result.removed) {
          return { ...n, children: result.list } as ComponentNode;
        }
      }
      return n;
    })
    .filter(Boolean) as ComponentNode[];

  const removed = nodes.find((n) => n.id === id) ?? null;
  if (removed) return { removed, list };

  for (const n of nodes) {
    if (n.children) {
      const result = removeNode(n.children, id);
      if (result.removed) return { removed: result.removed, list: nodes.map((node) => (node.id === n.id ? { ...n, children: result.list } : node)) };
    }
  }
  return { removed: null, list: nodes };
};

export const useDesignerStore = create<DesignerState>((set, get) => ({
  formSchema: createDefaultSchema(),
  selectedComponentId: null,
  propertyPanelOpen: false,
  draggingId: null,
  hoverId: null,
  actions: {
    addComponent: (component, targetId = null, index) =>
      set((state) => {
        if (!targetId) {
          const next = [...state.formSchema.components];
          const position = index ?? next.length;
          next.splice(position, 0, component);
          return {
            formSchema: { ...state.formSchema, components: next },
            selectedComponentId: component.id,
            propertyPanelOpen: true,
          };
        }

        const newComponents = state.formSchema.components.map((node) => {
          if (node.id === targetId) {
            const children = node.children ? [...node.children] : [];
            const position = index ?? children.length;
            children.splice(position, 0, component);
            return { ...node, children };
          }
          if (node.children) {
            const updated = addToChild(node, targetId, component, index);
            if (updated) return updated;
          }
          return node;
        });

        return {
          formSchema: { ...state.formSchema, components: newComponents },
          selectedComponentId: component.id,
          propertyPanelOpen: true,
        };
      }),
    updateComponent: (componentId, updates) =>
      set((state) => ({
        formSchema: {
          ...state.formSchema,
          components: updateNode(state.formSchema.components, componentId, updates),
        },
      })),
    moveComponent: (componentId, targetParentId, targetIndex) =>
      set((state) => {
        const { removed, list } = removeNode(state.formSchema.components, componentId);
        if (!removed) return state;

        const insertInto = (nodes: ComponentNode[]): ComponentNode[] => {
          if (!targetParentId) {
            const newList = [...nodes];
            newList.splice(targetIndex, 0, removed);
            return newList;
          }
          return nodes.map((node) => {
            if (node.id === targetParentId) {
              const children = node.children ? [...node.children] : [];
              children.splice(targetIndex, 0, removed);
              return { ...node, children };
            }
            if (node.children) return { ...node, children: insertInto(node.children) };
            return node;
          });
        };

        return {
          formSchema: { ...state.formSchema, components: insertInto(list) },
        };
      }),
    selectComponent: (componentId) =>
      set(() => ({ selectedComponentId: componentId, propertyPanelOpen: !!componentId })),
    setDraggingId: (id) => set(() => ({ draggingId: id })),
    setHoverId: (id) => set(() => ({ hoverId: id })),
    reset: () => set(() => ({ formSchema: createDefaultSchema(), selectedComponentId: null, propertyPanelOpen: false })),
  },
}));

const addToChild = (
  node: ComponentNode,
  targetId: string,
  component: ComponentNode,
  index?: number
): ComponentNode | null => {
  if (!node.children) return null;
  const updatedChildren = node.children.map((child) => {
    if (child.id === targetId) {
      const children = child.children ? [...child.children] : [];
      const position = index ?? children.length;
      children.splice(position, 0, component);
      return { ...child, children };
    }
    const nested = addToChild(child, targetId, component, index);
    return nested ?? child;
  });
  return { ...node, children: updatedChildren };
};

const updateNode = (
  nodes: ComponentNode[],
  id: string,
  updates: Partial<ComponentProps>
): ComponentNode[] =>
  nodes.map((node) => {
    if (node.id === id) return { ...node, props: { ...node.props, ...updates } };
    if (node.children) return { ...node, children: updateNode(node.children, id, updates) };
    return node;
  });

export const createComponent = (type: ComponentType): ComponentNode => {
  const base: ComponentNode = {
    id: nanoid(),
    type,
    props: {},
    children: type === ComponentType.CONTAINER || type === ComponentType.ROW || type === ComponentType.COLUMN ? [] : undefined,
    parent: null,
  };

  switch (type) {
    case ComponentType.INPUT:
      base.props = { label: '输入框', placeholder: '请输入内容', required: false, style: { width: '100%' } };
      break;
    case ComponentType.SELECT:
      base.props = { label: '选择框', options: ['选项A', '选项B'], required: false };
      break;
    case ComponentType.BUTTON:
      base.props = { label: '按钮', style: { width: '100%', backgroundColor: '#0ea5e9', color: '#fff', padding: '10px 12px' } };
      break;
    case ComponentType.TEXT:
      base.props = { label: '文本', style: { color: '#1f2937' } };
      break;
    case ComponentType.IMAGE:
      base.props = { src: 'https://placehold.co/320x180', style: { width: '100%' } };
      break;
    default:
      base.props = { style: { padding: '12px' } };
      break;
  }
  return base;
};
