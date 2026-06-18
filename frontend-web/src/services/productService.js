const API_URL = "https://cyna-api-d6b4.onrender.com"; // Ton backend NestJS

export const fetchProducts = async () => {
  try {
    // 👇 MODIFICATION IMPORTANTE : On ajoute "/products" ici
    const response = await fetch(`${API_URL}/products`);
    
    if (!response.ok) {
      throw new Error("Erreur réseau");
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    return [];
  }
};