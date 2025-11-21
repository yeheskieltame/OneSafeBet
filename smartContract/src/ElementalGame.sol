// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Vault} from "./Vault.sol";
import {QuestManager} from "./QuestManager.sol";

contract ElementalGame {
    Vault public vault;
    QuestManager public questManager;
    address public owner;

    uint8 constant FIRE = 1;
    uint8 constant WATER = 2;
    uint8 constant WIND = 3;

    struct Round {
        uint256 id;
        uint256 startTime;
        uint256 lockTime;
        uint256 endTime;
        uint256 totalPowerFire;
        uint256 totalPowerWater;
        uint256 totalPowerWind;
        uint256 totalYieldPot;
        uint8 winningFaction;
        bool isResolved;
    }

    uint256 public currentRoundId;
    mapping(uint256 => Round) public rounds;
    mapping(uint256 => mapping(address => uint8)) public userVotes;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    event RoundStarted(uint256 indexed roundId, uint256 startTime, uint256 lockTime, uint256 endTime);
    event Voted(uint256 indexed roundId, address indexed user, uint8 faction, uint256 power);
    event RoundResolved(uint256 indexed roundId, uint8 winningFaction);
    event RewardClaimed(uint256 indexed roundId, address indexed user, uint256 amount);
    event YieldDeposited(uint256 indexed roundId, uint256 amount);

    constructor(address _vault, address _questManager) {
        vault = Vault(_vault);
        questManager = QuestManager(_questManager);
        owner = msg.sender;
        _startNewRound();
    }

    function depositYield() external payable {
        require(msg.value > 0, "Must deposit yield");
        rounds[currentRoundId].totalYieldPot += msg.value;
        emit YieldDeposited(currentRoundId, msg.value);
    }

    function vote(uint8 faction) external {
        Round storage r = rounds[currentRoundId];
        require(block.timestamp < r.lockTime, "Round locked");
        require(faction >= 1 && faction <= 3, "Invalid faction");
        require(userVotes[currentRoundId][msg.sender] == 0, "Already voted");

        uint256 userPower = vault.getBalance(msg.sender);
        require(userPower > 0, "No staked balance");

        userVotes[currentRoundId][msg.sender] = faction;

        if (faction == FIRE) {
            r.totalPowerFire += userPower;
        } else if (faction == WATER) {
            r.totalPowerWater += userPower;
        } else if (faction == WIND) {
            r.totalPowerWind += userPower;
        }

        emit Voted(currentRoundId, msg.sender, faction, userPower);
    }

    function resolveRound() external {
        Round storage r = rounds[currentRoundId];
        require(block.timestamp >= r.endTime, "Round not over");
        require(!r.isResolved, "Already resolved");

        uint256 totalPower = r.totalPowerFire + r.totalPowerWater + r.totalPowerWind;

        if (totalPower > 0) {
            int256 firePct = int256((r.totalPowerFire * 10000) / totalPower);
            int256 waterPct = int256((r.totalPowerWater * 10000) / totalPower);
            int256 windPct = int256((r.totalPowerWind * 10000) / totalPower);

            int256 fireScore = windPct - waterPct;
            int256 waterScore = firePct - windPct;
            int256 windScore = waterPct - firePct;

            if (fireScore > waterScore && fireScore > windScore) {
                r.winningFaction = FIRE;
            } else if (waterScore > fireScore && waterScore > windScore) {
                r.winningFaction = WATER;
            } else if (windScore > fireScore && windScore > waterScore) {
                r.winningFaction = WIND;
            } else {
                r.winningFaction = 0;
            }
        }

        r.isResolved = true;
        emit RoundResolved(currentRoundId, r.winningFaction);
        _startNewRound();
    }

    function claimReward(uint256 roundId) external {
        Round storage r = rounds[roundId];
        require(r.isResolved, "Round not finished");
        require(!hasClaimed[roundId][msg.sender], "Already claimed");
        require(r.winningFaction != 0, "No winner");

        uint8 userChoice = userVotes[roundId][msg.sender];
        require(userChoice != 0, "Did not vote");

        bool isWinner = (userChoice == r.winningFaction);
        uint256 userBalance = vault.getBalance(msg.sender);

        questManager.checkQuests(msg.sender, userBalance, isWinner);
        hasClaimed[roundId][msg.sender] = true;

        if (isWinner) {
            uint256 winningTotalPower;
            if (r.winningFaction == FIRE) {
                winningTotalPower = r.totalPowerFire;
            } else if (r.winningFaction == WATER) {
                winningTotalPower = r.totalPowerWater;
            } else if (r.winningFaction == WIND) {
                winningTotalPower = r.totalPowerWind;
            }

            require(winningTotalPower > 0, "No winning power");
            uint256 share = (userBalance * r.totalYieldPot) / winningTotalPower;

            if (share > 0) {
                payable(msg.sender).transfer(share);
                emit RewardClaimed(roundId, msg.sender, share);
            }
        }
    }

    function _startNewRound() internal {
        currentRoundId++;
        rounds[currentRoundId] = Round({
            id: currentRoundId,
            startTime: block.timestamp,
            lockTime: block.timestamp + 5 days,
            endTime: block.timestamp + 7 days,
            totalPowerFire: 0,
            totalPowerWater: 0,
            totalPowerWind: 0,
            totalYieldPot: 0,
            winningFaction: 0,
            isResolved: false
        });
        emit RoundStarted(currentRoundId, block.timestamp, block.timestamp + 5 days, block.timestamp + 7 days);
    }

    function getRoundInfo(uint256 roundId) external view returns (Round memory) {
        return rounds[roundId];
    }

    function getUserVote(uint256 roundId, address user) external view returns (uint8) {
        return userVotes[roundId][user];
    }
}
