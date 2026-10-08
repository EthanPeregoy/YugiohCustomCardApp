const AUTH_URL = "http://localhost:3000/api/auth";

export async function getCurrentUser() {
  const response = await fetch(`${AUTH_URL}/me`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve user");
  }

  return response.json();
}

export async function logout() {
  const response = await fetch(`${AUTH_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to log out");
  }
}

export async function login(
  username: string,
  password: string
) {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed.");
  }

  return data;
}

export async function register(
  username: string,
  password: string
) {
  const response = await fetch(`${AUTH_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed.");
  }

  return data;
}

export async function checkSession() {
  const response = await fetch(`${AUTH_URL}/me`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Session check failed: ${response.status}`
    );
  }

  return response.json();
}