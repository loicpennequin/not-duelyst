import PriorityQueue from 'ts-priority-queue';
import { isDefined, isFunction } from '@hc/shared';

export type NodeKey = string | number;

export type Edge<T> = {
  node: T;
  weight: number;
};

type QueueEntry<T> = {
  node: T;
  cost: number;
};

export interface GraphAdapter<T> {
  getKey?: (node: T) => NodeKey;
  getEdges: (node: T) => Edge<T>[];
}

const getNodeKey = <T>(node: T, adapter: GraphAdapter<T>): NodeKey => {
  if (isFunction(adapter.getKey)) return adapter.getKey(node);
  if (typeof node === 'string' || typeof node === 'number') return node;
  throw new Error('Adapter must implement method getKey');
};

export const dijkstra = <T>(adapter: GraphAdapter<T>, startNode: T, finishNode?: T) => {
  const getKey = (node: T) => getNodeKey(node, adapter);
  const parents: Record<NodeKey, T> = {};
  const costs: Record<NodeKey, number> = {};
  const explored: Record<NodeKey, boolean> = {};
  const prioQueue = new PriorityQueue<QueueEntry<T>>({
    comparator: (a, b) => a.cost - b.cost
  });
  prioQueue.queue({ node: startNode, cost: 0 });
  do {
    const node = prioQueue.dequeue().node;
    const nodeKey = getKey(node);
    const cost = costs[nodeKey] || 0;

    explored[nodeKey] = true;

    // Early return when the shortest path in our
    // graph is already the finishNode
    if (isDefined(finishNode) && nodeKey === getKey(finishNode)) break;

    adapter.getEdges(node).forEach(edge => {
      const childNode = edge.node;
      const childNodeKey = getKey(childNode);
      const newCost = cost + edge.weight;

      const isTooExpensive =
        isDefined(costs[childNodeKey]) && newCost > costs[childNodeKey];
      if (isTooExpensive) return;

      costs[childNodeKey] = newCost;
      parents[childNodeKey] = node;

      if (!explored[childNodeKey]) {
        prioQueue.queue({ node: childNode, cost: newCost });
      }
    });
  } while (prioQueue.length);

  return {
    costs,
    parents
  };
};

export const findShortestPath = <T>(
  adapter: GraphAdapter<T>,
  startNode: T,
  finishNode: T
) => {
  const getKey = (node: T) => getNodeKey(node, adapter);
  const { costs, parents } = dijkstra(adapter, startNode, finishNode);
  const optimalPath = [finishNode];
  let parent = parents[getKey(finishNode)];

  if (!parent) return null;

  while (parent) {
    if (parent !== startNode) {
      optimalPath.push(parent);
    }
    parent = parents[getKey(parent)];
  }
  optimalPath.reverse();

  const results = {
    distance: costs[getKey(finishNode)],
    path: optimalPath
  };

  return results;
};
