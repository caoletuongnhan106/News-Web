const aiService = require('./aiService');
const CommentRepository = require('../comments/commentRepository');
const PostRepository = require('../posts/postRepository');

class AIController {
  async analyzeComment(req, res) {
    try {
      const { commentId, postId } = req.body;
      
      // Lấy full article content từ DB
      const postQuery = await PostRepository.findByID(postId);
      const post = postQuery.Items && postQuery.Items[0];
      
      if (!post || !post.Content) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      // Strip HTML tags khỏi content
      const articleContent = post.Content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Lấy comment content  
      const commentQuery = await CommentRepository.getComment(postId);
      const commentItem = commentQuery.Items.find(c => c.CommentId === commentId);
      
      if (!commentItem) {
        return res.status(404).json({ error: 'Comment not found' });
      }
      
      // Phân tích AI với article content thật
      const analysis = await aiService.analyzeContradiction(
        commentItem.CommentContent,
        articleContent
      );
      
      return res.status(200).json(analysis);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  async healthCheck(req, res) {
    try {
      const health = await aiService.healthCheck();
      return res.status(200).json(health);
    } catch (error) {
      return res.status(500).json({ status: 'unhealthy', error: error.message });
    }
  }
}

module.exports = new AIController();
