document.getElementById('signupButton').addEventListener('click', function() {
    window.location.href = '/user/signup';
});

async function login(e) {
    try {
        e.preventDefault();

        const loginDetails = {
            email: e.target.email.value,
            password: e.target.password.value
        }

        axios.post('http://localhost:3000/user/login', loginDetails)
        .then(res => {
            if (res.status === 200) {
                alert(res.data.message)
            } else if (res.status === 401) {
                alert(res.data.message)
            }
            
        })
    } catch (err) {
        alert(err);
    }
}