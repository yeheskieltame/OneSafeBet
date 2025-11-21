// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PredictionMarket} from "../src/PredictionMarket.sol";

contract DeployPredictionMarketScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Get deployed Vault and QuestManager addresses from .env
        address vault = vm.envAddress("VAULT_ADDRESS");
        address questManager = vm.envAddress("QUEST_MANAGER_ADDRESS");

        console.log("========================================");
        console.log("Deploying PredictionMarket to Hedera Testnet");
        console.log("========================================");
        console.log("Vault Address:", vault);
        console.log("QuestManager Address:", questManager);
        console.log("Deployer:", vm.addr(deployerPrivateKey));

        vm.startBroadcast(deployerPrivateKey);

        PredictionMarket market = new PredictionMarket(vault, questManager);

        console.log("========================================");
        console.log("PredictionMarket deployed at:", address(market));
        console.log("Owner:", market.owner());
        console.log("Total Markets:", market.getTotalMarkets());
        console.log("========================================");
        console.log("SAVE THIS ADDRESS TO .env:");
        console.log("PREDICTION_MARKET_ADDRESS=%s", address(market));
        console.log("========================================");

        vm.stopBroadcast();
    }
}
