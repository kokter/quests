import Header from '../components/header';
import Promotions from '../components/promotions';
import ServiceDetail from '../components/service-detail';
import ServiceSchedule from '../containers/schedule';
import Additions from '../containers/additions';
import { OrderProvider } from '../context/order-context';

const ServicePage = () => {
  return (
    <OrderProvider>
      <Header />
      <Promotions />
      <ServiceDetail />
      <ServiceSchedule />
      <Additions />
      {/* Нижний отступ страницы */}
      <div className="bg-color w-full h-12" />
    </OrderProvider>
  );
};

export default ServicePage;

