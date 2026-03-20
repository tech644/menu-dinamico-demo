// Recipe data loader - uses mock data that can be replaced with Firebase
import { recipesData } from './recipesData';

export async function loadRecipesData() {
  // Simulating async data loading
  // TODO: Replace with Firebase Firestore call
  // Example: const recipesRef = collection(db, 'recipes');
  //          const snapshot = await getDocs(recipesRef);
  //          return { recipes: snapshot.docs.map(doc => doc.data()) };
  
  await new Promise(resolve => setTimeout(resolve, 50));
  return recipesData;
}
