"use client";

import { useState, useEffect } from "react";

export default function EventBanner() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % events.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [events.length]);

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

  const currentEvent = events[currentIndex];

  return (
    <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl overflow-hidden border border-blue-500 dark:from-blue-700 dark:to-indigo-700 dark:border-blue-600">
      <div className="flex flex-col md:flex-row">
        {currentEvent.image && (
          <div className="md:w-1/3">
            <img
              src={currentEvent.image}
              alt={currentEvent.title}
              className="w-full h-48 md:h-full object-cover border-r border-blue-500 dark:border-blue-600"
            />
          </div>
        )}
        <div className="flex-1 p-6 text-white dark:text-white">
          <h2 className="text-2xl font-bold mb-2 tracking-tight">{currentEvent.title}</h2>
          <p className="mb-4 opacity-90">{currentEvent.description}</p>
          <div className="flex items-center gap-4 text-sm opacity-80">
            <span>
              {new Date(currentEvent.startDate).toLocaleDateString("mn-MN")} –{" "}
              {new Date(currentEvent.endDate).toLocaleDateString("mn-MN")}
            </span>
          </div>
        </div>
      </div>

      {events.length > 1 && (
        <div className="flex justify-center gap-2 pb-4">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}