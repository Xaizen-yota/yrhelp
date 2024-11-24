// Retrieve users from local storage or initialize as empty array
const users = JSON.parse(localStorage.getItem('users')) || [];

// Elements for user profiles and search input
const userProfiles = document.getElementById("userProfiles");
const searchInput = document.getElementById("userSearchInput");


// Function to generate HTML for a user card
function generateUserCard(user, index) {
  return `
    <div class="user-card" data-index="${index}">
      <img src="${user.photo}" alt="${user.name}" title="${user.name}" class="user-card__img">
      <h3 class="user-card__name">${user.name}</h3>
      <div class="menu">
        <li class="menu__item" style="--i:1;--clr:#ff0000"><a href="${user.youtube}" target="_blank" class="menu__link"><i class="fab fa-youtube"></i></a></li>
        <li class="menu__item" style="--i:2;--clr:#010101;"><a href="${user.tiktok}" target="_blank" class="menu__link"><i class="fab fa-tiktok"></i></a></li>
        <li class="menu__item" style="--i:3;--clr:#c32aa3;"><a href="${user.instagram}" target="_blank" class="menu__link"><i class="fab fa-instagram"></i></a></li>
        <li class="menu__item" style="--i:5;--clr:#25d366;"><a href="#" onclick="markDone(this)" class="menu__link"><i class="fas fa-check"></i></a></li>
        <div class="menu__toggle">
          <i class="fas fa-ellipsis-h"></i>
          <i class="fas fa-times"></i>
        </div>
      </div>
    </div>
  `;
}

// Function to render user cards
function renderUserCards(usersToRender) {
  // Clear existing user profiles
  userProfiles.innerHTML = "";
  usersToRender.forEach((user, index) => {
    // Create and append each user card
    const userCard = document.createElement("div");
    userCard.innerHTML = generateUserCard(user, index);
    userProfiles.appendChild(userCard);
  });

  // Add toggle functionality for user menu
  let toggles = document.querySelectorAll('.menu__toggle');
  toggles.forEach(toggle => {
    toggle.onclick = function () {
      this.parentElement.classList.toggle('menu--active');
    }
  });
}

// Function to filter users based on search input
function filterUsers() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchValue) || 
    user.country.toLowerCase().includes(searchValue)
  );
  renderUserCards(filteredUsers);
}

// Function to mark user as done
function markDone(button) {
  button.closest('.user-card').style.backgroundColor = '#28a745';
  button.onclick = null; // Disable the button
}

// Event listener for search input
searchInput.addEventListener("input", filterUsers);

// Event listener for logout button
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'login.html';
});
