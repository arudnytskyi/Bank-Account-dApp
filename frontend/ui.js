import {
  createAccount,
  getAccountsDetails,
  deposit,
  withdrawRequest,
  approveWithdraw,
  withdraw,
  queryWithdrawals,
} from "./blockchain.js";

function appendToEventLog(message) {
  const eventLog = document.getElementById("events");
  eventLog.append(message + "\n");
}

async function onCreateAccount() {
  const ownersInput = document.getElementById("owners").value;
  const owners = ownersInput
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  try {
    const result = await createAccount(owners);
    appendToEventLog(result);
  } catch (err) {
    appendToEventLog(err.message);
  }
}

async function onViewAccounts() {
  try {
    const details = await getAccountsDetails();
    let accountsHtml = `<table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px;">Account ID</th>
          <th style="text-align: left; padding: 8px;">Owners</th>
          <th style="text-align: left; padding: 8px;">Balance (ETH)</th>
        </tr>
      </thead>
      <tbody>`;
    details.forEach(({ id, owners, balance }) => {
      const abbreviatedOwners = owners
        .map((addr) => addr.slice(0, 6) + "..." + addr.slice(-4))
        .join(", ");
      accountsHtml += `<tr>
          <td style="padding: 8px; border: 1px solid #ccc;">${id}</td>
          <td style="padding: 8px; border: 1px solid #ccc; white-space: nowrap;">${abbreviatedOwners}</td>
          <td style="padding: 8px; border: 1px solid #ccc;">${balance}</td>
      </tr>`;
    });
    accountsHtml += `</tbody></table>`;
    let dialog = document.getElementById("accountsDialog");
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "accountsDialog";
      document.body.appendChild(dialog);
    }
    dialog.innerHTML = `<h2>Accounts</h2>
      ${accountsHtml}
      <div style="text-align: right; margin-top: 20px;">
        <button id="closeAccountsDialog">Close</button>
      </div>`;
    dialog.showModal();
    document
      .getElementById("closeAccountsDialog")
      .addEventListener("click", () => {
        dialog.close();
      });
  } catch (err) {
    appendToEventLog(err.message);
  }
}

async function onDeposit() {
  const accountId = document.getElementById("depositAccountId").value;
  const amountStr = document.getElementById("depositAmount").value;
  try {
    const result = await deposit(accountId, amountStr);
    appendToEventLog(result);
  } catch (err) {
    appendToEventLog(err.message);
  }
}

async function onWithdrawRequest() {
  const accountId = document.getElementById("withdrawRequestAccountId").value;
  const amountStr = document.getElementById("withdrawRequestAmount").value;
  try {
    const result = await withdrawRequest(accountId, amountStr);
    appendToEventLog(result);
  } catch (err) {
    appendToEventLog(err.message);
  }
}

async function onApproveWithdraw() {
  const accountId = document.getElementById("approveAccountId").value;
  const withdrawId = document.getElementById("approveWithdrawId").value;
  try {
    const result = await approveWithdraw(accountId, withdrawId);
    appendToEventLog(result);
  } catch (err) {
    appendToEventLog(err.message);
  }
}

async function onWithdraw() {
  const accountId = document.getElementById("withdrawAccountId").value;
  const withdrawId = document.getElementById("withdrawWithdrawId").value;
  try {
    const result = await withdraw(accountId, withdrawId);
    appendToEventLog(result);
  } catch (err) {
    appendToEventLog(err.message);
  }
}

async function onViewWithdrawals() {
  try {
    const details = await queryWithdrawals();
    let withdrawalsHtml = `<table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px;">Account ID</th>
          <th style="text-align: left; padding: 8px;">Withdraw ID</th>
          <th style="text-align: left; padding: 8px;">Requested By</th>
          <th style="text-align: left; padding: 8px;">Amount (ETH)</th>
          <th style="text-align: left; padding: 8px;">Approvals</th>
        </tr>
      </thead>
      <tbody>`;
    details.forEach(({ accountId, withdrawId, user, amount, approvals }) => {
      const abbreviatedUser = user.slice(0, 6) + "..." + user.slice(-4);
      withdrawalsHtml += `<tr>
          <td style="padding: 8px; border: 1px solid #ccc;">${accountId}</td>
          <td style="padding: 8px; border: 1px solid #ccc;">${withdrawId}</td>
          <td style="padding: 8px; border: 1px solid #ccc;">${abbreviatedUser}</td>
          <td style="padding: 8px; border: 1px solid #ccc;">${amount}</td>
          <td style="padding: 8px; border: 1px solid #ccc;">${approvals}</td>
      </tr>`;
    });
    withdrawalsHtml += `</tbody></table>`;
    let dialog = document.getElementById("withdrawalsDialog");
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "withdrawalsDialog";
      document.body.appendChild(dialog);
    }
    dialog.innerHTML = `<h2>Withdrawal Requests</h2>
      ${withdrawalsHtml}
      <div style="text-align: right; margin-top: 20px;">
        <button id="closeWithdrawalsDialog">Close</button>
      </div>`;
    dialog.showModal();
    document
      .getElementById("closeWithdrawalsDialog")
      .addEventListener("click", () => {
        dialog.close();
      });
  } catch (err) {
    appendToEventLog(err.message);
  }
}

document.getElementById("create").addEventListener("click", onCreateAccount);
document.getElementById("view").addEventListener("click", onViewAccounts);
document.getElementById("deposit").addEventListener("click", onDeposit);
document.getElementById("withdrawRequest").addEventListener("click", onWithdrawRequest);
document.getElementById("approveWithdraw").addEventListener("click", onApproveWithdraw);
document.getElementById("withdraw").addEventListener("click", onWithdraw);
document.getElementById("viewWithdrawals").addEventListener("click", onViewWithdrawals);
