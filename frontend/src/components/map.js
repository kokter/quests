import { useEffect, useRef } from "react";

const Map = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    // Удаляем старый скрипт, если он есть
    const existingScript = document.querySelector('script[src*="api-maps.yandex.ru/services/constructor"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Удаляем старый iframe карты, если он есть
    const existingIframe = document.querySelector('#yandex-map iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    // Ждем, пока контейнер будет готов
    const checkContainer = () => {
      if (!mapContainerRef.current) {
        setTimeout(checkContainer, 100);
        return;
      }

      // Загружаем скрипт Яндекс.Карт конструктора
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.charset = 'utf-8';
      script.async = true;
      script.src = 'https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3A2cf777b3078d5322e6288e436db4a4ff06cc55a3139a8e53676a2c7f3b51c339&width=500&height=400&lang=ru_RU&scroll=true';
      
      // Вставляем скрипт прямо перед контейнером карты
      // Скрипт конструктора создаст карту в элементе, который находится сразу после script
      if (mapContainerRef.current && mapContainerRef.current.parentNode) {
        mapContainerRef.current.parentNode.insertBefore(script, mapContainerRef.current);
      } else {
        document.head.appendChild(script);
      }

      // Применяем стили к iframe после его создания
      const applyStyles = () => {
        const iframe = document.querySelector('#yandex-map iframe');
        if (iframe) {
          iframe.style.width = '100%';
          iframe.style.maxWidth = '100%';
        } else {
          setTimeout(applyStyles, 100);
        }
      };
      
      setTimeout(applyStyles, 500);
    };

    checkContainer();

    return () => {
      // Очистка при размонтировании компонента
      const script = document.querySelector('script[src*="api-maps.yandex.ru/services/constructor"]');
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <section className="bg-color text-white w-full pt-8 pb-[901px]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex justify-center">
        <div className="h-[400px] overflow-hidden" style={{ width: '500px', maxWidth: '100%' }}>
          <div 
            ref={mapContainerRef}
            id="yandex-map"
            className="w-full h-full"
            style={{
              width: '500px',
              maxWidth: '100%'
            }}
          >
            {/* Скрипт конструктора автоматически создаст карту здесь */}
            <style>{`
              #yandex-map iframe {
                width: 500px !important;
                max-width: 100% !important;
              }
            `}</style>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Map;

