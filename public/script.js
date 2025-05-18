// Handle Registration Form Submission
const signupForm = document.getElementById('signupForm'); // Get the signup or registration form element
if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        const formData = new FormData(signupForm); // Collect form data
        const data = Object.fromEntries(formData.entries()); // Convert form data to an object

        try {
            // Send a POST request to the signup API
            const response = await fetch('/api/signup', {
                method: 'POST', // HTTP method
                headers: {
                    'Content-Type': 'application/json', // Specify content type
                },
                body: JSON.stringify(data), // Convert data to JSON
            });

            if (response.ok) {
                const result = await response.json(); // Parse the JSON response
                window.location.href = result.redirectUrl; // Redirect to profile page
            } else {
                const errorText = await response.text(); // Get error message
                alert('Error: ' + errorText); // Alert the user of the error
            }
        } catch (error) {
            console.error('Error during signup:', error); // Log any errors
            alert('An error occurred. Please try again.'); // Alert the user of the error
        }
    });
}
