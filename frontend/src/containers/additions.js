import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useIsMobile } from "../hooks/isMobile";
import "../styles/colors.css";
import { useOrder } from "../context/order-context";
import { API_BASE_URL } from "../config";

const AdditionCard = ({ item, selected, onToggle }) => {
  return (
    <div
      className={`rounded-md overflow-hidden flex flex-col transition-colors
        ${selected ? "bg-yellow-400/10 border border-yellow-400" : "bg-white/5 border border-white/10"}
      `}
    >
      <div className="aspect-[4/3] bg-white/10 flex items-center justify-center">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-white/10" />
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-white text-sm mb-1 line-clamp-2">{item.name}</div>
        <div className="text-white/70 text-sm mb-3">{item.cost} ₽</div>
        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={() => onToggle?.(item)}
            aria-pressed={selected}
            className={`text-white text-xs px-3 py-1 rounded transition-colors
              ${selected ? "bg-green-600 hover:bg-green-700" : "button-color hover:opacity-90"}
            `}
          >
            {selected ? "Добавлено" : "Добавить"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Additions = () => {
  const { urlName } = useParams();
  const isMobile = useIsMobile();
  const { selectedIds, toggleAddition } = useOrder();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdditions = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `${API_BASE_URL}/service/addition/?service_url=${encodeURIComponent(urlName || "")}`;
        const resp = await fetch(url, { headers: { Accept: "application/json" } });
        if (!resp.ok) throw new Error(`Ошибка загрузки дополнений: ${resp.status}`);
        const data = await resp.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (urlName) fetchAdditions();
  }, [urlName]);

  const onToggle = (item) => toggleAddition(item);

  return (
    <section className="bg-color text-white w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Заголовок-аккордеон */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between border border-white/10 bg-white/5 px-4 py-3 rounded-t-md"
        >
          <span className="text-sm md:text-base">Дополнительные услуги</span>
          <svg
            className={`w-5 h-5 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Содержимое аккордеона */}
        <div className={`${open ? "block" : "hidden"} border-x border-b border-white/10 bg-white/5 rounded-b-md`}
             aria-hidden={!open}
        >
          <div className="p-4">
            {loading && <div className="text-gray-400">Загрузка дополнительных услуг…</div>}
            {error && <div className="text-red-400">{error}</div>}
            {!loading && !error && (
              items.length ? (
                <div className={`grid gap-4 ${isMobile ? "grid-cols-2" : "grid-cols-3"}`}>
                  {items.map((item) => (
                    <AdditionCard
                      key={item.id}
                      item={item}
                      selected={selectedIds.has(item.id)}
                      onToggle={onToggle}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-400">Нет дополнительных услуг для этой услуги.</div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Additions;
