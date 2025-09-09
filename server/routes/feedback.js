const express = require('express');
const { sendFeedbackEmail } = require('../utils/emailService');

const router = express.Router();

// POST /api/feedback - Submit feedback and send email
router.post('/', async (req, res) => {
  try {
    const { rating, feedback, userEmail } = req.body;
    
    // Basic validation
    if (!rating && !feedback) {
      return res.status(400).json({ 
        error: 'Missing required fields: either rating or feedback must be provided'
      });
    }
    
    console.log('Received feedback submission:', { rating, feedback: feedback?.substring(0, 50) + (feedback?.length > 50 ? '...' : '') });
    
    // Send email
    const emailResult = await sendFeedbackEmail({
      rating: rating || 0,
      feedback,
      userEmail
    });
    
    console.log('Feedback email sent successfully:', emailResult.messageId);
    res.status(201).json({ 
      success: true, 
      message: 'Feedback submitted successfully'
    });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      message: err.message 
    });
  }
});

module.exports = router;
