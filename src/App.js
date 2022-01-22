// import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";

import { ethers } from "ethers";

import zetaContract from "./contracts/zeta-abi.json";
// import zzetaContract from "./contracts/zzeta-abi.json";
import zvaultContract from "./contracts/zvault-abi.json";

const zetaAddress = "0x7100C4D0BfF8689238aD80af6185Cd790Ed80f71";
// const zzetaAddress = "0xbf156D554385CBf4BAB257c97405C8a0A266fE36";
const zvaultAddress = "0x2b94a256B4BA600e259A799A3043283B74fD09dB";

const vaultAbi = zvaultContract.abi;
const zetaAbi = zetaContract.abi;

function App() {
	const [currentAccount, setCurrentAccount] = useState(null);
	const [getNumber, setGetNumber] = useState("-1");
  const [stakingApproval, setStakingApproval] = useState(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);


	const checkWalletIsConnected = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Make sure you have Metamask installed!");
			return;
		} else {
			console.log("Wallet exists! We're ready to go!");
		}

		const accounts = await ethereum.request({ method: "eth_accounts" });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account: ", account);
			setCurrentAccount(account);
		} else {
			console.log("No authorized account found");
		}
	};

	const connectWalletHandler = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			alert("Please install Metamask!");
		}

		try {
			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});
			console.log("Found an account! Address: ", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (err) {
			console.log(err);
		}
	};

	const getBalance = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const wallet = provider.getSigner();
    const address = currentAccount;

    const contract = new ethers.Contract(zetaAddress, zetaContract.abi, wallet);
    const balance = await contract.balanceOf(address);
    
    // change state of getNumber to balance
    setGetNumber(balance.toString());

	};

	const approveDeposit = async () => {
		const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);

    const signer = provider.getSigner();

		const stakedContract = new ethers.Contract(
			zetaAddress,
			zetaAbi,
      signer  

		);
		const tx = await stakedContract.approve(
			zvaultAddress,
			ethers.utils.parseEther("1")
		);
		console.log("Approve tx: ", tx);
    setStakingApproval(tx);
	};

	const stakingHandler = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const Contract = new ethers.Contract(zvaultAddress, vaultAbi, signer);

				console.log("Initialize payment");
				let Txn = await Contract.deposit(depositAmount);

				console.log("Minting... please wait");
				await Txn.wait();

				console.log(
					`Mint, see transaction: https://goerli.etherscan.io/tx/${Txn.hash}`
				);
			} else {
				console.log("Ethereum object does not exist");
			}
		} catch (err) {
			console.log(err);
		}
	};

	const connectWalletButton = () => {
		return (
			<button
				onClick={connectWalletHandler}
				className="cta-button connect-wallet-button"
			>
				Connect Wallet
			</button>
		);
	};
	const stakeButton = () => {
		return (
			<button onClick={stakingHandler} className="cta-button mint-nft-button">
				Stake!
			</button>
		);
	};
  const approveButton = () => {
    return (
      <button onClick={approveDeposit} className="cta-button approve-button">
        Approve
      </button>
    );
  };

  const stakingStatusButton = () => {
    var button;
    if (currentAccount && stakingApproval) {
			button = stakeButton();
		} else if (currentAccount && !stakingApproval) {
			button = approveButton();
		} else {
			button = connectWalletButton();
		}
    return button;
  };

  const withdrawHandler = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const Contract = new ethers.Contract(zvaultAddress, vaultAbi, signer);

    var userBalance = getBalance();
    if (userBalance > 0 & userBalance < withdrawAmount){
     try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const Contract = new ethers.Contract(zvaultAddress, vaultAbi, signer);

				console.log("Initialize payment");
				let Txn = await Contract.deposit(depositAmount);

				console.log("Minting... please wait");
				await Txn.wait();

				console.log(
					`Mint, see transaction: https://goerli.etherscan.io/tx/${Txn.hash}`
				);
			} else {
				console.log("Ethereum object does not exist");
			}
		} catch (err) {
			console.log(err);
		}}


     else {
      alert("You don't have enough tokens to withdraw!");
    }
  }

  const withdrawButton = () => {
    return (
      <button onClick={withdrawHandler} className="cta-button withdraw-button">
        Withdraw
      </button>
    );
  };

  const withdrawStatusButton = () => {
    var button;
    if (currentAccount && stakingApproval) {
      button = withdrawButton();
    } else if (currentAccount && !stakingApproval) {
      button = approveButton();
    } else {
      button = connectWalletButton();
    }
    return button;
  };



	useEffect(() => {
		checkWalletIsConnected();
	}, []);

	return (
		<div className="main-app">
			<h1>Zeta Finance</h1>
      {/* Create a text input box of deposit amount */}
      <div className="input-box">
      Deposit Amount: <input type="text" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
      </div>
      {stakingStatusButton()}
      <div className="input-box">
      Withdraw Amount: <input type="text" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
      </div>
      {withdrawStatusButton()}

			<div className="balance-container">
				<h2>Balance: {getNumber}</h2>
				<button className="cta-button balance-button" onClick={getBalance} type="button">
					Get Balance
				</button>
			</div>
		</div>
	);
}

export default App;
