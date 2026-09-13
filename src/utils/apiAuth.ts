export function getAuthHeaders(preferredRole?: 'admin' | 'faculty' | 'student'): Record<string, string> {
  let token = '';
  try {
    if (preferredRole === 'admin') {
      const s = localStorage.getItem('codeelevate_admin_session');
      if (s) {
        const parsed = JSON.parse(s);
        token = parsed.token || parsed.user?.id || '';
      }
    } else if (preferredRole === 'faculty') {
      const s = localStorage.getItem('codeelevate_faculty_session');
      if (s) {
        const parsed = JSON.parse(s);
        token = parsed.token || parsed.user?.id || '';
      }
    } else if (preferredRole === 'student') {
      const s = localStorage.getItem('codeelevate_auth_session');
      if (s) {
        const parsed = JSON.parse(s);
        token = parsed.token || parsed.user?.id || '';
      }
    }

    if (!token) {
      // Fallback check in order of admin, faculty, student
      const adminS = localStorage.getItem('codeelevate_admin_session');
      const facultyS = localStorage.getItem('codeelevate_faculty_session');
      const studentS = localStorage.getItem('codeelevate_auth_session');
      if (adminS) token = JSON.parse(adminS).token || JSON.parse(adminS).user?.id || '';
      else if (facultyS) token = JSON.parse(facultyS).token || JSON.parse(facultyS).user?.id || '';
      else if (studentS) token = JSON.parse(studentS).token || JSON.parse(studentS).user?.id || '';
    }
  } catch (e) {
    // Ignore storage parsing errors
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-user-id'] = token;
  }

  return headers;
}

/**
 * Returns the fully resolved API URL.
 * If VITE_API_URL is configured (e.g. deployed frontend on Vercel/Netlify pointing to Render backend),
 * it prepends the backend base URL. Otherwise, it uses the local relative path.
 */
export function getApiUrl(path: string): string {
  const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return baseUrl ? `${baseUrl}${cleanPath}` : cleanPath;
}

/**
 * Performs a network request with robust JSON/HTML error detection.
 * Prevents "Unexpected token '<', '<!DOCTYPE '... is not valid JSON" crashes.
 */
export async function safeFetchJson<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data?: T; error?: string; rawText?: string }> {
  const url = getApiUrl(endpoint);
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await res.json();
      return {
        ok: res.ok,
        status: res.status,
        data,
        error: data && typeof data === 'object' && data.error ? data.error : undefined
      };
    }

    // Response is NOT JSON (e.g. HTML 404, 502 Bad Gateway, or SPA index.html fallback)
    const text = await res.text();
    let friendlyError = `Server returned status ${res.status}`;

    if (text.trim().startsWith('<!DOCTYPE') || text.includes('<html')) {
      if (res.status === 404) {
        friendlyError = `API endpoint "${endpoint}" not found (404). If your backend is deployed on Render separately from your frontend, make sure to set VITE_API_URL to your Render backend URL.`;
      } else if (res.status === 502 || res.status === 503 || res.status === 504) {
        friendlyError = `Backend service on Render is starting up or temporarily unavailable (HTTP ${res.status} Gateway error). Free Render instances take 30–50 seconds to spin up from idle. Please wait a moment and try again.`;
      } else {
        friendlyError = `The server returned an HTML webpage instead of a JSON API response (HTTP ${res.status}). Verify your backend Web Service is running and accessible.`;
      }
    } else if (text.trim()) {
      friendlyError = text.slice(0, 200);
    }

    return {
      ok: false,
      status: res.status,
      error: friendlyError,
      rawText: text
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: err.message || 'Unable to connect to the backend server. Please check your network connection.'
    };
  }
}

