import { type UnitId, UNITS, type UnitBlueprint } from '../units/unit-lookup';
import { clamp, isDefined } from '@hc/shared';
import type { Serializable } from '../utils/interfaces';
import { GameSession } from '../game-session';
import { Entity } from '../entity/entity';
import type { SerializedPlayer } from './player-manager';
import { config } from '../config';
import { cloneDeep } from 'lodash-es';

export type PlayerId = string;

export type Loadout = {
  units: Record<UnitId, { cooldown: number }>;
};

export class Player implements Serializable {
  public readonly id: PlayerId;
  public readonly name: string;
  public readonly loadout: Loadout;
  public readonly generalId: UnitId;
  private _gold: number;
  private goldPerTurn: number;

  constructor(
    private ctx: GameSession,
    options: SerializedPlayer
  ) {
    this.id = options.id;
    this.name = options.name;
    this.loadout = cloneDeep(options.loadout);
    this.generalId = options.generalId;
    this._gold = options.gold;
    this.goldPerTurn = this._gold;
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      loadout: this.loadout,
      generalId: this.generalId,
      gold: this.gold
    };
  }

  get gold() {
    return this._gold;
  }

  set gold(val: number) {
    this.gold = clamp(val, 0, config.MAX_GOLD);
  }

  equals(player: Player) {
    return player.id === this.id;
  }

  clone() {
    return new Player(this.ctx, this.serialize());
  }

  canSummon(unitId: UnitId) {
    const unit = UNITS[unitId];
    const loadoutUnit = this.loadout.units[unitId];
    if (!isDefined(loadoutUnit)) return false;

    const hpCost = this.getSumonHpCost(unit);
    if (hpCost >= this.general.hp) return false;

    return loadoutUnit.cooldown === 0 && this.gold >= unit.summonCost;
  }

  getSumonHpCost(unit: UnitBlueprint) {
    const available = [...this.general.unit.factions];
    let hpCost = 0;
    for (const faction of unit.factions) {
      const index = available.findIndex(
        value => value.id === faction.id || value === null
      );
      if (index === -1) {
        hpCost++;
      } else {
        available.splice(index, 1);
      }
    }

    return hpCost;
  }

  summonFromLoadout(unit: UnitBlueprint) {
    if (!this.canSummon(unit.id)) return;

    this.gold = clamp(this.gold - unit.summonCost, 0, Infinity);
    // const hpCost = this.getSumonHpCost(unit);
    // if (hpCost > 0) {
    //   this.ctx.actionQueue.push(
    //     new DealDamageAction(
    //       {
    //         amount: hpCost,
    //         sourceId: this.general.id,
    //         targets: [this.general.id]
    //       },
    //       this.ctx
    //     )
    //   );
    // }

    this.loadout.units[unit.id].cooldown = unit.summonCooldown;
  }

  get summonableUnits() {
    return Object.entries(this.loadout.units).map(([unitId, info]) => ({
      unit: UNITS[unitId],
      ...info
    }));
  }

  get entities() {
    return this.ctx.entityManager.getList().filter(e => e.playerId === this.id);
  }

  get general() {
    return this.ctx.entityManager.getGeneral(this.id);
  }

  get opponent() {
    return this.ctx.playerManager.getOpponent(this.id);
  }

  ownsEntity(entity: Entity) {
    return entity.playerId === this.id;
  }

  startTurn() {
    Object.entries(this.loadout.units).forEach(([, unit]) => {
      unit.cooldown = clamp(unit.cooldown - 1, 0, Infinity);
    });
    this.goldPerTurn = Math.min(this.goldPerTurn + 1, config.MAX_GOLD);
    this.gold += this.goldPerTurn;
  }
}
