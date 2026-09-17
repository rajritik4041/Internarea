"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowUpRight, MapPin, LocateFixed, CalendarFold, MoveRight } from "lucide-react";
import { API_BASE_URL } from "@/data/api";

interface Internship {
  _id: string;
  title: string;
  company: string;
  location?: string;
  Experience?: string;
  category?: string;
  aboutCompany?: string;
  aboutJob?: string;
  aboutInternship?: string;
  whoCanApply?: string;
  perks?: string[];
  AdditionalInfo?: string;
  additionalInfo?: string;
  stipend?: string | number;
  StartDate?: string;
  startDate?: string;
  numberOfOpening?: string;
  createdAt?: string;
  createAt?: string;
}

interface Pagination {
  currentPage: number;
  limit: number;
  totalJobs: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function InternshipPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [minstipend, setMinstipend] = useState("0");
  const [loading, setLoading] = useState(false);
  const fetchInternships = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit,
      };
      if (search.trim()) {
        params.search = search.trim();
      }
      if (location.trim()) {
        params.location = location.trim();
      }
      if (category) {
        params.category = category;
      }
      if (experience) {
        params.experience = experience;
      }
      if (minstipend && Number(minstipend) > 0) {
        params.minstipend = Number(minstipend);
      }
      console.log("API FILTER PARAMS:", params);
      const response = await axios.get(`${API_BASE_URL}/api/internship`, {
        params,
      });
      console.log("API RESPONSE:", response.data);
      setInternships(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error("Error fetching internships:", error);
      setInternships([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInternships();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, location, category, experience, minstipend]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExperience(e.target.value);
    setPage(1);
  };

  const handleStipendChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinstipend(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setCategory("");
    setExperience("");
    setMinstipend("0");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="w-full rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm col-span-1 lg:col-span-4 xl:col-span-3 lg:sticky lg:top-6">
          <div className="mb-6 flex items-center justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-bold">Filters</h2>

            <button
              onClick={clearFilters}
              className="rounded-lg bg-red-500 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white transition hover:bg-red-600"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="mb-2 block font-semibold">Search</label>
              <input
                type="text"
                placeholder="Search internship/company..."
                value={search}
                onChange={handleSearchChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Location</label>
              <input
                type="text"
                placeholder="e.g. Bengaluru"
                value={location}
                onChange={handleLocationChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Category</label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"              >
                <option value="">All Categories</option>
                <option value="Engineering">Engineering</option>
                <option value="Data Science">Data Science</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="MBA">MBA</option>
                <option value="Media">Media</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Part-time">Part-time</option>
                <option value="Work From Home">Work From Home</option>
                <option value="Big Brands">Big Brands</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold">Experience</label>
              <select
                value={experience}
                onChange={handleExperienceChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              >
                <option value="">All Experience</option>
                <option value="Fresher">Fresher</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-4 flex items-center justify-between">
              <label className="text-base sm:text-lg font-semibold">Minimum stipend</label>
              <span className="text-base sm:text-lg font-bold text-blue-600">
                ₹{Number(minstipend).toLocaleString("en-IN")}+ /month
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="60000"
              step="5000"
              value={minstipend}
              onChange={handleStipendChange}
              className="w-full cursor-pointer"
            />

            <div className="mt-2 flex justify-between text-xs sm:text-sm text-gray-500">
              <span>₹0</span>
              <span>₹10K</span>
              <span>₹20K</span>
              <span>₹30K</span>
              <span>₹40K</span>
              <span>₹50K</span>
              <span>₹60K</span>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-gray-500">
              Showing internships with minimum stipend ₹
              {Number(minstipend).toLocaleString("en-IN")} /month
            </p>
          </div>
        </div>

        <section className="col-span-1 lg:col-span-8 xl:col-span-9">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Latest Internships</h1>

            {pagination && (
              <span className="text-sm text-gray-500">
                {pagination.totalJobs} internships found
              </span>
            )}
          </div>

          {loading && (
            <div className="py-10 text-center text-gray-500">
              Loading internships...
            </div>
          )}

          {!loading && internships.length === 0 && (
            <div className="rounded-xl border bg-white p-10 text-center">
              <p className="text-lg font-semibold text-gray-600">
                No internships found
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Try changing your filters.
              </p>
            </div>
          )}

          {!loading && internships.length > 0 && (
            <div className="grid min-w-full lg:grid-cols-3 sm:grid-cols-1 gap-5">
              {internships.map((internship) => (
                <div key={internship._id} className="flex">
                  <div className="w-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-2xl p-5 transition flex flex-col justify-between">
                    <div>
                      <div className="text-blue-600 flex items-center gap-1 mb-2 text-xs font-semibold bg-blue-50 w-fit px-2.5 py-0.5 rounded-full">
                        <ArrowUpRight width={14} /> Actively Hiring
                      </div>

                      <div className="font-bold text-gray-900 text-base mb-0.5">
                        {internship.title}
                      </div>
                      <div className="text-sm text-gray-600 font-medium mb-3">
                        {internship.company}
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-600">
                        {internship.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin width={14} className="text-gray-400" /> {internship.location}
                          </div>
                        )}
                        {internship.category && (
                          <div className="flex items-center gap-1.5">
                            <LocateFixed width={14} className="text-gray-400" /> {internship.category}
                          </div>
                        )}
                        {internship.stipend && (
                          <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                            {internship.stipend}
                          </div>
                        )}
                        {internship.Experience && (
                          <div className="flex items-center gap-1.5">
                            <CalendarFold width={14} className="text-gray-400" /> {internship.Experience}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-100">
                      <div className="bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded-full text-xs">
                        Internship
                      </div>
                      <Link href={`/internareaid/${internship._id}`}>
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

          {pagination && pagination.totalPages > 0 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                disabled={!pagination.hasPreviousPage}
                onClick={() => {
                  if (pagination.hasPreviousPage) {
                    setPage((prev) => prev - 1);
                  }
                }}
                className="rounded-lg bg-gray-200 px-5 py-2 font-medium transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"              >
                Previous
              </button>
              <span className="min-w-[120px] text-center font-semibold">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => {
                  if (pagination.hasNextPage) {
                    setPage((prev) => prev + 1);
                  }
                }}
                className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
