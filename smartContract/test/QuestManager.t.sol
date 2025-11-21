// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/QuestManager.sol";

contract QuestManagerTest is Test {
    QuestManager public questManager;
    address public gameContract = address(0x123);
    address public user1 = address(0x456);
    address public noviceBadge = address(0x1001);
    address public loyalistBadge = address(0x1002);
    address public whaleBadge = address(0x1003);

    function setUp() public {
        questManager = new QuestManager();
        questManager.setAddresses(gameContract, noviceBadge, loyalistBadge, whaleBadge);
    }

    function testSetAddresses() public {
        assertEq(questManager.gameContract(), gameContract);
        assertEq(questManager.noviceBadge(), noviceBadge);
        assertEq(questManager.loyalistBadge(), loyalistBadge);
        assertEq(questManager.whaleBadge(), whaleBadge);
    }

    function testFirstWinBadge() public {
        vm.prank(gameContract);
        questManager.checkQuests(user1, 1000 * 1e8, true);

        assertEq(questManager.userTotalWins(user1), 1);
        assertEq(questManager.userWinStreak(user1), 1);
        assertTrue(questManager.hasBadge(user1, noviceBadge));
    }

    function testWinStreakBadge() public {
        vm.startPrank(gameContract);
        questManager.checkQuests(user1, 1000 * 1e8, true);
        questManager.checkQuests(user1, 1000 * 1e8, true);
        questManager.checkQuests(user1, 1000 * 1e8, true);
        vm.stopPrank();

        assertEq(questManager.userWinStreak(user1), 3);
        assertEq(questManager.userTotalWins(user1), 3);
        assertTrue(questManager.hasBadge(user1, loyalistBadge));
    }

    function testStreakResetOnLoss() public {
        vm.startPrank(gameContract);
        questManager.checkQuests(user1, 1000 * 1e8, true);
        questManager.checkQuests(user1, 1000 * 1e8, true);
        questManager.checkQuests(user1, 1000 * 1e8, false);
        vm.stopPrank();

        assertEq(questManager.userWinStreak(user1), 0);
        assertEq(questManager.userTotalWins(user1), 2);
        assertFalse(questManager.hasBadge(user1, loyalistBadge));
    }

    function testWhaleBadge() public {
        vm.prank(gameContract);
        questManager.checkQuests(user1, 10000 * 1e8, true);

        assertTrue(questManager.hasBadge(user1, whaleBadge));
    }

    function testGetUserStats() public {
        vm.startPrank(gameContract);
        questManager.checkQuests(user1, 1000 * 1e8, true);
        questManager.checkQuests(user1, 1000 * 1e8, true);
        vm.stopPrank();

        (uint256 wins, uint256 streak) = questManager.getUserStats(user1);
        assertEq(wins, 2);
        assertEq(streak, 2);
    }

    function testRevertWhenCheckQuestsNotGame() public {
        vm.expectRevert("Only game");
        vm.prank(user1);
        questManager.checkQuests(user1, 1000 * 1e8, true);
    }

    function testRevertWhenSetAddressesNotOwner() public {
        vm.expectRevert("Only owner");
        vm.prank(user1);
        questManager.setAddresses(gameContract, noviceBadge, loyalistBadge, whaleBadge);
    }
}
