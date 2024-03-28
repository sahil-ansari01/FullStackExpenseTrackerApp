document.getElementById('signupButton').addEventListener('click', function() {
    window.location.href = '/user/signup';
});

async function login(e) {
    try {
        e.preventDefault();

        const loginDetails = {
            email: e.target.email.value,
            password: e.target.password.value
        };

        const res = await axios.post('http://localhost:3000/user/login', loginDetails);
        
        if (res.status === 200) {
            alert(res.data.message);
            window.location.href = '../html/expense.html';
        } else {
            alert(res.data.message);
        }
    } catch (err) {
        alert(err.res.data.message);
    }
}
