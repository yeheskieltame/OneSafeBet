# OneSafeBet Smart Contracts

Clean, simple, and secure smart contracts for the OneSafeBet GameFi platform on Hedera.

## Contracts

### 1. Vault.sol
Secure storage for user deposits (principal). Users can deposit and withdraw at any time.

- `deposit()` - Deposit HBAR
- `withdraw(uint256 amount)` - Withdraw HBAR
- `getBalance(address user)` - Check balance

### 2. QuestManager.sol
Tracks user achievements and awards badges.

- Novice Badge: First win
- Loyalist Badge: 3-win streak
- Whale Badge: 10,000+ HBAR deposit

### 3. ElementalGame.sol
Core game logic for Elemental Triad (Fire, Water, Wind).

- `vote(uint8 faction)` - Vote for a faction
- `resolveRound()` - Resolve round and determine winner
- `claimReward(uint256 roundId)` - Claim rewards

## Development

### Build
```bash
forge build
```

### Test
```bash
forge test
forge test -vv  # with logs
```

### Deploy to Hedera Testnet
```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url hedera_testnet --broadcast --legacy
```

### Deploy to Hedera Mainnet
```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url hedera_mainnet --broadcast --legacy
```

## Configuration

Copy `.env.example` to `.env` and add your private key:
```bash
cp .env.example .env
```

## Architecture

```
┌─────────────┐
│   Vault     │ ← User deposits (safe)
└──────┬──────┘
       │
       ├────────┐
       │        │
┌──────▼──────┐ │
│ Elemental   │ │
│   Game      │◄┘
└──────┬──────┘
       │
┌──────▼──────┐
│   Quest     │
│  Manager    │
└─────────────┘
```

## Security

- Principal is 100% safe in Vault
- Only yield is used for gaming
- All contracts tested
- Clean, simple code
