import { X, AlertCircle } from 'lucide-react';
import { Allergen } from '../types/recipe';

// Modal used to display allergen details when requested by the user.
interface AllergenModalProps {
  isOpen: boolean;
  onClose: () => void;
  allergens: Allergen[];
}

export default function AllergenModal({ isOpen, onClose, allergens }: AllergenModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Allergeni</h2>
            <p className="text-sm text-gray-600 mt-0.5">Consulta la lista degli Allergeni</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-6 h-6" />
            <span className="text-sm font-medium uppercase">Chiudi</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4 max-h-[calc(85vh-100px)]">
          {allergens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nessun allergene rilevato in questo piatto</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allergens.map((allergen, index) => (
                <div 
                  key={index}
                  className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {allergen.type}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {allergen.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
