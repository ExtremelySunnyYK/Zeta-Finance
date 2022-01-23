// import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";

import { ethers } from "ethers";

import zetaContract from "./contracts/zeta-abi.json";
import zzetaContract from "./contracts/zzeta-abi.json";
import zvaultContract from "./contracts/zvault-abi.json";

const zetaAddress = "0x7100C4D0BfF8689238aD80af6185Cd790Ed80f71";
const zzetaAddress = "0xbf156D554385CBf4BAB257c97405C8a0A266fE36";
const zvaultAddress = "0x2b94a256b4ba600e259a799a3043283b74fd09db";

const vaultAbi = zvaultContract.abi;
const zetaAbi = zetaContract.abi;
const zzetaAbi = zzetaContract.abi;

function App() {
	const [currentAccount, setCurrentAccount] = useState(null);
	const [getZetaNumber, setGetZetaNumber] = useState("-1");
	const [getZZetaNumber, setGetZZetaNumber] = useState("-1");
  const [stakingApproval, setStakingApproval] = useState(null);
  const [withdrawApproval, setWithdrawApproval] = useState(null);
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

	const getZetaBalance = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const wallet = provider.getSigner();
    const address = currentAccount;

    const contract = new ethers.Contract(zetaAddress, zetaContract.abi, wallet);
    const balance = await contract.balanceOf(address);
    
    // change state of getZetaNumber to balance
    setGetZetaNumber(balance.toString());

	};

	const getZZetaBalance = async () => {
		const { ethereum } = window;
		const provider = new ethers.providers.Web3Provider(ethereum);
		const wallet = provider.getSigner();
		const address = currentAccount;

		const contract = new ethers.Contract(zzetaAddress, zzetaAbi, wallet);
		const balance = await contract.balanceOf(address);
		
		// change state of getZetaNumber to balance
		setGetZZetaNumber(balance.toString());
		console.log(balance.toString());
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
	
	const approveWithdrawal = async () => {
	const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);

    const signer = provider.getSigner();

		const Contract = new ethers.Contract(
			zzetaAddress,
			zzetaAbi,
      signer  

		);
		const tx = await Contract.approve(
			zvaultAddress,
			ethers.utils.parseEther("1")
		);
		console.log("Approve tx: ", tx);
    setWithdrawApproval(tx);
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
  const approveStakeButton = () => {
    return (
      <button onClick={approveDeposit} className="cta-button approve-button">
        Approve
      </button>
    );
  };

  const maxWithdrawText = async() => {
	// var balance = await getZZetaBalance();
	setWithdrawAmount(await getZZetaBalance());
	// return withdrawAmount;
  };
  const maxWithdrawButton = () => {
	return (
		<button onClick={maxWithdrawText} className="cta-button max-withdraw-button">
			Max Withdraw
		</button>
	);
	  };

  const stakingStatusButton = () => {
    var button;
    if (currentAccount && stakingApproval) {
			button = stakeButton();
		} else if (currentAccount && !stakingApproval) {
			button = approveStakeButton();
		} else {
			button = connectWalletButton();
		}
    return button;
  };

  const withdrawHandler = async () => {

	try {
		const { ethereum } = window;
		var userBalance = await getZZetaBalance();
		console.log(userBalance);
    	if (userBalance < 0 || userBalance < withdrawAmount){
			alert("You don't have enough ZZeta to withdraw!");
		}

		if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const Contract = new ethers.Contract(zvaultAddress, vaultAbi, signer);

			console.log("Initialize Withdrawal");
			let Txn = await Contract.withdraw(depositAmount);

			console.log("Withdrawing... please wait");
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

  const withdrawButton = () => {
    return (
      <button onClick={withdrawHandler} className="cta-button withdraw-button">
        Withdraw
      </button>
    );
  };

  const withdrawStatusButton = () => {
    var button;
    if (currentAccount && withdrawApproval) {
      button = withdrawButton();
    } else if (currentAccount && !withdrawApproval) {
      button = approveWithdrawalButton();
    } else {
      button = connectWalletButton();
    }
    return button;
  };

  const approveWithdrawalButton = () => {
	return (
		<button onClick={approveWithdrawal} className="cta-button approve-button">
			Approve
		</button>
	);
	  };

	useEffect(() => {
		checkWalletIsConnected();
	}, []);

	return (
		<div className="main-app">
			<h1>Zeta Finance</h1>
			{/* Create a text input box of deposit amount */}
			<div className="input-box">
				Deposit Amount:{" "}
				<input
					type="text"
					value={depositAmount}
					onChange={(e) => setDepositAmount(e.target.value)}
				/>
			</div>
			{stakingStatusButton()}
			<div className="input-box">
				Withdraw Amount:{" "}
				<input
					type="text"
					value={withdrawAmount}
					onChange={(e) => setWithdrawAmount(e.target.value)}
				/>
			</div>
			{withdrawStatusButton()}
			{maxWithdrawButton()}

			<div className="balance-container">
				<h2>Zeta Balance: {getZetaNumber}</h2>
				<button
					className="cta-button balance-button"
					onClick={getZetaBalance}
					type="button"
				>
					Get Zeta Balance
				</button>
			</div>
		</div>
	);
}

export default App;
