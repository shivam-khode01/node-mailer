const socket = io('http://localhost:5000');

// Listen for real-time submission updates
socket.on('newemail', (data) => {
  console.log('New submission received:', data);
  // Update the UI as needed
});
