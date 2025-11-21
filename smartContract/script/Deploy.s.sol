// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Vault} from "../src/Vault.sol";
import {QuestManager} from "../src/QuestManager.sol";
import {ElementalGame} from "../src/ElementalGame.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("=== Deploying OneSafeBet Contracts ===");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("");

        Vault vault = new Vault();
        console.log("Vault deployed:", address(vault));

        QuestManager questManager = new QuestManager();
        console.log("QuestManager deployed:", address(questManager));

        ElementalGame game = new ElementalGame(address(vault), address(questManager));
        console.log("ElementalGame deployed:", address(game));

        console.log("");
        console.log("=== Configuring Contracts ===");

        vault.setGameContract(address(game));
        console.log("Vault configured");

        questManager.setAddresses(address(game), address(0), address(0), address(0));
        console.log("QuestManager configured");

        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("Vault:          ", address(vault));
        console.log("QuestManager:   ", address(questManager));
        console.log("ElementalGame:  ", address(game));
        console.log("");
        console.log("Current Round:  ", game.currentRoundId());

        vm.stopBroadcast();
    }
}
