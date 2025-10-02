
"use client";

import { useState, useMemo, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Model } from "@/lib/db/types";
import { useDebounce } from "@/hooks/use-debounce";

const getCategoryEmoji = (category: Model['category']) => {
  switch (category) {
    case 'Phone': return '📱';
    case 'Mac': return '💻';
    case 'iPad': return '📲';
    case 'Watch': return '⌚';
    default: return '📱';
  }
};

const ModelResultItem = memo(({ model }: { model: Model }) => {
  const displayName = `${model.brand} ${model.name}`;
  
  return (
    <li>
      <Link 
        href={`/model/${model.id}`} 
        className="block hover:bg-muted transition-colors duration-150"
        prefetch={true}
      >
        <div className="flex items-center gap-4 p-4">
          <span className="text-xl">{getCategoryEmoji(model.category)}</span>
          <div>
            <p className="font-semibold">{displayName}</p>
          </div>
        </div>
      </Link>
    </li>
  );
});
ModelResultItem.displayName = 'ModelResultItem';

interface SearchComponentProps {
  allModels: Model[];
}

export function SearchComponent({ allModels }: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms debounce

  const normalizedModels = useMemo(() => {
    const modelMap = new Map<string, Model>();
    allModels.forEach(model => {
      let normalizedName = model.name;
      let brand = model.brand;

      // Normalize Samsung models
      if (brand === 'Samsung' && !normalizedName.toLowerCase().startsWith('galaxy')) {
        normalizedName = `Galaxy ${normalizedName}`;
      }
      
      // Normalize other brands for display consistency
      if (brand === 'Motorola' && !normalizedName.toLowerCase().startsWith('moto')) {
        normalizedName = `Moto ${normalizedName}`;
      }

      const key = `${brand} ${normalizedName}`.toLowerCase();
      if (!modelMap.has(key)) {
        modelMap.set(key, { ...model, name: normalizedName, brand: brand });
      }
    });
    return Array.from(modelMap.values());
  }, [allModels]);


  // Índice de búsqueda optimizado
  const searchIndex = useMemo(() => {
    return normalizedModels.map(model => ({
      model,
      searchString: `${model.brand} ${model.name} ${model.processor || ''}`.toLowerCase(),
      brandString: model.brand.toLowerCase(),
      nameString: model.name.toLowerCase()
    }));
  }, [normalizedModels]);

  const filteredModels = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase().trim();
    if (!query || query.length < 2) return [];

    const searchTerms = query.split(' ').filter(term => term.length > 0);

    return searchIndex
      .filter(({ searchString, brandString, nameString }) => {
        // Búsqueda optimizada con prioridad
        const exactBrandMatch = brandString.includes(query);
        const exactNameMatch = nameString.includes(query);
        const fullMatch = searchTerms.every(term => searchString.includes(term));
        
        return exactBrandMatch || exactNameMatch || fullMatch;
      })
      .map(({ model }) => model)
      .slice(0, 10); // Limitar resultados para mejor rendimiento
  }, [debouncedSearchQuery, searchIndex]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Input
              type="text"
              placeholder="Busca tu modelo..."
              className="h-12 text-lg w-full rounded-full border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/40"
              style={{
                boxShadow: "0 0 20px 2px hsla(var(--primary) / 0.15)",
                borderColor: "hsl(var(--primary))"
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </motion.div>

        <AnimatePresence>
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 w-full z-50"
          >
            <Card className="text-left max-h-96 overflow-y-auto">
              {filteredModels.length > 0 ? (
                <ul>
                  {filteredModels.map((model) => (
                    <ModelResultItem key={model.id} model={model} />
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No se encontraron modelos.
                </div>
              )}
            </Card>
          </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
}
