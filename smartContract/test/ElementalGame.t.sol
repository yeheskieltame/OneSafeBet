// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/ElementalGame.sol";
import "../src/Vault.sol";
import "../src/QuestManager.sol";

contract ElementalGameTest is Test {
    ElementalGame public game;
    Vault public vault;
    QuestManager public questManager;

    address public user1 = address(0x123);
    address public user2 = address(0x456);
    address public user3 = address(0x789);

    uint8 constant FIRE = 1;
    uint8 constant WATER = 2;
    uint8 constant WIND = 3;

    function setUp() public {
        vault = new Vault();
        questManager = new QuestManager();
        game = new ElementalGame(address(vault), address(questManager));

        vault.setGameContract(address(game));
        questManager.setAddresses(
            address(game),
            address(0x1001),
            address(0x1002),
            address(0x1003)
        );

        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);

        vm.prank(user1);
        vault.deposit{value: 30 ether}();

        vm.prank(user2);
        vault.deposit{value: 20 ether}();

        vm.prank(user3);
        vault.deposit{value: 10 ether}();
    }

    function testInitialRoundCreated() public {
        assertEq(game.currentRoundId(), 1);
        (uint256 id, , , , , , , , , bool isResolved) = game.rounds(1);
        assertEq(id, 1);
        assertFalse(isResolved);
    }

    function testVote() public {
        vm.prank(user1);
        game.vote(FIRE);

        assertEq(game.userVotes(1, user1), FIRE);
        (, , , , uint256 firePower, , , , , ) = game.rounds(1);
        assertEq(firePower, 30 ether);
    }

    function testVoteMultipleUsers() public {
        vm.prank(user1);
        game.vote(FIRE);

        vm.prank(user2);
        game.vote(WATER);

        vm.prank(user3);
        game.vote(FIRE);

        (, , , , uint256 firePower, uint256 waterPower, , , , ) = game.rounds(1);
        assertEq(firePower, 40 ether);
        assertEq(waterPower, 20 ether);
    }

    function testRevertWhenVoteTwice() public {
        vm.startPrank(user1);
        game.vote(FIRE);
        vm.expectRevert("Already voted");
        game.vote(WATER);
        vm.stopPrank();
    }

    function testRevertWhenVoteWithoutStake() public {
        address noStakeUser = address(0x99);
        vm.expectRevert("No staked balance");
        vm.prank(noStakeUser);
        game.vote(FIRE);
    }

    function testRevertWhenVoteInvalidFaction() public {
        vm.expectRevert("Invalid faction");
        vm.prank(user1);
        game.vote(4);
    }

    function testDepositYield() public {
        vm.deal(address(this), 100 ether);
        game.depositYield{value: 50 ether}();

        (, , , , , , , uint256 yieldPot, , ) = game.rounds(1);
        assertEq(yieldPot, 50 ether);
    }

    function testResolveRound() public {
        vm.prank(user1);
        game.vote(FIRE);

        vm.prank(user2);
        game.vote(WATER);

        vm.prank(user3);
        game.vote(WIND);

        vm.warp(block.timestamp + 8 days);
        game.resolveRound();

        (, , , , , , , , , bool isResolved) = game.rounds(1);
        assertTrue(isResolved);
        assertEq(game.currentRoundId(), 2);
    }

    function testClaimRewardWinner() public {
        vm.prank(user1);
        game.vote(FIRE);

        vm.prank(user2);
        game.vote(WATER);

        vm.deal(address(this), 100 ether);
        game.depositYield{value: 60 ether}();

        vm.warp(block.timestamp + 8 days);
        game.resolveRound();

        (, , , , , , , , uint8 winner, ) = game.rounds(1);

        uint256 balanceBefore = user1.balance;

        if (winner == FIRE) {
            vm.prank(user1);
            game.claimReward(1);
            assertGt(user1.balance, balanceBefore);
        } else if (winner == WATER) {
            vm.prank(user2);
            game.claimReward(1);
            assertGt(user2.balance, balanceBefore);
        }
    }

    function testRevertWhenClaimBeforeResolve() public {
        vm.prank(user1);
        game.vote(FIRE);

        vm.expectRevert("Round not finished");
        vm.prank(user1);
        game.claimReward(1);
    }

    function testRevertWhenClaimTwice() public {
        vm.prank(user1);
        game.vote(FIRE);

        vm.deal(address(this), 100 ether);
        game.depositYield{value: 60 ether}();

        vm.warp(block.timestamp + 8 days);
        game.resolveRound();

        (, , , , , , , , uint8 winner, ) = game.rounds(1);

        if (winner == FIRE) {
            vm.startPrank(user1);
            game.claimReward(1);
            vm.expectRevert("Already Claimed");
            game.claimReward(1);
            vm.stopPrank();
        } else {
            vm.skip(true);
        }
    }

    function testGetRoundInfo() public {
        ElementalGame.Round memory round = game.getRoundInfo(1);
        assertEq(round.id, 1);
        assertFalse(round.isResolved);
    }

    function testGetUserVote() public {
        vm.prank(user1);
        game.vote(FIRE);

        uint8 vote = game.getUserVote(1, user1);
        assertEq(vote, FIRE);
    }

    function testRevertWhenVoteAfterLock() public {
        vm.warp(block.timestamp + 6 days);

        vm.expectRevert("Round locked");
        vm.prank(user1);
        game.vote(FIRE);
    }
}
