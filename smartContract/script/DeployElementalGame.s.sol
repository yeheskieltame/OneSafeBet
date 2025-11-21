// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ElementalGame} from "../src/ElementalGame.sol";

contract DeployElementalGameScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        address vault = 0x07D595FFA6DA87F2b0327195f6f16DD33661990e;
        address questManager = 0x425e42F73B5bC6b665b2809AC350B8249CB93de6;

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying ElementalGame...");
        console.log("Vault:", vault);
        console.log("QuestManager:", questManager);

        ElementalGame game = new ElementalGame(vault, questManager);
        console.log("ElementalGame deployed:", address(game));
        console.log("Current Round:", game.currentRoundId());

        vm.stopBroadcast();
    }
}
