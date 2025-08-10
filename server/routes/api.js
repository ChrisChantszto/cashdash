const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

// External API config (HSBC Sandbox)
const HSBC_BASE_URL = process.env.HSBC_BASE_URL || 'https://developer.hsbc.com.hk/sandbox';
const HSBC_CLIENT_ID = process.env.HSBC_CLIENT_ID;
const HSBC_CLIENT_SECRET = process.env.HSBC_CLIENT_SECRET;

// Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

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

    // Prefer global fetch (Node >= 18). If unavailable, try lazy import of node-fetch.
    let doFetch = (typeof fetch !== 'undefined') ? fetch : null;
    if (!doFetch) {
      try {
        // eslint-disable-next-line global-require
        doFetch = (await import('node-fetch')).default;
      } catch (e) {
        return res.status(500).json({
          error: 'Fetch is not available on the server and node-fetch is not installed',
          hint: 'Install node-fetch: cd server && npm i node-fetch@3',
          details: String(e),
        });
      }
    }

    const response = await doFetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // HSBC sandbox docs expect these header names; include IBM gateway aliases too
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
    return res.status(500).json({ error: err.message });
  }
});

// Transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('userId');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/transactions', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
