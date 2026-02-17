const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const chatWithUsername = localStorage.getItem("chatWith");
const matchedUser = JSON.parse(localStorage.getItem("profiles")).find(p => p.username === chatWithUsername);

document.getElementById("chatTitle").innerText = `${currentUser.name} ↔ ${matchedUser.name}`;

const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");

let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};
const chatKey = [currentUser.username, matchedUser.username].sort().join("_");
if(!chatHistory[chatKey]) chatHistory[chatKey]=[];

// Render existing messages
function renderMessages(){
  chatMessages.innerHTML = "";
  chatHistory[chatKey].forEach(msg=>{
    const div = document.createElement("div");
    div.className = "chat-message "+(msg.sender===currentUser.username?"sent":"received");
    div.textContent = (msg.sender===currentUser.username?"You:":matchedUser.name+":")+" "+msg.text;
    chatMessages.appendChild(div);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

renderMessages();

// Send message
function sendMessage(){
  const text = messageInput.value.trim();
  if(!text) return;
  chatHistory[chatKey].push({sender:currentUser.username, text});
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

  // Mark as unread for other user
  let unreadMessages = JSON.parse(localStorage.getItem("unreadMessages")) || {};
  unreadMessages[chatKey] = unreadMessages[chatKey] || 0;
  unreadMessages[chatKey] += 1;
  localStorage.setItem("unreadMessages", JSON.stringify(unreadMessages));

  messageInput.value="";
  renderMessages();
}

// Allow pressing Enter to send
messageInput.addEventListener("keypress", e=>{
  if(e.key==="Enter") sendMessage();
});

// Back
function goBack(){ window.location.href="index.html"; }

// Dummy calls
function startVoiceCall(){ alert("Voice call feature coming soon!"); }
function startVideoCall(){ alert("Video call feature coming soon!"); }
