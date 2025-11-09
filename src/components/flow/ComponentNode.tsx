import type { CSSProperties, FC, ReactNode } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Typography, Tag } from 'antd';
import {
  MessageOutlined,
  FormOutlined,
  ApiOutlined,
  AuditOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';

import type { ComponentNodeData } from '../../lib/decision-tree';
import { componentTypeMeta } from '../../lib/decision-tree';

const { Text } = Typography;

const wrapperStyle: CSSProperties = {
  padding: 12,
  borderRadius: 10,
  border: '1px solid rgba(5, 5, 5, 0.08)',
  background: '#fff',
  minWidth: 220,
  boxShadow: '0 6px 16px -8px rgba(0, 0, 0, 0.2)',
};

const iconMap: Record<ComponentNodeData['componentType'], ReactNode> = {
  message: <MessageOutlined />,
  form: <FormOutlined />,
  api: <ApiOutlined />,
  approval: <AuditOutlined />,
  delay: <FieldTimeOutlined />,
};

const ComponentNode: FC<NodeProps<ComponentNodeData>> = ({ data, selected }) => {
  const meta = componentTypeMeta[data.componentType];
  return (
    <div
      style={{
        ...wrapperStyle,
        borderColor: selected ? meta.accent : wrapperStyle.border,
        boxShadow: selected
          ? `0 0 0 2px ${meta.accent}22`
          : wrapperStyle.boxShadow,
      }}
    >
      <Handle type="target" id="target" position={Position.Top} style={{ background: meta.accent }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Tag color={meta.accent} style={{ borderRadius: 16 }}>
          {iconMap[data.componentType]}
        </Tag>
        <Text strong>{data.label}</Text>
      </div>
      {data.description ? (
        <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.6 }}>
          {data.description}
        </Text>
      ) : null}
      <Handle
        type="source"
        id="next"
        position={Position.Bottom}
        style={{ background: meta.accent, width: 12, height: 12 }}
      />
    </div>
  );
};

export default ComponentNode;

