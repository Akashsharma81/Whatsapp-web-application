
// import { Picker } from 'emoji-picker-react';
const socket = io('http://localhost:8000');
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageinp');
const messageContainer = document.getElementById('container'); // Correct ID
const typingStatus = document.getElementById("typing-status");
const emojiButton = document.getElementById('emoji-btn');
const fileInput = document.getElementById('file-input');
const fileButton = document.getElementById('file-btn');

// Emit typing event when input is active

messageInput.addEventListener("input", () => {
  socket.emit("typing");
});

// Emit stop typing when input is empty
messageInput.addEventListener("blur", () => {
  socket.emit("stop-typing");
});

// Listen for typing events
socket.on("user-typing", (userName) => {
  typingStatus.textContent = `${userName} is typing...`;
  typingStatus.style.visibility = "visible";
});

// Listen for stop typing event
socket.on("user-stopped-typing", () => {
  typingStatus.style.visibility = "hidden";
});

//file input and send file

document.getElementById('file-btn').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });
  
  document.getElementById('file-input').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      socket.emit('send-file', { fileName: file.name, fileContent: file });
    }
  });

  socket.on('receive-file', ({ fileName }) => {
    append(`${fileName} shared a file`, 'left');
  });


var audio = new Audio('ting.mp3');
const scrollToBottom = () => {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  };
  

const append = (message, position) => {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageElement.classList.add('message');
  messageElement.classList.add(position);
  messageContainer.append(messageElement);
  if (position === 'left') {
    audio.play();
  }
  scrollToBottom();
};

//handle emoji picker
const emojiPicker = document.createElement('emoji-picker');
document.body.appendChild(emojiPicker);
emojiPicker.style.display = 'none';

emojiButton.addEventListener('click', () => {
  emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
});

emojiPicker.addEventListener('emoji-click', (event) => {
  messageInput.value += event.detail.unicode;
});


// Handle file sharing
fileButton.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const fileData = reader.result;
      socket.emit('send-file', { fileName: file.name, fileContent: fileData });
    };
    reader.readAsDataURL(file);
  }
});


socket.on('receive-file', ({ fileName, fileContent }) => {
    if (fileContent.startsWith("data:image")) {
      const img = document.createElement('img');
      img.src = fileContent;
      img.alt = fileName;
      img.style.maxWidth = '200px';
      messageContainer.appendChild(img);
    } else {
      appendMessage(`${fileName} shared`, 'left');
    }
  });


form.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value;
  append(`You: ${message}`, 'right');
  socket.emit('send', message);
  messageInput.value = '';
});

let userName;
while (!userName) {
  userName = prompt("Enter your userName to join");
}
socket.emit('new-user-joined', userName);


socket.on('user-joined', userName => {
  append(`${userName} joined the chat`, 'right');
});

//typing status dikhega
messageInput.addEventListener('input', () => socket.emit('typing'));
messageInput.addEventListener('blur', () => socket.emit('stop-typing'));
socket.on('user-typing', (userName) => {
    typingStatus.innerText = `${userName} is typing...`;
    typingStatus.style.visibility = 'visible';
  });
  
  socket.on('user-stopped-typing', () => {
    typingStatus.style.visibility = 'hidden';
  });
  

socket.on('receive', data => {
  append(`${data.userName}: ${data.message}`, 'left');
});

socket.on('user-left', userName => {
  append(`${userName}: left the chat`, 'left');
});
