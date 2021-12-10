module.exports = {
 mailto:function(nam,date, time , location , destination, participants ,id , mail)
{ 
  console.log("1")
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: ''
  }
});

var mailOptions = {
  from: 'jasveer3101998@gmail.com',
  to: `${mail}`,
  subject: 'Ticket booked..',
  html : `<h1>Hi ${nam} your ticket is booked</h1> <h3>Here are the following details</h3> <h4>name:${nam}</h4><h4>Ticketid:${id} <h4>location:${location}</h4> <h4>Destination:${destination}</h4> <h4>Date:${date}</h4> <h4>Time:${time}</h4> <h4>mail:${mail}<h4><h4>participants:${participants}`          
  
}

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
}}
