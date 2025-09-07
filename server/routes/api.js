const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

// ============================================================================
// CONFIGURATION
// ============================================================================

// External API config (HSBC Sandbox)
const HSBC_BASE_URL = process.env.HSBC_BASE_URL || 'https://developer.hsbc.com.hk/sandbox';
const HSBC_CLIENT_ID = process.env.HSBC_CLIENT_ID;
const HSBC_CLIENT_SECRET = process.env.HSBC_CLIENT_SECRET;

// External API config (Exchange Rates API)
const FX_BASE_URL = process.env.EXCHANGE_RATES_API_BASE || 'http://api.exchangeratesapi.io/v1';
const FX_API_KEY = process.env.EXCHANGE_RATES_API_KEY;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Get fetch function (Node >= 18 has global fetch, fallback to node-fetch)
const getFetch = async () => {
  if (typeof fetch !== 'undefined') return fetch;
  try {
    return (await import('node-fetch')).default;
  } catch (e) {
    throw new Error('Fetch is not available. Install node-fetch: npm i node-fetch@3');
  }
};

// ============================================================================
// USER ROUTES
// ============================================================================

// Get all users
router.get('/users', async (req, res) => {
  try {
    console.log('Fetching all users...');
    const users = await User.find();
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users', message: err.message });
  }
});

// ============================================================================
// CURRENCY CONVERSION ROUTES
// ============================================================================

// Currency conversion via exchangeratesapi.io
// GET /api/currency/convert?from=USD&to=HKD&amount=123.45&date=YYYY-MM-DD(optional)
router.get('/currency/convert', async (req, res) => {
  try {
    if (!FX_API_KEY) {
      return res.status(500).json({
        error: 'Exchange Rates API key is not configured on the server',
        hint: 'Set EXCHANGE_RATES_API_KEY in server/.env',
      });
    }

    const from = (req.query.from || '').toString().toUpperCase();
    const to = (req.query.to || '').toString().toUpperCase();
    const amountRaw = (req.query.amount || '').toString();
    const date = (req.query.date || '').toString();

    if (!from || !to || !amountRaw) {
      return res.status(400).json({ error: 'Missing required query params: from, to, amount' });
    }
    const amount = Number(amountRaw);
    if (!Number.isFinite(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const endpoint = date ? `${FX_BASE_URL}/${date}` : `${FX_BASE_URL}/latest`;
    const url = `${endpoint}?access_key=${encodeURIComponent(FX_API_KEY)}&symbols=${encodeURIComponent([from, to, 'EUR'].join(','))}`;

    const doFetch = await getFetch();
    const response = await doFetch(url);
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      return res.status(response.status || 502).json({
        error: 'Failed to fetch exchange rates',
        details: data.error || data,
      });
    }

    const rates = data.rates || {};
    const rFrom = from === 'EUR' ? 1 : rates[from];
    const rTo = to === 'EUR' ? 1 : rates[to];
    if (!rFrom || !rTo) {
      return res.status(400).json({
        error: 'Missing currency in rate response',
        available: Object.keys(rates).sort(),
      });
    }

    // Convert: amount_in_to = amount * (rate_to / rate_from)
    const rate = rTo / rFrom;
    const result = amount * rate;

    return res.json({
      success: true,
      query: { from, to, amount },
      date: data.date || date || null,
      base: data.base || 'EUR',
      rate,
      result,
      meta: {
        rFrom,
        rTo,
        source: endpoint,
      },
    });
  } catch (err) {
    console.error('Currency convert error:', err);
    return res.status(500).json({ error: 'Currency conversion failed', details: err.message });
  }
});

// Get user by email
router.get('/users/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user by email:', err);
    res.status(500).json({ error: 'Failed to fetch user', message: err.message });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    console.log('Creating user with data:', req.body);
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return res.status(400).json({ 
        error: 'User with this email already exists',
        user: existingUser
      });
    }
    
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      profileImage: req.body.profileImage || null,
    });
    
    await user.save();
    console.log('New user created:', { id: user._id, email: user.email });
    res.status(201).json(user);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(400).json({ 
      error: 'Failed to create user',
      message: err.message 
    });
  }
});

// Update user profile
router.put('/users/:id', async (req, res) => {
  try {
    console.log('Updating user:', req.params.id, 'with data:', req.body);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User updated successfully:', { id: user._id, email: user.email });
    res.json(user);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(400).json({ 
      error: 'Failed to update user',
      message: err.message 
    });
  }
});

// ============================================================================
// EXTERNAL API ROUTES (HSBC)
// ============================================================================

// HSBC Sandbox: Personal Credit Cards (proxy)
router.get('/hsbc/personal-credit-cards', async (req, res) => {
  try {
    if (!HSBC_CLIENT_ID || !HSBC_CLIENT_SECRET) {
      return res.status(500).json({
        error: 'HSBC credentials are not configured on the server',
        hint: 'Set HSBC_CLIENT_ID and HSBC_CLIENT_SECRET in server/.env',
      });
    }

    const url = `${HSBC_BASE_URL}/open-banking/v1.0/personal-credit-cards`;
    const lang = (req.query.lang || '').toString().trim() || 'zh-HK';

    const doFetch = await getFetch();
    const response = await doFetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ClientID': HSBC_CLIENT_ID,
        'ClientSecret': HSBC_CLIENT_SECRET,
        'x-ibm-client-id': HSBC_CLIENT_ID,
        'x-ibm-client-secret': HSBC_CLIENT_SECRET,
        'Accept-Language': lang,
        'User-Agent': 'cashdash/1.0 (+https://github.com/ChrisChantszto/cashdash)'
      },
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch (_) { data = text; }

    if (!response.ok) {
      console.log('HSBC proxy request failed', { status: response.status, lang });
      return res.status(response.status).json({
        error: 'HSBC API error',
        status: response.status,
        body: data,
      });
    }

    console.log('HSBC proxy success', { status: response.status, lang });
    return res.json(data);
  } catch (err) {
    console.error('HSBC API error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// TRANSACTION ROUTES
// ============================================================================

// Get all transactions
router.get('/transactions', async (req, res) => {
  try {
    console.log('Fetching transactions...');
    const { userId } = req.query;
    
    const filter = userId ? { userId } : {};
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    
    console.log(`Found ${transactions.length} transactions`);
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
  }
});

// Create new transaction
router.post('/transactions', async (req, res) => {
  try {
    console.log('Creating transaction with data:', req.body);
    
    // Basic validation
    if (!req.body.userId || !req.body.amount || !req.body.category) {
      return res.status(400).json({
        error: 'Missing required fields: userId, amount, category',
        receivedData: req.body
      });
    }

    // Ensure date is properly formatted
    const transactionData = {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      amount: Number(req.body.amount)
    };
    
    const transaction = new Transaction(transactionData);
    await transaction.save();
    
    console.log('Transaction created successfully:', { id: transaction._id, amount: transaction.amount });
    res.status(201).json(transaction);
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(400).json({ 
      error: 'Failed to create transaction',
      details: err.message,
      receivedData: req.body
    });
  }
});

module.exports = router;
