const aiController = require('../modules/ai/aiController');
const {
    verifyToken,
} = require('../middleware/verifyToken');

module.exports = async (app) => {
    app.post('/api/ai/analyze-comment', verifyToken, aiController.analyzeComment);
    app.get('/api/ai/health', aiController.healthCheck);
};
