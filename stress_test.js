import http from 'k6/http';
import { check, sleep } from 'k6';

// Change this to your actual API base
const BASE_URL = 'http://localhost:3000';

export default function () {
    http.get('http://localhost:8080');

    // Unique email per virtual user and iteration
    const email = `user${__VU}_${__ITER}@test.com`;
    const password = "TestPass123!";

    // 1. Register (ignore error if already exists)
    let regPayload = JSON.stringify({ email, password });
    let regHeaders = { 'Content-Type': 'application/json' };
    let regRes = http.post(`${BASE_URL}/register`, regPayload, { headers: regHeaders });
    check(regRes, {
        'registered or exists': r => r.status === 201 || (r.status === 400 && r.json('error') === 'Email already exists'),
    });

    // 2. Login
    let loginPayload = JSON.stringify({ email, password });
    let loginRes = http.post(`${BASE_URL}/login`, loginPayload, { headers: regHeaders });
    check(loginRes, { 'logged in': r => r.status === 200 && r.json('token') });

    // 3. Extract JWT token
    let token = loginRes.json('token');
    let authHeaders = { 'Authorization': `Bearer ${token}` };

    // 4. Access dashboard (triggers producer)
    let dashRes = http.get(`${BASE_URL}/dashboard`, { headers: authHeaders });
    check(dashRes, { 'dashboard accessed': r => r.status === 200 });

    sleep(2);
}
