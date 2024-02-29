import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Cell } from '../map/cell';
import { Point3D } from '../types';
import { Keyword } from '../utils/keywords';

export type SkillId = string;

export type SkillOptions = {
  cost: number;
  name: string;
  animationFX?: string;
  soundFX?: string;
  spriteId: string;
  cooldown: number;
  shouldExhaustCaster: boolean;
  shouldPreventMovement?: boolean;
  minTargets?: number;
  maxTargets?: number;
  id: string;
  keyords?: Keyword[];
};

export type SkillDescriptionContext = {
  attack: number;
  speed: number;
};

export abstract class Skill {
  readonly id: SkillId;
  readonly name: string;
  readonly cooldown: number;
  readonly animationFX: string;
  readonly soundFX: string;
  readonly spriteId: string;
  readonly minTargets: number;
  readonly maxTargets: number;
  readonly shouldExhaustCaster: boolean;
  readonly shouldPreventMovement: boolean;
  readonly keywords: Keyword[];

  constructor(options: SkillOptions) {
    this.id = options.id;
    this.name = options.name;
    this.keywords = options.keyords ?? [];
    this.cooldown = options.cooldown;
    this.animationFX = options.animationFX ?? 'cast';
    this.soundFX = options.soundFX ?? 'cast-placeholder';
    this.spriteId = options.spriteId;
    this.minTargets = options.minTargets ?? 1;
    this.maxTargets = options.maxTargets ?? 1;
    this.shouldExhaustCaster = options.shouldExhaustCaster;
    this.shouldPreventMovement = options.shouldPreventMovement ?? true;
  }

  abstract getDescription(caster: SkillDescriptionContext): string;

  getText(caster: SkillDescriptionContext) {
    return `${this.getDescription(caster)}${
      this.shouldExhaustCaster ? '' : '\nDoes not exhaust.'
    }${this.shouldPreventMovement ? '' : '\nDoes not prevent movement.'}`;
  }

  abstract isTargetable(
    ctx: GameSession,
    point: Point3D,
    caster: Entity,
    targets: Point3D[]
  ): boolean;

  abstract isWithinRange(
    ctx: GameSession,
    point: Point3D,
    caster: Entity,
    targets: Point3D[]
  ): boolean;

  abstract isInAreaOfEffect(
    ctx: GameSession,
    point: Point3D,
    caster: Entity,
    targets: Point3D[]
  ): boolean;

  abstract execute(
    ctx: GameSession,
    caster: Entity,
    targets: Point3D[],
    affectedCells: Cell[]
  ): void;

  fxImpl(
    ctx: GameSession,
    caster: Entity,
    targets: Point3D[],
    affectedPoints: Point3D[]
  ) {
    return Promise.resolve();
  }
}
