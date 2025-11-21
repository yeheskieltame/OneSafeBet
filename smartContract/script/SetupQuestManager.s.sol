// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {QuestManager} from "../src/QuestManager.sol";

contract SetupQuestManagerScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        address questManagerAddr = 0x425e42F73B5bC6b665b2809AC350B8249CB93de6;
        address gameAddr = 0x6F00756F10cbDf14dbC05b43404ECaAf8d0dB73f;

        vm.startBroadcast(deployerPrivateKey);

        console.log("Setting up QuestManager...");
        QuestManager questManager = QuestManager(questManagerAddr);
        questManager.setAddresses(gameAddr, address(0), address(0), address(0));
        console.log("QuestManager configured with game:", gameAddr);

        vm.stopBroadcast();
    }
}
