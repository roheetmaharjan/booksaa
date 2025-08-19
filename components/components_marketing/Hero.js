"use client"
import { Input } from "../ui/input";
import {SearchIcon} from "lucide-react"
import { TypeAnimation } from 'react-type-animation';

const Hero = () => {
  return (
    <>
      <section
        id="home"
        className="relative overflow-hidden bg-black py-[120px] md:py-[130px] lg:py-[160px]"
      >
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4">
              <div
                className="hero-content wow fadeInUp mx-auto max-w-[780px] text-center"
                data-wow-delay=".2s"
              >
                <h1 className="mb-6 text-3xl font-bold leading-snug text-white sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-[1.2]">
                  Book your 
                  <TypeAnimation
                    sequence={[
                      "Yoga",
                      1000,
                      "Saloon",
                      1000,
                      "Massage",
                      1000,
                      "Workout",
                      1000,
                    ]}
                    wrapper="span"
                    speed={50}
										style={{ marginLeft: '10px'}}
                    repeat={Infinity}
                  />
                </h1>
                <p className="mx-auto mb-9 max-w-[600px] text-base font-medium text-white sm:text-lg sm:leading-[1.44]">
                  Whether you’re a salon, trainer, or repair expert, we give you
                  the tools to manage bookings, promote your services, and
                  receive payments, all in one place.
                </p>
                <div className="relative max-w-[500px] m-auto">
                  <SearchIcon className="absolute top-3 text-gray-400 left-3 w-6" />
                  <Input
                    placeholder="Search services or business"
                    className="px-5 bg-white py-6 pl-12"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
