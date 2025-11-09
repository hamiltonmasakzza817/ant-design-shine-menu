import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Space,
  Typography,
  message,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import ConditionNode from '../components/flow/ConditionNode';
import ComponentNode from '../components/flow/ComponentNode';
import Palette from '../components/flow/Palette';
import {
  componentTypeMeta,
  initialEdges,
  initialNodes,
  isConditionNode,
  paletteItems,
  type ComponentNodeData,
  type PaletteItem,
  type TreeNodeData,
} from '../lib/decision-tree';

const { Text } = Typography;
const { Option } = Select;

const nodeTypes = {
  condition: ConditionNode,
  component: ComponentNode,
};

const DecisionBuilder = () => {
  const [nodes, setNodes] = useState<Node<TreeNodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const flowWrapper = useRef<HTMLDivElement | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [form] = Form.useForm();

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  useEffect(() => {
    if (!selectedNode) {
      return;
    }
    form.setFieldsValue({
      label: selectedNode.data.label,
      condition: isConditionNode(selectedNode.data) ? selectedNode.data.condition : undefined,
      componentType: !isConditionNode(selectedNode.data) ? selectedNode.data.componentType : undefined,
      description: !isConditionNode(selectedNode.data) ? selectedNode.data.description : undefined,
    });
  }, [form, selectedNode]);

  const handleDragStart = useCallback((event: DragEvent<HTMLDivElement>, item: PaletteItem) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!reactFlowInstance || !flowWrapper.current) {
        return;
      }

      const payload = event.dataTransfer.getData('application/reactflow');
      if (!payload) {
        return;
      }

      const item: PaletteItem = JSON.parse(payload);
      const bounds = flowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const id = `node_${Date.now()}`;
      const baseNode = {
        id,
        position,
        data: {} as TreeNodeData,
      } as Node<TreeNodeData>;

      if (item.nodeType === 'condition') {
        baseNode.type = 'condition';
        baseNode.data = {
          nodeType: 'condition',
          label: '新的条件判断',
          condition: 'context.flag === true',
        };
      } else if (item.nodeType === 'component' && item.componentType) {
        const meta = componentTypeMeta[item.componentType];
        baseNode.type = 'component';
        baseNode.data = {
          nodeType: 'component',
          label: meta.label,
          componentType: item.componentType,
          description: meta.description,
        } as ComponentNodeData;
      } else {
        return;
      }

      setNodes((current) => current.concat(baseNode));
    },
    [reactFlowInstance, setNodes],
  );

  const handleNodeChanges = useCallback(
    (changes: NodeChange<TreeNodeData>[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes],
  );

  const handleEdgeChanges = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      setEdges((eds) => {
        const nextEdges = applyEdgeChanges(changes, eds);
        const removed = changes.filter((change) => change.type === 'remove');
        if (removed.length) {
          setNodes((nds) =>
            nds.map((node) => {
              if (!isConditionNode(node.data)) {
                return node;
              }
              const data = { ...node.data };
              let dirty = false;
              removed.forEach((change) => {
                const edge = eds.find((itemEdge) => itemEdge.id === change.id);
                if (!edge || edge.source !== node.id) {
                  return;
                }
                if (edge.sourceHandle === 'left' && data.left === edge.target) {
                  data.left = undefined;
                  dirty = true;
                }
                if (edge.sourceHandle === 'right' && data.right === edge.target) {
                  data.right = undefined;
                  dirty = true;
                }
              });
              return dirty ? { ...node, data } : node;
            }),
          );
        }
        return nextEdges;
      });
    },
    [setEdges, setNodes],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return;
      }

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds,
        ),
      );

      if (connection.sourceHandle) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id !== connection.source || !isConditionNode(node.data)) {
              return node;
            }
            if (connection.sourceHandle === 'left') {
              return { ...node, data: { ...node.data, left: connection.target ?? undefined } };
            }
            if (connection.sourceHandle === 'right') {
              return { ...node, data: { ...node.data, right: connection.target ?? undefined } };
            }
            return node;
          }),
        );
      }
    },
    [setEdges, setNodes],
  );

  const handleNodeSelect = useCallback((node: Node<TreeNodeData>) => {
    setSelectedNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(
    (values: Partial<ComponentNodeData & { condition: string }>) => {
      if (!selectedNodeId) {
        return;
      }

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== selectedNodeId) {
            return node;
          }

          if (isConditionNode(node.data)) {
            return {
              ...node,
              data: {
                ...node.data,
                label: values.label ?? node.data.label,
                condition: values.condition ?? node.data.condition,
              },
            };
          }

          const componentValues: Partial<ComponentNodeData> = {};
          if (values.componentType && values.componentType !== node.data.componentType) {
            const meta = componentTypeMeta[values.componentType];
            componentValues.componentType = values.componentType;
            componentValues.label = values.label && values.label.trim().length > 0 ? values.label : meta.label;
            componentValues.description =
              values.description && values.description.trim().length > 0
                ? values.description
                : meta.description;
          } else {
            componentValues.label = values.label ?? node.data.label;
            componentValues.description = values.description ?? node.data.description;
          }
          return {
            ...node,
            data: {
              ...node.data,
              ...componentValues,
            },
          };
        }),
      );
      message.success('节点信息已更新');
    },
    [selectedNodeId, setNodes],
  );

  const handleDelete = useCallback(() => {
    if (!selectedNodeId) {
      return;
    }

    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
    setNodes((nds) =>
      nds
        .filter((node) => node.id !== selectedNodeId)
        .map((node) => {
          if (!isConditionNode(node.data)) {
            return node;
          }
          const data = { ...node.data };
          if (data.left === selectedNodeId) {
            data.left = undefined;
          }
          if (data.right === selectedNodeId) {
            data.right = undefined;
          }
          return { ...node, data };
        }),
    );
    setSelectedNodeId(null);
    form.resetFields();
    message.success('节点已删除');
  }, [form, selectedNodeId, setEdges, setNodes]);

  return (
    <Row gutter={16}>
      <Col span={17}>
        <Card
          title="流程编排画布"
          bodyStyle={{ padding: 0, height: 540 }}
        >
          <div
            ref={flowWrapper}
            style={{ width: '100%', height: '100%' }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={(changes) => {
                handleNodeChanges(changes);
            }}
              onEdgesChange={handleEdgeChanges}
              onConnect={handleConnect}
              onInit={setReactFlowInstance}
              fitView
              onNodeClick={(_, node) => handleNodeSelect(node)}
              onPaneClick={handlePaneClick}
            >
              <Background gap={16} color="#f0f0f0" />
              <Controls position="top-right" />
            </ReactFlow>
          </div>
        </Card>
      </Col>
      <Col span={7}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Palette items={paletteItems} onDragStart={handleDragStart} />
          </Card>
          <Card title="节点详情" size="small">
            {selectedNode ? (
              <Form
                layout="vertical"
                form={form}
                onFinish={handleSubmit}
                initialValues={{
                  label: selectedNode.data.label,
                  condition: isConditionNode(selectedNode.data)
                    ? selectedNode.data.condition
                    : undefined,
                  componentType: !isConditionNode(selectedNode.data)
                    ? selectedNode.data.componentType
                    : undefined,
                  description: !isConditionNode(selectedNode.data)
                    ? selectedNode.data.description
                    : undefined,
                }}
              >
                <Form.Item label="节点标题" name="label" rules={[{ required: true, message: '请输入节点标题' }]}>
                  <Input placeholder="请输入节点标题" />
                </Form.Item>
                {isConditionNode(selectedNode.data) ? (
                  <Form.Item
                    label="条件表达式"
                    name="condition"
                    rules={[{ required: true, message: '请输入条件表达式' }]}
                  >
                    <Input placeholder="例如：context.score > 60" />
                  </Form.Item>
                ) : (
                  <>
                    <Form.Item label="组件类型" name="componentType">
                      <Select>
                        {Object.entries(componentTypeMeta).map(([key, meta]) => (
                          <Option key={key} value={key}>
                            {meta.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item label="展示描述" name="description">
                      <Input.TextArea rows={3} placeholder="描述节点的业务含义" />
                    </Form.Item>
                  </>
                )}
                <Space>
                  <Button type="primary" htmlType="submit">
                    保存
                  </Button>
                  <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                    删除节点
                  </Button>
                </Space>
              </Form>
            ) : (
              <Empty description="点击画布节点后进行编辑" />
            )}
            <Divider />
            <Text type="secondary" style={{ fontSize: 12, display: 'block', lineHeight: 1.8 }}>
              1. 从左侧拖入条件或组件节点。
              <br />
              2. 通过拖拽节点之间的连接点构建二叉结构。
              <br />
              3. 点击节点后可在此处编辑标题、条件或组件配置。
            </Text>
          </Card>
        </Space>
      </Col>
    </Row>
  );
};

export default DecisionBuilder;

