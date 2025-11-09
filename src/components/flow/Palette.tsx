import type { DragEvent, FC } from 'react';
import { Card, Typography } from 'antd';

import type { PaletteItem } from '../../lib/decision-tree';

const { Text } = Typography;

interface PaletteProps {
  items: PaletteItem[];
  onDragStart: (event: DragEvent<HTMLDivElement>, item: PaletteItem) => void;
}

const Palette: FC<PaletteProps> = ({ items, onDragStart }) => (
  <div>
    <Text strong style={{ display: 'block', marginBottom: 12 }}>
      组件拖拽面板
    </Text>
    <div style={{ display: 'grid', gap: 12 }}>
      {items.map((item) => (
        <Card
          key={item.id}
          size="small"
          draggable
          onDragStart={(event) => onDragStart(event, item)}
          style={{ cursor: 'grab', borderStyle: 'dashed' }}
        >
          <Text strong>{item.label}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {item.description}
          </Text>
        </Card>
      ))}
    </div>
  </div>
);

export default Palette;

