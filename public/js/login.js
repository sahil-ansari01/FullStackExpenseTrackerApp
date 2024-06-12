document.getElementById('signupButton').addEventListener('click', function() {
    window.location.href = '/user/signup';
});

const token = localStorage.getItem('token');

async function login(e) {
    try {
        e.preventDefault();

        const loginDetails = {
            email: e.target.email.value,
            password: e.target.password.value
        };

        const res = await axios.post('http://18.206.181.58:3000/user/login', loginDetails);
        
        if (res.status === 200) {
            alert(res.data.message);
            localStorage.setItem('token', res.data.token);
            window.location.href = '../html/expense.html';
        } else {
            alert(res.data.message);
        }
    } catch (err) {
        alert(err.response.data.message);
    }
}

function showForgotPasswordForm() {
    document.getElementById('forgotPasswordForm').style.display = 'block';
}

async function submitForgotPassword(event) {
    try {
        event.preventDefault();
        const email = document.getElementById('forgotEmail').value;
        
        const res = await axios.post('http://18.206.181.58:3000/resetpassword/forgetpassword', { email }, { headers: {'Authentication': token }});
        if (res.status === 200) {
            alert('Password reset link sent to your email');
            document.getElementById('forgotPasswordForm').style.display = 'none';
        } else {
            alert('Failed to send password reset link');
        }
    } catch (err) {
        alert('Failed to send password reset link');
        console.error(err);
    }
}
