import type { Edge, Node } from 'reactflow';
import { MarkerType } from 'reactflow';

export type ComponentType =
  | 'message'
  | 'form'
  | 'api'
  | 'approval'
  | 'delay';

export type TreeNodeKind = 'condition' | 'component';

export interface ConditionNodeData {
  nodeType: 'condition';
  label: string;
  condition: string;
  left?: string;
  right?: string;
}

export interface ComponentNodeData {
  nodeType: 'component';
  label: string;
  componentType: ComponentType;
  description?: string;
}

export type TreeNodeData = ConditionNodeData | ComponentNodeData;

export interface PaletteItem {
  id: string;
  nodeType: TreeNodeKind;
  label: string;
  description: string;
  componentType?: ComponentType;
}

export const componentTypeMeta: Record<
  ComponentType,
  { label: string; description: string; accent: string }
> = {
  message: {
    label: '消息提醒',
    description: '向用户发送消息、提示或通知内容。',
    accent: '#1677ff',
  },
  form: {
    label: '表单收集',
    description: '展示数据采集表单并等待用户提交。',
    accent: '#fa8c16',
  },
  api: {
    label: 'API 请求',
    description: '调用外部 API 同步或异步获取数据。',
    accent: '#13c2c2',
  },
  approval: {
    label: '审批节点',
    description: '提交审批任务并等待负责人处理。',
    accent: '#722ed1',
  },
  delay: {
    label: '延时节点',
    description: '等待一段时间后再继续执行流程。',
    accent: '#52c41a',
  },
};

export const paletteItems: PaletteItem[] = [
  {
    id: 'condition',
    nodeType: 'condition',
    label: '条件判断',
    description: '根据条件表达式分支到左右子树。',
  },
  {
    id: 'component-message',
    nodeType: 'component',
    componentType: 'message',
    label: componentTypeMeta.message.label,
    description: componentTypeMeta.message.description,
  },
  {
    id: 'component-form',
    nodeType: 'component',
    componentType: 'form',
    label: componentTypeMeta.form.label,
    description: componentTypeMeta.form.description,
  },
  {
    id: 'component-api',
    nodeType: 'component',
    componentType: 'api',
    label: componentTypeMeta.api.label,
    description: componentTypeMeta.api.description,
  },
  {
    id: 'component-approval',
    nodeType: 'component',
    componentType: 'approval',
    label: componentTypeMeta.approval.label,
    description: componentTypeMeta.approval.description,
  },
  {
    id: 'component-delay',
    nodeType: 'component',
    componentType: 'delay',
    label: componentTypeMeta.delay.label,
    description: componentTypeMeta.delay.description,
  },
];

export const initialNodes: Node<TreeNodeData>[] = [
  {
    id: 'root-condition',
    type: 'condition',
    position: { x: 0, y: 0 },
    data: {
      nodeType: 'condition',
      label: '用户是否已登录？',
      condition: 'context.user !== null',
      left: 'guest-message',
      right: 'task-check',
    },
  },
  {
    id: 'guest-message',
    type: 'component',
    position: { x: -220, y: 160 },
    data: {
      nodeType: 'component',
      label: componentTypeMeta.message.label,
      componentType: 'message',
      description: '展示登录邀请并提示快速注册。',
    },
  },
  {
    id: 'task-check',
    type: 'condition',
    position: { x: 220, y: 160 },
    data: {
      nodeType: 'condition',
      label: '是否存在待办任务？',
      condition: 'context.todos.length > 0',
      left: 'empty-state',
      right: 'task-reminder',
    },
  },
  {
    id: 'empty-state',
    type: 'component',
    position: { x: 60, y: 320 },
    data: {
      nodeType: 'component',
      label: componentTypeMeta.form.label,
      componentType: 'form',
      description: '展示任务创建表单引导用户添加事项。',
    },
  },
  {
    id: 'task-reminder',
    type: 'component',
    position: { x: 380, y: 320 },
    data: {
      nodeType: 'component',
      label: componentTypeMeta.api.label,
      componentType: 'api',
      description: '触发提醒服务并展示待办列表。',
    },
  },
];

export const initialEdges: Edge[] = [
  {
    id: 'edge-root-left',
    source: 'root-condition',
    target: 'guest-message',
    sourceHandle: 'left',
    targetHandle: 'target',
    label: '否',
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'edge-root-right',
    source: 'root-condition',
    target: 'task-check',
    sourceHandle: 'right',
    targetHandle: 'target',
    label: '是',
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'edge-task-left',
    source: 'task-check',
    target: 'empty-state',
    sourceHandle: 'left',
    targetHandle: 'target',
    label: '否',
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'edge-task-right',
    source: 'task-check',
    target: 'task-reminder',
    sourceHandle: 'right',
    targetHandle: 'target',
    label: '是',
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
];

export const isConditionNode = (data: TreeNodeData): data is ConditionNodeData =>
  data.nodeType === 'condition';

