const getContradictionStyle = (type) => {
  const styles = {
    'Numerical': { backgroundColor: '#ffebee', borderLeft: '4px solid #f44336' },
    'Entity': { backgroundColor: '#fff3e0', borderLeft: '4px solid #ff9800' },
    'Temporal': { backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3' },
    'Factual': { backgroundColor: '#fce4ec', borderLeft: '4px solid #e91e63' },
    'No-Contradiction': { backgroundColor: 'transparent', borderLeft: 'none' }
  };
  return styles[type] || styles['No-Contradiction'];
};

// Trong render comment
<div style={getContradictionStyle(comment.ContradictionType)}>
  {comment.ContradictionType !== 'No-Contradiction' && (
    <span className="contradiction-badge">
      ⚠️ {comment.ContradictionType} ({(comment.ContradictionConfidence * 100).toFixed(0)}%)
    </span>
  )}
  <p>{comment.CommentContent}</p>
</div>
