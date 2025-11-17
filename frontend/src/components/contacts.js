import { useState, useEffect } from "react";
import { FiMapPin, FiPhone, FiGlobe } from "react-icons/fi";
import { useIsMobile } from "../hooks/isMobile";
import "../styles/colors.css";
import telegramIcon from "../media/telegram.png";
import vkIcon from "../media/vk.png";
import whatsappIcon from "../media/whatsapp.png";
import { API_BASE_URL } from "../config";

// Функция для форматирования номера телефона
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Убираем все нецифровые символы, кроме +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Если номер начинается с +7, заменяем на 8
  if (cleaned.startsWith('+7')) {
    cleaned = '8' + cleaned.substring(2);
  }
  
  // Форматируем: 8-920-346-04-70
  if (cleaned.length === 11 && cleaned.startsWith('8')) {
    return `${cleaned[0]}-${cleaned.substring(1, 4)}-${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9)}`;
  }
  
  // Если формат не подходит, возвращаем как есть
  return phone;
};

// Функция для получения номера телефона для tel: ссылки
const getTelLink = (phone) => {
  if (!phone) return '';
  
  // Убираем все нецифровые символы
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Если номер начинается с +7, оставляем как есть
  if (cleaned.startsWith('+7')) {
    return cleaned;
  }
  
  // Если номер начинается с 8, заменяем на +7
  if (cleaned.startsWith('8') && cleaned.length === 11) {
    return '+7' + cleaned.substring(1);
  }
  
  return cleaned;
};

const Contacts = () => {
  const isMobile = useIsMobile();
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/contacts/contact/`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setContactData(data);
        } else {
          console.error("Ошибка при загрузке контактов:", response.status);
        }
      } catch (error) {
        console.error("Ошибка при загрузке контактов:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) {
    return (
      <section id="contacts" className="bg-color text-white w-full py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <p className="text-gray-400">Загрузка контактов...</p>
        </div>
      </section>
    );
  }

  if (!contactData) {
    return null;
  }

  return (
    <section id="contacts" className="bg-color text-white w-full py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Заголовок */}
        <h2 className={`font-orelega font-normal text-center leading-[100%] mb-8 md:mb-12 ${
          isMobile ? 'text-[50px]' : 'text-[100px]'
        }`}>
          Контакты
        </h2>

        {/* Вводный текст */}
        <p className={`font-orienta font-normal text-center leading-[100%] mb-12 md:mb-16 ${
          isMobile ? 'text-[20px]' : 'text-[40px]'
        }`}>
          Хотите забронировать игру или задать вопрос? Мы всегда на связи!
        </p>

        {/* Контактная информация */}
        <div className="flex flex-col items-center gap-8 md:gap-12">
          {/* Адрес */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-3">
              <FiMapPin className="text-red-500 text-2xl md:text-3xl flex-shrink-0" />
              <span className={`font-orienta font-normal leading-[100%] ${
                isMobile ? 'text-[18px]' : 'text-[28px]'
              }`}>
                Адрес:
              </span>
            </div>
            <p className={`font-orienta font-normal leading-[100%] ${
              isMobile ? 'text-[16px]' : 'text-[24px]'
            }`}>
              {contactData.address}
            </p>
          </div>

          {/* Телефон */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-3">
              <FiPhone className="text-gray-400 text-2xl md:text-3xl flex-shrink-0" />
              <span className={`font-orienta font-normal leading-[100%] ${
                isMobile ? 'text-[18px]' : 'text-[28px]'
              }`}>
                Телефон для бронирования:
              </span>
            </div>
            {isMobile ? (
              <a
                href={`tel:${getTelLink(contactData.phone)}`}
                className={`font-orienta font-normal leading-[100%] text-[16px] hover:text-yellow-400 transition-colors underline`}
              >
                {formatPhoneNumber(contactData.phone)}
              </a>
            ) : (
              <p className={`font-orienta font-normal leading-[100%] text-[24px]`}>
                {formatPhoneNumber(contactData.phone)}
              </p>
            )}
          </div>

          {/* Социальные сети */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-6">
              <FiGlobe className="text-gray-400 text-2xl md:text-3xl flex-shrink-0" />
              <span className={`font-orienta font-normal leading-[100%] ${
                isMobile ? 'text-[18px]' : 'text-[28px]'
              }`}>
                Социальные сети:
              </span>
            </div>
            <div className="flex items-center justify-center gap-6 md:gap-8">
              {contactData.telegram_link && (
                <a
                  href={contactData.telegram_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="Telegram"
                >
                  <img
                    src={telegramIcon}
                    alt="Telegram"
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                </a>
              )}
              {contactData.vk_link && (
                <a
                  href={contactData.vk_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="VK"
                >
                  <img
                    src={vkIcon}
                    alt="VK"
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                </a>
              )}
              {contactData.whatsapp_link && (
                <a
                  href={contactData.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <img
                    src={whatsappIcon}
                    alt="WhatsApp"
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;

