import React, { useState } from "react";
import { useWallet } from "../../hooks/useWallet.js";
import { useAuth } from "../../context/AuthContext.jsx";

const Wallet = () => {
  const { user } = useAuth();
  const { address, connect, disconnect, network, isConnected, provider, switchToChain, isSwitching, error: walletError } = useWallet();
  const [status, setStatus] = useState("");
  const walletMatchesUser = Boolean(
    address && user?.walletAddress && address.toLowerCase() === user.walletAddress.toLowerCase()
  );
  const showConnected = isConnected && walletMatchesUser;
  const sepoliaChainIdHex = "0xaa36a7"; // 11155111
  const sepoliaChainId = 11155111;
  const onWrongNetwork = network && Number(network.chainId) !== sepoliaChainId; // ethers v6 returns BigInt

  const handleSwitch = async () => {
    setStatus("");
    try {
      if (!provider) {
        setStatus("MetaMask not available in this browser.");
        return;
      }
      // Prompt MetaMask to let the user pick an account
      await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]);
      await connect();
    } catch (err) {
      console.error(err);
      setStatus("Please open MetaMask and pick the correct account.");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Wallet</h3>
      <div className="bg-slate-900 border border-slate-800 p-4 rounded">
        <p className="text-slate-300">Connected address:</p>
        <p className="text-lg font-mono">{address || "Not connected"}</p>
        <p className="text-sm text-slate-400">Network: {network?.name || "-"}</p>
        {user?.walletAddress && (
          <p className="text-xs text-slate-500">Profile wallet: {user.walletAddress}</p>
        )}
        {!walletMatchesUser && address && user?.walletAddress && (
          <p className="text-xs text-amber-300 mt-1">Connected account does not match profile wallet. Switch in MetaMask and reconnect.</p>
        )}
        {onWrongNetwork && (
          <div className="text-xs text-amber-300 mt-1 flex items-center gap-2">
            <span>Wrong network. Switch to Sepolia.</span>
            <button
              className="underline text-primary disabled:opacity-60"
              onClick={() => switchToChain(sepoliaChainIdHex)}
              disabled={isSwitching}
            >
              {isSwitching ? "Switching..." : "Switch"}
            </button>
          </div>
        )}
        <button
          className={`mt-3 px-4 py-2 rounded transition transform duration-200 ${
            showConnected
              ? "bg-slate-700 cursor-default"
              : "bg-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0"
          }`}
          onClick={showConnected ? undefined : handleSwitch}
          disabled={showConnected}
        >
          {showConnected ? "Connected" : walletMatchesUser ? "Connect MetaMask" : "Switch to profile wallet"}
        </button>
        {showConnected && (
          <button
            className="mt-2 px-3 py-2 rounded bg-slate-800 text-sm"
            type="button"
            onClick={disconnect}
          >
            Disconnect
          </button>
        )}
        {status && <p className="text-xs text-amber-300 mt-2">{status}</p>}
        {walletError && <p className="text-xs text-amber-300 mt-1">{walletError}</p>}
      </div>
    </div>
  );
};

export default Wallet;
