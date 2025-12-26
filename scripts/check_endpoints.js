const urls = [
  'http://localhost:3001/',
  'http://localhost:3001/api/debug/env',
  'http://localhost:3001/api/csrf-token',
  'http://localhost:3001/api/leaderboard',
  'http://localhost:3001/api/tasks/list',
  'http://localhost:3001/api/auth/providers',
  'http://localhost:3001/api/auth/register',
];

(async () => {
  for (const u of urls) {
    try {
      const res = await fetch(u, { method: 'GET' });
      const text = await res.text();
      console.log(`--- ${u} -> ${res.status} ---`);
      if (!text) {
        console.log('<no content>');
      } else if (text.length > 400) {
        console.log(text.slice(0, 400) + '...');
      } else {
        console.log(text);
      }
    } catch (e) {
      console.log(`--- ${u} -> ERROR: ${e.message} ---`);
    }
  }
})();
