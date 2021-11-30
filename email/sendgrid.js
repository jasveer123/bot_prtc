
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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')
const msg = {
  to: 'jasveer3101998@gmail.com', // Change to your recipient
  from: 'jasveer3101998@gmail.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>hi this is jasveer </strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })