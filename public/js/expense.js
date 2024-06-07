const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', async function () {
  renderExpenses();  // Default view
  await checkPremiumStatus();

  const expenseForm = document.getElementById('expenseForm');

  expenseForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const spentAmount = document.getElementById('spentAmount').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;

    const expenseDetails = {
      spentAmount: spentAmount,
      description: description,
      category: category
    };

    try {
      await axios.post('http://localhost:3000/expense/postExpense', expenseDetails, { headers: { "Authorization": token }});
      renderExpenses('daily');  // Refresh daily view after adding expense
      showLeaderboard();
    } catch (err) {
      console.error(err);
    }

    document.getElementById('spentAmount').value = "";
    document.getElementById('description').value = "";
    document.getElementById('category').value = "Food";
  });

  // document.getElementById('dailyView').addEventListener('click', function() {
  //   renderExpenses('daily');
  // });

  // document.getElementById('weeklyView').addEventListener('click', function() {
  //   renderExpenses('weekly');
  // });

  // document.getElementById('monthlyView').addEventListener('click', function() {
  //   renderExpenses('monthly');
  // });
});

async function checkPremiumStatus() {
  try {
    const response = await axios.get('http://localhost:3000/premium/premiumstatus', { headers: { "Authorization": token } });
    if (response.data.isPremium) {
      document.getElementById('showLeaderboardBtn').style.display = 'block';
      // document.getElementById('viewTypeButtons').style.display = 'block';
      document.getElementById('downloadBtn').style.display = 'block';
      document.getElementById('previousDownloadsBtn').style.display = 'block';
      replacePremiumButton();
      showLeaderboard();
    }
  } catch (err) {
    console.error(err);
    alert("Failed to check premium status. Please try again later.");
  }
}

function replacePremiumButton() {
  const premiumButton = document.getElementById('rzp-button1');
  const premiumText = document.createElement('p');
  premiumText.textContent = "Premium User";
  premiumText.classList.add('premium-user');
  premiumButton.parentNode.replaceChild(premiumText, premiumButton);
}

// Expense Table Pagination Logics
let expenseTablePage = 1;
const expenseTablePageSize = 4;
const expenseTablePrevPage = document.getElementById('expenseTablePrevPage');
const expenseTableNextPage = document.getElementById('expenseTableNextPage');
const expenseTablePageNumber = document.getElementById('expenseTablePageNumber');

expenseTablePrevPage.addEventListener('click', async function() {
  if (expenseTablePage > 1) {
    expenseTablePage--;
    renderExpenses();
  } else {
    
  }
});

expenseTableNextPage.addEventListener('click', async function() {
  expenseTablePage++;
  renderExpenses();
})

function fetchExpense() {
  return axios.get(`http://localhost:3000/expense/getExpense?page=${expenseTablePage}&pageSize=${expenseTablePageSize}`, { headers: { "Authorization": token }}) 
    .then(res => {
      return res.data.expenses;
    })
    .catch(err => {
      console.error(err);
    });
}

function renderExpenses() {
  fetchExpense()
    .then(expenseData => {
      const expenseTableBody = document.getElementById('expenseTableBody');
      expenseTableBody.innerHTML = '';

      if (expenseData && expenseData.length > 0) {
        expenseData.forEach(expense => {
          const newRow = document.createElement("tr");
          newRow.dataset.id = expense.id;
          newRow.innerHTML = `
            <td class="text-center">${expense.spentAmount}</td>
            <td class="text-center">${expense.description}</td>
            <td class="text-center">${expense.category}</td>
            <td class="text-center"><button class="btn btn-danger delete-btn">Delete</button></td>
          `;

          expenseTableBody.appendChild(newRow);
        });
        expenseTablePageNumber.textContent = expenseTablePage;
      }
    })
    .catch(err => {
      console.error(err);
    });
}

// Add event listener to handle delete buttons
document.getElementById("expenseTableBody").addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-btn")) {
    const row = event.target.closest("tr");
    const expenseId = row.dataset.id;
    axios.delete(`http://localhost:3000/expense/deleteExpense/${expenseId}`, { headers: { "Authorization": token }})
      .then(() => {
        row.remove();
        renderExpenses('daily');  // Refresh daily view after deleting expense
        showLeaderboard();
      })
      .catch(err => {
        console.error(err);
      });
  }
});

document.getElementById('rzp-button1').addEventListener('click', async function(e) {
  try {
    const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: { "Authorization": token }});

    const options = {
      "key": response.data.key_id,
      "order_id": response.data.order.id,
      "handler": async function (razorpayResponse) {
        try {
          await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
            order_id: response.data.order.id,
            payment_id: razorpayResponse.razorpay_payment_id,
          }, { headers: { "Authorization": token }});

          document.getElementById('successModal').style.display = 'block';
          document.getElementById('showLeaderboard').style.display = 'block'; 

        } catch (err) {
          console.error(err);
          alert("Failed to update transaction status. Please try again later.");
        }
      },
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on('payment.failed', function (response){
      console.log(response);
      document.getElementById('failModal').style.display = 'block';
    });
  } catch (err) {
    console.error(err);
    alert("Failed to initiate premium membership purchase. Please try again later.");
  }
});

// Event listener for "OK" button in modals
document.getElementById('okButton').addEventListener('click', function() {
  document.getElementById('successModal').style.display = 'none';
  checkPremiumStatus();
});

document.getElementById('okButtonFailed').addEventListener('click', function() {
  document.getElementById('failModal').style.display = 'none';
});

// Leaderboard code 
const showLeaderboardBtn = document.getElementById('showLeaderboardBtn');

showLeaderboardBtn.addEventListener('click', async function() {
  var leaderboard = document.getElementById('leaderboardTable');
  var tablesContainer = document.getElementById('tabsContainer');
  
  if (leaderboard.style.display === 'none' || leaderboard.style.display === '') {
    leaderboard.style.display = 'block';
    tablesContainer.classList.add('lg:grid', 'lg:grid-cols-2', 'gap-8');
  } else {
    leaderboard.style.display = 'none';
    tablesContainer.classList.remove('lg:grid', 'lg:grid-cols-2', 'gap-8');
  }

  showLeaderboard();
});


// Leaderboard Pagination Logics
let leaderboardPage = 1;
const leaderboardPageSize = 4;
const leaderboardPrevPage = document.getElementById('leaderboardPrevPage');
const leaderboardNextPage = document.getElementById('leaderboardNextPage');
const leaderboardPageNumber = document.getElementById('leaderboardPageNumber');

leaderboardPrevPage.addEventListener('click', async function() {
  if (leaderboardPage > 1) {
    leaderboardPage--;
    showLeaderboard();
  }
});

leaderboardNextPage.addEventListener('click', async function() {
  leaderboardPage++;
  showLeaderboard();
})

async function showLeaderboard() {
  try {
    const userLeaderboardArray = await axios.get(`http://localhost:3000/premium/showLeaderboard?page=${leaderboardPage}&pageSize=${leaderboardPageSize}`, { headers: { "Authorization": token }});

    const userDetails = userLeaderboardArray.data;
    const leaderboardTableBody = document.getElementById('leaderboardTableBody');
    leaderboardTableBody.innerHTML = '';

    userDetails.forEach(userDetails => {
      const newRow = document.createElement("tr");
      newRow.dataset.name = userDetails.name;
      newRow.dataset.id = userDetails.id;
      newRow.innerHTML = `
        <td class="text-center">${userDetails.name}</td>
        <td class="text-center">$ ${userDetails.total_cost}</td>
      `;

      leaderboardTableBody.appendChild(newRow);
    }); 
    leaderboardPageNumber.textContent = leaderboardPage;
  } catch (err) {
    console.log(err);
  }
}

async function download() {
  try {
    axios.get('http://localhost:3000/expense/download', { headers: { 'Authorization': token }})
    .then((res) => {
      if(res.status === 200) {
        // postDownloads();
        loadPreviousDownloads();
        var a = document.createElement('a');
        a.href = res.data.fileURL;
        a.download = 'myexpense.csv';
        a.click();
      } else {
        throw new Error(res.data.message);
      }
    })
  } catch (err) {
    console.log(err);
  }
}

// Previous Downloads
let previousDownloadsPage = 1;
const previousDownloadsSize = 5;
const previousDownloadsPrevPage = document.getElementById('previousDownloadsPrevPage');
const previousDownloadsNextPage = document.getElementById('previousDownloadsNextPage');
const previousDownloadsPageNumber = document.getElementById('previousDownloadsPageNumber');
const previousDownloadsBtn = document.getElementById('previousDownloadsBtn');

previousDownloadsPrevPage.addEventListener('click', async function() {
  if (previousDownloadsPage > 1) {
    previousDownloadsPage--;
    loadPreviousDownloads();
  }
});

previousDownloadsNextPage.addEventListener('click', async function() {
  previousDownloadsPage++;
  loadPreviousDownloads();
});

previousDownloadsBtn.addEventListener('click', function() {
  var previousDownloadsTable = document.getElementById('previousDownloadsTable');
  loadPreviousDownloads();
  if (previousDownloadsTable.style.display === 'none') {
    previousDownloadsTable.style.display = 'block';
  } else {
    previousDownloadsTable.style.display = 'none';
  }
});

async function loadPreviousDownloads() {
  try {
    const response = await axios.get(`http://localhost:3000/expense/getDownloads?page=${previousDownloadsPage}&pageSize=${previousDownloadsSize}`, { headers: { 'Authorization': token } });
    const previousDownloads = response.data;
    console.log(previousDownloads);
    const tableBody = document.getElementById('previousDownloadsTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    previousDownloads.forEach(download => {
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
    previousDownloadsPageNumber.textContent = previousDownloadsPage;
  } catch (err) {
    console.error(err);
  }
}
