const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { Server } = require("socket.io");
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const emails = require("./model/emails");
const path = require("path");
const ejsMate = require("ejs-mate");

// Configure MongoDB
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/mailer', { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected to database");
}
main().catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", 'ejs');
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'username',   
    pass: 'password'
  }
});

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.post('/', async (req, res) => {
  const { name, email, number } = req.body;

  // Save to MongoDB
  try {
    let newEmail = new emails({ name, email, number });
    await newEmail.save();
    console.log("Data saved to MongoDB");

    // Emit event to client
    io.emit('newSubmission', newEmail);

    // Send thank-you email
    const mailOptions = {
      from: 'shivamkhode04@gmail.com',
      to: email,
      subject: 'Thank you for contacting us!',
      text: `Hi ${name},\n\nThank you for reaching out. We will get back to you soon!\n\nBest,\nYour Company`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error sending email');
        return;
      } else {
        console.log('Email sent: ' + info.response);
        res.redirect("/"); // Redirect only after email is successfully sent
      }
    });

  } catch (error) {
    console.error("Error saving data to MongoDB:", error);
    res.status(500).send("Failed to save data");
  }
});

// Start the server
server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

