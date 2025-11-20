import type { CSSProperties, DragEvent } from 'react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Typography,
  message,
} from 'antd';
import clsx from 'clsx';

import './FormDesigner.css';

const { Text } = Typography;

const layoutComponentTypes = new Set<FormComponentType>(['form', 'row', 'column']);

type DropFeedback = 'idle' | 'valid' | 'invalid';

type FormComponentType = 'form' | 'row' | 'column' | 'input' | 'select' | 'button' | 'image' | 'text';

type FormComponent = {
  id: string;
  type: FormComponentType;
  label: string;
  required?: boolean;
  placeholder?: string;
  buttonText?: string;
  textContent?: string;
  imageUrl?: string;
  style?: {
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
  children?: FormComponent[];
};

type DropZoneTarget = {
  parentId: string | null;
  parentType: FormComponentType | null;
  index: number;
};

type DragContext =
  | { source: 'palette'; componentType: FormComponentType }
  | { source: 'canvas'; componentId: string; componentType: FormComponentType };

type PropertyFormValues = {
  label?: string;
  required?: boolean;
  placeholder?: string;
  buttonText?: string;
  textContent?: string;
  imageUrl?: string;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
};

const paletteGroups = [
  {
    key: 'layout',
    title: '布局组件',
    description: '容器类组件可嵌套其它元素',
    items: [
      { type: 'form', label: '表单容器', description: '构建整个表单的根容器' },
      { type: 'row', label: '行容器', description: '横向排列表单列' },
      { type: 'column', label: '列容器', description: '用于放置具体控件' },
    ],
  },
  {
    key: 'controls',
    title: '表单控件',
    description: '可配置标签、必填、占位等属性',
    items: [
      { type: 'input', label: '输入框', description: '输入文本内容' },
      { type: 'select', label: '选择框', description: '单选下拉控件' },
      { type: 'button', label: '按钮', description: '触发提交或操作' },
      { type: 'image', label: '图片', description: '展示图片资源' },
      { type: 'text', label: '文本', description: '显示描述或提示' },
    ],
  },
];

const createComponentFromType = (type: FormComponentType): FormComponent => {
  const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const base: FormComponent = {
    id,
    type,
    label: '未命名组件',
    children: layoutComponentTypes.has(type) ? [] : undefined,
    style: { textAlign: 'left' },
  };

  switch (type) {
    case 'form':
      return { ...base, label: '表单容器', style: { padding: '20px', backgroundColor: '#ffffff' } };
    case 'row':
      return { ...base, label: '行容器', style: { padding: '12px', backgroundColor: '#f5f5f5' } };
    case 'column':
      return { ...base, label: '列容器', style: { padding: '12px', backgroundColor: '#ffffff' } };
    case 'input':
      return { ...base, label: '输入框', placeholder: '请输入内容', required: false };
    case 'select':
      return { ...base, label: '选择框', placeholder: '请选择', required: false };
    case 'button':
      return { ...base, label: '按钮', buttonText: '提交' };
    case 'image':
      return { ...base, label: '图片', imageUrl: 'https://picsum.photos/320/160' };
    case 'text':
      return { ...base, label: '文本', textContent: '这是文本描述' };
    default:
      return base;
  }
};

const findComponentById = (nodes: FormComponent[], id: string): FormComponent | null => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const child = findComponentById(node.children, id);
      if (child) {
        return child;
      }
    }
  }
  return null;
};

const removeComponent = (
  nodes: FormComponent[],
  id: string,
): { tree: FormComponent[]; removed: FormComponent | null } => {
  let removed: FormComponent | null = null;
  const nextTree = nodes
    .map((node) => {
      if (node.id === id) {
        removed = node;
        return null;
      }
      if (node.children) {
        const result = removeComponent(node.children, id);
        if (result.removed) {
          removed = result.removed;
          return { ...node, children: result.tree };
        }
        if (result.tree !== node.children) {
          return { ...node, children: result.tree };
        }
      }
      return node;
    })
    .filter(Boolean) as FormComponent[];

  return { tree: nextTree, removed };
};

const insertComponent = (
  nodes: FormComponent[],
  parentId: string | null,
  index: number,
  component: FormComponent,
): FormComponent[] => {
  if (!parentId) {
    const next = [...nodes];
    const safeIndex = Math.max(0, Math.min(index, next.length));
    next.splice(safeIndex, 0, component);
    return next;
  }

  return nodes.map((node) => {
    if (node.id === parentId) {
      const children = node.children ? [...node.children] : [];
      const safeIndex = Math.max(0, Math.min(index, children.length));
      children.splice(safeIndex, 0, component);
      return { ...node, children };
    }
    if (node.children) {
      const children = insertComponent(node.children, parentId, index, component);
      if (children !== node.children) {
        return { ...node, children };
      }
    }
    return node;
  });
};

const updateComponent = (
  nodes: FormComponent[],
  id: string,
  updater: (component: FormComponent) => FormComponent,
): FormComponent[] =>
  nodes.map((node) => {
    if (node.id === id) {
      return updater({ ...node });
    }
    if (node.children) {
      const children = updateComponent(node.children, id, updater);
      if (children !== node.children) {
        return { ...node, children };
      }
    }
    return node;
  });

const hasDescendant = (node: FormComponent, targetId: string): boolean => {
  if (!node.children) {
    return false;
  }
  return node.children.some((child) => child.id === targetId || hasDescendant(child, targetId));
};

const FormDesigner = () => {
  const [structure, setStructure] = useState<FormComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [dragContext, setDragContext] = useState<DragContext | null>(null);
  const [activeDrop, setActiveDrop] = useState<DropZoneTarget | null>(null);
  const [isCanvasDragOver, setIsCanvasDragOver] = useState(false);
  const [dropFeedback, setDropFeedback] = useState<DropFeedback>('idle');
  const [form] = Form.useForm<PropertyFormValues>();

  const selectedComponent = useMemo(
    () => (selectedId ? findComponentById(structure, selectedId) : null),
    [structure, selectedId],
  );

  useEffect(() => {
    if (!selectedComponent) {
      form.resetFields();
      return;
    }
    form.setFieldsValue({
      label: selectedComponent.label,
      required: selectedComponent.required,
      placeholder: selectedComponent.placeholder,
      buttonText: selectedComponent.buttonText,
      textContent: selectedComponent.textContent,
      imageUrl: selectedComponent.imageUrl,
      padding: selectedComponent.style?.padding,
      margin: selectedComponent.style?.margin,
      backgroundColor: selectedComponent.style?.backgroundColor,
      textAlign: selectedComponent.style?.textAlign ?? 'left',
    });
  }, [form, selectedComponent]);

  const clearDragState = () => {
    setDragContext(null);
    setActiveDrop(null);
    setIsCanvasDragOver(false);
    setDropFeedback('idle');
  };

  const handlePaletteDragStart = (componentType: FormComponentType) => (event: DragEvent<HTMLDivElement>) => {
    const payload: DragContext = { source: 'palette', componentType };
    event.dataTransfer.setData('application/form-component', JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'copy';
    setDragContext(payload);
    setDropFeedback('idle');
  };

  const handleComponentDragStart = (component: FormComponent) => (event: DragEvent<HTMLDivElement>) => {
    const payload: DragContext = { source: 'canvas', componentId: component.id, componentType: component.type };
    event.dataTransfer.setData('application/form-component', JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
    setDragContext(payload);
    setDropFeedback('idle');
  };

  const canDropOnTarget = (target: DropZoneTarget) => !target.parentType || layoutComponentTypes.has(target.parentType);

  const registerDragIntent = (event: DragEvent<HTMLDivElement>, target: DropZoneTarget) => {
    if (!dragContext) {
      return false;
    }
    const allowed = canDropOnTarget(target);
    if (!allowed) {
      event.dataTransfer.dropEffect = 'none';
      return false;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = dragContext.source === 'palette' ? 'copy' : 'move';
    setActiveDrop(target);
    setDropFeedback('valid');
    setIsCanvasDragOver(true);
    return true;
  };

  const handleDropZoneDrag = (target: DropZoneTarget) => (event: DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    registerDragIntent(event, target);
  };

  const handleDropZoneLeave = (target: DropZoneTarget) => () => {
    if (
      activeDrop &&
      activeDrop.parentId === target.parentId &&
      activeDrop.parentType === target.parentType &&
      activeDrop.index === target.index
    ) {
      setActiveDrop(null);
      setDropFeedback(isCanvasDragOver ? 'invalid' : 'idle');
    }
  };

  const handleDrop = (target: DropZoneTarget) => (event: DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const allowed = registerDragIntent(event, target);
    if (!allowed || !dragContext) {
      return;
    }

    setStructure((current) => {
      if (dragContext.source === 'palette') {
        const newComponent = createComponentFromType(dragContext.componentType);
        return insertComponent(current, target.parentId, target.index, newComponent);
      }

      const movingComponent = findComponentById(current, dragContext.componentId);
      if (!movingComponent) {
        return current;
      }

      if (target.parentId && (target.parentId === movingComponent.id || hasDescendant(movingComponent, target.parentId))) {
        message.warning('无法将组件放置到自身或其子级中');
        return current;
      }

      const { tree, removed } = removeComponent(current, dragContext.componentId);
      if (!removed) {
        return current;
      }
      return insertComponent(tree, target.parentId, target.index, removed);
    });

    clearDragState();
  };

  const handleCanvasDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (!dragContext) {
      return;
    }
    event.preventDefault();
    setIsCanvasDragOver(true);
    if (!activeDrop) {
      event.dataTransfer.dropEffect = 'none';
      setDropFeedback('invalid');
    }
  };

  const handleCanvasDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!dragContext) {
      return;
    }
    event.preventDefault();
    setIsCanvasDragOver(true);
    if (!activeDrop) {
      event.dataTransfer.dropEffect = 'none';
      setDropFeedback('invalid');
    }
  };

  const handleCanvasDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget as Node | null;
    if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
      return;
    }
    setIsCanvasDragOver(false);
    if (!activeDrop) {
      setDropFeedback('idle');
    }
  };

  const handleCanvasDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!dragContext) {
      return;
    }
    event.preventDefault();
    clearDragState();
  };

  const renderDropZone = (target: DropZoneTarget, label = '松开放置组件') => {
    if (target.parentType && !layoutComponentTypes.has(target.parentType)) {
      return null;
    }
    const isActive =
      activeDrop &&
      activeDrop.parentId === target.parentId &&
      activeDrop.parentType === target.parentType &&
      activeDrop.index === target.index;

    return (
      <div
        key={`${target.parentId ?? 'root'}-${target.parentType ?? 'root'}-${target.index}`}
        className={clsx('designer-drop-zone', { 'designer-drop-zone--active': isActive })}
        onDragOver={handleDropZoneDrag(target)}
        onDragEnter={handleDropZoneDrag(target)}
        onDragLeave={handleDropZoneLeave(target)}
        onDrop={handleDrop(target)}
      >
        {label}
      </div>
    );
  };

  const renderControlPreview = (component: FormComponent) => {
    const baseStyle = component.style ?? {};
    const style: CSSProperties = {
      textAlign: baseStyle.textAlign,
      padding: baseStyle.padding,
      margin: baseStyle.margin,
      background: baseStyle.backgroundColor,
    };

    switch (component.type) {
      case 'input':
      case 'select':
        return (
          <div style={style}>
            <div className="designer-component__preview-label">
              {component.label}
              {component.required ? <Text type="danger"> *</Text> : null}
            </div>
            <div className="designer-component__preview-control">
              {component.placeholder || '请输入内容'}
            </div>
          </div>
        );
      case 'button':
        return (
          <div style={style}>
            <button className="designer-component__preview-button" type="button">
              {component.buttonText || component.label}
            </button>
          </div>
        );
      case 'image':
        return (
          <div style={style}>
            <img
              src={component.imageUrl}
              alt={component.label}
              style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
            />
          </div>
        );
      case 'text':
        return (
          <div style={style}>
            <div className="designer-component__preview-label">{component.label}</div>
            <div className="designer-component__preview-text">{component.textContent}</div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderComponent = (component: FormComponent) => {
    const isSelected = component.id === selectedId;
    const isDraggingComponent = dragContext?.source === 'canvas' && dragContext.componentId === component.id;
    const containerClass = clsx('designer-component', {
      'designer-component--selected': isSelected,
      'designer-component--dragging': isDraggingComponent,
    });

    const headerHint = layoutComponentTypes.has(component.type)
      ? '可在内部继续拖放组件'
      : '拖拽以调整顺序';

    const layoutStyle = component.style ?? {};

    return (
      <div
        key={component.id}
        className={containerClass}
        draggable
        onDragStart={handleComponentDragStart(component)}
        onDragEnd={clearDragState}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedId(component.id);
        }}
      >
        <div className="designer-component__header">
          <span>{component.label}</span>
          <span className="designer-component__hint">{headerHint}</span>
        </div>
        {layoutComponentTypes.has(component.type) ? (
          <div
            className={clsx('designer-component__body', {
              'designer-component__body--row': component.type === 'row',
              'designer-component__body--column': component.type === 'column',
            })}
            style={layoutStyle}
          >
            {component.children && component.children.length > 0 ? null : (
              <div className="form-designer__empty">
                <Text type="secondary">拖拽组件到此区域</Text>
              </div>
            )}
            {component.children?.map((child, index) => (
              <Fragment key={child.id}>
                {renderDropZone({ parentId: component.id, parentType: component.type, index })}
                {renderComponent(child)}
              </Fragment>
            ))}
            {renderDropZone({ parentId: component.id, parentType: component.type, index: component.children?.length ?? 0 })}
          </div>
        ) : (
          renderControlPreview(component)
        )}
      </div>
    );
  };

  const renderCanvasContent = () => {
    if (structure.length === 0) {
      return (
        <div className="form-designer__empty">
          <Empty description="拖拽组件到画布开始设计" />
          {renderDropZone({ parentId: null, parentType: null, index: 0 }, '将组件拖拽到这里')}
        </div>
      );
    }

    return (
      <>
        {structure.map((component, index) => (
          <Fragment key={component.id}>
            {renderDropZone({ parentId: null, parentType: null, index })}
            {renderComponent(component)}
          </Fragment>
        ))}
        {renderDropZone({ parentId: null, parentType: null, index: structure.length })}
      </>
    );
  };

  const handlePropertyChange = (_: unknown, allValues: PropertyFormValues) => {
    if (!selectedId) {
      return;
    }
    setStructure((current) =>
      updateComponent(current, selectedId, (component) => ({
        ...component,
        label: allValues.label ?? component.label,
        required: allValues.required,
        placeholder: allValues.placeholder,
        buttonText: allValues.buttonText,
        textContent: allValues.textContent,
        imageUrl: allValues.imageUrl,
        style: {
          ...component.style,
          padding: allValues.padding,
          margin: allValues.margin,
          backgroundColor: allValues.backgroundColor,
          textAlign: allValues.textAlign ?? component.style?.textAlign ?? 'left',
        },
      })),
    );
  };

  const handlePropertySave = () => {
    message.success('属性已更新');
  };

  const isInvalidCanvasState = Boolean(dragContext) && dropFeedback === 'invalid' && isCanvasDragOver;
  const canvasClass = clsx('form-designer__canvas', {
    'form-designer__canvas--dragging': Boolean(dragContext),
    'form-designer__canvas--invalid': isInvalidCanvasState,
  });

  const shouldShowValidHint = Boolean(dragContext) && dropFeedback === 'valid';
  const shouldShowInvalidHint = Boolean(dragContext) && dropFeedback === 'invalid' && isCanvasDragOver;

  return (
    <div className="form-designer">
      <div className="form-designer__toolbar">
        <Space>
          <Button type="primary" onClick={() => setPaletteOpen(true)}>
            打开组件面板
          </Button>
          <Button onClick={() => setStructure([])}>清空画布</Button>
        </Space>
        <Text type="secondary">拖拽组件即可完成表单搭建</Text>
      </div>

      <div
        className={canvasClass}
        onClick={() => setSelectedId(null)}
        onDragEnter={handleCanvasDragEnter}
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
        onDrop={handleCanvasDrop}
      >
        {(shouldShowValidHint || shouldShowInvalidHint) && (
          <div
            className={clsx('form-designer__canvas-hint', {
              'form-designer__canvas-hint--valid': shouldShowValidHint,
              'form-designer__canvas-hint--invalid': shouldShowInvalidHint,
            })}
          >
            {shouldShowValidHint ? '松开放置到高亮区域' : '此区域无法放置组件'}
          </div>
        )}
        {renderCanvasContent()}
      </div>

      <Drawer
        title="组件选择"
        placement="right"
        width={320}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        mask={false}
      >
        {paletteGroups.map((group) => (
          <div key={group.key} style={{ marginBottom: 24 }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Text strong>{group.title}</Text>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>{group.description}</div>
              </div>
              {group.items.map((item) => (
                <div
                  key={item.type}
                  className="palette-item"
                  draggable
                  onDragStart={handlePaletteDragStart(item.type as FormComponentType)}
                  onDragEnd={clearDragState}
                >
                  <div className="palette-item__title">{item.label}</div>
                  <div className="palette-item__desc">{item.description}</div>
                </div>
              ))}
            </Space>
            <Divider style={{ margin: '16px 0 0' }} />
          </div>
        ))}
      </Drawer>

      <Drawer
        title={selectedComponent ? `属性设置 - ${selectedComponent.label}` : '属性设置'}
        placement="right"
        width={360}
        open={Boolean(selectedComponent)}
        onClose={() => setSelectedId(null)}
        destroyOnClose={false}
        mask={false}
      >
        {selectedComponent ? (
          <Form layout="vertical" form={form} onValuesChange={handlePropertyChange} onFinish={handlePropertySave}>
            <div className="properties-form__group">
              <div className="properties-form__section-title">基础属性</div>
              <Form.Item label="标签" name="label">
                <Input placeholder="请输入标签文案" />
              </Form.Item>
              {['input', 'select'].includes(selectedComponent.type) ? (
                <>
                  <Form.Item label="占位提示" name="placeholder">
                    <Input placeholder="请输入提示语" />
                  </Form.Item>
                  <Form.Item label="是否必填" name="required" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </>
              ) : null}
              {selectedComponent.type === 'button' ? (
                <Form.Item label="按钮文字" name="buttonText">
                  <Input placeholder="例如：提交" />
                </Form.Item>
              ) : null}
              {selectedComponent.type === 'text' ? (
                <Form.Item label="文本内容" name="textContent">
                  <Input.TextArea rows={3} placeholder="请输入展示文本" />
                </Form.Item>
              ) : null}
              {selectedComponent.type === 'image' ? (
                <Form.Item label="图片 URL" name="imageUrl">
                  <Input placeholder="https://" />
                </Form.Item>
              ) : null}
            </div>

            <div className="properties-form__group">
              <div className="properties-form__section-title">样式设置</div>
              <Form.Item label="内边距" name="padding">
                <Input placeholder="例如：16px" />
              </Form.Item>
              <Form.Item label="外边距" name="margin">
                <Input placeholder="例如：12px 0" />
              </Form.Item>
              <Form.Item label="背景颜色" name="backgroundColor">
                <Input placeholder="#ffffff" />
              </Form.Item>
              <Form.Item label="文本对齐" name="textAlign">
                <Select>
                  <Select.Option value="left">居左</Select.Option>
                  <Select.Option value="center">居中</Select.Option>
                  <Select.Option value="right">居右</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <Button type="primary" htmlType="submit" block>
              保存属性
            </Button>
          </Form>
        ) : (
          <Empty description="点击画布中的组件以配置属性" />
        )}
      </Drawer>
    </div>
  );
};

export default FormDesigner;
