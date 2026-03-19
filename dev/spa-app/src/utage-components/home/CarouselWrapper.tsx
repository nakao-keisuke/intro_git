import type React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import BannerCard from '@/components/home/BannerCard';
import homeStyles from '@/styles/home/HomePage.module.css';
import type { Banner } from '@/types/Banner';

interface CarouselWrapperProps {
  bannerList: Banner[];
}

const CarouselWrapper: React.FC<CarouselWrapperProps> = ({ bannerList }) => {
  return (
    <Carousel
      className={homeStyles.carousel}
      showThumbs={false}
      autoPlay={true}
      emulateTouch={true}
      infiniteLoop={true}
      showStatus={false}
      showIndicators={true}
      showArrows={false}
      interval={5000}
    >
      {bannerList.map((banner, index) => (
        <div key={index}>
          <BannerCard banner={banner} index={index} deviceCategory="mobile" />
        </div>
      ))}
    </Carousel>
  );
};

export default CarouselWrapper;
