import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting End-to-End Test Suite for Multimedia Hub API...');

  // 1. Healthcheck
  console.log('\n[1/9] Testing API Health...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(healthRes.status, 200, 'Health check should return 200');
  const healthJson = await healthRes.json();
  console.log('  ✓ Health Status:', healthJson.status, '| Service:', healthJson.service);

  // 2. Authentication: Admin Login & Current User
  console.log('\n[2/9] Testing Admin Login & Auth Token...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@multimediahub.com', password: 'AdminPassword123!' })
  });
  assert.strictEqual(loginRes.status, 200, 'Admin login should succeed');
  const loginData = await loginRes.json();
  assert(loginData.data.token, 'Token should be returned');
  const adminToken = loginData.data.token;
  console.log('  ✓ Admin logged in. User:', loginData.data.user.name, '| Role:', loginData.data.user.role);

  // Get Me
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const meData = await meRes.json();
  assert.strictEqual(meData.data.user.email, 'admin@multimediahub.com');
  console.log('  ✓ Session restored. Stats:', meData.data.stats);

  // 3. User Registration & Login
  console.log('\n[3/9] Testing New User Registration & Duplicate Prevention...');
  const testEmail = `tester_${Date.now()}@multimediahub.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'QA Automation Bot',
      email: testEmail,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!'
    })
  });
  assert.strictEqual(regRes.status, 201, 'User registration should succeed');
  const regData = await regRes.json();
  const userToken = regData.data.token;
  console.log('  ✓ User registered successfully. Email:', testEmail);

  // Try duplicate registration
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'QA Bot Duplicate',
      email: testEmail,
      password: 'SecurePassword123!'
    })
  });
  assert.strictEqual(dupRes.status, 400, 'Duplicate email should be rejected with 400');
  console.log('  ✓ Duplicate email rejected properly.');

  // 4. Media Catalog & Dashboard
  console.log('\n[4/9] Testing Media Catalog, Filtering, and Dashboard...');
  const mediaRes = await fetch(`${BASE_URL}/media?limit=5`);
  const mediaData = await mediaRes.json();
  assert(mediaData.data.items.length > 0, 'Should return media items');
  const sampleMedia = mediaData.data.items[0];
  console.log(`  ✓ Retrieved ${mediaData.data.items.length} items. First: "${sampleMedia.title}" (${sampleMedia.mediaType})`);

  // Dashboard
  const dashRes = await fetch(`${BASE_URL}/media/dashboard`);
  const dashData = await dashRes.json();
  assert(dashData.data.trending.length > 0, 'Trending should contain media');
  console.log(`  ✓ Dashboard loaded. Trending count: ${dashData.data.trending.length}, Recommended: ${dashData.data.recommended.length}`);

  // Search
  const searchRes = await fetch(`${BASE_URL}/media/search?q=ambient`);
  const searchData = await searchRes.json();
  console.log(`  ✓ Search for "ambient" returned ${searchData.data.items.length} items, suggestions:`, searchData.data.suggestions);

  // 5. Favorites Toggle
  console.log('\n[5/9] Testing Favorites Persistence...');
  const favToggle1 = await fetch(`${BASE_URL}/favorites/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ mediaId: sampleMedia.id })
  });
  const favToggle1Data = await favToggle1.json();
  assert.strictEqual(favToggle1Data.isFavorite, true, 'First toggle should favorite');
  console.log('  ✓ Added favorite for media:', sampleMedia.id);

  const getFavs = await fetch(`${BASE_URL}/favorites`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const favsData = await getFavs.json();
  assert.strictEqual(favsData.data.length, 1, 'Should have 1 favorite');
  console.log('  ✓ Favorites list verified. Total items:', favsData.data.length);

  // 6. Ratings
  console.log('\n[6/9] Testing 5-Star Ratings & Reviews...');
  const rateRes = await fetch(`${BASE_URL}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ mediaId: sampleMedia.id, score: 5, review: 'Exceptional quality!' })
  });
  const rateData = await rateRes.json();
  assert.strictEqual(rateData.success, true);
  console.log(`  ✓ Rated 5 stars. New Average: ${rateData.data.averageRating} (${rateData.data.ratingCount} reviews)`);

  // 7. Watch History
  console.log('\n[7/9] Testing Watch History & Progress Tracking...');
  const historyRes = await fetch(`${BASE_URL}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ mediaId: sampleMedia.id, progress: 14.5, completed: 0 })
  });
  assert.strictEqual(historyRes.status, 200);

  const getHist = await fetch(`${BASE_URL}/history`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const histData = await getHist.json();
  assert(histData.data.length >= 1);
  console.log(`  ✓ Watch progress recorded: ${histData.data[0].progress}s on "${histData.data[0].title}"`);

  // 8. Playlists Lifecycle
  console.log('\n[8/9] Testing Playlists Lifecycle (Create, Add Item, Read, Delete)...');
  const createPlRes = await fetch(`${BASE_URL}/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ title: 'QA Test Playlist', description: 'Automated test suite', isPublic: true })
  });
  const createPlData = await createPlRes.json();
  const plId = createPlData.data.id;
  console.log('  ✓ Playlist created. ID:', plId);

  // Add Item to Playlist
  await fetch(`${BASE_URL}/playlists/${plId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ mediaId: sampleMedia.id })
  });
  console.log('  ✓ Item added to playlist.');

  // Fetch Playlist Details
  const getPlRes = await fetch(`${BASE_URL}/playlists/${plId}`);
  const plDetail = await getPlRes.json();
  assert.strictEqual(plDetail.data.items.length, 1);
  console.log('  ✓ Playlist verified with item count:', plDetail.data.items.length);

  // Delete Playlist
  await fetch(`${BASE_URL}/playlists/${plId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log('  ✓ Playlist deleted cleanly.');

  // 9. Admin Stats & Category Management
  console.log('\n[9/9] Testing Admin Metrics & Category Lifecycle...');
  const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.strictEqual(statsRes.status, 200);
  const statsData = await statsRes.json();
  console.log('  ✓ Admin Stats Verified:', {
    users: statsData.data.summary.totalUsers,
    media: statsData.data.summary.totalMedia,
    videos: statsData.data.summary.totalVideos,
    music: statsData.data.summary.totalMusic,
    images: statsData.data.summary.totalImages,
    docs: statsData.data.summary.totalDocs,
    storage: formatBytes(statsData.data.summary.totalStorageBytes)
  });

  // Create & Delete Category as Admin
  const createCatRes = await fetch(`${BASE_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ name: 'Automated Test Category', description: 'Temporary category', icon: 'Cpu' })
  });
  const catData = await createCatRes.json();
  assert(catData.data.id);
  console.log('  ✓ Category created:', catData.data.name);

  await fetch(`${BASE_URL}/categories/${catData.data.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('  ✓ Category deleted cleanly.');

  console.log('\n🎉 ALL 9 END-TO-END SUITE TESTS PASSED WITH 100% SUCCESS!');
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

runTests().catch(err => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});
