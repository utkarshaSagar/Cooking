import React, { useState } from 'react';
import { ShoppingCart, Check, Info, ArrowLeftRight, Sparkles, Filter } from 'lucide-react';
import { GroceryItem, Substitution } from '../types';
import { motion } from 'motion/react';

interface GroceryListProps {
  groceryList: GroceryItem[];
  substitutions: Substitution[];
  onSwapApplied: (original: string, substitute: string, costDifference: number) => void;
  appliedSwaps: Record<string, string>; // Maps original item -> substitute item name
}

export default function GroceryList({ groceryList, substitutions, onSwapApplied, appliedSwaps }: GroceryListProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showOnlyEssentials, setShowOnlyEssentials] = useState<boolean>(false);

  // Helper code to check if an item has an available recommended substitution
  const findSubstitution = (itemName: string): Substitution | undefined => {
    return substitutions.find(sub => 
      sub.originalItem.toLowerCase().includes(itemName.toLowerCase()) ||
      itemName.toLowerCase().includes(sub.originalItem.toLowerCase())
    );
  };

  // Group items by category (e.g., Produce, Meat, Pantry)
  const categories = groceryList.reduce<Record<string, GroceryItem[]>>((groups, item) => {
    // If the item has been swapped, use the substituted name
    const currentName = appliedSwaps[item.item] || item.item;
    
    // Filter out non-essentials if filter is active
    if (showOnlyEssentials && !item.essential) {
      return groups;
    }

    const cat = item.category || 'Other';
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push({
      ...item,
      // dynamically update name inside grouped view if swapped
      item: currentName 
    });
    return groups;
  }, {});

  const toggleCheck = (itemKey: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const getCleanKey = (item: string) => item.toLowerCase().replace(/\s+/g, '-');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-5"
      id="grocery-list-container-card"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-150 pb-4 gap-4" id="grocery-header">
        <div>
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            Adaptive Grocery Checklist
          </h3>
          <p className="text-xs text-stone-500">Tick columns as you shop. Apply smart substitutions on the fly.</p>
        </div>

        {/* Filter controls */}
        <button
          onClick={() => setShowOnlyEssentials(!showOnlyEssentials)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border ${
            showOnlyEssentials
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300"
          }`}
          id="toggle-essentials-filter-btn"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{showOnlyEssentials ? "Showing Essentials Only" : "Show All items"}</span>
        </button>
      </div>

      {Object.keys(categories).length === 0 ? (
        <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-500 text-sm">
          No matches found for your filter.
        </div>
      ) : (
        <div className="space-y-6" id="grocery-categories-wrapper">
          {Object.entries(categories).map(([category, items]) => (
            <div key={category} className="space-y-2.5" id={`grocery-category-group-${category.toLowerCase()}`}>
              <h4 className="text-xs font-extrabold text-stone-400 uppercase tracking-widest pl-1">
                {category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((goods) => {
                  const itemKey = getCleanKey(goods.item);
                  const isChecked = !!checkedItems[itemKey];
                  const substitution = findSubstitution(goods.item);
                  const isSwapped = !!appliedSwaps[goods.item];

                  return (
                    <div 
                      key={goods.item}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                        isChecked 
                          ? "bg-stone-50/50 border-stone-150 opacity-60" 
                          : "bg-white border-stone-250 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-sm"
                      }`}
                      id={`grocery-item-card-${itemKey}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div 
                          className="flex items-start gap-2.5 cursor-pointer flex-1"
                          onClick={() => toggleCheck(itemKey)}
                        >
                          <div className={`w-4 h-4 mt-0.5 border rounded flex items-center justify-center transition-colors ${
                            isChecked 
                              ? "bg-emerald-600 border-emerald-600" 
                              : "border-stone-300"
                          }`}>
                            {isChecked && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                          </div>
                          <div>
                            <span className={`text-xs font-bold text-stone-800 block ${isChecked ? "line-through text-stone-400" : ""}`}>
                              {goods.item}
                            </span>
                            <span className="text-[10px] text-stone-500 font-medium">{goods.quantity}</span>
                          </div>
                        </div>

                        {/* Price and essential badges */}
                        <div className="text-right flex flex-col items-end gap-1" id="item-badges">
                          <span className="text-xs font-semibold text-stone-900 font-mono">
                            ${goods.estimatedCost.toFixed(2)}
                          </span>
                          {goods.essential ? (
                            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Essential
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Flexible
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Substitution trigger drawer */}
                      {substitution && !isChecked && (
                        <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2" id="swap-trigger-area">
                          <div className="flex items-center gap-1 text-[10px] text-stone-500">
                            <ArrowLeftRight className="w-3.5 h-3.5 text-stone-400" />
                            <span>
                              {isSwapped 
                                ? `Swapped for cheaper option` 
                                : `Cheaper option: ${substitution.substituteItem}`}
                            </span>
                          </div>
                          <button
                            onClick={() => onSwapApplied(goods.item, substitution.substituteItem, substitution.costDiff)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                              isSwapped
                                ? "bg-stone-100 text-stone-500 cursor-not-allowed"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                            disabled={isSwapped}
                            id={`apply-swap-btn-${itemKey}`}
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{isSwapped ? "Swapped" : `Swap & Save $${Math.abs(substitution.costDiff).toFixed(2)}`}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
