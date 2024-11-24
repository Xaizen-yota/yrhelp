document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the logged-in user from local storage
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    // If no logged-in user is found, redirect to the login page
    if (!loggedInUser) {
      window.location.href = 'login.html';
    }
});

function logout() {
    // Remove the logged-in user from local storage and redirect to login page
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}
