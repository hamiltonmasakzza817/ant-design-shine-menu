import type { CSSProperties, FC } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Typography, Tag } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import type { ConditionNodeData } from '../../lib/decision-tree';

const { Text } = Typography;

const cardStyle: CSSProperties = {
  padding: 12,
  borderRadius: 10,
  border: '1px solid #91caff',
  background: '#f0f5ff',
  minWidth: 200,
  boxShadow: '0 6px 16px -8px rgba(24, 144, 255, 0.4)',
};

const ConditionNode: FC<NodeProps<ConditionNodeData>> = ({ data, selected }) => (
  <div
    style={{
      ...cardStyle,
      borderColor: selected ? '#2f54eb' : cardStyle.border,
      boxShadow: selected
        ? '0 0 0 2px rgba(47, 84, 235, 0.25)'
        : cardStyle.boxShadow,
    }}
  >
    <Handle type="target" position={Position.Top} id="target" style={{ background: '#2f54eb' }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <QuestionCircleOutlined style={{ color: '#1d39c4' }} />
      <Text strong>{data.label}</Text>
    </div>
    <Tag color="processing" style={{ marginBottom: 6 }}>
      条件表达式
    </Tag>
    <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.6 }}>
      {data.condition}
    </Text>
    <Handle
      type="source"
      id="left"
      position={Position.Left}
      style={{ background: '#fa541c', width: 12, height: 12 }}
    />
    <Handle
      type="source"
      id="right"
      position={Position.Right}
      style={{ background: '#52c41a', width: 12, height: 12 }}
    />
  </div>
);

export default ConditionNode;

