"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowUpRight, MapPin, LocateFixed, CalendarFold, MoveRight } from "lucide-react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { API_BASE_URL } from "@/data/api";

const slides = [
  {
    title: "Make your dream career a reality",
    bgColor: "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800",
    pattern: "pattern-1",
  },
  {
    title: "Trending Internships with High Stipends",
    bgColor: "bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600",
    pattern: "pattern-2",
  },
  {
    title: "Top Fresher Jobs at Leading Companies",
    bgColor: "bg-gradient-to-r from-amber-500 via-orange-600 to-red-500",
    pattern: "pattern-3",
  },
  {
    title: "Accelerate Your Growth with Top Opportunities",
    bgColor: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700",
    pattern: "pattern-4",
  },
];

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  stipend?: string;
  CTC?: string;
  Experience?: string;
}

interface Internship {
  _id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  stipend: string;
  Experience: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [internship, setInternShip] = useState<Internship[]>([]);
  const limit = 12;

  const fetchJobs = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/job?page=${1}&limit=${limit}`
      );
      setJobs(response.data.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchInternship = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/internship?page=${1}&limit=${limit}`
      );
      setInternShip(response.data.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchInternship();
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
      {/* hero section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Make your dream career a reality
        </h1>
        <p className="text-xl text-gray-600">Trending on InternArea 🔥</p>
      </div>
      {/* Swiper section */}
      <div className="mb-16">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="rounded-xl overflow-hidden shadow-lg [--swiper-navigation-color:#ffffff] [--swiper-pagination-color:#ffffff]"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className={`relative h-[400px] ${slide.bgColor}`}>
                {/* SVG Pattern Background */}
                <div className="absolute inset-0 opacity-20">
                  <svg
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {slide.pattern === "pattern-1" && (
                      <pattern
                        id="pattern-1"
                        x="0"
                        y="0"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <circle cx="10" cy="10" r="3" fill="white" />
                      </pattern>
                    )}
                    {slide.pattern === "pattern-2" && (
                      <pattern
                        id="pattern-2"
                        x="0"
                        y="0"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <rect
                          x="15"
                          y="15"
                          width="10"
                          height="10"
                          fill="white"
                        />
                      </pattern>
                    )}
                    {slide.pattern === "pattern-3" && (
                      <pattern
                        id="pattern-3"
                        x="0"
                        y="0"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="white" />
                      </pattern>
                    )}
                    {slide.pattern === "pattern-4" && (
                      <pattern
                        id="pattern-4"
                        x="0"
                        y="0"
                        width="60"
                        height="60"
                        patternUnits="userSpaceOnUse"
                      >
                        <path d="M30 5 L55 30 L30 55 L5 30 Z" fill="white" />
                      </pattern>
                    )}
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      fill={`url(#${slide.pattern})`}
                    />
                  </svg>
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white">
                    {slide.title}
                  </h2>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Latest Internships</h1>
          <Link
            href="/internship"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
          >
            View all <MoveRight width={15} />
          </Link>
        </div>

        <div>
          {internship && (
            <div className="grid min-w-full lg:grid-cols-3 sm:grid-cols-1 gap-5">
              {internship.map((intern, index) => (
                <div key={index} className="flex">
                  <div className="w-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-2xl p-5 transition flex flex-col justify-between">
                    <div>
                      <div className="text-blue-600 flex items-center gap-1 mb-2 text-xs font-semibold bg-blue-50 w-fit px-2.5 py-0.5 rounded-full">
                        <ArrowUpRight width={14} /> Actively Hiring
                      </div>

                      <div className="font-bold text-gray-900 text-base mb-0.5">
                        {intern.title}
                      </div>
                      <div className="text-sm text-gray-600 font-medium mb-3">
                        {intern.company}
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin width={14} className="text-gray-400" /> {intern.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <LocateFixed width={14} className="text-gray-400" /> {intern.category}
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                          {intern.stipend}
                        </div>
                        {intern.Experience && (
                          <div className="flex items-center gap-1.5">
                            <CalendarFold width={14} className="text-gray-400" /> {intern.Experience}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-100">
                      <div className="bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded-full text-xs">
                        Internship
                      </div>
                      <Link href={`/internareaid/${intern._id}`}>
                        <div className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs">
                          View Details <MoveRight width={14} />
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Latest Jobs</h1>
          <Link
            href="/job"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
          >
            View all <MoveRight width={15} />
          </Link>
        </div>

        <div>
          {jobs && (
            <div className="grid min-w-full lg:grid-cols-3 sm:grid-cols-1 gap-5">
              {jobs.map((job, index) => (
                <div key={index} className="flex">
                  <div className="w-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-2xl p-5 transition flex flex-col justify-between">
                    <div>
                      <div className="text-blue-600 flex items-center gap-1 mb-2 text-xs font-semibold bg-blue-50 w-fit px-2.5 py-0.5 rounded-full">
                        <ArrowUpRight width={14} /> Actively Hiring
                      </div>

                      <div className="font-bold text-gray-900 text-base mb-0.5">
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-600 font-medium mb-3">
                        {job.company}
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin width={14} className="text-gray-400" /> {job.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <LocateFixed width={14} className="text-gray-400" /> {job.category}
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                          {job.CTC || job.stipend}
                        </div>
                        {job.Experience && (
                          <div className="flex items-center gap-1.5">
                            <CalendarFold width={14} className="text-gray-400" /> {job.Experience}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-100">
                      <div className="bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded-full text-xs">
                        Job
                      </div>
                      <Link href={`/internareaid/${job._id}`}>
                        <div className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs">
                          View Details <MoveRight width={14} />
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
