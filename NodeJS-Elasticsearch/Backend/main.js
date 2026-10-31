import { Client } from '@elastic/elasticsearch'

const esClient = new Client({ node: 'https://localhost:9200' }); // Adjust to your Elasticsearch URL

// Test connection
esClient.ping({}, (error) => {
  if (error) {
    console.error('Elasticsearch cluster is down!');
  } else {
    console.log('Elasticsearch is running.');
  }
});