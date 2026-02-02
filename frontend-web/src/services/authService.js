const API_URL = "http://localhost:3000/auth";

// Fonction pour se connecter
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erreur de connexion");
  
  // On sauvegarde le token (le "badge d'accès") dans le navigateur
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
};

// Fonction pour s'inscrire
export const registerUser = async (email, password, fullName) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erreur d'inscription");
  return data;
};

// Fonction pour se déconnecter
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};