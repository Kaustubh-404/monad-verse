// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MockEDGE.sol";
import "../src/StrategyDAO.sol";

contract DeployAllScript is Script {
    function run() external {
        uint256 deployerPrivateKey = uint256(vm.envBytes32("PRIVATE_KEY"));

        vm.startBroadcast(deployerPrivateKey);

        MockEDGE edge = new MockEDGE();
        StrategyDAO dao = new StrategyDAO(address(edge));

        vm.stopBroadcast();
    }
}
