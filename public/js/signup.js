document.getElementById('loginButton').addEventListener('click', function() {
    window.location.href = '/user/login';
});

async function signup(e) {
    try {
        e.preventDefault();
        
        const signupDetails = {
            name: e.target.name.value,
            email: e.target.email.value,
            password: e.target.password.value
        }
        
        console.log(signupDetails);
        const response = await axios.post('http://localhost:3000/user/signup', signupDetails)

        if (response.status === 201) {
            window.location.href = '/user/login';
        } else {
            throw new Error('Failed to login')
        }

    } catch (err) {
        alert(err);
    }
}