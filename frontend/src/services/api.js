const BASE_URL = '/api/v1';

function getToken() {
  return localStorage.getItem('alphastream_token');
}

function setToken(token) {
  localStorage.setItem('alphastream_token', token);
}

function removeToken() {
  localStorage.removeItem('alphastream_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.errors = data.errors || [];
    err.status = res.status;
    throw err;
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => request('/auth/profile'),
};

// ── Signals ───────────────────────────────────────────────
export const signalsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
    ).toString();
    return request(`/signals${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => request(`/signals/${id}`),
  create: (body) => request('/signals', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/signals/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => request(`/signals/${id}`, { method: 'DELETE' }),
};

export { getToken, setToken, removeToken };
