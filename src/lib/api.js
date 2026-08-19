export async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}
