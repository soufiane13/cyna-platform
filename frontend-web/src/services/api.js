// Ajoute cette fonction à ton api.js ou crée un orderService.js
const API_URL = 'http://localhost:3000'; // Ton backend NestJS

export const createOrder = async (userId, cart, total) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, cart, total }),
  });
  return response.json();
};