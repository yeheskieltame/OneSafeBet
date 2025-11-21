# Deployment Information

## Hedera Testnet

**Deployed:** November 21, 2025
**Chain ID:** 296

### Contract Addresses

| Contract | Address | Status |
|----------|---------|--------|
| **Vault** | `0x07D595FFA6DA87F2b0327195f6f16DD33661990e` |  |
| **QuestManager** | `0x425e42F73B5bC6b665b2809AC350B8249CB93de6` | |
| **ElementalGame** | `0x6F00756F10cbDf14dbC05b43404ECaAf8d0dB73f` |  |

### Configuration

✅ **Vault** connected to ElementalGame
✅ **QuestManager** connected to ElementalGame
✅ **ElementalGame** Round 1 active

### HashScan Explorer

- [Vault Contract](https://hashscan.io/testnet/contract/0x07D595FFA6DA87F2b0327195f6f16DD33661990e)
- [QuestManager Contract](https://hashscan.io/testnet/contract/0x425e42F73B5bC6b665b2809AC350B8249CB93de6)
- [ElementalGame Contract](https://hashscan.io/testnet/contract/0x6F00756F10cbDf14dbC05b43404ECaAf8d0dB73f)

### Verification Status

All contracts verified on Sourcify ✅

### Next Steps

1. Update Frontend with contract addresses
2. Create NFT Badge tokens (optional)
3. Configure badge addresses in QuestManager
4. Deposit initial yield to start game

### Commands to Verify

```bash
# Check current round
cast call 0x6F00756F10cbDf14dbC05b43404ECaAf8d0dB73f \
  "currentRoundId()" \
  --rpc-url hedera_testnet

# Check Vault game contract
cast call 0x07D595FFA6DA87F2b0327195f6f16DD33661990e \
  "gameContract()" \
  --rpc-url hedera_testnet

# Check QuestManager game contract
cast call 0x425e42F73B5bC6b665b2809AC350B8249CB93de6 \
  "gameContract()" \
  --rpc-url hedera_testnet
```

### Deployer

`0xE610b819dd190Fc8154d0190BB3F3e9758d42bAa`
