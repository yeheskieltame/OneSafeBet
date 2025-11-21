# PredictionMarket Smart Contract

## Overview

The `PredictionMarket.sol` contract implements a decentralized prediction market system where users can create markets, vote YES or NO on predictions, and earn rewards based on the outcome. This contract integrates with the existing OneSafeBet ecosystem, using the Vault for Battle Power (user stakes) and QuestManager for gamification.

## Key Features

- **Create Markets**: Anyone can create prediction markets with custom questions, categories, and durations
- **Vote with Battle Power**: Users vote YES/NO using their Battle Power (staked balance in Vault)
- **Proportional Rewards**: Winners receive a proportional share of the total prize pool
- **Quest Integration**: Voting and winning triggers quest checks for NFT badge rewards
- **Flexible Resolution**: Market outcomes are resolved by the contract owner (oracle integration can be added)

## Architecture

```
PredictionMarket.sol
├── Integration with Vault.sol (Battle Power)
├── Integration with QuestManager.sol (Badges)
└── Market Management (Create, Vote, Resolve, Claim)
```

## Smart Contract Functions

### Read Functions

#### `getMarket(uint256 marketId)`
Returns complete market information including pools, voters, status, etc.

#### `getTotalMarkets()`
Returns the total number of markets created.

#### `getUserVote(uint256 marketId, address user)`
Returns user's vote choice (1=YES, 2=NO, 0=not voted) and staked amount.

#### `calculatePotentialWin(uint256 marketId, bool choice, uint256 amount)`
Calculates the potential reward for a given stake amount on a market.

### Write Functions

#### `createMarket(string question, string category, uint256 duration, uint256 minStake)`
Creates a new prediction market.
- **question**: The prediction question
- **category**: Market category (e.g., "Crypto", "Sports", "Technology")
- **duration**: Duration in seconds until market ends
- **minStake**: Minimum Battle Power required to vote
- **Returns**: Market ID

#### `vote(uint256 marketId, bool choice, uint256 amount)`
Vote on a prediction market.
- **marketId**: ID of the market to vote on
- **choice**: true for YES, false for NO
- **amount**: Amount of Battle Power to stake
- **Requirements**:
  - User must have sufficient Battle Power in Vault
  - Amount must be >= minStake
  - Can only vote once per market
  - Market must not have ended

#### `claimReward(uint256 marketId)`
Claim rewards from a resolved market.
- **Requirements**:
  - Market must be resolved
  - User must have voted
  - Can only claim once
- **Reward Calculation**: `(userStake / winningPool) * totalPool`

#### `depositPrizePool()`
Deposit HBAR to fund prize pools (payable function).

#### `resolveMarket(uint256 marketId, bool outcome)` (Owner only)
Resolve a market and determine the winning side.
- **outcome**: true if YES wins, false if NO wins
- **Requirements**:
  - Market must have ended
  - Only owner can resolve

#### `deactivateMarket(uint256 marketId)` (Owner only)
Emergency function to deactivate a market.

## Deployment Guide

### Prerequisites

1. Deployed Vault contract
2. Deployed QuestManager contract
3. Foundry installed
4. Hedera testnet/mainnet account with HBAR

### Step 1: Set Environment Variables

Create a `.env` file in `smartContract/` directory:

```bash
PRIVATE_KEY=your_private_key_here
HEDERA_RPC_URL=https://testnet.hashio.io/api
```

### Step 2: Deploy Contract

```bash
cd smartContract

# Deploy PredictionMarket
forge script script/DeployPredictionMarket.s.sol:DeployPredictionMarketScript \
  --rpc-url $HEDERA_RPC_URL \
  --broadcast \
  --verify

# Note the deployed contract address
```

### Step 3: Update Frontend Configuration

Update the contract address in `Frontend/contracts/PredictionMarket.ts`:

```typescript
export const PREDICTION_MARKET_ADDRESS = "0xYourDeployedContractAddress"
```

### Step 4: Configure Vault Access (Optional)

If needed, grant PredictionMarket contract permission to read from Vault:

```bash
cast send $VAULT_ADDRESS "setGameContract(address)" $PREDICTION_MARKET_ADDRESS \
  --rpc-url $HEDERA_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Testing Guide

### Run All Tests

```bash
cd smartContract
forge test --match-contract PredictionMarketTest -vv
```

### Run Specific Test

```bash
forge test --match-test testVoteYes -vv
```

### Test Coverage

```bash
forge coverage --contracts src/PredictionMarket.sol
```

### Gas Report

```bash
forge test --gas-report --match-contract PredictionMarketTest
```

## Test Results

All 22 tests passing:

- ✅ Market creation and management
- ✅ YES/NO voting mechanics
- ✅ Multiple users voting
- ✅ Validation and error handling
- ✅ Market resolution
- ✅ Reward claims for winners and losers
- ✅ Edge cases and security checks

## Frontend Integration

### 1. Install Web3 Dependencies

```bash
cd Frontend
pnpm add ethers@6 # or viem, wagmi, etc.
```

### 2. Use the Custom Hook

```typescript
import { usePredictionMarket } from '@/hooks/usePredictionMarket'

function PredictionGameComponent() {
  const {
    markets,
    isLoading,
    vote,
    claimReward,
    getBattlePower,
  } = usePredictionMarket()

  // Use the functions in your component
}
```

### 3. Integration Steps

The following files have been created to help with frontend integration:

- **`Frontend/contracts/PredictionMarket.ts`**: Contract ABI and address
- **`Frontend/contracts/Vault.ts`**: Vault contract ABI and address
- **`Frontend/hooks/usePredictionMarket.ts`**: Custom React hook for contract interaction

### 4. Web3 Provider Setup

You need to integrate a Web3 provider. Example with ethers.js:

```typescript
import { ethers } from 'ethers'
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from '@/contracts/PredictionMarket'

// Connect to Hedera
const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api')
const signer = new ethers.Wallet(privateKey, provider)

// Create contract instance
const contract = new ethers.Contract(
  PREDICTION_MARKET_ADDRESS,
  PREDICTION_MARKET_ABI,
  signer
)

// Call contract functions
const totalMarkets = await contract.getTotalMarkets()
const market = await contract.getMarket(1)

// Vote on market
const tx = await contract.vote(1, true, ethers.parseEther('10'))
await tx.wait()
```

## Example Usage

### Create a Market

```solidity
// Create a market asking if BTC will hit $150k by end of 2025
uint256 marketId = predictionMarket.createMarket(
    "Will Bitcoin hit $150,000 by end of 2025?",
    "Crypto",
    365 days,        // Duration
    10 * 1e8        // Min stake: 10 HBAR
);
```

### Vote on a Market

```solidity
// User votes YES with 50 HBAR worth of Battle Power
predictionMarket.vote(
    1,              // Market ID
    true,           // YES
    50 * 1e8        // 50 HBAR
);
```

### Resolve and Claim

```solidity
// Owner resolves market (YES wins)
predictionMarket.resolveMarket(1, true);

// User claims reward
predictionMarket.claimReward(1);
```

## Security Considerations

1. **Principal Safety**: Only Battle Power from Vault is used for voting, principal remains safe
2. **Single Vote Per Market**: Users can only vote once per market
3. **Time Locks**: Markets cannot be voted on after they end
4. **Claim Protection**: Users can only claim rewards once
5. **Owner Resolution**: Only owner can resolve markets (consider adding oracle integration)

## Reward Distribution Formula

For winners:

```
userReward = (userStake / totalWinningStake) × totalPool
```

Example:
- Total Pool: 100 HBAR (60 YES + 40 NO)
- YES wins
- User staked 30 HBAR on YES
- Total YES pool: 60 HBAR
- User reward: (30 / 60) × 100 = 50 HBAR

## Events

The contract emits the following events for frontend/indexer integration:

- `MarketCreated(marketId, question, category, endTime, minStake)`
- `VoteCast(marketId, user, choice, amount)`
- `MarketResolved(marketId, outcome, totalPool)`
- `RewardClaimed(marketId, user, amount)`

## Future Enhancements

1. **Oracle Integration**: Automated market resolution using Chainlink or Band Protocol
2. **Liquidity Mining**: Reward liquidity providers who create markets
3. **Multi-Outcome Markets**: Support for more than 2 choices
4. **Market Categories**: Advanced filtering and categorization
5. **Social Features**: Comments, sharing, and market discussions
6. **Market Analytics**: Historical data and user statistics

## Contract Addresses

### Hedera Testnet
- Vault: `0x07D595FFA6DA87F2b0327195f6f16DD33661990e`
- QuestManager: `0x425e42F73B5bC6b665b2809AC350B8249CB93de6`
- PredictionMarket: `[To be deployed]`

### Hedera Mainnet
- Vault: `[To be deployed]`
- QuestManager: `[To be deployed]`
- PredictionMarket: `[To be deployed]`

## Support

For issues or questions:
- Check the test files for usage examples: `test/PredictionMarket.t.sol`
- Review the main contract: `src/PredictionMarket.sol`
- See the frontend integration files in `Frontend/contracts/` and `Frontend/hooks/`

## License

MIT License - See LICENSE file for details
