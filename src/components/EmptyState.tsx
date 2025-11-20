import { clsx } from 'clsx';

const EmptyState = ({ highlight }: { highlight?: boolean }) => (
  <div
    className={clsx(
      'flex h-[64vh] items-center justify-center rounded-lg border border-dashed border-border bg-white text-slate-400 text-sm',
      { 'border-accent/70 text-accent': highlight }
    )}
  >
    将组件拖放到这里开始设计
  </div>
);

export default EmptyState;
