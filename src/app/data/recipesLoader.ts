// Asynchronous loader for local recipe fallback data.
import { recipesData } from './recipesData';

export async function loadRecipesData() {
  // Preserves async behavior so callers can keep a single data-loading flow.
  
  await new Promise(resolve => setTimeout(resolve, 50));
  return recipesData;
}
