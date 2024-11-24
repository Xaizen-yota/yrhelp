// Retrieve users from local storage or initialize as empty array
const users = JSON.parse(localStorage.getItem('users')) || [];

// Elements for user profiles, search input, and add user button
const userProfiles = document.getElementById("adminUserProfiles");
const searchInput = document.getElementById("adminSearchInput");
const addUserBtn = document.getElementById("adminAddUserBtn");

// Elements for choice modal
const addChoiceModal = document.getElementById("addChoiceModal");
const manualAddBtn = document.getElementById("manualAddBtn");
const autoAddBtn = document.getElementById("autoAddBtn");
const closeModalButtons = document.querySelectorAll(".close");

// Scraping elements
const scrapeDataFormContainer = document.getElementById("scrapeDataFormContainer");
const scrapeDataForm = document.getElementById("scrapeDataForm");
const scrapedDataContainer = document.getElementById("scrapedDataContainer");
const scrapedCountry = document.getElementById("scrapedCountry");
const scrapedInstagram = document.getElementById("scrapedInstagram");
const scrapedYouTube = document.getElementById("scrapedYouTube");
const scrapedTikTok = document.getElementById("scrapedTikTok");


// Show choice modal when add user button is clicked
if (addUserBtn) {
  addUserBtn.addEventListener("click", () => {
    addChoiceModal.style.display = "block";
  });
}

// Close modals when 'x' is clicked
closeModalButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    addChoiceModal.style.display = "none";
    scrapeDataFormContainer.style.display = "none";
    scrapedDataContainer.style.display = "none";
    uploadDataFormContainer.style.display = "none";
});
});

// Close modals when clicking outside of them
window.addEventListener("click", (event) => {
  if (event.target == addChoiceModal) {
    addChoiceModal.style.display = "none";
  } else if (event.target == scrapeDataFormContainer) {
    scrapeDataFormContainer.style.display = "none";
  } else if (event.target == scrapedDataContainer) {
    scrapedDataContainer.style.display = "none";
  }
});



//////////////////////////////////////////////////////////////////////////////////////////////////// Add and display post existing in the backend  //////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", async () => {
  // First, check if posts exist in localStorage
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // If posts are not found in localStorage, fetch them from the backend
  if (users.length === 0) {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/posts");
      if (response.ok) {
        const responseData = await response.json();
        users = responseData.posts || [];  // Assuming 'posts' contains the list of posts
        localStorage.setItem("users", JSON.stringify(users));  // Save to localStorage
      } else {
        throw new Error("Failed to fetch posts.");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  renderUserCards(users);  
});




// Handling new user addition/////////////////////////////////////////

if (manualAddBtn) {
  manualAddBtn.addEventListener("click", async () => {
    addChoiceModal.style.display = "none";

    const newName = await promptInput("Enter the user's name:");
    const newCountry = await promptInput("Enter the user's country:");
    const newPhoto = await promptInput("Enter the user's photo URL:");
    const newYouTube = await promptInput("Enter the user's YouTube URL:");
    const newTikTok = await promptInput("Enter the user's TikTok URL:");
    const newInstagram = await promptInput("Enter the user's Instagram URL:");

    if (newName && newCountry && newPhoto && newYouTube && newTikTok && newInstagram) {
      const newUser = {
        name: newName,
        country: newCountry,
        photo: newPhoto,
        youtube: newYouTube,
        tiktok: newTikTok,
        instagram: newInstagram,
      };

      try {
        const response = await fetch("http://127.0.0.1:8000/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(newUser),
        });

        if (response.ok) {
          const responseData = await response.json(); // Parse the response JSON
          const post = responseData.post; // Extract the `post` object from the response

          // Make sure the post has an `id`
          if (post.id) {
            users.push(post); // Directly add the post object with the id
            localStorage.setItem("users", JSON.stringify(users));
            renderUserCards(users);
            alert(responseData.message || "User added successfully!");
          } else {
            throw new Error('Post ID not returned from backend');
          }
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error adding user. Please try again.");
      }
    } else {
      alert("All fields are required to add a new user.");
    }
  });
}



// Function to remove the user both from UI and backend///////////////////////////////////////////:::::::::::::::::::::::::::::::::






async function removeUser(index) {
  if (confirm("Are you sure you want to delete this user?")) {
    const userId = users[index].id; // Ensure each user has an `id`

    try {
      // Send DELETE request to the backend
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'User deleted successfully!');

        // Remove the user from the local array
        users.splice(index, 1);
        localStorage.setItem("users", JSON.stringify(users));

        renderUserCards(users); // Re-render the updated list
      } else {
        throw new Error(data.message || 'Failed to delete user from the backend');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Failed to delete user');
    }
  }
}
// Utility Functions

/**
 * Function to prompt user input asynchronously.
 * @param {string} message - The message to display in the prompt.
 * @returns {Promise<string|null>} - The user's input or null if canceled.
 */
async function promptInput(message) {
  return new Promise((resolve) => {
    const userInput = prompt(message);
    resolve(userInput?.trim() || null); // Resolve with trimmed input or null
  });
}

/**
 * Function to render user cards dynamically on the page.
 * @param {Array} users - Array of user objects to display.
 */


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
        <li class="menu__item" style="--i:4;--clr:#d32323;"><a href="#" onclick="removeUser(${index})" class="menu__link"><i class="fas fa-trash-alt"></i></a></li>
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
  localStorage.setItem('users', JSON.stringify(users));

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

// Function to prompt for user input
function promptInput(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'prompt-overlay';

    const container = document.createElement('div');
    container.className = 'prompt-container';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'prompt-input';
    input.placeholder = message;

    container.appendChild(input);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    input.focus();

    // Resolve the promise with input value when Enter key is pressed
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        resolve(input.value);
        document.body.removeChild(overlay);
      }
    });
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////////// deleate Post   //////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to remove the user both from UI and backend
async function removeUser(index) {
  if (confirm("Are you sure you want to delete this user?")) {
    const userId = users[index].id; // Assuming each user has an 'id' property

    try {
      // Send DELETE request to the backend
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${userId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Successfully deleted from backend
        alert(data.message || 'User deleted successfully!');

        // Remove the user from the local users array
        users.splice(index, 1);

        // Update the users in localStorage
        localStorage.setItem("users", JSON.stringify(users));

        // Re-render the user cards
        renderUserCards(users);
      } else {
        throw new Error(data.message || 'Failed to delete user from the backend');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Failed to delete user');
    }
  }
}



// Initial load of users from localStorage or backend
document.addEventListener("DOMContentLoaded", async () => {
  let users = JSON.parse(localStorage.getItem("users")) || [];  // Get users from localStorage or set to empty array

  // If users are not in localStorage, fetch from the backend
  if (users.length === 0) {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/posts");
      if (response.ok) {
        const responseData = await response.json();
        users = responseData.posts || [];  // Assuming 'posts' contains the list of users
        localStorage.setItem("users", JSON.stringify(users));  // Save to localStorage
      } else {
        throw new Error("Failed to fetch users from backend");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  renderUserCards(users);  // Render users after loading
});


















// Event listener for search input
searchInput.addEventListener("input", filterUsers);

// Event listener for logout button
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'login.html';
});

// Upload elements
const uploadBtn = document.getElementById("uploadBtn");
const uploadDataFormContainer = document.getElementById("uploadDataFormContainer");
const uploadDataForm = document.getElementById("uploadDataForm");

// Close all modals
function closeAllModals() {
  addChoiceModal.style.display = "none";
  scrapeDataFormContainer.style.display = "none";
  uploadDataFormContainer.style.display = "none";
  scrapedDataContainer.style.display = "none";
}

// Close modals when 'x' is clicked
closeModalButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    closeAllModals(); // Ensure all modals are closed when any close button is clicked
  });
});

// Close modals when clicking outside of them
window.addEventListener("click", (event) => {
  if (event.target == addChoiceModal) {
    closeAllModals();
  } else if (event.target == scrapeDataFormContainer) {
    closeAllModals();
  } else if (event.target == uploadDataFormContainer) {
    closeAllModals();
  } else if (event.target == scrapedDataContainer) {
    closeAllModals();
  }
});

// Open upload data modal
if (uploadBtn) {
  uploadBtn.addEventListener("click", () => {
    closeAllModals();
    uploadDataFormContainer.style.display = "block";
  });
}

// Handle upload data form submission
if (uploadDataForm) {
  uploadDataForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://127.0.0.1:5000/upload", {
          method: "POST",
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          if (result.users && result.users.length > 0) {
            result.users.forEach(user => users.push(user));
            renderUserCards(users);
            localStorage.setItem('users', JSON.stringify(users));
          }
          alert("File uploaded successfully");
        } else {
          alert("Failed to upload file");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to upload file");
      }
    } else {
      alert("Please select a file to upload");
    }
  });
}
