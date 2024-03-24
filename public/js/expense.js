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
      renderExpenses();
    } catch (err) {
      console.error(err);
    }
  });
});

function fetchExpense() {
  return axios.get('http://localhost:3000/expense/getExpense')
    .then(res => {
      return res.data.expense;
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

      expenseData.forEach(expense => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>${expense.spentAmount}</td>
          <td>${expense.description}</td>
          <td>${expense.category}</td>
          <td><button class="btn btn-danger delete-btn">Delete</button></td>
        `;
        expenseTableBody.appendChild(newRow);
      });
    });
}

// Add event listener to handle delete buttons
document.getElementById("expenseTableBody").addEventListener("click", function(event) {
  if (event.target.classList.contains("delete-btn")) {
    const row = event.target.closest("tr");
    const expenseId = row.dataset.id;
    axios.delete(`http://localhost:3000/expense/deleteExpense/${expenseId}`)
      .then(() => {
        row.remove();
      })
      .catch(err => {
        console.error(err);
      });
  }
});