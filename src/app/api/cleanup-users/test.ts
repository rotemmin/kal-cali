async function testCleanupEndpoint() {
  try {
    const response = await fetch('http://localhost:3000/api/cleanup-users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLEANUP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    console.log('Cleanup Results:', {
      status: response.status,
      data
    });

    return data;
  } catch (error) {
    console.error('Error testing cleanup endpoint:', error);
    throw error;
  }
}

if (require.main === module) {
  testCleanupEndpoint()
    .then(result => {
      console.log('Test completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
} 