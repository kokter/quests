import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useIsMobile } from "../hooks/isMobile";
import "../styles/colors.css";
import OrderModal from "./order-modal";
import { useOrder } from "../context/order-context";
import { API_BASE_URL } from "../config";

// Безопасный парсинг дат форматов `YYYY-MM-DD` и `DD.MM.YYYY`
function parseDate(value) {
  if (!value) return null;
  if (value.includes("-")) {
    // YYYY-MM-DD
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (value.includes(".")) {
    const [dd, mm, yyyy] = value.split(".").map((x) => parseInt(x, 10));
    if (!dd || !mm || !yyyy) return null;
    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatDDMM(date) {
  if (!date) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

const WEEK_DAYS = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

function formatWeekday(date) {
  if (!date) return "";
  return WEEK_DAYS[date.getDay()];
}

const TimePill = ({ time, price, isActive, onClick }) => {
  return (
    <button
      disabled={!isActive}
      onClick={isActive ? onClick : undefined}
      className={`rounded-full border px-4 py-2 text-sm md:text-base transition-colors whitespace-nowrap
        ${isActive ? "border-red-500/60 text-red-300 hover:bg-red-500/10" : "border-white/20 text-white/40 cursor-not-allowed"}
      `}
      title={isActive ? `${time} — ${price}₽` : "Недоступно"}
    >
      {time}
    </button>
  );
};

const ServiceSchedule = () => {
  const { urlName } = useParams();
  const isMobile = useIsMobile();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { selectedAdditions, additionsTotal } = useOrder();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `${API_BASE_URL}/information/schedule/?service_url=${encodeURIComponent(urlName || "")}`;
        const resp = await fetch(url, { headers: { Accept: "application/json" } });
        if (!resp.ok) throw new Error(`Ошибка загрузки расписания: ${resp.status}`);
        const data = await resp.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (urlName) fetchSchedule();
  }, [urlName]);

  // Группируем по дате
  const byDate = useMemo(() => {
    const groups = new Map();
    for (const it of items) {
      const d = parseDate(it.date);
      const key = d ? d.toISOString().slice(0, 10) : String(it.date);
      if (!groups.has(key)) groups.set(key, { date: d, rows: [] });
      groups.get(key).rows.push(it);
    }
    // сортировка по дате
    return Array.from(groups.values()).sort((a, b) => (a.date && b.date ? a.date - b.date : 0));
  }, [items]);

  const openModal = (date, time, price, id) => {
    const two = (n) => String(n).padStart(2, "0");
    const dateText = date ? `${two(date.getDate())}.${two(date.getMonth() + 1)}.${date.getFullYear()}` : "";
    const timeText = String(time).slice(0, 5);
    setSelectedSlot({ date, dateText, timeText, price, id });
    setModalOpen(true);
  };

  const submitOrder = async (payload) => {
    try {
      const body = {
        name: payload.name,
        phone: payload.phone,
        email: payload.email || "",
        comment: payload.comment || "",
        schedule: selectedSlot?.id,
        additions: selectedAdditions.map(a => a.id),
      };
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (payload.client_ip) {
        headers["X-Client-IP"] = payload.client_ip;
      }
      const resp = await fetch(`${API_BASE_URL}/order/orders/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        console.error('Ошибка создания заказа:', resp.status, errText);
      }
    } catch (e) {
      console.error('Сбой создания заказа:', e);
    } finally {
      setModalOpen(false);
      // Перечитать расписание, чтобы слот отобразился как занятый
      // Простая перезагрузка данных
      try {
        const url = `${API_BASE_URL}/information/schedule/?service_url=${encodeURIComponent(urlName || "")}`;
        const resp = await fetch(url, { headers: { Accept: "application/json" } });
        if (resp.ok) {
          const data = await resp.json();
          setItems(Array.isArray(data) ? data : []);
        }
      } catch {}
    }
  };

  if (loading) {
    return (
      <section className="bg-color text-white w-full py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-gray-400">Загрузка расписания…</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-color text-white w-full py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-red-400">{error}</div>
      </section>
    );
  }

  if (!byDate.length) {
    return (
      <section className="bg-color text-white w-full py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-gray-400">Расписание скоро появится.</div>
      </section>
    );
  }

  return (
    <section className="bg-color text-white w-full py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Табличная шапка только на десктопе */}
        {!isMobile && (
          <div className="grid" style={{ gridTemplateColumns: "220px 1fr" }}>
            <div className="border-y border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60">ДД/ММ</div>
              <div className="text-xs text-white/60">День недели</div>
            </div>
            <div className="border-y border-white/10 bg-white/5 p-4" />
          </div>
        )}

        {/* Строки расписания */}
        <div className="border-b border-white/10">
          {byDate.map((g, idx) => {
            const dateStr = formatDDMM(g.date);
            const dayStr = formatWeekday(g.date);
            // сортировка по времени
            const times = [...g.rows].sort((a, b) => String(a.time).localeCompare(String(b.time)));
            return (
              <div key={idx} className="grid items-stretch" style={{ gridTemplateColumns: isMobile ? "1fr" : "220px 1fr" }}>
                {/* Левая колонка с датой */}
                <div className={`border-t border-white/10 ${isMobile ? "px-0 py-4" : "p-4 bg-white/5"}`}>
                  <div className="text-sm text-white/80">{dateStr}</div>
                  <div className="text-xs text-white/60">{dayStr}</div>
                </div>

                {/* Плитки времени */}
                <div className="border-t border-white/10 p-3">
                  <div className="flex flex-wrap gap-3">
                    {times.map((t, i) => (
                      <TimePill
                        key={i}
                        time={String(t.time).slice(0, 5)}
                        price={t.price}
                        isActive={t.is_active}
                        onClick={() => openModal(g.date, t.time, t.price, t.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Сноска с ценой */}
        <p className="mt-6 text-xs text-white/50">
          *Стоимость указана за участие группы до 5 человек, каждый следующий + 500₽.
        </p>
      </div>

      {/* Модальное окно бронирования */}
      <OrderModal open={modalOpen} onClose={() => setModalOpen(false)} slot={selectedSlot} onSubmit={submitOrder} />
    </section>
  );
};

export default ServiceSchedule;
