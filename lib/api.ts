const API_URL = 'http://localhost:8000/api';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Giris basarisiz');
  }

  return data;
}

export async function register(token: string, name: string, email: string, password: string, password_confirmation: string, role_id: string) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name, email, password, password_confirmation, role_id }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Kayit basarisiz');
  }

  return data;
}

export async function logout(token: string) {
  const response = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Cikis basarisiz');
  }

  return true;
}

export async function getUser(token: string) {
  const response = await fetch(`${API_URL}/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error('Kullanici bilgisi alinamadi');
  }

  return data;
}

export async function getRoles(token: string) {
  const response = await fetch(`${API_URL}/roles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error('Roller alinamadi');
  }

  return data;
}

export async function getPermissions(token: string) {
  const response = await fetch(`${API_URL}/permissions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error('Yetkiler alinamadi');
  }

  return data;
}

export async function createRole(token: string, name: string, display_name: string, permissions: string[]) {
  const response = await fetch(`${API_URL}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name, display_name, permissions }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Rol olusturulamadi');
  }

  return data;
}

export async function updateRole(token: string, id: string, name: string, display_name: string, permissions: string[]) {
  const response = await fetch(`${API_URL}/roles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name, display_name, permissions }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Rol guncellenemedi');
  }

  return data;
}

export async function deleteRole(token: string, id: string) {
  const response = await fetch(`${API_URL}/roles/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Rol silinemedi');
  }

  return true;
}
