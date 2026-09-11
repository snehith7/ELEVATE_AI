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
