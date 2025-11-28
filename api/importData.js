const AWS = require('aws-sdk');
const blogData = require('./modules/database/BlogData.json');

AWS.config.update({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'dummy',
  secretAccessKey: 'dummy'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = 'news-table';

async function importData() {
  console.log('Importing', blogData.length, 'items...');
  
  for (const item of blogData) {
    try {
      await dynamodb.put({
        TableName: tableName,
        Item: item
      }).promise();
      console.log('Imported:', item.id || item.postId);
    } catch (err) {
      console.error('Error:', err);
    }
  }
  
  console.log('Import done!');
}

importData();
