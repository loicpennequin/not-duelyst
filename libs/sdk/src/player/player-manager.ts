import { Player, PlayerId } from './player';

export class PlayerManager {
  playerMap = new Map<PlayerId, Player>();

  constructor(players: Player[]) {
    players.forEach(player => {
      this.playerMap.set(player.id, player);
    });
  }

  getList() {
    return [...this.playerMap.values()];
  }

  getPlayerById(id: PlayerId) {
    return this.playerMap.get(id);
  }

  addEntity(player: Player) {
    this.playerMap.set(player.id, player);
  }

  removeEntity(playerId: PlayerId) {
    this.playerMap.delete(playerId);
  }

  serialize() {
    return this.getList().map(player => player.serialize());
  }
}
