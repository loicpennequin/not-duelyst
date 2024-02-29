import { MatchmakingStrategy } from '../matchmaking';
import { User } from '../../users/user.entity';
import { MatchmakingUser } from '../matchmaking.entity';

type TestStrategyParticipant = {
  user: User;
  matchmakingUser: MatchmakingUser;
};
export class MatchmakingTestStrategy
  implements MatchmakingStrategy<TestStrategyParticipant>
{
  sorter(a: TestStrategyParticipant, b: TestStrategyParticipant): number {
    return b.user.mmr - a.user.mmr;
  }

  matcher(a: TestStrategyParticipant, b: TestStrategyParticipant): boolean {
    return Math.abs(a.user.mmr - b.user.mmr) < 9999;
  }

  processUnmatched(participant: TestStrategyParticipant): TestStrategyParticipant {
    return participant;
  }
}
