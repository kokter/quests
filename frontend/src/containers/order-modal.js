import { useEffect, useMemo, useRef, useState } from "react";
import { useOrder } from "../context/order-context";
import { useIsMobile } from "../hooks/isMobile";

const Label = ({ children, optional = false }) => (
  <label className="block text-sm text-white mb-2">
    {children} {optional && <span className="text-white/50">*</span>}
  </label>
);

const PHONE_TEMPLATE = "+7 (___) ___-__-__";
const PHONE_DIGIT_LIMIT = 10;

const formatPhoneValue = (digits = "") => {
  let idx = 0;
  return PHONE_TEMPLATE.replace(/_/g, () => (idx < digits.length ? digits[idx++] : "_"));
};

const extractDigits = (value = "") => {
  const numeric = value.replace(/\D/g, "");
  const hasMaskPrefix = value.trim().startsWith("+7");
  const trimmed = hasMaskPrefix && numeric.startsWith("7") ? numeric.slice(1) : numeric;
  return trimmed.slice(0, PHONE_DIGIT_LIMIT);
};

const OrderModal = ({ open, onClose, slot, onSubmit }) => {
  const isMobile = useIsMobile();
  const { selectedAdditions, additionsTotal } = useOrder();
  const basePrice = slot?.price || 0;
  const total = useMemo(() => basePrice + (additionsTotal || 0), [basePrice, additionsTotal]);
  const [phoneDigits, setPhoneDigits] = useState("");
  const phoneValue = useMemo(() => formatPhoneValue(phoneDigits), [phoneDigits]);
  const phoneInputRef = useRef(null);
  const [clientIp, setClientIp] = useState("");

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    if (open) {
      document.addEventListener("keydown", onEsc);
      // Блокируем прокрутку фона на мобильных
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onEsc);
        document.body.style.overflow = prevOverflow;
      };
    }
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setPhoneDigits("");
    }
  }, [open]);

  useEffect(() => {
    let aborted = false;
    const fetchIp = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        if (!aborted) {
          setClientIp(data?.ip || "");
        }
      } catch (_) {
        if (!aborted) {
          setClientIp("");
        }
      }
    };
    fetchIp();
    return () => {
      aborted = true;
    };
  }, []);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (e.currentTarget.reportValidity && !e.currentTarget.reportValidity()) {
      return;
    }
    if (phoneDigits.length !== PHONE_DIGIT_LIMIT) {
      phoneInputRef.current?.setCustomValidity("Введите номер полностью в формате +7 (XXX) XXX-XX-XX");
      phoneInputRef.current?.reportValidity();
      return;
    }
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.phone = phoneDigits.length ? `+7${phoneDigits}` : "";
    if (clientIp) {
      payload.client_ip = clientIp;
    }
    onSubmit?.(payload);
  };

  const onPhoneChange = (event) => {
    phoneInputRef.current?.setCustomValidity("");
    setPhoneDigits(extractDigits(event.target.value));
  };

  return (
    <div className={`fixed inset-0 z-50 ${isMobile ? "flex items-stretch justify-center" : "flex items-center justify-center"}`}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative z-10 bg-color text-white shadow-xl overflow-hidden
        ${isMobile ? "w-full h-full rounded-none" : "w-[90%] max-w-xl rounded-lg"}
      `}>
        <div className={`border-b border-white/10 flex items-center justify-between ${isMobile ? "px-4 py-3 sticky top-0 bg-color" : "px-6 py-4"}`}>
          <div className={`${isMobile ? "text-base" : "text-lg"}`}>Бронирование</div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">✕</button>
        </div>

        {/* Info about selected time */}
        {slot && (
          <div className={`${isMobile ? "px-4 pt-4" : "px-6 pt-4"} text-sm text-white/80` }>
            <div>Дата: <span className="text-white">{slot.dateText}</span></div>
            <div>Время: <span className="text-white">{slot.timeText}</span></div>
            <div>Базовая стоимость: <span className="text-white">{basePrice} ₽</span></div>
            {selectedAdditions.length > 0 && (
              <div>Доп. услуги: <span className="text-white">+{additionsTotal} ₽</span></div>
            )}
            <div className="mt-1">Итого: <span className="text-white font-semibold">{total} ₽</span></div>
          </div>
        )}

        <form className={`${isMobile ? "px-4 py-4" : "px-6 py-4"} space-y-4 overflow-y-auto`} onSubmit={handleSubmit} style={isMobile ? {maxHeight: 'calc(100vh - 140px)'} : {}}>
          <div>
            <Label>Ваше имя</Label>
            <input name="name" required className="w-full bg-white/10 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <div>
            <Label>Телефон</Label>
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phoneValue}
              onChange={onPhoneChange}
              placeholder={PHONE_TEMPLATE}
              ref={phoneInputRef}
              className="w-full bg-white/10 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <Label optional>Email</Label>
            <input name="email" type="email" className="w-full bg-white/10 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <div>
            <Label optional>Заметка</Label>
            <textarea name="comment" rows={3} className="w-full bg-white/10 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>

          <button type="submit" className={`button-color text-white px-6 py-2 rounded-full ${isMobile ? "w-full" : ""}`}>Забронировать</button>

        </form>
      </div>
    </div>
  );
};

export default OrderModal;
