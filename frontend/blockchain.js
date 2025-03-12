import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

const provider = new ethers.BrowserProvider(window.ethereum);

const abi = [
  "event AccountCreated(address[] owners, uint256 indexed id, uint256 timestamp)",
  "event Deposit(address indexed user, uint256 indexed accountId, uint256 value, uint256 timestamp)",
  "event Withdraw(uint256 indexed withdrawId, uint256 timestamp)",
  "event WithdrawRequested(address indexed user, uint256 indexed accountId, uint256 indexed withdrawId, uint256 amount, uint256 timestamp)",
  "function approveWithdrawl(uint256 accountId, uint256 withdrawId)",
  "function createAccount(address[] otherOwners)",
  "function deposit(uint256 accountId) payable",
  "function getAccounts() view returns (uint256[])",
  "function getApprovals(uint256 accountId, uint256 withdrawId) view returns (uint256)",
  "function getBalance(uint256 accountId) view returns (uint256)",
  "function getOwners(uint256 accountId) view returns (address[])",
  "function requestWithdrawl(uint256 accountId, uint256 amount)",
  "function withdraw(uint256 accountId, uint256 withdrawId)",
];

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let contract = null;

function shortenError(err) {
  const msg = err.message;
  const pattern = /execution reverted:\s*"([^"]+)"/;
  const match = msg.match(pattern);
  if (match) {
    return `execution reverted: "${match[1]}"`;
  }
  return msg;
}

async function getAccess() {
  if (contract) return contract;
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  contract = new ethers.Contract(contractAddress, abi, signer);
  return contract;
}

export async function createAccount(owners) {
  try {
    await getAccess();
    const tx = await contract.createAccount(owners);
    await tx.wait();
    return "Account created successfully!";
  } catch (err) {
    throw new Error("Error creating account: " + shortenError(err));
  }
}

export async function getAccountsDetails() {
  try {
    await getAccess();
    const accountIds = await contract.getAccounts();
    const details = await Promise.all(
      accountIds.map(async (id) => {
        const idStr = id.toString();
        const owners = await contract.getOwners(idStr);
        const balance = await contract.getBalance(idStr);
        return { id: idStr, owners, balance: ethers.formatEther(balance) };
      })
    );
    return details;
  } catch (err) {
    throw new Error("Error retrieving accounts: " + shortenError(err));
  }
}

export async function deposit(accountId, amountStr) {
  try {
    await getAccess();
    const amount = ethers.parseEther(amountStr);
    const tx = await contract.deposit(accountId, { value: amount });
    await tx.wait();
    return "Deposit successful!";
  } catch (err) {
    throw new Error("Error depositing funds: " + shortenError(err));
  }
}

export async function withdrawRequest(accountId, amountStr) {
  try {
    await getAccess();
    const amount = ethers.parseEther(amountStr);
    const tx = await contract.requestWithdrawl(accountId, amount);
    await tx.wait();
    return "Withdrawal request submitted!";
  } catch (err) {
    throw new Error("Error requesting withdrawal: " + shortenError(err));
  }
}

export async function approveWithdraw(accountId, withdrawId) {
  try {
    await getAccess();
    const tx = await contract.approveWithdrawl(accountId, withdrawId);
    await tx.wait();
    return "Withdrawal approved!";
  } catch (err) {
    throw new Error("Error approving withdrawal: " + shortenError(err));
  }
}

export async function withdraw(accountId, withdrawId) {
  try {
    await getAccess();
    const tx = await contract.withdraw(accountId, withdrawId);
    await tx.wait();
    return "Withdrawal successful!";
  } catch (err) {
    throw new Error("Error withdrawing funds: " + shortenError(err));
  }
}

export async function queryWithdrawals() {
  try {
    await getAccess();
    const filter = contract.filters.WithdrawRequested();
    const events = await contract.queryFilter(filter, 0, "latest");
    const details = await Promise.all(
      events.map(async (event) => {
        const [user, accountId, withdrawId, amount] = event.args;
        const approvals = await contract.getApprovals(accountId, withdrawId);
        return {
          accountId: accountId.toString(),
          withdrawId: withdrawId.toString(),
          user,
          amount: ethers.formatEther(amount),
          approvals: approvals.toString(),
        };
      })
    );
    return details;
  } catch (err) {
    throw new Error(
      "Error retrieving withdrawal requests: " + shortenError(err)
    );
  }
}
