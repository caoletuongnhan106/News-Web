const axios = require('axios');

class AIService {
  constructor() {
    this.pythonServiceUrl = 'http://localhost:5000';
  }

  async analyzeContradiction(comment, article) {
    try {
      const response = await axios.post(`${this.pythonServiceUrl}/analyze`, {
        comment,
        article
      }, {
        timeout: 30000
      });

      // Flask trả về: { type: 'No-Contradiction' | 'Numerical' | 'Entity' | 'Temporal' | 'Factual', confidence: 0.xx }
      return response.data;
    } catch (error) {
      console.error('AI Service Error:', error.message);
      throw new Error('Failed to analyze contradiction: ' + error.message);
    }
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.pythonServiceUrl}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      throw new Error('Python AI service is not responding');
    }
  }
}

module.exports = new AIService();
