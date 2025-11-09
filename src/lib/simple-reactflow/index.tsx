import type { CSSProperties, FC, MutableRefObject, ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import './dist/style.css';

export enum Position {
  Left = 'left',
  Right = 'right',
  Top = 'top',
  Bottom = 'bottom',
}

export enum MarkerType {
  ArrowClosed = 'arrowclosed',
}

export interface XYPosition {
  x: number;
  y: number;
}

export interface Node<T = unknown> {
  id: string;
  type?: string;
  position: XYPosition;
  data: T;
}

export interface NodeProps<T> {
  id: string;
  data: T;
  selected: boolean;
  type?: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  label?: string;
  markerEnd?: { type: MarkerType };
}

export interface Connection {
  source?: string;
  sourceHandle?: string;
  target?: string;
  targetHandle?: string;
}

export type NodeChange<T> = {
  type: 'position';
  id: string;
  position: XYPosition;
};

export type EdgeChange<T = Edge> = {
  type: 'remove';
  id: string;
};

export interface ReactFlowInstance {
  project: (point: XYPosition) => XYPosition;
  getNodes: () => Node[];
  getEdges: () => Edge[];
}

interface HandleRegistration {
  nodeId: string;
  handleId: string;
  type: 'source' | 'target';
  position: Position;
  element: HTMLElement;
}

interface RegisteredHandle extends HandleRegistration {
  key: string;
}

interface FlowContextValue {
  registerHandle: (handle: HandleRegistration) => string;
  unregisterHandle: (key: string) => void;
  updateHandlePosition: (key: string) => void;
  startConnection: (nodeId: string, handleId: string, handleType: 'source' | 'target') => void;
  completeConnection: (nodeId: string, handleId: string, handleType: 'source' | 'target') => void;
  connectingFrom: { nodeId: string; handleId: string } | null;
}

const FlowContext = createContext<FlowContextValue | null>(null);
const NodeIdContext = createContext<string | null>(null);

export interface ReactFlowProps<T = unknown> {
  nodes: Node<T>[];
  edges: Edge[];
  nodeTypes?: Record<string, FC<NodeProps<unknown>>>;
  onNodesChange?: (changes: NodeChange<T>[]) => void;
  onEdgesChange?: (changes: EdgeChange[]) => void;
  onConnect?: (connection: Connection) => void;
  onNodeClick?: (event: MouseEvent, node: Node<T>) => void;
  onPaneClick?: () => void;
  onInit?: (instance: ReactFlowInstance) => void;
  fitView?: boolean;
  children?: ReactNode;
}

interface InternalHandlePosition {
  x: number;
  y: number;
}

const getHandleKey = (nodeId: string, handleId: string, type: 'source' | 'target') =>
  `${nodeId}:${handleId}:${type}`;

const useLatest = <T,>(value: T): MutableRefObject<T> => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
};

export const addEdge = (connection: Connection, edges: Edge[]): Edge[] => {
  if (!connection.source || !connection.target) {
    return edges;
  }
  const id = `${connection.source}-${connection.target}-${connection.sourceHandle ?? 'handle'}`;
  const edge: Edge = {
    id,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    markerEnd: { type: MarkerType.ArrowClosed },
  };
  return edges.concat(edge);
};

export const applyNodeChanges = <T,>(changes: NodeChange<T>[], nodes: Node<T>[]): Node<T>[] =>
  nodes.map((node) => {
    const change = changes.find((item) => item.id === node.id);
    if (!change) {
      return node;
    }
    if (change.type === 'position') {
      return { ...node, position: change.position };
    }
    return node;
  });

export const applyEdgeChanges = (changes: EdgeChange[], edges: Edge[]): Edge[] =>
  edges.filter((edge) => !changes.some((change) => change.id === edge.id));

const ReactFlowInner = <T,>({
  nodes,
  edges,
  nodeTypes,
  onNodesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onInit,
  children,
}: ReactFlowProps<T>) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [handlePositions, setHandlePositions] = useState<Record<string, InternalHandlePosition>>({});
  const handlesRef = useRef<Record<string, RegisteredHandle>>({});
  const nodesRef = useLatest(nodes);
  const edgesRef = useLatest(edges);
  const [connectionPreview, setConnectionPreview] = useState<{ from: InternalHandlePosition; to: InternalHandlePosition } | null>(null);
  const connectingFromRef = useRef<{ nodeId: string; handleId: string } | null>(null);
  const dragState = useRef<{ nodeId: string; offsetX: number; offsetY: number } | null>(null);
  const nodeRects = useRef<Record<string, { x: number; y: number; width: number; height: number }>>({});

  const updateHandlePosition = useCallback(
    (key: string) => {
      const handle = handlesRef.current[key];
      if (!handle || !wrapperRef.current) {
        return;
      }
      const rect = handle.element.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const position = {
        x: rect.left - wrapperRect.left + rect.width / 2,
        y: rect.top - wrapperRect.top + rect.height / 2,
      };
      setHandlePositions((prev) => ({ ...prev, [key]: position }));
    },
    [],
  );

  const registerHandle = useCallback(
    (handle: HandleRegistration) => {
      const key = getHandleKey(handle.nodeId, handle.handleId, handle.type);
      handlesRef.current[key] = { ...handle, key };
      updateHandlePosition(key);
      return key;
    },
    [updateHandlePosition],
  );

  const unregisterHandle = useCallback((key: string) => {
    delete handlesRef.current[key];
    setHandlePositions((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const startConnection = useCallback(
    (nodeId: string, handleId: string, handleType: 'source' | 'target') => {
      if (handleType !== 'source') {
        return;
      }
      const key = getHandleKey(nodeId, handleId, 'source');
      const position = handlePositions[key];
      if (!position) {
        return;
      }
      connectingFromRef.current = { nodeId, handleId };
      setConnectionPreview({ from: position, to: position });
    },
    [handlePositions],
  );

  const completeConnection = useCallback(
    (nodeId: string, handleId: string, handleType: 'source' | 'target') => {
      const connectingFrom = connectingFromRef.current;
      if (!connectingFrom || handleType !== 'target') {
        return;
      }
      if (onConnect) {
        onConnect({
          source: connectingFrom.nodeId,
          sourceHandle: connectingFrom.handleId,
          target: nodeId,
          targetHandle: handleId,
        });
      }
      connectingFromRef.current = null;
      setConnectionPreview(null);
    },
    [onConnect],
  );

  const flowInstance = useMemo<ReactFlowInstance>(() => ({
    project: (point: XYPosition) => point,
    getNodes: () => nodesRef.current,
    getEdges: () => edgesRef.current,
  }), [edgesRef, nodesRef]);

  const initCalled = useRef(false);
  useEffect(() => {
    if (!initCalled.current && onInit) {
      initCalled.current = true;
      onInit(flowInstance);
    }
  }, [flowInstance, onInit]);

  useEffect(() => {
    Object.keys(handlesRef.current).forEach((key) => updateHandlePosition(key));
  }, [nodes, updateHandlePosition]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!wrapperRef.current) {
        return;
      }
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      if (connectingFromRef.current) {
        const from = connectionPreview?.from;
        const to = {
          x: event.clientX - wrapperRect.left,
          y: event.clientY - wrapperRect.top,
        };
        setConnectionPreview(from ? { from, to } : null);
      }
      const drag = dragState.current;
      if (!drag) {
        return;
      }
      const nextPosition = {
        x: event.clientX - wrapperRect.left - drag.offsetX,
        y: event.clientY - wrapperRect.top - drag.offsetY,
      };
      if (onNodesChange) {
        onNodesChange([{ type: 'position', id: drag.nodeId, position: nextPosition }]);
      }
    },
    [connectionPreview?.from, onNodesChange],
  );

  const handleMouseUp = useCallback(() => {
    dragState.current = null;
    if (connectingFromRef.current) {
      connectingFromRef.current = null;
      setConnectionPreview(null);
    }
  }, []);

  const handlePaneClickInternal = useCallback(() => {
    setSelectedId(null);
    if (onPaneClick) {
      onPaneClick();
    }
  }, [onPaneClick]);

  const value = useMemo<FlowContextValue>(
    () => ({
      registerHandle,
      unregisterHandle,
      updateHandlePosition,
      startConnection,
      completeConnection,
      connectingFrom: connectingFromRef.current,
    }),
    [completeConnection, registerHandle, startConnection, updateHandlePosition, unregisterHandle],
  );

  const renderEdgeLabel = (edge: Edge, midpoint: InternalHandlePosition | null) => {
    if (!edge.label || !midpoint) {
      return null;
    }
    return (
      <text x={midpoint.x} y={midpoint.y - 6} className="rf-edge__label">
        {edge.label}
      </text>
    );
  };

  const getHandlePosition = useCallback(
    (nodeId: string, handleId: string | undefined, type: 'source' | 'target') => {
      if (!handleId) {
        return null;
      }
      return handlePositions[getHandleKey(nodeId, handleId, type)] ?? null;
    },
    [handlePositions],
  );

  const getNodeCenter = (nodeId: string) => {
    const rect = nodeRects.current[nodeId];
    if (!rect) {
      return null;
    }
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  };

  const edgesToRender = edges.map((edge) => {
    const source = getHandlePosition(edge.source, edge.sourceHandle, 'source') ?? getNodeCenter(edge.source);
    const target = getHandlePosition(edge.target, edge.targetHandle, 'target') ?? getNodeCenter(edge.target);
    return { edge, source, target };
  });

  return (
    <FlowContext.Provider value={value}>
      <div
        ref={wrapperRef}
        className="rf-wrapper"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handlePaneClickInternal}
      >
        <svg className="rf-edges" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker
              id="rf-arrow-closed"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#555" />
            </marker>
          </defs>
          {edgesToRender.map(({ edge, source, target }) => {
            if (!source || !target) {
              return null;
            }
            const path = `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
            const midpoint = {
              x: (source.x + target.x) / 2,
              y: (source.y + target.y) / 2,
            };
            return (
              <g key={edge.id} className="rf-edge">
                <path
                  d={path}
                  markerEnd={edge.markerEnd?.type === MarkerType.ArrowClosed ? 'url(#rf-arrow-closed)' : undefined}
                />
                {renderEdgeLabel(edge, midpoint)}
              </g>
            );
          })}
          {connectionPreview ? (
            <path
              d={`M ${connectionPreview.from.x} ${connectionPreview.from.y} L ${connectionPreview.to.x} ${connectionPreview.to.y}`}
              className="rf-edge rf-edge--preview"
            />
          ) : null}
        </svg>
        <div className="rf-nodes">
          {nodes.map((node) => {
            const NodeComponent = nodeTypes?.[node.type ?? ''] ?? nodeTypes?.default;
            const selected = node.id === selectedId;
            return (
              <NodeIdContext.Provider key={node.id} value={node.id}>
                <NodeRenderer
                  node={node}
                  nodeComponent={NodeComponent}
                  selected={selected}
                  setSelectedId={setSelectedId}
                  onNodeClick={onNodeClick}
                  onNodesChange={onNodesChange}
                  dragState={dragState}
                  wrapperRef={wrapperRef}
                  nodeRects={nodeRects}
                />
              </NodeIdContext.Provider>
            );
          })}
        </div>
        {children}
      </div>
    </FlowContext.Provider>
  );
};

interface NodeRendererProps<T> {
  node: Node<T>;
  nodeComponent?: FC<NodeProps<T>>;
  selected: boolean;
  setSelectedId: (id: string | null) => void;
  onNodeClick?: (event: MouseEvent, node: Node<T>) => void;
  onNodesChange?: (changes: NodeChange<T>[]) => void;
  dragState: MutableRefObject<{ nodeId: string; offsetX: number; offsetY: number } | null>;
  wrapperRef: MutableRefObject<HTMLDivElement | null>;
  nodeRects: MutableRefObject<Record<string, { x: number; y: number; width: number; height: number }>>;
}

const NodeRenderer = <T,>({
  node,
  nodeComponent: NodeComponent,
  selected,
  setSelectedId,
  onNodeClick,
  dragState,
  wrapperRef,
  nodeRects,
}: NodeRendererProps<T>) => {
  const nodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!nodeRef.current || !wrapperRef.current) {
      return;
    }
    const registry = nodeRects.current;
    const updateRect = () => {
      if (!nodeRef.current || !wrapperRef.current) {
        return;
      }
      const rect = nodeRef.current.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      registry[node.id] = {
        x: rect.left - wrapperRect.left,
        y: rect.top - wrapperRect.top,
        width: rect.width,
        height: rect.height,
      };
    };
    updateRect();
    const resizeObserver = new ResizeObserver(updateRect);
    resizeObserver.observe(nodeRef.current);
    return () => {
      resizeObserver.disconnect();
      delete registry[node.id];
    };
  }, [node.id, node.position.x, node.position.y, nodeRects, wrapperRef]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.button !== 0) {
      return;
    }
    setSelectedId(node.id);
    if (!wrapperRef.current) {
      return;
    }
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const offsetX = event.clientX - wrapperRect.left - node.position.x;
    const offsetY = event.clientY - wrapperRect.top - node.position.y;
    dragState.current = { nodeId: node.id, offsetX, offsetY };
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (onNodeClick) {
      onNodeClick(event.nativeEvent, node);
    }
  };

  const style: CSSProperties = {
    position: 'absolute',
    left: node.position.x,
    top: node.position.y,
    cursor: 'grab',
  };

  if (!NodeComponent) {
    return (
      <div ref={nodeRef} style={style} className={selected ? 'rf-node rf-node--selected' : 'rf-node'}>
        <div className="rf-node__default">{node.id}</div>
      </div>
    );
  }

  return (
    <div
      ref={nodeRef}
      style={style}
      className={selected ? 'rf-node rf-node--selected' : 'rf-node'}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <NodeComponent id={node.id} data={node.data} selected={selected} type={node.type} />
    </div>
  );
};

export const ReactFlow = ReactFlowInner;

export const Handle: FC<{
  type: 'source' | 'target';
  position: Position;
  id: string;
  style?: CSSProperties;
}> = ({ type, position, id, style }) => {
  const context = useContext(FlowContext);
  const nodeId = useContext(NodeIdContext);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const keyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!context || !nodeId || !handleRef.current) {
      return;
    }
    keyRef.current = context.registerHandle({
      nodeId,
      handleId: id,
      type,
      position,
      element: handleRef.current,
    });
    const resizeObserver = new ResizeObserver(() => {
      if (keyRef.current) {
        context.updateHandlePosition(keyRef.current);
      }
    });
    resizeObserver.observe(handleRef.current);
    return () => {
      resizeObserver.disconnect();
      if (keyRef.current) {
        context.unregisterHandle(keyRef.current);
      }
    };
  }, [context, id, nodeId, position, type]);

  const baseStyle: CSSProperties = {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '#555',
    transform: 'translate(-50%, -50%)',
    cursor: 'crosshair',
  };

  const positionStyle: CSSProperties = {
    [position === Position.Left ? 'left' : position === Position.Right ? 'right' : 'left']:
      position === Position.Left ? 0 : position === Position.Right ? 0 : '50%',
    [position === Position.Top ? 'top' : position === Position.Bottom ? 'bottom' : 'top']:
      position === Position.Top ? 0 : position === Position.Bottom ? 0 : '50%',
  } as CSSProperties;

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (context && nodeId) {
      context.startConnection(nodeId, id, type);
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (context && nodeId) {
      context.completeConnection(nodeId, id, type);
    }
  };

  return (
    <div
      ref={handleRef}
      className={`rf-handle rf-handle--${type}`}
      style={{ ...baseStyle, ...positionStyle, ...style }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    />
  );
};

export const Background: FC<{ color?: string; gap?: number }> = ({ color = '#f0f0f0', gap = 16 }) => (
  <div
    className="rf-background"
    style={{
      backgroundSize: `${gap}px ${gap}px`,
      backgroundImage: `linear-gradient(0deg, transparent 24%, ${color} 25%, ${color} 26%, transparent 27%, transparent 74%, ${color} 75%, ${color} 76%, transparent 77%), linear-gradient(90deg, transparent 24%, ${color} 25%, ${color} 26%, transparent 27%, transparent 74%, ${color} 75%, ${color} 76%, transparent 77%)`,
    }}
  />
);

const positionToStyle: Record<string, CSSProperties> = {
  'top-left': { top: 12, left: 12 },
  'top-right': { top: 12, right: 12 },
  'bottom-left': { bottom: 12, left: 12 },
  'bottom-right': { bottom: 12, right: 12 },
};

export const Controls: FC<{ position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }> = ({
  position = 'bottom-left',
}) => (
  <div className="rf-controls" style={positionToStyle[position] ?? positionToStyle['bottom-left']}>
    <button type="button" className="rf-controls__button" aria-label="zoom in">
      +
    </button>
    <button type="button" className="rf-controls__button" aria-label="zoom out">
      -
    </button>
    <button type="button" className="rf-controls__button" aria-label="center view">
      ⤢
    </button>
  </div>
);

export default ReactFlow;

