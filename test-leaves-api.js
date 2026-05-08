const fetch = require('node-fetch');

async function test() {
  const res = await fetch('http://localhost:3000/api/requests/leaves', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_email: 'test@example.com',
      student_name: 'Test',
      leave_type: 'Sick',
      reason: 'test',
      start_date: '2023-01-01',
      end_date: '2023-01-02',
      image_base64: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    })
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}
test();
