import DraggablePaletteItem from './DraggablePaletteItem';
import { ComponentType } from '../types';

const ComponentPanel = () => (
  <aside className="w-72 shrink-0">
    <div className="sticky top-20 space-y-4">
      <div className="p-4 bg-white border border-border rounded-xl shadow-sm">
        <p className="panel-title">Layout 布局</p>
        <div className="space-y-2">
          <DraggablePaletteItem label="容器" description="用于包裹组件" type={ComponentType.CONTAINER} />
          <DraggablePaletteItem label="行" description="行布局" type={ComponentType.ROW} />
          <DraggablePaletteItem label="列" description="列布局" type={ComponentType.COLUMN} />
        </div>
      </div>
      <div className="p-4 bg-white border border-border rounded-xl shadow-sm">
        <p className="panel-title">Form Control 表单控件</p>
        <div className="space-y-2">
          <DraggablePaletteItem label="输入框" description="文本输入" type={ComponentType.INPUT} />
          <DraggablePaletteItem label="选择框" description="下拉选择" type={ComponentType.SELECT} />
          <DraggablePaletteItem label="按钮" description="提交/操作" type={ComponentType.BUTTON} />
        </div>
      </div>
      <div className="p-4 bg-white border border-border rounded-xl shadow-sm">
        <p className="panel-title">展示组件</p>
        <div className="space-y-2">
          <DraggablePaletteItem label="文本" description="说明文案" type={ComponentType.TEXT} />
          <DraggablePaletteItem label="图片" description="展示图片" type={ComponentType.IMAGE} />
        </div>
      </div>
    </div>
  </aside>
);

export default ComponentPanel;
