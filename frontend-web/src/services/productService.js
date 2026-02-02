const API_URL = "http://localhost:3000"; // Ton backend NestJS

export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) {
      throw new Error("Erreur réseau");
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    return [];
  }
};