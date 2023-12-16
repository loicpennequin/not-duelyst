import { clamp } from '@hc/shared';
import { isGeneral } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { UnitId } from '../units/unit-lookup';
import { Loadout, Player, PlayerId } from './player';

export class PlayerManager {
  private playerMap = new Map<PlayerId, Player>();

  constructor(private ctx: GameSession) {}

  setup(players: { id: PlayerId; loadout: Loadout; generalId: UnitId }[]) {
    players
      .map(p => new Player(this.ctx, p.id, p.loadout, p.generalId))
      .forEach(player => {
        this.addPlayer(player);
      });

    if (this.ctx.isAuthoritative) {
      this.ctx.emitter.on('entity:turn-start', entity => {
        if (isGeneral(entity)) {
          Object.entries(this.getPlayerById(entity.playerId)!.loadout.units).forEach(
            ([name, unit]) => {
              unit.cooldown = clamp(unit.cooldown - 1, 0, Infinity);
            }
          );
        }
      });
    }
  }

  getList() {
    return [...this.playerMap.values()];
  }

  getPlayerById(id: PlayerId) {
    return this.playerMap.get(id);
  }

  getOpponent(id: PlayerId) {
    return this.getList().find(p => p.id !== id)!;
  }

  getActivePlayer() {
    return this.getPlayerById(this.ctx.atb.activeEntity.playerId)!;
  }

  addPlayer(player: Player) {
    this.playerMap.set(player.id, player);
  }

  removePlayer(playerId: PlayerId) {
    this.playerMap.delete(playerId);
  }

  serialize() {
    return this.getList().map(player => player.serialize());
  }
}
