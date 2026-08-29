const API_URL = "http://localhost:4000/api";

function getHeaders() {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getChores(householdId) {
  const response = await fetch(
    `${API_URL}/households/${householdId}/chores`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load chores.");
  }

  return data.data.chores;
}

export async function createChore(householdId, choreData) {
  const response = await fetch(
    `${API_URL}/households/${householdId}/chores`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(choreData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create chore.");
  }

  return data.data.chore;
}

export async function updateChore(choreId, choreData) {
  const response = await fetch(
    `${API_URL}/chores/${choreId}`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(choreData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update chore.");
  }

  return data.data.chore;
}

export async function deleteChore(choreId) {
  const response = await fetch(
    `${API_URL}/chores/${choreId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete chore.");
  }

  return data;
}