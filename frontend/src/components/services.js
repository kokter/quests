import { useState, useEffect } from "react";
import "../styles/colors.css";
import { useIsMobile } from "../hooks/isMobile";
import Service from "../containers/service";
import ServiceType from "../containers/service-type";

const API_BASE_URL = process.env.REACT_APP_PATH_URL_API || "http://127.0.0.1:8000/api";

const Services = () => {
  const isMobile = useIsMobile();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);

  // Обработчик клика на категорию
  const handleCategoryClick = async (categoryId) => {
    try {
      setLoadingServices(true);
      setSelectedCategory(categoryId);
      const response = await fetch(`${API_BASE_URL}/service/category/${categoryId}/`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
        if (response.ok) {
          const data = await response.json();
          console.log("Полученные данные категории:", data);
          // Фильтруем только активные квесты
          const activeServices = data.services.filter(service => service.is_active);
          console.log("Активные квесты:", activeServices);
          activeServices.forEach(service => {
            console.log(`Квест "${service.name}": изображение = ${service.image}`);
          });
          setServices(activeServices);
        } else {
        const errorText = await response.text();
        console.error("Ошибка ответа:", response.status, errorText);
      }
    } catch (error) {
      console.error("Ошибка при загрузке квестов категории:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  // Загрузка категорий при монтировании компонента
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const url = `${API_BASE_URL}/service/category/`;
        console.log("Запрос категорий по URL:", url);
        console.log("API_BASE_URL:", API_BASE_URL);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });
        
        console.log("Статус ответа:", response.status, response.statusText);
        console.log("Заголовки ответа:", Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Ошибка ответа:", response.status, errorText);
          return;
        }
        
        const data = await response.json();
        console.log("Полученные данные:", data);
        console.log("Тип данных:", typeof data, Array.isArray(data));
        
        if (Array.isArray(data)) {
          console.log("Категории с иконками:");
          data.forEach(category => {
            console.log(`Категория "${category.name}": иконка = ${category.icon}`);
          });
          setCategories(data);
          console.log("Категории установлены:", data.length);
          // Автоматически выбираем первую категорию, если есть
          if (data.length > 0) {
            handleCategoryClick(data[0].id);
          }
        } else {
          console.error("Ожидался массив, получено:", typeof data, data);
        }
      } catch (error) {
        console.error("Ошибка при загрузке категорий:", error);
        console.error("Детали ошибки:", error.message);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.error("Возможная проблема с CORS или недоступностью сервера");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="services" className="bg-color text-white w-full py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Заголовок секции "Услуги" */}
        <h2 className={`font-orelega font-normal text-center leading-[100%] mb-8 md:mb-12 ${
          isMobile ? 'text-[50px]' : 'text-[100px]'
        }`}>
          Услуги
        </h2>

        {/* Блоки с услугами (service) - категории */}
        {loading ? (
          <div className="text-center text-gray-400 py-8">
            Загрузка категорий...
          </div>
        ) : (
          <div className={`flex flex-wrap justify-center gap-6 md:gap-8 mb-12 md:mb-16 ${
            isMobile ? 'flex-col' : 'flex-row'
          }`}>
            {categories.map((category) => (
              <Service 
                key={category.id}
                id={category.id}
                icon={category.icon}
                title={category.name}
                isSelected={selectedCategory === category.id}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>
        )}

        {/* Плиточное расположение типов услуг (service-type) */}
        <div className="relative">
          {loadingServices ? (
            <div className="text-center text-gray-400 py-8">
              Загрузка квестов...
            </div>
          ) : (
            <div className={`grid gap-4 ${
              isMobile ? 'grid-cols-1' : 'grid-cols-3'
            } md:gap-8 lg:gap-12 xl:gap-16`}>
              {services.length > 0 ? (
                services.map((service) => (
                  <ServiceType 
                    key={service.id}
                    image={service.image}
                    title={service.name}
                    maxParticipants={service.peoples}
                    ageRange={service.minimal_age ? `${service.minimal_age}+ лет` : null}
                    description={service.description}
                    cost={service.cost}
                    urlName={service.url_name}
                  />
                ))
              ) : (
                <div className="text-center text-gray-400 py-8 w-full col-span-full">
                  {selectedCategory ? "В этой категории пока нет активных квестов" : "Выберите категорию для просмотра квестов"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Services;

