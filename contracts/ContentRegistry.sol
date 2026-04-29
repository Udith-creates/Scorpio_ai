// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ContentRegistry
 * @dev Scorpio AI — on-chain content fingerprint vault.
 *      Each piece of content is identified by a Keccak-256 hash of its
 *      DNA vector. Once registered, the record is immutable.
 */
contract ContentRegistry {

    struct ContentRecord {
        bytes32  contentHash;
        address  owner;
        uint256  timestamp;
        string   title;
        string   contentId;   // off-chain Firestore document ID
        bool     exists;
    }

    // contentHash → record
    mapping(bytes32 => ContentRecord) private _records;

    // ordered list of all registered hashes (for enumeration)
    bytes32[] private _allHashes;

    // ── Events ────────────────────────────────────────────────────────────────

    event ContentRegistered(
        bytes32 indexed contentHash,
        address indexed owner,
        string  title,
        string  contentId,
        uint256 timestamp
    );

    // ── Write ─────────────────────────────────────────────────────────────────

    /**
     * @notice Register a content fingerprint on-chain.
     * @param contentHash  Keccak-256 of the mean DNA vector (from Scorpio AI).
     * @param title        Human-readable title of the content.
     * @param contentId    Firestore document ID for cross-reference.
     */
    function registerContent(
        bytes32 contentHash,
        string calldata title,
        string calldata contentId
    ) external {
        require(!_records[contentHash].exists, "Content already registered");

        _records[contentHash] = ContentRecord({
            contentHash : contentHash,
            owner       : msg.sender,
            timestamp   : block.timestamp,
            title       : title,
            contentId   : contentId,
            exists      : true
        });

        _allHashes.push(contentHash);

        emit ContentRegistered(contentHash, msg.sender, title, contentId, block.timestamp);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /**
     * @notice Verify whether a content hash is registered.
     * @return exists    true if the hash is in the registry.
     * @return owner     Wallet address that registered it.
     * @return timestamp Unix timestamp of registration.
     * @return title     Content title supplied at registration.
     * @return contentId Firestore document ID.
     */
    function verifyContent(bytes32 contentHash)
        external
        view
        returns (
            bool    exists,
            address owner,
            uint256 timestamp,
            string  memory title,
            string  memory contentId
        )
    {
        ContentRecord storage r = _records[contentHash];
        return (r.exists, r.owner, r.timestamp, r.title, r.contentId);
    }

    /**
     * @notice Total number of registered content items.
     */
    function totalRegistered() external view returns (uint256) {
        return _allHashes.length;
    }

    /**
     * @notice Retrieve a registered hash by index (for enumeration).
     */
    function hashAt(uint256 index) external view returns (bytes32) {
        require(index < _allHashes.length, "Index out of bounds");
        return _allHashes[index];
    }
}
