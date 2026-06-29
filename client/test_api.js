const https = require('https');

https.get('https://www.googleapis.com/books/v1/volumes?q=fiction%20bestseller%20novel&maxResults=38&key=AIzaSyCBmHropUwTPyaA43QvHI1upsnmXXdKLlI', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Total Items:', parsed.totalItems);
      console.log('Returned Items Count:', parsed.items ? parsed.items.length : 0);
    } catch (e) {
      console.error(e);
    }
  });
});
