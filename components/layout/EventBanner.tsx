"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function EventBanner() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Fetch events error:", error);
    }
  };

  if (events.length === 0) return null;

  return (
    <div className="mb-8 rounded-xl overflow-hidden border border-border dark:border-zinc-700 h-64 md:h-80">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet",
          bulletActiveClass: "swiper-pagination-bullet-active",
        }}
        className="h-full"
      >
        {events.map((event, index) => (
          <SwiperSlide key={index} className="relative">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              {event.image ? (
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
              <div className="max-w-2xl">
                <h2 className="text-2xl md:text-xl font-bold text-zinc-100 mb-3 tracking-tight">
                  {event.title}
                </h2>
                <p className="text-zinc-100/90 mb-4 text-sm md:text-base line-clamp-2 md:line-clamp-none">
                  {event.description}
                </p>
                <div className="flex items-center text-zinc-100/80 text-sm">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    {new Date(event.startDate).toLocaleDateString("mn-MN")} –{" "}
                    {new Date(event.endDate).toLocaleDateString("mn-MN")}
                  </span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom styles for pagination bullets */}
      <style jsx global>{`
        .swiper-pagination {
          text-align: left;
          padding: 4px 8px;
          top: 0 !important;
        }
        .swiper-pagination-bullet {
          margin-right: 2px !important;
          width: 8px;
          height: 8px;
          background-color: rgba(255, 255, 255, 0.5);
          opacity: 1;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          width: 16px;
          background-color: white;
          border-radius: 4px;
        }
        .swiper-pagination-bullet:hover {
          background-color: rgba(255, 255, 255, 0.7);
        }
      `}</style>
    </div>
  );
}