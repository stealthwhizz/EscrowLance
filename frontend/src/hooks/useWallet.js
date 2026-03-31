import { useEffect, useState } from "react";
import { ethers } from "ethers";

export const useWallet = () => {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.ethereum) return;
    const ethProvider = new ethers.BrowserProvider(window.ethereum);
    setProvider(ethProvider);
    ethProvider.getNetwork().then(setNetwork).catch(console.error);

    ethProvider
      .send("eth_accounts", [])
      .then((accounts) => accounts?.[0] && setAddress(accounts[0]))
      .catch(console.error);

    const handleAccountsChanged = (accounts) => {
      setAddress(accounts?.[0] || null);
    };

    const handleChainChanged = async () => {
      try {
        const net = await ethProvider.getNetwork();
        setNetwork(net);
      } catch (err) {
        console.error(err);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connect = async () => {
    if (!provider) throw new Error("MetaMask not found");
    setError("");
    const accounts = await provider.send("eth_requestAccounts", []);
    setAddress(accounts[0]);
    const net = await provider.getNetwork();
    setNetwork(net);
    return accounts[0];
  };

  const disconnect = () => {
    setAddress(null);
    setError("");
  };

  const switchToChain = async (targetChainIdHex) => {
    if (!provider) return;
    setIsSwitching(true);
    setError("");
    try {
      await provider.send("wallet_switchEthereumChain", [{ chainId: targetChainIdHex }]);
      const net = await provider.getNetwork();
      setNetwork(net);
    } catch (err) {
      console.error(err);
      setError("Unable to switch network in MetaMask.");
    } finally {
      setIsSwitching(false);
    }
  };

  const isConnected = Boolean(address);

  return { provider, address, network, connect, disconnect, switchToChain, isConnected, isSwitching, error };
};
