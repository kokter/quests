import { useState, useEffect } from "react";
import { useIsMobile } from "../hooks/isMobile";
import "../styles/colors.css";

const API_BASE_URL = process.env.REACT_APP_PATH_URL_API || "http://127.0.0.1:8000/api";

const Promotions = () => {
  const isMobile = useIsMobile();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/information/actions/`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setActions(data);
        } else {
          console.error("Ошибка при загрузке акций:", response.status);
        }
      } catch (error) {
        console.error("Ошибка при загрузке акций:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, []);

  // Автоматическая прокрутка
  useEffect(() => {
    if (actions.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % actions.length);
    }, 5000); // Меняем слайд каждые 5 секунд

    return () => clearInterval(interval);
  }, [actions.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? actions.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === actions.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return (
      <section className="bg-color text-white w-full h-[400px] md:h-[500px] flex items-center justify-center">
        <p className="text-gray-400">Загрузка акций...</p>
      </section>
    );
  }

  if (actions.length === 0) {
    return null;
  }

  const currentAction = actions[currentIndex];
  const imageUrl = isMobile && currentAction.mobile_image 
    ? currentAction.mobile_image 
    : currentAction.image;

  return (
    <section id="promotions" className="bg-color text-white w-full h-[400px] md:h-[500px] relative overflow-hidden">
      {/* Изображение акции */}
      {imageUrl && (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={imageUrl}
            alt={currentAction.name || 'Акция'}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Контент поверх изображения */}
      <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-8">
        {/* Индикаторы слайдов */}
        {actions.length > 1 && (
          <div className="flex justify-center gap-2 mb-4">
            {actions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'w-8 bg-yellow-400' 
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Стрелки навигации */}
        {actions.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 md:p-4 transition-all z-20"
              aria-label="Предыдущий слайд"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 md:p-4 transition-all z-20"
              aria-label="Следующий слайд"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default Promotions;

