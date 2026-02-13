// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title StrategyDAO
/// @notice Tiered strategy release system.
///         Agent publishes AI-generated DeFi strategies from Polymarket signals.
///         Token holders get earlier access based on their $EDGE balance.
contract StrategyDAO is Ownable {

    // ─── Tier thresholds (18 decimals) ───────────────────────────────────────
    uint256 public constant TIER1_THRESHOLD = 10_000 * 1e18; // Whale
    uint256 public constant TIER2_THRESHOLD =  1_000 * 1e18; // Dolphin
    uint256 public constant TIER3_THRESHOLD =    100 * 1e18; // Shrimp

    // ─── Tier unlock delays ───────────────────────────────────────────────────
    uint256 public constant TIER1_DELAY = 0;
    uint256 public constant TIER2_DELAY = 24 hours;
    uint256 public constant TIER3_DELAY = 48 hours;
    uint256 public constant TIER4_DELAY = 72 hours;

    // ─── State ────────────────────────────────────────────────────────────────
    IERC20 public edgeToken;

    struct Strategy {
        uint256 id;
        string  marketSlug;         // Polymarket slug → links to market
        string  question;           // Full question text
        string  signal;             // "YES" or "NO"
        uint256 probability;        // Entry probability 0-100
        uint256 confidence;         // LLM confidence 0-100
        string  strategyType;       // e.g. RISK_OFF, LONG_ETH, STABLE_YIELD
        string  description;        // LLM-generated strategy explanation
        uint256 publishedAt;        // block.timestamp when added
        bool    active;
    }

    Strategy[] public strategies;

    // ─── Events ───────────────────────────────────────────────────────────────
    event StrategyAdded(
        uint256 indexed id,
        string  question,
        string  strategyType,
        uint256 confidence,
        uint256 publishedAt
    );

    constructor(address _edgeToken) Ownable(msg.sender) {
        edgeToken = IERC20(_edgeToken);
    }

    // ─── Tier logic ───────────────────────────────────────────────────────────

    function getTier(address user) public view returns (uint256) {
        uint256 bal = edgeToken.balanceOf(user);
        if (bal >= TIER1_THRESHOLD) return 1;
        if (bal >= TIER2_THRESHOLD) return 2;
        if (bal >= TIER3_THRESHOLD) return 3;
        return 4;
    }

    function tierDelay(uint256 tier) public pure returns (uint256) {
        if (tier == 1) return TIER1_DELAY;
        if (tier == 2) return TIER2_DELAY;
        if (tier == 3) return TIER3_DELAY;
        return TIER4_DELAY;
    }

    /// @notice Returns unix timestamp when strategy unlocks for this user
    function unlockTime(uint256 strategyId, address user) public view returns (uint256) {
        require(strategyId < strategies.length, "Invalid id");
        uint256 tier = getTier(user);
        return strategies[strategyId].publishedAt + tierDelay(tier);
    }

    /// @notice Whether the user can currently see this strategy in full
    function canAccess(uint256 strategyId, address user) public view returns (bool) {
        return block.timestamp >= unlockTime(strategyId, user);
    }

    // ─── Agent writes ─────────────────────────────────────────────────────────

    function addStrategy(
        string memory _marketSlug,
        string memory _question,
        string memory _signal,
        uint256 _probability,
        uint256 _confidence,
        string memory _strategyType,
        string memory _description
    ) external onlyOwner returns (uint256) {
        uint256 id = strategies.length;

        strategies.push(Strategy({
            id:           id,
            marketSlug:   _marketSlug,
            question:     _question,
            signal:       _signal,
            probability:  _probability,
            confidence:   _confidence,
            strategyType: _strategyType,
            description:  _description,
            publishedAt:  block.timestamp,
            active:       true
        }));

        emit StrategyAdded(id, _question, _strategyType, _confidence, block.timestamp);
        return id;
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getStrategy(uint256 id) external view returns (Strategy memory) {
        require(id < strategies.length, "Invalid id");
        return strategies[id];
    }

    function getStrategyCount() external view returns (uint256) {
        return strategies.length;
    }

    function getLatestStrategies(uint256 n) external view returns (Strategy[] memory) {
        uint256 total = strategies.length;
        uint256 count = n > total ? total : n;
        Strategy[] memory result = new Strategy[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = strategies[total - count + i];
        }
        return result;
    }
}
