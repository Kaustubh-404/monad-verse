// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CrowdEdgeVault.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = uint256(vm.envBytes32("PRIVATE_KEY"));

        vm.startBroadcast(deployerPrivateKey);

        CrowdEdgeVault vault = new CrowdEdgeVault();

        vm.stopBroadcast();

        console.log("CrowdEdgeVault deployed at:", address(vault));
        console.log("Add to .env: VAULT_CONTRACT=", address(vault));
    }
}
