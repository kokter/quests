import { useIsMobile } from "../hooks/isMobile";
import { FiMap, FiTruck, FiSmile } from "react-icons/fi";

const Service = ({ id, icon, title, isSelected, onClick }) => {
  const isMobile = useIsMobile();

  // Если иконка - это URL изображения, показываем изображение, иначе используем иконки
  const renderIcon = () => {
    if (icon && (icon.startsWith('http') || icon.startsWith('/'))) {
      return (
        <img 
          src={icon} 
          alt={title}
          className="w-full h-full object-contain"
          onError={(e) => {
            console.error('Ошибка загрузки иконки:', icon);
            e.target.style.display = 'none';
          }}
        />
      );
    }
    
    // Выбор иконки в зависимости от типа
    switch (icon) {
      case "map":
        return <FiMap className="w-full h-full" />;
      case "car":
        return <FiTruck className="w-full h-full" />;
      case "mask":
        return <FiSmile className="w-full h-full" />;
      default:
        return <FiMap className="w-full h-full" />;
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`
        border rounded-lg 
        flex flex-col items-center justify-center
        p-6 md:p-8
        ${isMobile ? 'w-full' : 'flex-1 min-w-[200px] max-w-[300px]'}
        transition-colors cursor-pointer
        ${isSelected 
          ? 'border-yellow-400 bg-yellow-400/10' 
          : 'border-white hover:border-yellow-400'
        }
      `}
    >
      {/* Иконка */}
      <div className={`text-white mb-4 ${
        isMobile ? 'w-16 h-16' : 'w-20 h-20'
      }`}>
        {renderIcon()}
      </div>

      {/* Название */}
      <p className={`font-orienta font-normal text-center leading-[100%] text-white ${
        isMobile ? 'text-[20px]' : 'text-[25px]'
      }`}>
        {title}
      </p>
    </div>
  );
};

export default Service;

