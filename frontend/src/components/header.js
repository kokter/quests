import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX, FiMapPin } from "react-icons/fi";
import { useIsMobile } from "../hooks/isMobile";
import logo from "../media/logo.jpg";
import { API_BASE_URL } from "../config";

const splitAddressIntoTwoLines = (address) => {
  if (!address) return [];
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return [];
  if (parts.length <= 2) return [parts.join(", "), ""].filter(Boolean);
  return [
    parts.slice(0, 2).join(", "),
    parts.slice(2).join(", "),
  ];
};

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [contactData, setContactData] = useState(null);
  const isMobile = useIsMobile();

  // Загрузка контактной информации
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/contacts/contact/`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setContactData(data);
        }
      } catch (error) {
        console.error("Ошибка при загрузке контактов:", error);
      }
    };

    fetchContacts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Header скрывается когда верхняя часть GIF достигнет верха экрана (78px)
      if (currentScrollY >= 78) {
        // Определяем направление скролла
        if (currentScrollY > lastScrollY) {
          // Скролл вниз - скрываем header
          setIsVisible(false);
        } else {
          // Скролл вверх - показываем header
          setIsVisible(true);
        }
      } else {
        // Если scrollY < 78, всегда показываем header
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`bg-color text-white w-full fixed top-0 left-0 z-50 shadow-md transition-transform duration-300 ease-in-out ${
      isMobile ? '' : 'h-[78px]'
    } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className={`max-w-7xl mx-auto flex justify-between items-center px-4 ${
        isMobile ? 'py-3' : 'h-full'
      }`}>

        {/* --- Логотип --- */}
        <div className="flex items-center">
          <Link to="/" aria-label="На главную">
            <img 
              src={logo} 
              alt="ФАБРИКА КВЕСТОВ" 
              className="h-12 w-12 md:h-14 md:w-14 rounded-full object-cover"
            />
          </Link>
        </div>

        {/* --- Десктопное меню --- */}
        {!isMobile && (
          <nav className="flex space-x-8 font-orienta text-[25px] font-normal leading-[100%]">
            <a href="/#about" className="hover:text-yellow-400 transition-colors">О нас</a>
            <a href="/#services" className="hover:text-yellow-400 transition-colors">Услуги</a>
            <a href="/#contacts" className="hover:text-yellow-400 transition-colors">Контакты</a>
          </nav>
        )}

        {/* --- Правая часть --- */}
        <div className="flex items-center gap-4">
          {/* --- Адрес (только на десктопе) --- */}
          {!isMobile && contactData && (
            <div className="flex items-center gap-2">
              <FiMapPin className="text-red-500 text-xl flex-shrink-0" />
              <div className="flex flex-col text-sm font-bold font-sans leading-tight">
                {splitAddressIntoTwoLines(contactData.address).map((line, index) => (
                  <span key={index}>{line}</span>
                ))}
              </div>
            </div>
          )}

          {/* --- Бургер (только на мобилке) --- */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-3xl focus:outline-none"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          )}
        </div>
      </div>

      {/* --- Мобильное меню --- */}
      {isMobile && menuOpen && (
        <div
          id="mobile-menu"
          className="bg-color text-white px-6 pb-6 space-y-4 text-lg border-t border-gray-700 overflow-hidden transition-[max-height] duration-300 ease-out"
          style={{ maxHeight: '100vh' }}
        >
          <a
            href="/#about"
            className="block border-b border-gray-700 pb-2 pt-2 hover:text-yellow-400 font-orienta text-[25px] font-normal leading-[100%]"
            onClick={() => setMenuOpen(false)}
          >
            О нас
          </a>
          <a
            href="/#services"
            className="block border-b border-gray-700 pb-2 hover:text-yellow-400 font-orienta text-[25px] font-normal leading-[100%]"
            onClick={() => setMenuOpen(false)}
          >
            Услуги
          </a>
          <a
            href="/#contacts"
            className="block border-b border-gray-700 pb-2 hover:text-yellow-400 font-orienta text-[25px] font-normal leading-[100%]"
            onClick={() => setMenuOpen(false)}
          >
            Контакты
          </a>

          {/* Адрес в мобильном меню */}
          {contactData && (
            <div className="flex items-start gap-2 border-gray-700">
              <FiMapPin className="text-red-500 text-lg flex-shrink-0 mt-1" />
              <div className="text-white text-sm font-bold font-sans">
                {contactData.address && contactData.address.split(',').map((part, index) => (
                  <p key={index}>{part.trim()}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
