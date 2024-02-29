export type MatchmakingStrategy<T> = {
  sorter(a: T, b: T): number;
  matcher(a: T, b: T): boolean;
  processUnmatched(user: T): T;
};

export class Matchmaking<T> {
  constructor(
    private participants: T[],
    private strategy: MatchmakingStrategy<T>
  ) {}

  makePairs(): {
    pairs: [T, T][];
    remaining: T[];
  } {
    const sorted = this.participants.slice().sort(this.strategy.sorter);

    const pairs: [T, T][] = [];
    const remaining: T[] = [];

    while (sorted.length > 1) {
      const a = sorted.shift()!;
      const b = sorted.shift()!;

      if (this.strategy.matcher(a, b)) {
        pairs.push([a, b]);
      } else {
        remaining.push(a, b);
      }
    }

    return { pairs, remaining };
  }
}
