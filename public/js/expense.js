const token = localStorage.getItem('token');
const rowsPerPage = document.getElementById('rowsPerPage');

function getRowsPerPage() {
  const savedRowsPerPage = localStorage.getItem('rowsPerPage');
  return savedRowsPerPage ? parseInt(savedRowsPerPage) : 5;
}

function setRowsPerPage(value) {
  localStorage.setItem('rowsPerPage', value)
}

// Set the dropdown value based on local storage
rowsPerPage.value = getRowsPerPage();

rowsPerPage.addEventListener('change', async function () {
  const newRowsPerPage = parseInt(rowsPerPage.value);
  setRowsPerPage(newRowsPerPage);
  expenseTablePageSize = newRowsPerPage;
  expenseTablePage = 1; // Reset to first page whenever rows per page changes
  await renderExpenses();
  await loadPreviousDownloads();
});

document.addEventListener('DOMContentLoaded', async function () {
  await renderExpenses();  // Default view
  await checkPremiumStatus();

  const expenseForm = document.getElementById('expenseForm');
  expenseForm.addEventListener('submit', handleExpenseFormSubmit);
});

async function handleExpenseFormSubmit(event) {
  event.preventDefault();

  const spentAmount = document.getElementById('spentAmount').value;
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;

  const expenseDetails = { spentAmount, description, category };

  try {
    await axios.post('http://localhost:3000/expense/postExpense', expenseDetails, { headers: { "Authorization": token } });
    await renderExpenses();  // Refresh view after adding expense
    await showLeaderboard();
  } catch (err) {
    console.error(err);
  }

  resetFormFields();
}

function resetFormFields() {
  document.getElementById('spentAmount').value = "";
  document.getElementById('description').value = "";
  document.getElementById('category').value = "Food";
}

async function checkPremiumStatus() {
  try {
    const response = await axios.get('http://localhost:3000/premium/premiumstatus', { headers: { "Authorization": token } });
    if (response.data.isPremium) {
      showPremiumFeatures();
      replacePremiumButton();
      await showLeaderboard();
    }
  } catch (err) {
    console.error(err);
    alert("Failed to check premium status. Please try again later.");
  }
}

function showPremiumFeatures() {
  document.getElementById('showLeaderboardBtn').style.display = 'block';
  document.getElementById('downloadBtn').style.display = 'block';
  document.getElementById('previousDownloadsBtn').style.display = 'block';
  document.getElementById('leaderboardNav').style.display = 'block';
}

function replacePremiumButton() {
  const premiumButton = document.getElementById('rzp-button1');
  const premiumText = document.createElement('p');
  premiumText.textContent = "Premium User";
  premiumText.classList.add('premium-user');
  premiumButton.parentNode.replaceChild(premiumText, premiumButton);
}

let expenseTablePage = 1;
let expenseTablePageSize = getRowsPerPage();

document.getElementById('expenseTablePrevPage').addEventListener('click', async function () {
  if (expenseTablePage > 1) {
    expenseTablePage--;
    await renderExpenses();
  }
});

document.getElementById('expenseTableNextPage').addEventListener('click', async function () {
  expenseTablePage++;
  await renderExpenses();
});

async function fetchExpenses() {
  try {
    const response = await axios.get(`http://localhost:3000/expense/getExpense?page=${expenseTablePage}&pageSize=${expenseTablePageSize}`, { headers: { "Authorization": token } });
    return response.data.expenses;
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function renderExpenses() {
  const expenseData = await fetchExpenses();
  const expenseTableBody = document.getElementById('expenseTableBody');
  expenseTableBody.innerHTML = '';

  if (expenseData.length > 0) {
    expenseData.forEach(expense => {
      const newRow = createExpenseRow(expense);
      expenseTableBody.appendChild(newRow);
    });
  }
  
  document.getElementById('expenseTablePageNumber').textContent = expenseTablePage;
}

function createExpenseRow(expense) {
  const newRow = document.createElement("tr");
  newRow.dataset.id = expense._id; // Use _id for MongoDB ObjectId
  newRow.innerHTML = `
      <td class="text-center">${expense.spentAmount}</td>
      <td class="text-center">${expense.description}</td>
      <td class="text-center">${expense.category}</td>
      <td class="text-center"><button class="btn btn-danger delete-btn">Delete</button></td>
  `;
  return newRow;
}

document.getElementById("expenseTableBody").addEventListener("click", async function (event) {
  if (event.target.classList.contains("delete-btn")) {
      const row = event.target.closest("tr");
      const expenseId = row.dataset.id; // Get the expense ID from the row's data attribute
      await deleteExpense(expenseId); // Call the delete function
      row.remove(); // Remove the row from the table
      await renderExpenses(); // Refresh the expenses view
      await showLeaderboard(); // Optionally refresh the leaderboard
  }
});

async function deleteExpense(expenseId) {
  try {
      await axios.delete(`http://localhost:3000/expense/deleteExpense/${expenseId}`, { headers: { "Authorization": token } });
  } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Failed to delete expense. Please try again.'); // Notify the user of the error
  }
}

document.getElementById('rzp-button1').addEventListener('click', handlePremiumPurchase);

async function handlePremiumPurchase(e) {
  e.preventDefault();
  try {
    const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: { "Authorization": token } });
    const options = getRazorpayOptions(response.data);
    const rzp1 = new Razorpay(options);
    rzp1.open();
    rzp1.on('payment.failed', handlePaymentFailure);
  } catch (err) {
    console.error(err);
    alert("Failed to initiate premium membership purchase. Please try again later.");
  }
}

function getRazorpayOptions(data) {
  return {
    key: data.key_id,
    order_id: data.order.id,
    handler: async function (razorpayResponse) {
      try {
        await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
          order_id: data.order.id,
          payment_id: razorpayResponse.razorpay_payment_id,
        }, { headers: { "Authorization": token } });

        document.getElementById('successModal').style.display = 'block';

      } catch (err) {
        console.error(err);
        alert("Failed to update transaction status. Please try again later.");
      }
    },
  };
}

function handlePaymentFailure(response) {
  console.log(response);
  document.getElementById('failModal').style.display = 'block';
}

document.getElementById('okButton').addEventListener('click', function () {
  document.getElementById('successModal').style.display = 'none';
  checkPremiumStatus();
});

document.getElementById('okButtonFailed').addEventListener('click', function () {
  document.getElementById('failModal').style.display = 'none';
});

document.getElementById('showLeaderboardBtn').addEventListener('click', toggleLeaderboardVisibility);

async function toggleLeaderboardVisibility() {
  const leaderboard = document.getElementById('leaderboardTable');
  leaderboard.style.display = leaderboard.style.display === 'none' || leaderboard.style.display === '' ? 'block' : 'none';
  await showLeaderboard();
}

let leaderboardPage = 1;
const leaderboardPageSize = 10;

document.getElementById('leaderboardPrevPage').addEventListener('click', async function () {
  if (leaderboardPage > 1) {
    leaderboardPage--;
    await showLeaderboard();
  }
});

document.getElementById('leaderboardNextPage').addEventListener('click', async function () {
  leaderboardPage++;
  await showLeaderboard();
});

async function showLeaderboard() {
  try {
    const response = await axios.get(`http://localhost:3000/premium/showLeaderboard?page=${leaderboardPage}&pageSize=${leaderboardPageSize}`, { headers: { "Authorization": token } });
    populateLeaderboardTable(response.data);
    document.getElementById('leaderboardPageNumber').textContent = leaderboardPage;
  } catch (err) {
    console.error(err);
  }
}

function populateLeaderboardTable(userDetails) {
  const leaderboardTableBody = document.getElementById('leaderboardTableBody');
  leaderboardTableBody.innerHTML = '';
  userDetails.forEach(userDetail => {
    const newRow = document.createElement("tr");
    newRow.dataset.name = userDetail.name;
    newRow.dataset.id = userDetail.id;
    newRow.innerHTML = `
      <td class="text-center">${userDetail.name}</td>
      <td class="text-center">$ ${userDetail.total_cost}</td>
    `;
    leaderboardTableBody.appendChild(newRow);
  });
}

async function download() {
  try {
    const response = await axios.get('http://localhost:3000/expense/download', { headers: { 'Authorization': token } });
    if (response.status === 200) {
      loadPreviousDownloads();
      downloadFile(response.data.fileURL, 'myexpense.csv');
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    console.error(err);
  }
}

function downloadFile(fileURL, filename) {
  const a = document.createElement('a');
  a.href = fileURL;
  a.download = filename;
  a.click();
}

let previousDownloadsPage = 1;
let previousDownloadsSize = 5;

document.getElementById('previousDownloadsPrevPage').addEventListener('click', async function () {
  if (previousDownloadsPage > 1) {
    previousDownloadsPage--;
    await loadPreviousDownloads();
  }
});

document.getElementById('previousDownloadsNextPage').addEventListener('click', async function () {
  previousDownloadsPage++;
  await loadPreviousDownloads();
});

document.getElementById('previousDownloadsBtn').addEventListener('click', function () {
  const previousDownloadsTable = document.getElementById('previousDownloadsTable');
  previousDownloadsTable.style.display = previousDownloadsTable.style.display === 'none' ? 'block' : 'none';
  loadPreviousDownloads();
});

async function loadPreviousDownloads() {
  try {
    const response = await axios.get(`http://localhost:3000/expense/getDownloads?page=${previousDownloadsPage}&pageSize=${previousDownloadsSize}`, { headers: { 'Authorization': token } });
    populatePreviousDownloadsTable(response.data);
    document.getElementById('previousDownloadsPageNumber').textContent = previousDownloadsPage;
  } catch (err) {
    console.error(err);
  }
}

function populatePreviousDownloadsTable(downloads) {
  const tableBody = document.getElementById('previousDownloadsTableBody');
  tableBody.innerHTML = '';
  downloads.forEach(download => {
    const row = document.createElement('tr');
    row.classList.add('text-center');

    const dateCell = document.createElement('td');
    dateCell.classList.add('px-4', 'py-2', 'text-gray-600');
    dateCell.textContent = new Date(download.createdAt).toLocaleString();

    const linkCell = document.createElement('td');
    linkCell.classList.add('px-4', 'py-2', 'text-gray-600');
    const link = document.createElement('a');
    link.href = download.fileURL;
    link.textContent = 'Download';
    link.classList.add('text-purple-600', 'hover:underline');
    linkCell.appendChild(link);

    row.appendChild(dateCell);
    row.appendChild(linkCell);

    tableBody.appendChild(row);
  });
}
