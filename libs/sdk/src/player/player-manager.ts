import { GameSession } from '../game-session';
import { UnitId } from '../units/unit-lookup';
import { Loadout, PlayerId, Player } from './player';

export type SerializedPlayer = {
  id: PlayerId;
  loadout: Loadout;
  generalId: UnitId;
  gold: number;
  name: string;
};
export class PlayerManager {
  private playerMap = new Map<PlayerId, Player>();
  private activePlayerId!: PlayerId;

  constructor(private ctx: GameSession) {}

  setup(activePlayerId: PlayerId, players: [SerializedPlayer, SerializedPlayer]) {
    this.activePlayerId = activePlayerId;

    players
      .map(p => new Player(this.ctx, p))
      .forEach(player => {
        this.addPlayer(player);
      });
  }

  switchActivePlayer() {
    this.ctx.emitter.emit('game:turn-end', this.getActivePlayer());

    this.activePlayerId = this.getList().find(
      player => player.id !== this.activePlayerId
    )!.id;
    this.ctx.turn++;

    this.ctx.emitter.emit('game:turn-start', this.getActivePlayer());
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
    return this.getPlayerById(this.activePlayerId)!;
  }

  addPlayer(player: Player) {
    this.playerMap.set(player.id, player);
    this.ctx.emitter.on('game:turn-start', newPlayer => {
      if (this.ctx.turn <= 1) return;

      if (player.id === newPlayer.id) {
        player.startTurn();
      }
    });
  }

  removePlayer(playerId: PlayerId) {
    this.playerMap.delete(playerId);
  }

  serialize() {
    return {
      players: this.getList().map(player => player.serialize()) as [
        SerializedPlayer,
        SerializedPlayer
      ],
      activePlayerId: this.activePlayerId
    };
  }
}
