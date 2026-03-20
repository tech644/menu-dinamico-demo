// Allergen Service - Information about allergens
export interface AllergenInfo {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export const allergensList: AllergenInfo[] = [
  {
    id: 'glutine',
    name: 'Glutine',
    description: 'Contenuto nei cereali e nei derivati'
  },
  {
    id: 'crostacei',
    name: 'Crostacei',
    description: 'Gamberi, scampi, aragoste, granchi e simili'
  },
  {
    id: 'uova',
    name: 'Uova',
    description: 'Tutti i prodotti a base di uova e derivati'
  },
  {
    id: 'pesce',
    name: 'Pesce',
    description: 'Prodotti che contengono pesce o derivati'
  },
  {
    id: 'arachidi',
    name: 'Arachidi',
    description: 'Creme e condimenti anche in piccole dosi'
  },
  {
    id: 'soia',
    name: 'Soia',
    description: 'Contenuta nel tofu, latte di soia, spaghetti'
  },
  {
    id: 'latticini',
    name: 'Latticini',
    description: 'Latte e derivati inclusi formaggi e burro'
  },
  {
    id: 'frutta a guscio',
    name: 'Frutta a guscio',
    description: 'Mandorle, nocciole, noci, pistacchi e simili'
  },
  {
    id: 'sedano',
    name: 'Sedano',
    description: 'Presente in zuppe, salse e condimenti'
  },
  {
    id: 'senape',
    name: 'Senape',
    description: 'In salse, condimenti e marinature'
  },
  {
    id: 'sesamo',
    name: 'Sesamo',
    description: 'Semi e olio di sesamo'
  },
  {
    id: 'anidride solforosa e solfiti',
    name: 'Anidride solforosa e solfiti',
    description: 'Presenti in vino e altri prodotti conservati'
  },
  {
    id: 'lupini',
    name: 'Lupini',
    description: 'Legume utilizzato in alcuni prodotti'
  },
  {
    id: 'molluschi',
    name: 'Molluschi',
    description: 'Cozze, vongole, calamari e simili'
  }
];

export function getAllergenInfo(allergenId: string): AllergenInfo | undefined {
  return allergensList.find(a => a.id === allergenId);
}

export function getAllergensInfo(allergenIds: string[]): AllergenInfo[] {
  return allergenIds
    .map(id => getAllergenInfo(id))
    .filter((a): a is AllergenInfo => a !== undefined);
}