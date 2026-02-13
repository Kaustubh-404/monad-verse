// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title CrowdEdgeVault
/// @notice Public on-chain ledger of the CrowdEdge agent's paper trades.
///         No user funds are ever held here. Everything is verifiable.
contract CrowdEdgeVault is Ownable {

    struct Position {
        string  marketId;           // Polymarket condition_id
        string  marketQuestion;     // Human-readable question
        string  action;             // "YES" or "NO"
        uint256 entryProbability;   // 0-100
        uint256 paperAmountUSD;     // Always 10 (paper $10)
        string  reasoning;          // LLM reasoning
        uint256 openedAt;           // block.timestamp
        bool    resolved;
        bool    wasCorrect;
    }

    Position[] public positions;
    uint256 public totalResolved;
    uint256 public totalWins;

    event PositionOpened(
        uint256 indexed id,
        string  marketId,
        string  action,
        uint256 entryProbability,
        string  reasoning
    );

    event PositionResolved(
        uint256 indexed id,
        bool    wasCorrect
    );

    constructor() Ownable(msg.sender) {}

    /// @notice Agent records a new paper trade
    function logPosition(
        string memory _marketId,
        string memory _question,
        string memory _action,
        uint256 _entryProbability,
        string memory _reasoning
    ) external onlyOwner {
        require(_entryProbability <= 100, "Probability out of range");

        uint256 id = positions.length;

        positions.push(Position({
            marketId:         _marketId,
            marketQuestion:   _question,
            action:           _action,
            entryProbability: _entryProbability,
            paperAmountUSD:   10,
            reasoning:        _reasoning,
            openedAt:         block.timestamp,
            resolved:         false,
            wasCorrect:       false
        }));

        emit PositionOpened(id, _marketId, _action, _entryProbability, _reasoning);
    }

    /// @notice Mark a position resolved after the market settles
    function resolvePosition(uint256 _id, bool _wasCorrect) external onlyOwner {
        require(_id < positions.length, "Invalid position id");
        require(!positions[_id].resolved, "Already resolved");

        positions[_id].resolved  = true;
        positions[_id].wasCorrect = _wasCorrect;
        totalResolved++;
        if (_wasCorrect) totalWins++;

        emit PositionResolved(_id, _wasCorrect);
    }

    /// @notice On-chain win rate (0-100)
    function getWinRate() external view returns (uint256) {
        if (totalResolved == 0) return 0;
        return (totalWins * 100) / totalResolved;
    }

    function getPositionCount() external view returns (uint256) {
        return positions.length;
    }

    function getPosition(uint256 _id) external view returns (Position memory) {
        require(_id < positions.length, "Invalid position id");
        return positions[_id];
    }

    /// @notice Get latest N positions (for frontend)
    function getLatestPositions(uint256 _n) external view returns (Position[] memory) {
        uint256 total = positions.length;
        uint256 count = _n > total ? total : _n;
        Position[] memory result = new Position[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = positions[total - count + i];
        }
        return result;
    }
}
