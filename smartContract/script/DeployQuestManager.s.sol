// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {QuestManager} from "../src/QuestManager.sol";

contract DeployQuestManagerScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying QuestManager...");
        QuestManager questManager = new QuestManager();
        console.log("QuestManager deployed:", address(questManager));

        vm.stopBroadcast();
    }
}
