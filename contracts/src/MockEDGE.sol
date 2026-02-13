// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockEDGE
/// @notice Testnet ERC-20 representing $EDGE token.
///         Free mint for anyone to test tier levels.
///         On mainnet, replaced by the real $EDGE from nad.fun.
contract MockEDGE is ERC20, Ownable {
    constructor() ERC20("CrowdEdge", "EDGE") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }

    /// @notice Free mint — use this to test different tier levels
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
