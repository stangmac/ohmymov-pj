const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'http://localhost:9200', // เปลี่ยนเป็น URL ของ Elasticsearch Server ของคุณ
  auth: {
    username: 'elastic', // เปลี่ยนเป็นของคุณ
    password: 'yourpassword'
  }
});

module.exports = client;
