import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Holding,
  HoldingRaw,
  mockBonuses,
  V3PortfolioState,
  WithdrawalRequest,
  WithdrawalRequestRaw,
  WithdrawalSettings,
} from 'redux/portfolio/v3Portfolio.types';
import { RootState } from 'redux/index';
import { getAllTokensMap } from 'redux/bancor/token';
import { Token } from 'services/observables/tokens';
import { utils } from 'ethers';
import { RewardsProgramStake } from 'services/web3/v3/portfolio/standardStaking';
import BigNumber from 'bignumber.js';

export const initialState: V3PortfolioState = {
  holdingsRaw: [],
  isLoadingHoldings: true,
  withdrawalRequestsRaw: [],
  withdrawalSettings: { lockDuration: 0, withdrawalFee: 0 },
  isLoadingWithdrawalRequests: true,
  bonusesModal: false,
  bonuses: mockBonuses,
  standardRewards: [],
};

const v3PortfolioSlice = createSlice({
  name: 'v3Portfolio',
  initialState,
  reducers: {
    setHoldingsRaw: (state, action: PayloadAction<HoldingRaw[]>) => {
      state.holdingsRaw = action.payload;
      state.isLoadingHoldings = false;
    },
    setWithdrawalRequestsRaw: (
      state,
      action: PayloadAction<WithdrawalRequestRaw[]>
    ) => {
      state.withdrawalRequestsRaw = action.payload;
      state.isLoadingWithdrawalRequests = false;
    },
    setWithdrawalSettings: (
      state,
      action: PayloadAction<WithdrawalSettings>
    ) => {
      state.withdrawalSettings = action.payload;
    },
    openBonusesModal: (state, action: PayloadAction<boolean>) => {
      state.bonusesModal = action.payload;
    },
    setStandardRewards: (
      state,
      action: PayloadAction<RewardsProgramStake[]>
    ) => {
      state.standardRewards = action.payload;
    },
  },
});

export const {
  setHoldingsRaw,
  openBonusesModal,
  setWithdrawalRequestsRaw,
  setWithdrawalSettings,
  setStandardRewards,
} = v3PortfolioSlice.actions;

export const v3Portfolio = v3PortfolioSlice.reducer;

export const getPortfolioHoldings = createSelector(
  (state: RootState) => state.v3Portfolio.holdingsRaw,
  (state: RootState) => state.v3Portfolio.standardRewards,
  (state: RootState) => getAllTokensMap(state),
  (
    holdingsRaw: HoldingRaw[],
    standardRewards: RewardsProgramStake[],
    allTokensMap: Map<string, Token>
  ): Holding[] => {
    const standardRewardsMap = new Map(
      standardRewards.map((reward) => [reward.pool, reward])
    );
    return holdingsRaw
      .map((holdingRaw) => {
        const token = allTokensMap.get(holdingRaw.poolId);
        const standardStakingReward = standardRewardsMap.get(holdingRaw.poolId);
        if (!token) {
          return undefined;
        }

        const poolTokenBalance = utils.formatUnits(
          holdingRaw.poolTokenBalanceWei,
          18
        );
        const tokenBalance = utils.formatUnits(
          holdingRaw.tokenBalanceWei,
          token.decimals
        );

        const stakedTokenBalance = utils.formatUnits(
          standardStakingReward?.tokenAmountWei || 0,
          token.decimals
        );

        const combinedTokenBalance = new BigNumber(tokenBalance)
          .plus(stakedTokenBalance)
          .toString();

        const holding: Holding = {
          token,
          poolId: holdingRaw.poolId,
          poolTokenId: holdingRaw.poolTokenId,
          poolTokenBalance,
          tokenBalance,
          standardStakingReward,
          combinedTokenBalance,
        };

        return holding;
      })
      .filter((holding) => holding !== undefined) as Holding[];
  }
);

export const getPortfolioWithdrawalRequests = createSelector(
  (state: RootState) => state.v3Portfolio.withdrawalRequestsRaw,
  (state: RootState) => state.v3Portfolio.withdrawalSettings,
  (state: RootState) => getAllTokensMap(state),
  (
    withdrawalRequestsRaw: WithdrawalRequestRaw[],
    withdrawalSettings: WithdrawalSettings,
    allTokensMap: Map<string, Token>
  ): WithdrawalRequest[] => {
    return withdrawalRequestsRaw
      .map((requestRaw) => {
        const token = allTokensMap.get(requestRaw.reserveToken);
        if (!token) {
          return undefined;
        }

        const lockEndsAt =
          requestRaw.createdAt + withdrawalSettings.lockDuration;
        const poolTokenAmount = utils.formatUnits(
          requestRaw.poolTokenAmountWei,
          token.decimals
        );
        const reserveTokenAmount = utils.formatUnits(
          requestRaw.reserveTokenAmountWei,
          token.decimals
        );

        const request: WithdrawalRequest = {
          ...requestRaw,
          lockEndsAt,
          poolTokenAmount,
          reserveTokenAmount,
          token,
        };

        return request;
      })
      .filter((request) => request !== undefined) as WithdrawalRequest[];
  }
);
