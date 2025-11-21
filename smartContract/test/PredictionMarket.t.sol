// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/PredictionMarket.sol";
import "../src/Vault.sol";
import "../src/QuestManager.sol";

contract PredictionMarketTest is Test {
    PredictionMarket public market;
    Vault public vault;
    QuestManager public questManager;

    address public owner = address(this);
    address public user1 = address(0x123);
    address public user2 = address(0x456);
    address public user3 = address(0x789);

    function setUp() public {
        vault = new Vault();
        questManager = new QuestManager();
        market = new PredictionMarket(address(vault), address(questManager));

        vault.setGameContract(address(market));
        questManager.setAddresses(
            address(market),
            address(0x1001),
            address(0x1002),
            address(0x1003)
        );

        // Give users some HBAR
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);

        // Users deposit to vault
        vm.prank(user1);
        vault.deposit{value: 50 ether}();

        vm.prank(user2);
        vault.deposit{value: 30 ether}();

        vm.prank(user3);
        vault.deposit{value: 20 ether}();
    }

    function testCreateMarket() public {
        uint256 marketId = market.createMarket(
            "Will Bitcoin hit $150,000 by end of 2025?",
            "Crypto",
            7 days,
            10 ether
        );

        assertEq(marketId, 1);
        assertEq(market.getTotalMarkets(), 1);

        PredictionMarket.Market memory m = market.getMarket(1);
        assertEq(m.id, 1);
        assertEq(m.question, "Will Bitcoin hit $150,000 by end of 2025?");
        assertEq(m.category, "Crypto");
        assertEq(m.minStake, 10 ether);
        assertTrue(m.isActive);
        assertFalse(m.isResolved);
    }

    function testCreateMultipleMarkets() public {
        market.createMarket("Question 1", "Crypto", 7 days, 10 ether);
        market.createMarket("Question 2", "Sports", 3 days, 5 ether);
        market.createMarket("Question 3", "Technology", 14 days, 20 ether);

        assertEq(market.getTotalMarkets(), 3);
    }

    function testVoteYes() public {
        market.createMarket("Will ETH upgrade succeed?", "Technology", 7 days, 10 ether);

        vm.prank(user1);
        market.vote(1, true, 20 ether);

        (uint8 choice, uint256 amount) = market.getUserVote(1, user1);
        assertEq(choice, 1); // 1 = YES
        assertEq(amount, 20 ether);

        PredictionMarket.Market memory m = market.getMarket(1);
        assertEq(m.yesPool, 20 ether);
        assertEq(m.yesVoters, 1);
        assertEq(m.noPool, 0);
    }

    function testVoteNo() public {
        market.createMarket("Will ETH upgrade succeed?", "Technology", 7 days, 10 ether);

        vm.prank(user2);
        market.vote(1, false, 15 ether);

        (uint8 choice, uint256 amount) = market.getUserVote(1, user2);
        assertEq(choice, 2); // 2 = NO
        assertEq(amount, 15 ether);

        PredictionMarket.Market memory m = market.getMarket(1);
        assertEq(m.noPool, 15 ether);
        assertEq(m.noVoters, 1);
        assertEq(m.yesPool, 0);
    }

    function testVoteMultipleUsers() public {
        market.createMarket("Will SpaceX succeed?", "Space", 7 days, 10 ether);

        vm.prank(user1);
        market.vote(1, true, 25 ether);

        vm.prank(user2);
        market.vote(1, false, 20 ether);

        vm.prank(user3);
        market.vote(1, true, 15 ether);

        PredictionMarket.Market memory m = market.getMarket(1);
        assertEq(m.yesPool, 40 ether);
        assertEq(m.noPool, 20 ether);
        assertEq(m.yesVoters, 2);
        assertEq(m.noVoters, 1);
    }

    function testRevertWhenVoteTwice() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        vm.startPrank(user1);
        market.vote(1, true, 20 ether);

        vm.expectRevert("Already voted");
        market.vote(1, false, 10 ether);
        vm.stopPrank();
    }

    function testRevertWhenVoteBelowMinStake() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        vm.expectRevert("Below minimum stake");
        vm.prank(user1);
        market.vote(1, true, 5 ether);
    }

    function testRevertWhenVoteInsufficientBattlePower() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        vm.expectRevert("Insufficient Battle Power");
        vm.prank(user1);
        market.vote(1, true, 100 ether); // user1 only has 50 ether
    }

    function testRevertWhenVoteAfterEnd() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        vm.warp(block.timestamp + 8 days);

        vm.expectRevert("Market ended");
        vm.prank(user1);
        market.vote(1, true, 20 ether);
    }

    function testResolveMarketYesWins() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        vm.prank(user1);
        market.vote(1, true, 30 ether);

        vm.prank(user2);
        market.vote(1, false, 20 ether);

        vm.warp(block.timestamp + 8 days);

        market.resolveMarket(1, true); // YES wins

        PredictionMarket.Market memory m = market.getMarket(1);
        assertTrue(m.isResolved);
        assertTrue(m.outcome);
    }

    function testResolveMarketNoWins() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        vm.prank(user1);
        market.vote(1, true, 30 ether);

        vm.prank(user2);
        market.vote(1, false, 20 ether);

        vm.warp(block.timestamp + 8 days);

        market.resolveMarket(1, false); // NO wins

        PredictionMarket.Market memory m = market.getMarket(1);
        assertTrue(m.isResolved);
        assertFalse(m.outcome);
    }

    function testRevertResolveBeforeEnd() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        vm.expectRevert("Market not ended yet");
        market.resolveMarket(1, true);
    }

    function testRevertResolveNonOwner() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        vm.warp(block.timestamp + 8 days);

        vm.expectRevert("Only owner");
        vm.prank(user1);
        market.resolveMarket(1, true);
    }

    function testClaimRewardWinner() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        // Fund the prize pool
        vm.deal(address(this), 100 ether);
        market.depositPrizePool{value: 60 ether}();

        vm.prank(user1);
        market.vote(1, true, 30 ether); // YES

        vm.prank(user2);
        market.vote(1, false, 20 ether); // NO

        vm.warp(block.timestamp + 8 days);
        market.resolveMarket(1, true); // YES wins

        uint256 balanceBefore = user1.balance;

        vm.prank(user1);
        market.claimReward(1);

        // Winner should receive their share of total pool
        assertGt(user1.balance, balanceBefore);
    }

    function testClaimRewardLoser() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        vm.deal(address(this), 100 ether);
        market.depositPrizePool{value: 60 ether}();

        vm.prank(user1);
        market.vote(1, true, 30 ether); // YES

        vm.prank(user2);
        market.vote(1, false, 20 ether); // NO

        vm.warp(block.timestamp + 8 days);
        market.resolveMarket(1, false); // NO wins (user1 loses)

        uint256 balanceBefore = user1.balance;

        vm.prank(user1);
        market.claimReward(1);

        // Loser should not receive any reward
        assertEq(user1.balance, balanceBefore);
    }

    function testRevertClaimBeforeResolve() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        vm.prank(user1);
        market.vote(1, true, 20 ether);

        vm.expectRevert("Market not resolved");
        vm.prank(user1);
        market.claimReward(1);
    }

    function testRevertClaimTwice() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        vm.deal(address(this), 100 ether);
        market.depositPrizePool{value: 60 ether}();

        vm.prank(user1);
        market.vote(1, true, 30 ether);

        vm.prank(user2);
        market.vote(1, false, 20 ether);

        vm.warp(block.timestamp + 8 days);
        market.resolveMarket(1, true);

        vm.startPrank(user1);
        market.claimReward(1);

        vm.expectRevert("Already claimed");
        market.claimReward(1);
        vm.stopPrank();
    }

    function testRevertClaimWithoutVoting() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        vm.prank(user1);
        market.vote(1, true, 20 ether);

        vm.warp(block.timestamp + 8 days);
        market.resolveMarket(1, true);

        vm.expectRevert("Did not vote");
        vm.prank(user3);
        market.claimReward(1);
    }

    function testCalculatePotentialWin() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        vm.prank(user1);
        market.vote(1, true, 30 ether);

        uint256 potentialWin = market.calculatePotentialWin(1, false, 20 ether);
        assertGt(potentialWin, 0);
    }

    function testDeactivateMarket() public {
        market.createMarket("Question", "Category", 7 days, 10 ether);

        market.deactivateMarket(1);

        PredictionMarket.Market memory m = market.getMarket(1);
        assertFalse(m.isActive);

        vm.expectRevert("Market not active");
        vm.prank(user1);
        market.vote(1, true, 20 ether);
    }

    function testDepositPrizePool() public {
        vm.deal(address(this), 100 ether);
        market.depositPrizePool{value: 50 ether}();

        assertEq(address(market).balance, 50 ether);
    }

    function testReceiveFunction() public {
        vm.deal(user1, 100 ether);

        vm.prank(user1);
        (bool success,) = address(market).call{value: 10 ether}("");

        assertTrue(success);
        assertEq(address(market).balance, 10 ether);
    }
}
