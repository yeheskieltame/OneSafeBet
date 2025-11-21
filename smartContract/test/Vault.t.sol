// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Vault.sol";

contract VaultTest is Test {
    Vault public vault;
    address public user1 = address(0x123);
    address public user2 = address(0x456);
    address public gameContract = address(0x789);

    function setUp() public {
        vault = new Vault();
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
    }

    function testDeposit() public {
        vm.prank(user1);
        vault.deposit{value: 10 ether}();

        assertEq(vault.balances(user1), 10 ether);
        assertEq(vault.totalStaked(), 10 ether);
    }

    function testDepositMultipleUsers() public {
        vm.prank(user1);
        vault.deposit{value: 10 ether}();

        vm.prank(user2);
        vault.deposit{value: 5 ether}();

        assertEq(vault.balances(user1), 10 ether);
        assertEq(vault.balances(user2), 5 ether);
        assertEq(vault.totalStaked(), 15 ether);
    }

    function testWithdraw() public {
        vm.prank(user1);
        vault.deposit{value: 10 ether}();

        uint256 balanceBefore = user1.balance;

        vm.prank(user1);
        vault.withdraw(5 ether);

        assertEq(vault.balances(user1), 5 ether);
        assertEq(vault.totalStaked(), 5 ether);
        assertEq(user1.balance, balanceBefore + 5 ether);
    }

    function testRevertWhenWithdrawInsufficientBalance() public {
        vm.prank(user1);
        vault.deposit{value: 5 ether}();

        vm.expectRevert("Insufficient balance");
        vm.prank(user1);
        vault.withdraw(10 ether);
    }

    function testRevertWhenDepositZero() public {
        vm.expectRevert("Must deposit HBAR");
        vm.prank(user1);
        vault.deposit{value: 0}();
    }

    function testSetGameContract() public {
        vault.setGameContract(gameContract);
        assertEq(vault.gameContract(), gameContract);
    }

    function testRevertWhenSetGameContractNotOwner() public {
        vm.expectRevert("Only owner");
        vm.prank(user1);
        vault.setGameContract(gameContract);
    }

    function testGetBalance() public {
        vm.prank(user1);
        vault.deposit{value: 10 ether}();

        assertEq(vault.getBalance(user1), 10 ether);
        assertEq(vault.getBalance(user2), 0);
    }
}
