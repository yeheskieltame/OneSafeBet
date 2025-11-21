// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Vault} from "../src/Vault.sol";
import {QuestManager} from "../src/QuestManager.sol";

contract ConfigureScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        address vaultAddr = 0x07D595FFA6DA87F2b0327195f6f16DD33661990e;
        address questManagerAddr = 0x425e42F73B5bC6b665b2809AC350B8249CB93de6;
        address gameAddr = 0x6F00756F10cbDf14dbC05b43404ECaAf8d0dB73f;

        vm.startBroadcast(deployerPrivateKey);

        console.log("=== Configuring Contracts ===");

        Vault vault = Vault(vaultAddr);
        vault.setGameContract(gameAddr);
        console.log("Vault configured");

        QuestManager questManager = QuestManager(questManagerAddr);
        questManager.setAddresses(gameAddr, address(0), address(0), address(0));
        console.log("QuestManager configured");

        console.log("");
        console.log("=== Configuration Complete ===");

        vm.stopBroadcast();
    }
}
