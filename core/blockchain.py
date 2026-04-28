"""
Blockchain Ownership Vault
--------------------------
Generates a deterministic Keccak-256 content hash from the DNA vector,
then simulates anchoring it to Ethereum (mock tx for prototype demo).
In production, swap _anchor_to_chain() with a real Web3 call.
"""

import hashlib
import hmac
import json
import time
import secrets
import numpy as np
from typing import List


def _keccak256(data: bytes) -> str:
    """SHA3-256 as Keccak-256 approximation (standard hashlib)."""
    return hashlib.sha3_256(data).hexdigest()


def generate_content_hash(dna_sequence: List[List[float]]) -> str:
    """
    Deterministic content hash from DNA vector.
    Quantises floats to 4 decimal places so minor float precision
    differences don't change the hash.
    """
    arr = np.array(dna_sequence)
    mean_vec = arr.mean(axis=0)
    quantised = np.round(mean_vec, 4).tolist()
    payload = json.dumps(quantised, separators=(",", ":")).encode()
    return "0x" + _keccak256(payload)


def _simulate_eth_transaction(content_hash: str) -> dict:
    """
    Simulates submitting the hash to Ethereum.
    In production: use web3.py + a deployed smart contract.
    """
    # Deterministic fake tx based on content hash
    seed = int(content_hash[2:10], 16)
    rng = secrets.token_hex(32)
    tx_hash = "0x" + hashlib.sha3_256(
        (content_hash + rng).encode()
    ).hexdigest()

    return {
        "tx_hash": tx_hash,
        "block_number": seed % 20_000_000 + 18_000_000,
        "gas_used": 21000 + (seed % 5000),
        "network": "ethereum-mainnet-simulated",
        "anchored_at": int(time.time()),
    }


def anchor_to_blockchain(dna_sequence: List[List[float]]) -> dict:
    """
    Main entry point: hash the DNA and anchor it.
    Returns dict with content_hash, tx_hash, block_number, etc.
    """
    content_hash = generate_content_hash(dna_sequence)
    tx_info = _simulate_eth_transaction(content_hash)
    return {
        "content_hash": content_hash,
        **tx_info,
    }
