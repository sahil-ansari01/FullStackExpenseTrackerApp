document.addEventListener('DOMContentLoaded', function () {
  renderExpenses();

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
      const res = await axios.post('http://localhost:3000/expense/postExpense', expenseDetails);
      console.log(res.data);
      renderExpenses();
    } catch (err) {
      console.error(err);
    }
  });
});

function fetchExpense() {
  return axios.get('http://localhost:3000/expense/getExpense')
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
                      <td>${expense.spentAmount}</td>
                      <td>${expense.description}</td>
                      <td>${expense.category}</td>
                      <td><button class="btn btn-danger delete-btn">Delete</button></td>
                  `;
                  expenseTableBody.appendChild(newRow);
              });
          } else {
              console.log("No expenses found.");
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
      console.log(expenseId); // Ensure you're getting the correct expense ID
      axios.delete(`http://localhost:3000/expense/deleteExpense/${expenseId}`)
          .then(() => {
              row.remove();
          })
          .catch(err => {
              console.error(err);
          });
  }
});