// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract QuestManager {
    address public owner;
    address public gameContract;

    address public noviceBadge;
    address public loyalistBadge;
    address public whaleBadge;

    mapping(address => uint256) public userWinStreak;
    mapping(address => uint256) public userTotalWins;
    mapping(address => mapping(address => bool)) public hasBadge;

    event QuestCompleted(address indexed user, address indexed badge, string questType);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyGame() {
        require(msg.sender == gameContract, "Only game");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setAddresses(
        address _game,
        address _novice,
        address _loyalist,
        address _whale
    ) external onlyOwner {
        gameContract = _game;
        noviceBadge = _novice;
        loyalistBadge = _loyalist;
        whaleBadge = _whale;
    }

    function checkQuests(
        address user,
        uint256 depositAmount,
        bool isWin
    ) external onlyGame {
        if (isWin) {
            userWinStreak[user]++;
            userTotalWins[user]++;
        } else {
            userWinStreak[user] = 0;
        }

        if (userTotalWins[user] == 1 && !hasBadge[user][noviceBadge]) {
            _awardBadge(user, noviceBadge, "First Win");
        }

        if (userWinStreak[user] == 3 && !hasBadge[user][loyalistBadge]) {
            _awardBadge(user, loyalistBadge, "Win Streak");
        }

        if (depositAmount >= 10000 * 1e8 && !hasBadge[user][whaleBadge]) {
            _awardBadge(user, whaleBadge, "Whale");
        }
    }

    function _awardBadge(address user, address badge, string memory questType) internal {
        hasBadge[user][badge] = true;
        emit QuestCompleted(user, badge, questType);
    }

    function getUserStats(address user) external view returns (uint256 wins, uint256 streak) {
        return (userTotalWins[user], userWinStreak[user]);
    }
}
