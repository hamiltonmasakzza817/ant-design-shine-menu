import type { CSSProperties } from 'react';

export enum ComponentType {
  CONTAINER = 'container',
  ROW = 'row',
  COLUMN = 'column',
  INPUT = 'input',
  SELECT = 'select',
  BUTTON = 'button',
  TEXT = 'text',
  IMAGE = 'image',
}

export interface ComponentProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  src?: string;
  style?: CSSProperties;
}

export interface ComponentNode {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  children?: ComponentNode[];
  parent?: string | null;
}

export interface FormSchema {
  id: string;
  name: string;
  components: ComponentNode[];
}

export type DragOrigin = 'panel' | 'canvas';

export interface DragMeta {
  origin: DragOrigin;
  type: ComponentType;
  id?: string;
}
