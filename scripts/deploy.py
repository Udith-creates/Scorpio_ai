"""
Deploy ContentRegistry.sol to any EVM chain.

Usage:
    python scripts/deploy.py

Environment variables required:
    ETH_RPC_URL      — RPC endpoint (Sepolia, Polygon, etc.)
    ETH_PRIVATE_KEY  — 0x-prefixed deployer wallet private key

After running, copy the printed CONTRACT_ADDRESS into your .env file
or store it in Secret Manager.
"""

import os
import sys
import json

# ── Bootstrap path ────────────────────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv()

ETH_RPC_URL     = os.environ.get("ETH_RPC_URL", "")
ETH_PRIVATE_KEY = os.environ.get("ETH_PRIVATE_KEY", "")

if not ETH_RPC_URL or not ETH_PRIVATE_KEY:
    print("ERROR: Set ETH_RPC_URL and ETH_PRIVATE_KEY in your .env file.")
    sys.exit(1)

# ── Install solcx compiler if needed ─────────────────────────────────────────
try:
    import solcx
except ImportError:
    print("Installing py-solc-x...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "py-solc-x"])
    import solcx

from web3 import Web3
from eth_account import Account

SOLIDITY_VERSION = "0.8.19"

def compile_contract() -> tuple[str, str]:
    """Compile ContentRegistry.sol and return (abi, bytecode)."""
    print(f"Installing Solidity compiler {SOLIDITY_VERSION}...")
    solcx.install_solc(SOLIDITY_VERSION, show_progress=False)
    solcx.set_solc_version(SOLIDITY_VERSION)

    sol_path = os.path.join(os.path.dirname(__file__), "..", "contracts", "ContentRegistry.sol")
    with open(sol_path) as f:
        source = f.read()

    compiled = solcx.compile_source(
        source,
        output_values=["abi", "bin"],
        solc_version=SOLIDITY_VERSION,
    )
    key = "<stdin>:ContentRegistry"
    abi      = compiled[key]["abi"]
    bytecode = compiled[key]["bin"]
    return abi, bytecode


def deploy():
    print(f"\nConnecting to {ETH_RPC_URL[:40]}...")
    w3 = Web3(Web3.HTTPProvider(ETH_RPC_URL))
    if not w3.is_connected():
        print("ERROR: Cannot connect to RPC endpoint.")
        sys.exit(1)

    account = Account.from_key(ETH_PRIVATE_KEY)
    print(f"Deployer wallet : {account.address}")

    balance = w3.eth.get_balance(account.address)
    print(f"Wallet balance  : {w3.from_wei(balance, 'ether'):.6f} ETH")
    if balance == 0:
        print("\nWARNING: Wallet has 0 ETH — deployment will fail.")
        print("Get free Sepolia ETH from: https://sepoliafaucet.com")
        sys.exit(1)

    abi, bytecode = compile_contract()
    print("Contract compiled successfully.")

    Contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    nonce    = w3.eth.get_transaction_count(account.address)
    chain_id = w3.eth.chain_id

    tx = Contract.constructor().build_transaction({
        "from"    : account.address,
        "nonce"   : nonce,
        "chainId" : chain_id,
        "gas"     : 1_500_000,
        "gasPrice": w3.eth.gas_price,
    })

    signed   = account.sign_transaction(tx)
    tx_hash  = w3.eth.send_raw_transaction(signed.raw_transaction)
    print(f"\nDeployment tx sent: {tx_hash.hex()}")
    print("Waiting for confirmation...")

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    address = receipt.contractAddress
    print(f"\n✓ Contract deployed at: {address}")
    print(f"  Block number        : {receipt.blockNumber}")
    print(f"  Gas used            : {receipt.gasUsed}")

    # Save ABI locally for the application to use
    out_dir = os.path.join(os.path.dirname(__file__), "..", "contracts")
    abi_path = os.path.join(out_dir, "ContentRegistry.abi.json")
    with open(abi_path, "w") as f:
        json.dump(abi, f, indent=2)
    print(f"  ABI saved to        : contracts/ContentRegistry.abi.json")

    print("\n── Next step ──────────────────────────────────────────────────────")
    print(f"Add to your .env:\n  CONTRACT_ADDRESS={address}")
    print("Or store in Secret Manager:")
    print(f"  echo -n '{address}' | gcloud secrets create CONTRACT_ADDRESS --data-file=- --project=scorpio-ai-2026")

    return address


if __name__ == "__main__":
    deploy()
