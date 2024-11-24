document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.login__tab-link');
    const contents = document.querySelectorAll('.login__tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove 'active' class from all tabs and contents
            tabs.forEach(t => t.classList.remove('login__tab-link--active'));
            contents.forEach(c => c.classList.remove('login__tab-content--active'));

            // Add 'active' class to the clicked tab and corresponding content
            tab.classList.add('login__tab-link--active');
            document.getElementById(tab.getAttribute('data-tab') + 'Form').classList.add('login__tab-content--active');
        });
    });

    // Sign In form submission handling////////////////////////////////////////::


    document.getElementById('signinForm').addEventListener('submit', async function(event) {
        event.preventDefault();
    
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('signin-error');
    
        try {
            // Send login credentials to the backend
            const response = await fetch('http://127.0.0.1:8000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), // Send email instead of username
            });
    
            if (!response.ok) {
                throw new Error('Invalid email or password');
            }
    
            // Parse the JSON response from the backend
            const data = await response.json();
    
            // Store logged-in user data in local storage
            localStorage.setItem('loggedInUser', JSON.stringify(data.user));
    
            // Redirect based on user role
            if (data.user.role === 'admin') {
                window.location.href = 'admin.html'; // Adjust path as needed
            } else {
                window.location.href = 'index.html'; // Adjust path as needed
            }
        } catch (error) {
            // Display error message if login fails
            errorMessage.textContent = error.message;
        }
    });
  
    // Sign Up form submission handling
    document.getElementById('signupForm').addEventListener('submit', async function(event) {
        event.preventDefault();
    
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const errorMessage = document.getElementById('signup-error');

        // Validate form input before sending data to the backend
        const isValid = validateForm(event);
        if (!isValid) return;

        try {
            // Send registration data to the backend
            const response = await fetch('http://127.0.0.1:8000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    // Add CORS headers
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ username, email, password }),
                credentials: 'include',
                mode: 'cors' // Explicitly set CORS mode
            });

            // Check for specific status codes
            if (response.status === 302) {
                // Handle redirect
                const redirectUrl = response.headers.get('Location');
                window.location.href = redirectUrl;
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed. Please try again.');
            }

            // Parse the JSON response from the backend
            const data = await response.json();

            // Display success message
            errorMessage.style.color = 'green'; // Make success message green
            errorMessage.textContent = 'User registered successfully! Redirecting...';
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } catch (error) {
            // Improved error handling
            errorMessage.style.color = 'red';
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                errorMessage.textContent = 'Unable to connect to the server. Please check if the server is running.';
            } else {
                errorMessage.textContent = error.message || 'An error occurred during registration';
            }
            console.error('Registration error:', error); // Add logging for debugging
        }
    });

    // Validation function for the forms
    function validateForm(event) {
        const form = event.target;
        const email = form.querySelector('input[type="email"]');
        const password = form.querySelector('input[type="password"]');
        let valid = true;

        // Reset previous error messages
        const errorMessages = form.querySelectorAll('.login__error-message');
        errorMessages.forEach(msg => msg.textContent = ''); // Clear old errors

        // Validate email
        if (email && !email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            email.nextElementSibling.textContent = 'Please enter a valid email address.';
            valid = false;
        }

        // Validate password strength
        if (password && password.value.length < 6) {
            password.nextElementSibling.textContent = 'Password must be at least 6 characters long.';
            valid = false;
        }

        return valid;
    }
});












/////////////////////////////////////////////////////////////////////////////////////////////////////////////: Sign Up form submission handling///////////////////////////////////////////////////////////////////////////////////////////