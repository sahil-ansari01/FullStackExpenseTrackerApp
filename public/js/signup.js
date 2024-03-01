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