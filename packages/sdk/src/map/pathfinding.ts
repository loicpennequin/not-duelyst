import { isDefined } from '@hc/shared';
import { CellId } from './cell';
import { Edge, GraphAdapter, dijkstra, findShortestPath } from '../utils/dijakstra';
import { Point3D } from '../types';
import { pointToCellId } from '../utils/helpers';
import { isEmpty } from '../entity/entity-utils';
import { Vec3 } from '../utils/vector';
import { GameSession } from '../game-session';

export class Pathfinder {
  private cache = new Map<CellId, Edge<CellId>[]>();

  private makeAdapter(origin: Point3D): GraphAdapter<CellId> {
    const originVec = Vec3.fromPoint3D(origin);

    return {
      getEdges: node => {
        if (!this.cache.has(node)) {
          const edges = [
            this.ctx.map.getDestination(node, 'north'),
            this.ctx.map.getDestination(node, 'south'),
            this.ctx.map.getDestination(node, 'west'),
            this.ctx.map.getDestination(node, 'east')
          ];
          this.cache.set(
            node,
            edges
              .filter(isDefined)
              .filter(point => {
                if (!isEmpty(this.ctx, point)) return false;
                if (this.boundaries) {
                  return (
                    originVec.dist(point) <= originVec.dist(this.boundaries[0]) &&
                    originVec.dist(point) <= originVec.dist(this.boundaries[1])
                  );
                }
                return true;
              })
              .map(point => {
                return {
                  node: pointToCellId(point),
                  weight: 1
                };
              })
          );
        }

        return this.cache.get(node)!;
      }
    };
  }

  constructor(
    private ctx: GameSession,
    private boundaries?: [Point3D, Point3D]
  ) {}

  findPath(from: Point3D, to: Point3D) {
    return findShortestPath<CellId>(
      this.makeAdapter(from),
      pointToCellId(from),
      pointToCellId(to)
    );
  }

  getDistanceMap(from: Point3D) {
    const map = dijkstra(this.makeAdapter(from), pointToCellId(from));

    return {
      costs: map.costs,
      get(pt: Point3D) {
        return map.costs[pointToCellId(pt)];
      }
    };
  }
}
