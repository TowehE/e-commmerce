// Function to generate dynamic email
const generateDynamicEmail = (fullName, otp) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to iTea's Closest E-commerce!</title>
      </head>
      <body style="background-color: #FAF3E0; color: black;">
          <h1>Welcome ${fullName}!</h1>
          <p>We're excited to have you join iTea's Closest E-commerce!</p>
          <p>Your OTP is: <strong style="font-size: 24px;">${otp}</strong></p>
          <p>Start shopping and enjoy exclusive offers!</p>
          <p>Need help? Contact us at support@iteasclosest.com</p>
          <p>Happy shopping!</p>
          <p>Best Regards,</p>
          <p><strong>The iTea's Closest E-commerce Team</strong></p>
      </body>
      </html>
  `;
};

module.exports = { generateDynamicEmail };
