const nodemailer = require('nodemailer')

const registerMail = async (email, data) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    proxy: process.env.PROXY,
    auth: {
      user: process.env.EMAIL_SERVER,
      pass: process.env.EMAIL_KEY,
    },
  })
  var mailOptions = {
    from: process.env.EMAIL_SERVER,
    to: email,
    subject: 'Verify email',
    html: `<html>
      <head>
        <title>Verify account</title>
      </head>
      <body>
        <h2>Wellcome to ${process.env.APP_NAME}</h2>
        <p>We received an <b>Signup</b> action using this email</p>
        <p>If that are you, <a href="http://${process.env.APP_URL}user/user-register/${encodeURIComponent(
      data
    )}"> <b>Verify</b> </a></p>

      </body>
    </html>
    `,
  }
  try {
    const resss = await transporter.sendMail(mailOptions)
    return 'success'
  } catch (error) {
    return 'fail'
  }
}

module.exports = { registerMail }
