const token = localStorage.getItem('token')

document.addEventListener('DOMContentLoaded', async function () {

  renderExpenses();
  // await checkPremiumStatus();

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
      const res = await axios.post('http://localhost:3000/expense/postExpense', expenseDetails, { headers: { "Authorization": token }});  
      renderExpenses();
    } catch (err) {
      console.error(err);
    }

    document.getElementById('spentAmount').value = "";
    document.getElementById('description').value = "";
    document.getElementById('category').value = "Food";

  });
});

async function checkPremiumStatus() {
  try {
      const response = await axios.get('http://localhost:3000/user/premiumstatus', { headers: { "Authorization": token } });
      if (response.data.isPremium) {
          replacePremiumButton();
      }
  } catch (err) {
      console.error(err);
      alert("Failed to check premium status. Please try again later.");
  }
}

function replacePremiumButton() {
  const premiumButton = document.getElementById('rzp-button1');
  const premiumText = document.createElement('p');
  premiumText.textContent = "You are a Premium User";
  premiumButton.parentNode.replaceChild(premiumText, premiumButton);
}

function fetchExpense() {
  return axios.get('http://localhost:3000/expense/getExpense', { headers: { "Authorization": token }}) 
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
                  newRow.dataset.id = expense.id; // Set the expense ID as data-id
                  newRow.innerHTML = `
                      <td class="text-center">${expense.spentAmount}</td>
                      <td class="text-center">${expense.description}</td>
                      <td class="text-center">${expense.category}</td>
                      <td class="text-center"><button class="btn btn-danger delete-btn">Delete</button></td>

                  `;

                  expenseTableBody.appendChild(newRow);
              });
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
      const expenseId = row.dataset.id; // Retrieve expense ID from data-id attribute
      axios.delete(`http://localhost:3000/expense/deleteExpense/${expenseId}`, { headers: { "Authorization": token }})
          .then(() => {
              row.remove();
          })
          .catch(err => {
              console.error(err);
          });
  }
});

document.getElementById('rzp-button1').addEventListener('click', async function(e) {
  try {
    const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers : { "Authorization": token }});

    const options = {
      "key": response.data.key_id,
      "order_id": response.data.order.id,
      "handler": async function (razorpayResponse) { // Rename the argument to avoid shadowing
        try {
          await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
            order_id: response.data.order.id, // Use the outer response here
            payment_id: razorpayResponse.razorpay_payment_id, // Use razorpayResponse
          }, { headers: { "Authorization": token }});
          alert('You are a Premium User now!');
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
      alert('Transaction Failed!')
    });
  } catch (err) {
    console.error(err);
    alert("Failed to initiate premium membership purchase. Please try again later.");
  }
});
