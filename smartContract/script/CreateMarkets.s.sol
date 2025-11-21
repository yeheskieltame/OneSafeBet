// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {PredictionMarket} from "../src/PredictionMarket.sol";

contract CreateMarketsScript is Script {
    function run() external {
        // Get the deployed PredictionMarket address from .env or hardcode it
        address payable predictionMarketAddress = payable(vm.envAddress("PREDICTION_MARKET_ADDRESS"));

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        PredictionMarket predictionMarket = PredictionMarket(predictionMarketAddress);

        console.log("Creating prediction markets...");

        // Market 1: Bitcoin Price Prediction
        uint256 market1 = predictionMarket.createMarket(
            "Will Bitcoin reach $150,000 by end of 2025?",
            "Crypto",
            90 days, // 3 months
            10 * 10**8 // 10 HBAR minimum (in tinybars)
        );
        console.log("Created Market 1 (Bitcoin): ID", market1);

        // Market 2: Ethereum Upgrade
        uint256 market2 = predictionMarket.createMarket(
            "Will Ethereum successfully complete the next major upgrade in Q2 2025?",
            "Technology",
            60 days, // 2 months
            5 * 10**8 // 5 HBAR minimum
        );
        console.log("Created Market 2 (Ethereum): ID", market2);

        // Market 3: Hedera Adoption
        uint256 market3 = predictionMarket.createMarket(
            "Will Hedera have more than 10 billion transactions by end of 2025?",
            "Crypto",
            120 days, // 4 months
            10 * 10**8 // 10 HBAR minimum
        );
        console.log("Created Market 3 (Hedera): ID", market3);

        // Market 4: Sports - World Cup
        uint256 market4 = predictionMarket.createMarket(
            "Will Argentina defend their World Cup title in 2026?",
            "Sports",
            180 days, // 6 months
            15 * 10**8 // 15 HBAR minimum
        );
        console.log("Created Market 4 (World Cup): ID", market4);

        // Market 5: AI Technology
        uint256 market5 = predictionMarket.createMarket(
            "Will OpenAI release GPT-5 in 2025?",
            "Technology",
            150 days, // 5 months
            10 * 10**8 // 10 HBAR minimum
        );
        console.log("Created Market 5 (AI): ID", market5);

        // Market 6: Crypto Regulation
        uint256 market6 = predictionMarket.createMarket(
            "Will the US approve a national crypto regulation framework in 2025?",
            "Politics",
            180 days, // 6 months
            20 * 10**8 // 20 HBAR minimum
        );
        console.log("Created Market 6 (Regulation): ID", market6);

        // Market 7: Space Exploration
        uint256 market7 = predictionMarket.createMarket(
            "Will SpaceX successfully land humans on Mars by 2027?",
            "Space",
            365 days, // 1 year
            25 * 10**8 // 25 HBAR minimum
        );
        console.log("Created Market 7 (Mars): ID", market7);

        // Market 8: DeFi
        uint256 market8 = predictionMarket.createMarket(
            "Will DeFi Total Value Locked (TVL) exceed $200B in 2025?",
            "Crypto",
            120 days, // 4 months
            10 * 10**8 // 10 HBAR minimum
        );
        console.log("Created Market 8 (DeFi): ID", market8);

        // Market 9: NFT Market
        uint256 market9 = predictionMarket.createMarket(
            "Will NFT trading volume recover to $5B+ monthly by end of 2025?",
            "Technology",
            90 days, // 3 months
            10 * 10**8 // 10 HBAR minimum
        );
        console.log("Created Market 9 (NFT): ID", market9);

        // Market 10: Climate
        uint256 market10 = predictionMarket.createMarket(
            "Will global carbon emissions decrease by 10% in 2025?",
            "Politics",
            365 days, // 1 year
            15 * 10**8 // 15 HBAR minimum
        );
        console.log("Created Market 10 (Climate): ID", market10);

        console.log("\n==============================================");
        console.log("Successfully created 10 prediction markets!");
        console.log("Total markets:", predictionMarket.getTotalMarkets());
        console.log("==============================================");

        vm.stopBroadcast();
    }
}
