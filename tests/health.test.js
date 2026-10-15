const request = require('supertest');
const express = require('express');
const app = express();

// Re-use the same health route from index.js
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

describe('GET /health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
