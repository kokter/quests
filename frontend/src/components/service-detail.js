import { useState, useEffect, useRef } from "react";
import "../styles/colors.css";
import { useIsMobile } from "../hooks/isMobile";
import { useParams } from "react-router-dom";
import serviceLogo from "../media/service_logo.png";
import { API_BASE_URL } from "../config";

const ServiceDetail = () => {
  const { urlName } = useParams();
  const isMobile = useIsMobile();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descriptionFontSize, setDescriptionFontSize] = useState(null);
  const imageRef = useRef(null);
  const descriptionRef = useRef(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = `${API_BASE_URL}/service/by-url/${urlName}/`;
        console.log("Запрос услуги по URL:", url);
        console.log("urlName из параметров:", urlName);
        
        // Загружаем услугу по url_name
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        console.log("Статус ответа:", response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Ошибка ответа:", response.status, errorText);
          if (response.status === 404) {
            setError(`Услуга не найдена (url_name: ${urlName})`);
          } else {
            setError(`Ошибка при загрузке услуги: ${response.status}`);
          }
          return;
        }

        const data = await response.json();
        console.log("Полученные данные услуги:", data);
        setService(data);
      } catch (error) {
        console.error("Ошибка при загрузке услуги:", error);
        setError(`Ошибка при загрузке услуги: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (urlName) {
      fetchService();
    }
  }, [urlName]);

  // Эффект для подстройки размера шрифта описания под высоту изображения (только для десктопа)
  useEffect(() => {
    if (isMobile || !service || !service.description) {
      setDescriptionFontSize(null);
      return;
    }

    const adjustFontSize = () => {
      if (!imageRef.current || !descriptionRef.current) return;

      const image = imageRef.current;
      const descriptionContainer = descriptionRef.current;
      
      if (!image || !descriptionContainer) return;

      // Ждем, пока изображение загрузится и получит реальную высоту
      if (image.complete && image.naturalHeight !== 0) {
        const imageHeight = image.offsetHeight;
        
        // Находим контейнер с контентом
        const contentContainer = descriptionContainer.parentElement;
        if (!contentContainer) return;

        // Вычисляем использованную высоту (заголовок, разделитель, информация об участниках)
        const header = contentContainer.querySelector('h1');
        const divider = contentContainer.querySelector('.border-b.border-white\\/20');
        const participantsInfo = contentContainer.querySelector('.flex.items-start.gap-4');
        
        let usedHeight = 0;
        if (header) usedHeight += header.offsetHeight + 24; // mb-6 = 24px
        if (divider) usedHeight += divider.offsetHeight + 24; // mb-6 = 24px
        if (participantsInfo) usedHeight += participantsInfo.offsetHeight + 24; // mb-6 = 24px
        usedHeight += 24; // mt-6 для описания

        const availableHeight = imageHeight - usedHeight;
        const descriptionText = descriptionContainer.querySelector('p');
        
        if (!descriptionText || availableHeight <= 50) {
          // Если доступной высоты слишком мало, используем стандартный размер
          setDescriptionFontSize(16);
          return;
        }

        // Бинарный поиск оптимального размера шрифта
        let minSize = 10;
        let maxSize = 20;
        let bestSize = 16;

        // Временно устанавливаем максимальный размер для измерения
        descriptionText.style.fontSize = `${maxSize}px`;
        const maxHeight = descriptionText.scrollHeight;

        if (maxHeight <= availableHeight) {
          // Если текст помещается даже при максимальном размере, используем его
          bestSize = maxSize;
        } else {
          // Бинарный поиск оптимального размера
          while (maxSize - minSize > 0.5) {
            const testSize = (minSize + maxSize) / 2;
            descriptionText.style.fontSize = `${testSize}px`;
            
            if (descriptionText.scrollHeight <= availableHeight) {
              minSize = testSize;
              bestSize = testSize;
            } else {
              maxSize = testSize;
            }
          }
        }

        setDescriptionFontSize(bestSize);
        descriptionText.style.fontSize = `${bestSize}px`;
      }
    };

    // Запускаем после загрузки изображения
    const image = imageRef.current;
    if (image) {
      if (image.complete) {
        setTimeout(adjustFontSize, 200);
      } else {
        image.onload = () => {
          setTimeout(adjustFontSize, 200);
        };
      }
    }

    // Также вызываем при изменении размера окна с задержкой
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(adjustFontSize, 200);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [service, isMobile]);

  if (loading) {
    return (
      <section className="bg-color text-white w-full py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center text-gray-400 py-8">Загрузка услуги...</div>
        </div>
      </section>
    );
  }

  if (error || !service) {
    return (
      <section className="bg-color text-white w-full py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center text-red-400 py-8">{error || "Услуга не найдена"}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-color text-white w-full py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className={`flex gap-8 md:gap-12 ${
          isMobile ? 'flex-col' : 'flex-row items-start'
        }`}>
          {/* Левая часть - изображение */}
          <div className={`flex-shrink-0 ${
            isMobile ? 'w-full' : 'w-1/3'
          }`}>
            {service.image && (
              <img
                ref={imageRef}
                src={service.image}
                alt={service.name}
                className="w-full h-auto rounded-lg object-cover"
                style={{
                  maxHeight: isMobile ? '400px' : 'auto',
                  objectFit: 'cover'
                }}
              />
            )}
          </div>

          {/* Правая часть - контент */}
          <div className={`flex-1 ${
            isMobile ? 'w-full' : ''
          }`}>
            {/* Заголовок */}
            <h1 className={`font-orienta font-normal leading-[100%] mb-6 ${
              isMobile ? 'text-[32px]' : 'text-[48px]'
            }`}>
              {service.name}
            </h1>

            {/* Разделитель */}
            <div className="border-b border-white/20 mb-6"></div>

            {/* Иконка и информация об участниках */}
            <div className="flex items-start gap-4 mb-6">
              <img
                src={serviceLogo}
                alt="Service logo"
                className="text-red-500 w-12 h-12 md:w-16 md:h-16 flex-shrink-0 object-contain"
              />
              <div className="flex flex-col gap-3 flex-1">
                {service.minimal_age != null && service.minimal_age >= 0 && (
                  <>
                    <div className="flex items-center">
                      <span className={`font-sans text-white ${
                        isMobile ? 'text-[14px]' : 'text-[16px]'
                      }`}>
                        Возраст участников {service.minimal_age}+ лет
                      </span>
                    </div>
                    {service.peoples && <div className=""></div>}
                  </>
                )}
                {service.peoples && service.peoples > 0 && (
                  <div className="flex items-center">
                    <span className={`font-sans text-white ${
                      isMobile ? 'text-[14px]' : 'text-[16px]'
                    }`}>
                      Кол-во участников до {service.peoples}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Описание */}
            {service.description && (
              <div 
                ref={descriptionRef}
                className={`font-sans text-white leading-relaxed mt-6 ${
                  isMobile ? 'text-[14px]' : ''
                }`}
                style={!isMobile && descriptionFontSize ? { fontSize: `${descriptionFontSize}px` } : {}}
              >
                <p className="whitespace-pre-wrap break-words">{service.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceDetail;

