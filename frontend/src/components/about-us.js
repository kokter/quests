import "../styles/colors.css";
import { useIsMobile } from "../hooks/isMobile";
import aboutUs1 from "../media/about_us_1.jpg";
import aboutUs2 from "../media/about_us_2.jpg";
import aboutUs3 from "../media/about_us_3.jpg";

const AboutUs = () => {
  const isMobile = useIsMobile();

  // Данные для блоков с изображениями и текстом
  const contentBlocks = [
    {
      image: aboutUs1,
      alt: "О нас 1",
      heading: "Наши квесты — это не просто комнаты с загадками. Это целые истории, в которых вы становитесь главными героями.",
      text: "Вас ждут мрачные подземелья, таинственные замки, заброшенные лаборатории и тайные ходы, где каждая деталь имеет значение."
    },
    {
      image: aboutUs2,
      alt: "О нас 2",
      heading: "Мы создаём сценарии так, чтобы вы полностью погрузились в атмосферу:",
      text: "от продуманных головоломок и необычных механик до света, звука и антуража, который оживает прямо перед вами."
    },
    {
      image: aboutUs3,
      alt: "О нас 3",
      heading: "Наша цель — подарить вам не только испытание для ума, но и настоящее приключение, которое объединит друзей, коллег или семью и подарит незабываемые эмоции.",
      text: ""
    }
  ];

  return (
    <section id="about" className="bg-color text-white w-full py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Заголовок секции "О нас" */}
        <h2 className={`font-orelega font-normal text-center leading-[100%] mb-8 md:mb-12 ${
          isMobile ? 'text-[50px]' : 'text-[100px]'
        }`}>
          О нас
        </h2>

        {/* Текст после заголовка */}
        <p className={`font-orienta font-normal text-center leading-[100%] mb-8 md:mb-12 ${
          isMobile ? 'text-[25px]' : 'text-[50px]'
        }`}>
          Квесты для настоящих искателей приключений в г. Иваново! Мы предлагаем новые невероятные сюжеты, яркие впечатления, живые эмоции и неподдельный интерес.
        </p>

      </div>

      {/* Блоки с изображениями - ближе к левому краю */}
      <div className="flex flex-col gap-6 md:gap-8">
        {contentBlocks.map((block, index) => (
          <div 
            key={index} 
            className={`bg-color rounded-lg overflow-hidden flex gap-4 md:gap-6 p-4 md:p-6 ${
              isMobile 
                ? 'flex-col mx-4' 
                : 'flex-row items-center'
            }`}
          >
            {/* Изображение */}
            <div className={`flex-shrink-0 ${
              isMobile 
                ? 'w-full max-w-[60%] mx-auto' 
                : 'w-1/3 max-w-[400px] ml-4 md:ml-8 lg:ml-12 xl:ml-16'
            }`}>
              <img 
                src={block.image} 
                alt={block.alt}
                className="w-full h-auto rounded-[50px] object-cover max-w-full"
                style={{
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </div>

            {/* Текст */}
            <div className={`flex flex-col justify-center font-orienta font-normal leading-[100%] text-color-for-about-images text-center ${
              isMobile 
                ? 'text-[20px] mt-4' 
                : 'text-[40px] flex-1 pr-4 md:pr-8 lg:pr-12 xl:pr-16'
            }`}>
              <p className={isMobile ? 'mb-3' : 'mb-4'}>{block.heading}</p>
              {block.text && <p>{block.text}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutUs;
