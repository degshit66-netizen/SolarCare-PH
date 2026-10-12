export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('solarcare_token');
    const headers = new Headers(options.headers || {});
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }
    const res = await fetch(endpoint, {
        ...options,
        headers,
        credentials: 'include',
    });
    return res;
}
