import { createContext, useContext, useMemo, useState } from "react";

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [selectedMap, setSelectedMap] = useState(new Map()); // id -> item

  const toggleAddition = (item) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.set(item.id, item);
      return next;
    });
  };

  const clearAdditions = () => setSelectedMap(new Map());

  const value = useMemo(() => {
    const selectedAdditions = Array.from(selectedMap.values());
    const selectedIds = new Set(selectedMap.keys());
    const additionsTotal = selectedAdditions.reduce((s, a) => s + (a?.cost || 0), 0);
    return {
      selectedAdditions,
      selectedIds,
      additionsTotal,
      toggleAddition,
      clearAdditions,
    };
  }, [selectedMap]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrder = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
};

