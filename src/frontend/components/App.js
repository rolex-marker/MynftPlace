import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Navigation from './Navbar';
import Home from './Home.js'
import Create from './Create.js'
import MyListedItems from './MyListedItems.js'
import MyPurchases from './MyPurchases.js'
import MarketplaceAbi from '../contractsData/Marketplace.json'
import MarketplaceAddress from '../contractsData/Marketplace-address.json'
import NFTAbi from '../contractsData/NFT.json'
import NFTAddress from '../contractsData/NFT-address.json'
import { useState } from 'react'
import { ethers } from "ethers"
import { Spinner } from 'react-bootstrap'

import './App.css';

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState({})
  const [marketplace, setMarketplace] = useState({})
  // MetaMask Login/Connect
  // const web3Handler = async () => {
  //   const accounts =  await window.ethereum.request({
  //                       method: "wallet_switchEthereumChain",
  //                       params: [{ chainId: "0x7A69" }] // 31337
  //                     });
  //   setAccount(accounts[0])
  //    console.log(accounts);
  //   // Get provider from Metamask
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //    const network = await provider.getNetwork();
  //    console.log(network.chainId);

  //   if (network.chainId !== 31337) {
  //     alert("Please switch MetaMask to the Hardhat network (localhost:8545)")
  //     return
  //   }
  //   console.log(network.chainId);
  //   // Set signer
  //   const signer = provider.getSigner()

  //   window.ethereum.on('chainChanged', (chainId) => {
  //     window.location.reload();
  //   })

  //   window.ethereum.on('accountsChanged', async function (accounts) {
  //     setAccount(accounts[0])
  //     await web3Handler()
  //   })
  //   loadContracts(signer)
  // }
  const web3Handler = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return;
  }

  let accounts;
  try {
    accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
  } catch (error) {
    console.error("User rejected wallet connection", error);
    return;
  }

  // 🔐 SAFETY CHECK
  if (!accounts || accounts.length === 0) {
    console.error("No accounts found");
    return;
  }

  setAccount(accounts[0]);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== 31337) {
    alert("Please switch MetaMask to Hardhat Local (chainId 31337)");
    return;
  }

  const signer = provider.getSigner();
  loadContracts(signer);
};
  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
    setMarketplace(marketplace)
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    setNFT(nft)
    setLoading(false)
  }

  return (
    <BrowserRouter>
      <div className="App">
        <>
          <Navigation web3Handler={web3Handler} account={account} />
        </>
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home marketplace={marketplace} nft={nft} />
              } />
              <Route path="/create" element={
                <Create marketplace={marketplace} nft={nft} />
              } />
              <Route path="/my-listed-items" element={
                <MyListedItems marketplace={marketplace} nft={nft} account={account} />
              } />
              <Route path="/my-purchases" element={
                <MyPurchases marketplace={marketplace} nft={nft} account={account} />
              } />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>

  );
}

export default App;
