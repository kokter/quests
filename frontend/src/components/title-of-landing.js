import backgroundGif from "../media/background_for_title.gif";
import "../styles/colors.css";
import { useIsMobile } from "../hooks/isMobile";

const TitleOfLanding = () => {
  const isMobile = useIsMobile();

  return (
    <section 
      className={`relative w-full bg-color ${
        isMobile ? 'min-h-screen' : ''
      }`}
      style={{
        ...(isMobile ? {
          backgroundImage: `url(${backgroundGif})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll',
        } : {
          // Плавный переход между header и GIF через градиент
          background: `linear-gradient(to bottom, rgb(2, 6, 22) 0%, rgb(2, 6, 22) 78px, rgba(2, 6, 22, 0.8) 83px, rgba(2, 6, 22, 0.4) 90px, transparent 100px), url(${backgroundGif})`,
          backgroundSize: '100% auto',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll', // Статичное изображение, прокручивается вместе с контентом
          paddingTop: '78px',
          minHeight: '1327px', // Минимальная высота равна высоте GIF изображения
          overflow: 'hidden', // Предотвращаем выход элементов за границы
        }),
      }}
    >
      {/* Главный заголовок - позиционирование относительно GIF */}
      <h1 
        className={`title-color-for-landing font-orelega font-normal text-center absolute left-1/2 transform -translate-x-1/2 w-full px-4 leading-[100%] ${
          isMobile
            ? 'text-[60px] top-[25%]'
            : 'text-[120px] top-[448px]'
        }`}
      >
        Фабрика квестов
      </h1>

      {/* Подзаголовок - позиционирование относительно GIF */}
      <div 
        className={`absolute w-full max-w-2xl px-4 ${
          isMobile 
            ? 'left-1/2 transform -translate-x-1/2 bottom-[15%]' 
            : 'left-[51px] top-[733px]'
        }`}
      >
        <p 
          className={`title-color-for-landing font-orelega font-normal leading-[100%] ${
            isMobile
              ? 'text-[25px] text-center'
              : 'text-[50px] text-left'
          }`}
        >
          Квесты, где каждый шаг приближает к разгадке<br />
          — рискнёшь пройти испытание?
        </p>
      </div>
    </section>
  );
};

export default TitleOfLanding;

