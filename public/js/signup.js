document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            window.location.href = '/user/login';
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', signup);
    }
});

async function signup(e) {
    try {
        e.preventDefault();
        
        const signupDetails = {
            name: e.target.name.value,
            email: e.target.email.value,
            password: e.target.password.value
        }
        
        const response = await axios.post('http://3.85.228.232:3000/user/signup', signupDetails)

        console.log(response);
        if (response.status === 201) {
            window.location.href = '/user/login';
        } else {
            throw new Error('Failed to login')
        }

    } catch (error) {
        if (error.response) {
            // If the error is a response from the server (e.g., status code 400)
            if (error.response.status === 400) {
                alert(error.response.data.error); 
            } else {
                alert('An error occurred'); 
            }
        } else if (error.request) {
            // If the request was made but no response was received
            alert('No response from server');
        } else {
            // If an error occurred during the request setup
            alert('Error setting up request');
        }
    }
}