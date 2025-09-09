const nodemailer = require('nodemailer');

// Use provided Gmail credentials directly (per request)
const EMAIL_USER = 'cashlyhk@gmail.com';
// Strip ALL whitespace from the app password in case it's been pasted with spaces
const EMAIL_APP_PASSWORD = 'csbqvaodhwsyawcb'.replace(/\s+/g, '');

// Create a transporter for Gmail via SMTP (recommended for app passwords)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use TLS
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_APP_PASSWORD,
  },
});

/**
 * Send feedback email
 * @param {Object} feedbackData - The feedback data
 * @param {number} feedbackData.rating - Rating from 1-5
 * @param {string} feedbackData.feedback - Feedback text
 * @param {string} [feedbackData.userEmail] - Optional user email
 * @returns {Promise<Object>} - Email send result
 */
const sendFeedbackEmail = async (feedbackData) => {
  const { rating, feedback, userEmail } = feedbackData;
  
  // Format stars for email
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  
  // Create email content
  const mailOptions = {
    from: EMAIL_USER,
    to: EMAIL_USER,
    subject: `Cashly App Feedback: ${rating} Stars`,
    html: `
      <h2>New Feedback Received</h2>
      <p><strong>Rating:</strong> ${stars} (${rating}/5)</p>
      <p><strong>Feedback:</strong></p>
      <p>${feedback || '(No feedback text provided)'}</p>
      ${userEmail ? `<p><strong>User Email:</strong> ${userEmail}</p>` : ''}
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    `
  };

  try {
    // Verify configuration once to surface clear errors (auth/network)
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', {
      message: error?.message,
      code: error?.code,
      response: error?.response,
    });
    // Provide a clearer error upstream while hiding sensitive details
    const msg = error?.message || 'Unknown email error';
    throw new Error(`Email send failed: ${msg}`);
  }
};

module.exports = {
  sendFeedbackEmail
};
