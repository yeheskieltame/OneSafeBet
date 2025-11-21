// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Vault} from "./Vault.sol";
import {QuestManager} from "./QuestManager.sol";

contract PredictionMarket {
    Vault public vault;
    QuestManager public questManager;
    address public owner;

    struct Market {
        uint256 id;
        string question;
        string category;
        uint256 createdAt;
        uint256 endTime;
        uint256 yesPool;
        uint256 noPool;
        uint256 yesVoters;
        uint256 noVoters;
        uint256 minStake;
        bool isResolved;
        bool outcome; // true = YES wins, false = NO wins
        bool isActive;
    }

    uint256 public marketCounter;
    mapping(uint256 => Market) public markets;

    // marketId => user => vote choice (1 = YES, 2 = NO)
    mapping(uint256 => mapping(address => uint8)) public userVotes;

    // marketId => user => amount staked
    mapping(uint256 => mapping(address => uint256)) public userStakes;

    // marketId => user => has claimed reward
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    event MarketCreated(
        uint256 indexed marketId,
        string question,
        string category,
        uint256 endTime,
        uint256 minStake
    );

    event VoteCast(
        uint256 indexed marketId,
        address indexed user,
        bool choice, // true = YES, false = NO
        uint256 amount
    );

    event MarketResolved(
        uint256 indexed marketId,
        bool outcome,
        uint256 totalPool
    );

    event RewardClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _vault, address _questManager) {
        vault = Vault(_vault);
        questManager = QuestManager(_questManager);
        owner = msg.sender;
    }

    /**
     * @notice Create a new prediction market
     * @param question The question to predict
     * @param category Market category (e.g., "Crypto", "Sports", "Technology")
     * @param duration Duration in seconds until market ends
     * @param minStake Minimum stake amount in Battle Power
     */
    function createMarket(
        string memory question,
        string memory category,
        uint256 duration,
        uint256 minStake
    ) external returns (uint256) {
        require(duration > 0, "Invalid duration");
        require(minStake > 0, "Invalid min stake");

        marketCounter++;
        uint256 marketId = marketCounter;

        markets[marketId] = Market({
            id: marketId,
            question: question,
            category: category,
            createdAt: block.timestamp,
            endTime: block.timestamp + duration,
            yesPool: 0,
            noPool: 0,
            yesVoters: 0,
            noVoters: 0,
            minStake: minStake,
            isResolved: false,
            outcome: false,
            isActive: true
        });

        emit MarketCreated(marketId, question, category, block.timestamp + duration, minStake);
        return marketId;
    }

    /**
     * @notice Vote on a prediction market
     * @param marketId ID of the market
     * @param choice true for YES, false for NO
     * @param amount Amount of Battle Power to stake (from Vault balance)
     */
    function vote(uint256 marketId, bool choice, uint256 amount) external {
        Market storage market = markets[marketId];

        require(market.isActive, "Market not active");
        require(block.timestamp < market.endTime, "Market ended");
        require(!market.isResolved, "Market already resolved");
        require(userVotes[marketId][msg.sender] == 0, "Already voted");
        require(amount >= market.minStake, "Below minimum stake");

        // Check user has enough Battle Power in Vault
        uint256 userPower = vault.getBalance(msg.sender);
        require(userPower >= amount, "Insufficient Battle Power");

        // Record vote
        userVotes[marketId][msg.sender] = choice ? 1 : 2;
        userStakes[marketId][msg.sender] = amount;

        // Update pools
        if (choice) {
            market.yesPool += amount;
            market.yesVoters++;
        } else {
            market.noPool += amount;
            market.noVoters++;
        }

        emit VoteCast(marketId, msg.sender, choice, amount);
    }

    /**
     * @notice Resolve a market and determine the outcome
     * @param marketId ID of the market
     * @param outcome true if YES wins, false if NO wins
     */
    function resolveMarket(uint256 marketId, bool outcome) external onlyOwner {
        Market storage market = markets[marketId];

        require(market.isActive, "Market not active");
        require(block.timestamp >= market.endTime, "Market not ended yet");
        require(!market.isResolved, "Already resolved");

        market.isResolved = true;
        market.outcome = outcome;

        uint256 totalPool = market.yesPool + market.noPool;
        emit MarketResolved(marketId, outcome, totalPool);
    }

    /**
     * @notice Claim rewards from a resolved market
     * @param marketId ID of the market
     */
    function claimReward(uint256 marketId) external {
        Market storage market = markets[marketId];

        require(market.isResolved, "Market not resolved");
        require(!hasClaimed[marketId][msg.sender], "Already claimed");

        uint8 userChoice = userVotes[marketId][msg.sender];
        require(userChoice != 0, "Did not vote");

        hasClaimed[marketId][msg.sender] = true;

        // Check if user won
        bool userWon = (userChoice == 1 && market.outcome) || (userChoice == 2 && !market.outcome);

        uint256 userStake = userStakes[marketId][msg.sender];
        uint256 userBalance = vault.getBalance(msg.sender);

        // Trigger quest check
        questManager.checkQuests(msg.sender, userBalance, userWon);

        if (userWon) {
            uint256 winningPool = market.outcome ? market.yesPool : market.noPool;
            uint256 totalPool = market.yesPool + market.noPool;

            require(winningPool > 0, "No winning pool");

            // Calculate reward: user's share of total pool
            // Formula: (userStake / winningPool) * totalPool
            uint256 reward = (userStake * totalPool) / winningPool;

            // Transfer reward (assuming contract holds the prize pool)
            if (address(this).balance >= reward) {
                payable(msg.sender).transfer(reward);
                emit RewardClaimed(marketId, msg.sender, reward);
            }
        } else {
            // User lost, emit event with 0 reward
            emit RewardClaimed(marketId, msg.sender, 0);
        }
    }

    /**
     * @notice Deposit yield/prize pool for markets
     */
    function depositPrizePool() external payable {
        require(msg.value > 0, "Must deposit funds");
    }

    /**
     * @notice Get market details
     * @param marketId ID of the market
     */
    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    /**
     * @notice Get user's vote on a market
     * @param marketId ID of the market
     * @param user User address
     */
    function getUserVote(uint256 marketId, address user) external view returns (uint8, uint256) {
        return (userVotes[marketId][user], userStakes[marketId][user]);
    }

    /**
     * @notice Calculate potential win for a user
     * @param marketId ID of the market
     * @param choice true for YES, false for NO
     * @param amount Amount to stake
     */
    function calculatePotentialWin(
        uint256 marketId,
        bool choice,
        uint256 amount
    ) external view returns (uint256) {
        Market storage market = markets[marketId];

        uint256 currentPool = choice ? market.yesPool : market.noPool;
        uint256 newPool = currentPool + amount;
        uint256 totalPool = market.yesPool + market.noPool + amount;

        if (newPool == 0) return 0;

        return (amount * totalPool) / newPool;
    }

    /**
     * @notice Deactivate a market (emergency only)
     * @param marketId ID of the market
     */
    function deactivateMarket(uint256 marketId) external onlyOwner {
        markets[marketId].isActive = false;
    }

    /**
     * @notice Get total number of markets
     */
    function getTotalMarkets() external view returns (uint256) {
        return marketCounter;
    }

    /**
     * @notice Allow contract to receive HBAR for prize pools
     */
    receive() external payable {}
}
