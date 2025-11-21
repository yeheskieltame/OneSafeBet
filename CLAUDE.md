# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OneSafeBet is a gamified no-loss prediction platform built for Hedera. The project implements a "Yield Wars" concept where users stake their principal (which remains 100% safe) and use generated yield as "Battle Power" to play games and make predictions. The project consists of two main parts:

1. **Frontend**: Next.js 16 app with React 19, TypeScript, and Tailwind CSS
2. **Smart Contracts**: Solidity contracts for Hedera using Foundry

## Core Concept: The Elemental Triad

The main game mechanic is based on a circular hierarchy similar to rock-paper-scissors:
- **Ignis (Fire)** beats Zephyr, loses to Aqua
- **Aqua (Water)** beats Ignis, loses to Zephyr
- **Zephyr (Wind)** beats Aqua, loses to Ignis

Players commit "Battle Power" (yield from staked assets) to a faction. Winners share the yield pool proportionally to their contribution. Principal is never at risk - only the yield is used for gameplay.

## Smart Contract Architecture

The system is implemented with four modular contracts:

1. **Vault.sol**: Holds user principal deposits securely. No contract except the user can withdraw principal.
2. **QuestManager.sol**: Handles NFT badges and gamification using Hedera Token Service (HTS). Awards badges for achievements like first win, win streaks, and whale status.
3. **ElementalGame.sol**: Core game logic implementing the Triad mechanics, faction voting, round resolution, and reward distribution.
4. **PredictionMarket.sol**: Decentralized prediction market system where users create markets, vote YES/NO on predictions, and earn proportional rewards based on outcomes.

### Key Game Mechanics

- **Net Advantage Score**: Winner is determined by `(Target Faction Power - Predator Faction Power)`
  - Fire Score = Zephyr% - Aqua%
  - Water Score = Ignis% - Zephyr%
  - Wind Score = Aqua% - Ignis%
- **Power Voting**: Users' Battle Power is proportional to their staked balance in the Vault
- **Reward Distribution**: Winners receive share based on `(User Power / Total Winning Faction Power) * Yield Pool`

## Development Commands

### Frontend (Next.js)

```bash
cd Frontend
pnpm install        # Install dependencies
pnpm dev           # Run development server on http://localhost:3000
pnpm build         # Build for production
pnpm start         # Start production server
pnpm lint          # Run ESLint
```

### Smart Contracts (Foundry)

```bash
cd smartContract
forge build        # Compile contracts
forge test         # Run all tests
forge test --match-test testName  # Run specific test
forge fmt          # Format Solidity code
forge snapshot     # Generate gas snapshots

# Deploy (example - adjust RPC URL and private key)
forge script script/Counter.s.sol:CounterScript --rpc-url <rpc_url> --private-key <key>

# Interact with contracts
cast <subcommand>  # Swiss army knife for EVM interactions
```

## Frontend Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 with custom design system
- **Component Library**: Radix UI primitives with custom styling
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Font**: Orbitron (Google Fonts) for futuristic theme

### Key Routes
- `/` - Landing page with hero, dashboard preview, trending predictions
- `/games` - Game selection page
- `/games/elemental-triad` - Main Elemental Triad game interface
- `/games/prediction-market` - Prediction market game
- `/vault` - Asset management (deposit/withdraw HBAR, view Battle Power)
- `/missions` - Quest and achievement tracking
- `/docs` - Documentation

### Component Structure
- **app/**: Next.js App Router pages and layouts
- **components/**: React components
  - **ui/**: Reusable UI primitives (buttons, cards, dialogs, etc.)
  - Game-specific components (elemental-triad-game.tsx, prediction-game.tsx)
  - Layout components (floating-nav.tsx, hero-section.tsx)
- **hooks/**: Custom React hooks
- **lib/**: Utility functions (utils.ts with cn() for class merging)
- **styles/**: Global CSS

### Path Aliases
Use `@/` to import from the Frontend root:
```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

## Design System

### Color Scheme (Cosmic/Space Theme)
- **Primary**: Purple/violet tones
- **Chart Colors**:
  - chart-1 through chart-5 for data visualization
  - Faction colors: Red (Ignis), Blue (Aqua), Green (Zephyr)
- **Background**: Dark gradient (`bg-gradient-cosmic`)
- **Accents**: Yellow for Battle Power, Green for safety/vault

### Key Components
- All UI components follow Radix UI patterns with custom Tailwind styling
- Cards use glassmorphism effect: `bg-card/30 backdrop-blur-sm border-white/10`
- Buttons have gradient backgrounds for primary actions
- Animations use `framer-motion` for smooth transitions

## Important Implementation Notes

### Hedera Integration (Future Work)
- Use Hedera Token Service (HTS) precompiled contract at address `0x167`
- NFT badges require users to associate token IDs before minting
- Native staking will generate HBAR yield that converts to Battle Power

### Security Considerations
- Principal must NEVER be at risk - only yield is used for gameplay
- Smart contracts should use modifier guards (`onlyGame`, `onlyVault`)
- Vault contract should only allow withdrawals by the depositor
- Validate all user inputs in both frontend and contracts

### Testing
- Frontend: Currently no test framework configured
- Smart Contracts: Use Forge for testing (see smartContract/test/)
- When adding tests, follow the pattern in Counter.t.sol

## File References

Key files for understanding the system:
- `petunjuk.md`: Indonesian technical specification and contract architecture blueprint
- `smartContract/PREDICTION_MARKET.md`: Complete guide for PredictionMarket contract deployment and integration
- `Frontend/components/elemental-triad-game.tsx`: Main Elemental Triad game UI implementation
- `Frontend/components/prediction-game.tsx`: Prediction market UI implementation
- `Frontend/components/vault-card.tsx`: Vault deposit/withdraw interface
- `Frontend/contracts/PredictionMarket.ts`: PredictionMarket contract ABI and TypeScript types
- `Frontend/contracts/Vault.ts`: Vault contract ABI for frontend integration
- `Frontend/hooks/usePredictionMarket.ts`: Custom React hook for PredictionMarket contract interaction
- `smartContract/src/Vault.sol`: Principal deposit/withdrawal contract
- `smartContract/src/QuestManager.sol`: NFT badge and gamification system
- `smartContract/src/ElementalGame.sol`: Core game logic with Triad mechanics
- `smartContract/src/PredictionMarket.sol`: Prediction market contract with YES/NO voting
- `smartContract/src/IHederaTokenService.sol`: Interface for Hedera Token Service precompiled contract
- `smartContract/test/*.t.sol`: Comprehensive test suites for all contracts (22/22 tests passing for PredictionMarket)
- `smartContract/script/DeployPredictionMarket.s.sol`: Deployment script for PredictionMarket contract
