// ====== DATA SETUP ======
let profiles = JSON.parse(localStorage.getItem("profiles")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// ====== DOM Elements ======
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const showSignupBtn = document.getElementById("showSignup");
const authSection = document.getElementById("authSection");
const marketSection = document.getElementById("marketSection");
const logoutBtn = document.getElementById("logoutBtn");
const profileIcon = document.getElementById("profileIcon");
const themeToggle = document.getElementById("themeToggle");
const cardContainer = document.getElementById("cardContainer");
const searchInput = document.getElementById("searchInput");

// Notifications
const notificationIcon = document.getElementById("notificationIcon");
const notificationCount = document.getElementById("notificationCount");
const notificationDropdown = document.getElementById("notificationDropdown");

// Profile Modal
const profileModal = document.getElementById("profileModal");

// ====== Show Signup ======
showSignupBtn.addEventListener("click", () => {
  loginForm.style.display = "none";
  showSignupBtn.style.display = "none";
  document.getElementById("signupTitle").style.display = "block";
  signupForm.style.display = "block";
});

// ====== Signup ======
signupForm.addEventListener("submit", function(e){
  e.preventDefault();
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const name = document.getElementById("name").value.trim();
  const offer = document.getElementById("offer").value.trim();
  const want = document.getElementById("want").value.trim();
  const availability = document.getElementById("availability").value.trim();
  const bio = document.getElementById("bio").value.trim();

  if(profiles.some(p => p.username === username)){
    alert("Username already exists!");
    return;
  }

  const profile = {username, password, name, offer, want, availability, bio};
  profiles.push(profile);
  localStorage.setItem("profiles", JSON.stringify(profiles));

  alert("Profile created! Please login.");
  location.reload();
});

// ====== Login ======
loginForm.addEventListener("submit", function(e){
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const user = profiles.find(p => p.username === username && p.password === password);
  if(!user){ alert("Invalid username or password!"); return; }

  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  showMarketplace();
});

// ====== Logout ======
logoutBtn.addEventListener("click", function(){
  currentUser = null;
  localStorage.removeItem("currentUser");
  location.reload();
});

// ====== Show Marketplace ======
function showMarketplace(){
  authSection.style.display = "none";
  marketSection.style.display = "block";
  logoutBtn.style.display = "inline-block";
  profileIcon.style.display = "inline-block";
  notificationIcon.style.display = "inline-block"; // always show icon
  displayProfiles(profiles);
  updateNotifications();
}

// ====== Display Profiles ======
function displayProfiles(data){
  cardContainer.innerHTML = "";
  const filteredProfiles = data.filter(profile => profile.username !== currentUser.username);

  filteredProfiles.forEach(profile => {
    const connectionKey = [currentUser.username, profile.username].sort().join("_");
    const connections = JSON.parse(localStorage.getItem("connections")) || {};
    const status = connections[connectionKey];

    const card = document.createElement("div");
    card.classList.add("card");

    let buttonHTML = "";
    if(status === "accepted") buttonHTML = `<button onclick="openChatWith('${profile.username}')">Chat</button>`;
    else if(status === "pending" && profile.username !== currentUser.username) buttonHTML = `<button disabled>Pending</button>`;
    else buttonHTML = `<button onclick="sendConnectRequest('${profile.username}')">Connect</button>`;

    card.innerHTML = `
      <h3>${profile.name}</h3>
      <p><strong>Offers:</strong> ${profile.offer}</p>
      <p><strong>Wants:</strong> ${profile.want}</p>
      <p><strong>Available:</strong> ${profile.availability}</p>
      <p>${profile.bio}</p>
      ${buttonHTML}
    `;

    cardContainer.appendChild(card);
  });
}

// ====== Search ======
searchInput.addEventListener("input", function(){
  const value = searchInput.value.toLowerCase();
  const filtered = profiles.filter(p=>
    p.username !== currentUser.username &&
    (p.offer.toLowerCase().includes(value) || p.want.toLowerCase().includes(value))
  );
  displayProfiles(filtered);
});

// ====== Connect Requests ======
function sendConnectRequest(username){
  const sortedKey = [currentUser.username, username].sort().join("_");
  let connections = JSON.parse(localStorage.getItem("connections")) || {};
  if(connections[sortedKey] === "accepted"){
    openChatWith(username);
    return;
  }
  connections[sortedKey] = "pending";
  localStorage.setItem("connections", JSON.stringify(connections));
  alert(`Connection request sent to ${username}`);
  displayProfiles(profiles);
  updateNotifications();
}

// ====== Notifications ======
function updateNotifications(){
  const connections = JSON.parse(localStorage.getItem("connections")) || {};
  const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};
  const unreadMessages = JSON.parse(localStorage.getItem("unreadMessages")) || {};

  let pendingRequests = [];
  for(const key in connections){
    if(connections[key] === "pending"){
      const users = key.split("_");
      if(users.includes(currentUser.username) && users[0] !== currentUser.username){
        const otherUser = users.find(u=>u!==currentUser.username);
        pendingRequests.push(otherUser);
      }
    }
  }

  let messageNotifs = [];
  for(const key in unreadMessages){
    if(unreadMessages[key] > 0 && key.includes(currentUser.username)){
      const users = key.split("_");
      const otherUser = users[0] === currentUser.username ? users[1] : users[0];
      messageNotifs.push(otherUser);
    }
  }

  const totalCount = pendingRequests.length + messageNotifs.length;
  notificationCount.style.display = totalCount ? "inline-block" : "none";
  notificationCount.textContent = totalCount;

  notificationDropdown.innerHTML = "";

  // Connection Requests
  pendingRequests.forEach(u=>{
    const profile = profiles.find(p=>p.username===u);
    const div = document.createElement("div");
    div.style.padding = "8px 12px";
    div.style.borderBottom = "1px solid #ddd";
    div.innerHTML = `
      <p><strong>${profile.name}</strong> wants to connect</p>
      <button onclick="acceptRequest('${[currentUser.username,u].sort().join("_")}')">Accept</button>
      <button onclick="declineRequest('${[currentUser.username,u].sort().join("_")}')">Decline</button>
    `;
    notificationDropdown.appendChild(div);
  });

  // Message Notifications
  messageNotifs.forEach(u=>{
    const profile = profiles.find(p=>p.username===u);
    const div = document.createElement("div");
    div.style.padding = "8px 12px";
    div.style.borderBottom = "1px solid #ddd";
    div.innerHTML = `
      <p><strong>Message from ${profile.name}</strong></p>
      <button onclick="openChatWith('${u}')">Open Chat</button>
    `;
    notificationDropdown.appendChild(div);
  });
}

// Toggle dropdown
notificationIcon.addEventListener("click", ()=>{
  notificationDropdown.style.display = notificationDropdown.style.display==="none"?"block":"none";
});
document.addEventListener("click",(e)=>{
  if(!document.getElementById("notificationWrapper").contains(e.target)){
    notificationDropdown.style.display="none";
  }
});

// Accept/Decline
function acceptRequest(key){
  let connections = JSON.parse(localStorage.getItem("connections")) || {};
  connections[key] = "accepted";
  localStorage.setItem("connections", JSON.stringify(connections));
  updateNotifications();
  displayProfiles(profiles);
  alert("Connection accepted! You can now chat.");
}

function declineRequest(key){
  let connections = JSON.parse(localStorage.getItem("connections")) || {};
  connections[key] = "declined";
  localStorage.setItem("connections", JSON.stringify(connections));
  updateNotifications();
  displayProfiles(profiles);
}

// ====== Open Chat ======
function openChatWith(username){
  localStorage.setItem("chatWith", username);
  let unreadMessages = JSON.parse(localStorage.getItem("unreadMessages")) || {};
  const key = [currentUser.username, username].sort().join("_");
  unreadMessages[key] = 0;
  localStorage.setItem("unreadMessages", JSON.stringify(unreadMessages));
  updateNotifications();
  window.location.href = "chat.html";
}

// ====== Profile Edit ======
profileIcon.addEventListener("click", ()=>{
  document.getElementById("editUsername").value=currentUser.username;
  document.getElementById("editPassword").value=currentUser.password;
  document.getElementById("editName").value=currentUser.name;
  document.getElementById("editOffer").value=currentUser.offer;
  document.getElementById("editWant").value=currentUser.want;
  document.getElementById("editAvailability").value=currentUser.availability;
  document.getElementById("editBio").value=currentUser.bio;
  profileModal.style.display="flex";
});

function closeProfileModal(){ profileModal.style.display="none"; }

document.getElementById("editProfileForm").addEventListener("submit", function(e){
  e.preventDefault();
  const newUsername = document.getElementById("editUsername").value.trim();
  const newPassword = document.getElementById("editPassword").value.trim();
  if(profiles.some(p=>p.username===newUsername && p.username!==currentUser.username)){
    alert("Username already taken!"); return;
  }

  currentUser.username = newUsername;
  currentUser.password = newPassword;
  currentUser.name = document.getElementById("editName").value.trim();
  currentUser.offer = document.getElementById("editOffer").value.trim();
  currentUser.want = document.getElementById("editWant").value.trim();
  currentUser.availability = document.getElementById("editAvailability").value.trim();
  currentUser.bio = document.getElementById("editBio").value.trim();

  const index = profiles.findIndex(p=>p.username===currentUser.username);
  if(index!==-1) profiles[index]=currentUser;

  localStorage.setItem("profiles", JSON.stringify(profiles));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  displayProfiles(profiles);
  updateNotifications();
  alert("Profile updated!");
  closeProfileModal();
});

// ====== Theme Toggle ======
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark")
    ? "☀️"
    : "🌙";
});

// ====== Auto Login Check ======
if(currentUser){ showMarketplace(); }

// ====== Polling for notifications ======
setInterval(()=>{
  if(currentUser){ updateNotifications(); }
},3000);
