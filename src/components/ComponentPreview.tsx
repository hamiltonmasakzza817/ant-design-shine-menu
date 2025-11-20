import { ComponentNode, ComponentType } from '../types';

const ComponentPreview = ({ node }: { node: ComponentNode }) => {
  switch (node.type) {
    case ComponentType.INPUT:
      return (
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">{node.props.label}</label>
          <input
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={node.props.placeholder}
            required={node.props.required}
            style={node.props.style}
            readOnly
          />
        </div>
      );
    case ComponentType.SELECT:
      return (
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">{node.props.label}</label>
          <select
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            style={node.props.style}
            disabled
          >
            {(node.props.options ?? []).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    case ComponentType.BUTTON:
      return (
        <button className="w-full rounded-md text-sm font-semibold" style={node.props.style} type="button">
          {node.props.label}
        </button>
      );
    case ComponentType.TEXT:
      return (
        <p className="text-sm" style={node.props.style}>
          {node.props.label ?? '文本内容'}
        </p>
      );
    case ComponentType.IMAGE:
      return (
        <div className="space-y-2">
          <p className="text-sm text-slate-700">图片</p>
          <img
            src={node.props.src || ''}
            alt={node.props.label || 'image'}
            className="w-full rounded-md object-cover"
            style={node.props.style}
          />
        </div>
      );
    default:
      return (
        <div className="space-y-1" style={node.props.style}>
          <p className="text-sm font-semibold text-slate-700">布局容器</p>
          <p className="text-xs text-slate-500">可以在内部放置其他组件</p>
        </div>
      );
  }
};

export default ComponentPreview;
