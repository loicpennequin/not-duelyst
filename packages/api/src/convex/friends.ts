import { acceptFriendlyChallengeUsecase } from './friend/usecases/acceptFriendlyChallenge.usecase';
import { acceptFriendRequestUsecase } from './friend/usecases/acceptFriendRequest.usecase';
import { cancelFriendlyChallengeUsecase } from './friend/usecases/cancelFriendlyChallenge.usecase';
import { declineFriendlyChallengeUsecase } from './friend/usecases/declineFriendlyChallenge.usecase';
import { declineFriendRequestUsecase } from './friend/usecases/declineFriendRequest.usecase';
import { getFriendsUsecase } from './friend/usecases/getFriends.usecase';
import { getLatestChallengeUsecase } from './friend/usecases/getLatestChallenge.usecase';
import { getReceivedFriendRequestsUsecase } from './friend/usecases/getReceivedFriendRequests.usecase';
import { internalCancelPendingChallengesUsecase } from './friend/usecases/internalCancelPendingChallenges.usecase';
import { markFriendRequestAsSeenUsecase } from './friend/usecases/markFriendRequestAsSeen.usecase';
import { sendFriendlyChallengeUsecase } from './friend/usecases/sendFriendlyChallenge.usecase';
import { sendFriendRequestUsecase } from './friend/usecases/sendFriendRequest';

export const sendFriendRequest = sendFriendRequestUsecase;
export const newRequests = getReceivedFriendRequestsUsecase;
export const markAsSeen = markFriendRequestAsSeenUsecase;
export const acceptFriendRequest = acceptFriendRequestUsecase;
export const declineFriendRequest = declineFriendRequestUsecase;
export const all = getFriendsUsecase;

export const internalCancelPendingChallenges = internalCancelPendingChallengesUsecase;
export const sendFriendlyChallenge = sendFriendlyChallengeUsecase;
export const cancelFriendlyChallenge = cancelFriendlyChallengeUsecase;
export const acceptFriendlyChallenge = acceptFriendlyChallengeUsecase;
export const declineFriendlyChallenge = declineFriendlyChallengeUsecase;
export const latestReceivedChallenge = getLatestChallengeUsecase;
