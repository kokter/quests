import { Link } from "react-router-dom";
import { useIsMobile } from "../hooks/isMobile";
import { FiUser } from "react-icons/fi";

const ServiceType = ({ image, title, maxParticipants, ageRange, description, cost, urlName }) => {
  const isMobile = useIsMobile();

  return (
    <Link 
      to={urlName ? `/${urlName}` : '#'}
      className={`
        relative overflow-hidden rounded-lg w-full
        cursor-pointer
        group
        block
      `}
    >
      {/* Изображение */}
      {image && (
        <div className="relative w-full h-[400px] md:h-[500px]">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              console.error('Ошибка загрузки изображения:', image);
              e.target.style.display = 'none';
            }}
          />
          
          {/* Градиент для лучшей читаемости текста */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      )}

      {/* Контент поверх изображения */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
        {/* Название */}
        {title && (
          <h3 className={`font-orienta font-normal leading-[100%] mb-3 ${
            isMobile ? 'text-[24px]' : 'text-[28px]'
          }`}>
            {title}
          </h3>
        )}

        {/* Детали */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 text-sm md:text-base">
            {maxParticipants && (
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4" />
                <span>До {maxParticipants}</span>
              </div>
            )}
            {ageRange && (
              <span>({ageRange})</span>
            )}
          </div>
          {cost && (
            <div className="text-base md:text-lg font-semibold">
              {cost} ₽
            </div>
          )}
          {description && (
            <p className="text-sm md:text-base opacity-90 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ServiceType;

