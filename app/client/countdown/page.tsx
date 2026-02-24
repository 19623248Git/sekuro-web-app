"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { FaArrowRight, FaMapMarkerAlt, FaArrowLeft, FaDownload, FaBook, FaCogs, FaUsers, FaClock, FaRegCalendarAlt, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import ClientNavbar from "../components/navbar";
import ClientFooter from "../components/footer";


type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  raw?: number;
};

function calculateTimeLeft(target: Date): TimeLeft {
  const now = new Date().getTime();
  const distance = target.getTime() - now;
  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, raw: 0 };
  }
  const totalSeconds = Math.floor(distance / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, raw: distance };
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatEventDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


export default function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, raw: 0 });
  const [eventTitle, setEventTitle] = useState<string>("");
  const [eventLocation, setEventLocation] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [ongoingEvents, setOngoingEvents] = useState<any[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let target: Date | null = null;
    async function fetchEvent() {
      try {
        const res = await fetch("/api/upcomingEvents");
        const json = await res.json();
        const now = Date.now();
        const events = Array.isArray(json?.data) ? json.data : [];
        let soonest: any = null;
        for (const ev of events) {
          if (!ev?.event_start) continue;
          const t = new Date(ev.event_start).getTime();
          if (t > now && (!soonest || t < new Date(soonest.event_start).getTime())) {
            soonest = ev;
          }
        }
        if (soonest) {
          target = new Date(soonest.event_start);
          setEventTitle(soonest.event_title || "Upcoming Event");
          setEventLocation(soonest.event_location || "");
          setEventDate(target.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }));
        } else {
          target = new Date("2026-02-19T00:00:00+07:00");
          setEventTitle("No Upcoming Event");
          setEventLocation("");
          setEventDate("");
        }
        setTimeLeft(calculateTimeLeft(target));
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => {
          setTimeLeft(calculateTimeLeft(target!));
        }, 1000);
      } catch (error) {
        target = new Date("2026-02-19T00:00:00+07:00");
        setEventTitle("No Upcoming Event");
        setEventLocation("");
        setEventDate("");
        setTimeLeft(calculateTimeLeft(target));
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => {
          setTimeLeft(calculateTimeLeft(target!));
        }, 1000);
      }
    }

    async function fetchOngoingEvent() {
      try {
        const res = await fetch("/api/ongoingEvents");
        const json = await res.json();
        if (res.ok && json.data) {
          setOngoingEvents(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch ongoing event:", err);
      }
    }

    fetchEvent();
    fetchOngoingEvent();
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen antialiased bg-gradient-to-br from-[#0a1a2f] via-[#1a2632] to-[#050b10] text-white">
      <ClientNavbar active="home" />

      {/* Hero Section */}
      <main className="relative overflow-hidden">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-32 sm:pb-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#21d4fd]/10 border border-[#21d4fd]/20 text-[#21d4fd] text-xs font-bold uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#21d4fd] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#21d4fd]" />
              </span>
              Recruitment Phase 2026
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 drop-shadow-[0_2px_20px_#21d4fd55]">
              SEKURO <span className="italic text-[#21d4fd]">18</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#b0c4de] leading-relaxed mb-10">
              The Gateway to
<span className="text-white font-semibold"> Sekolah Unit Robotika</span>. Dimana kalian akan belajar banyak hal mengenai robotika dan bidang-bidang yang ada di dalamnya
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/client/links"
                className="w-full sm:w-auto px-8 py-4 bg-[#21d4fd] text-black rounded-xl font-bold text-lg hover:bg-[#00eaff] hover:shadow-[0_0_30px_#21d4fd] transition-all flex items-center justify-center gap-2 group"
              >
                Get Started
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/client/timeline"
                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-[#21d4fd] text-[#21d4fd] rounded-xl font-bold text-lg hover:bg-[#21d4fd]/10 transition-all text-center"
              >
                View Timeline
              </Link>
            </div>
          </div>
        </div>
        
        {/* Ongoing Events Cards */}
        {ongoingEvents.length > 0 && (
          <section className="relative max-w-4xl mx-auto px-4 pb-12">
            <div className="flex flex-col gap-6">
              {ongoingEvents.map((event) => (
                <div key={event.id} className="bg-[#00eaff]/10 border border-[#21d4fd]/30 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-2 h-full bg-[#21d4fd]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 text-[#21d4fd]">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#21d4fd] opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#21d4fd]" />
                      </span>
                      <span className="text-xs font-black uppercase tracking-[0.2em]">Ongoing Now</span>
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">
                      {event.event_title}
                    </h4>
                    <div className="flex items-center gap-3 text-[#b0c4de] text-sm">
                      <span className="flex items-center gap-1.5">
                        <FaClock className="text-sm" />
                        Started: {formatEventDate(event.event_start)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FaClock className="text-sm" />
                        Ends: {formatEventDate(event.event_end)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-sm" />
                        {event.event_location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Countdown Timer Section */}
        <section className="relative max-w-4xl mx-auto px-4 pb-24">
          <div className="bg-[#182a3a] border border-[#21d4fd]/30 rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 text-[#21d4fd]/20 pointer-events-none">
              <FaRegCalendarAlt className="text-9xl rotate-12 opacity-10" />
            </div>
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-[#21d4fd]">
              <FaClock />
              {eventTitle}
            </h2>
            {eventLocation && (
              <div className="flex items-center justify-center gap-2 mb-4 text-[#b0c4de] text-sm">
                <span className="font-semibold">{eventDate}</span>
                {eventLocation && <span>• {eventLocation}</span>}
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
              {/* Days */}
              <div className="flex flex-col p-4 bg-[#233648] rounded-xl border border-[#21d4fd]/30">
                <span className="text-4xl sm:text-5xl font-black tabular-nums text-[#21d4fd] drop-shadow-[0_0_10px_#21d4fd]">{pad(timeLeft.days)}</span>
                <span className="text-xs font-medium uppercase tracking-widest text-[#b0c4de] mt-2">Days</span>
              </div>
              {/* Hours */}
              <div className="flex flex-col p-4 bg-[#233648] rounded-xl border border-[#21d4fd]/30">
                <span className="text-4xl sm:text-5xl font-black tabular-nums text-[#21d4fd] drop-shadow-[0_0_10px_#21d4fd]">{pad(timeLeft.hours)}</span>
                <span className="text-xs font-medium uppercase tracking-widest text-[#b0c4de] mt-2">Hours</span>
              </div>
              {/* Minutes */}
              <div className="flex flex-col p-4 bg-[#233648] rounded-xl border border-[#21d4fd]/30">
                <span className="text-4xl sm:text-5xl font-black tabular-nums text-[#21d4fd] drop-shadow-[0_0_10px_#21d4fd]">{pad(timeLeft.minutes)}</span>
                <span className="text-xs font-medium uppercase tracking-widest text-[#b0c4de] mt-2">Minutes</span>
              </div>
              {/* Seconds */}
              <div className="flex flex-col p-4 bg-[#233648] rounded-xl border border-[#21d4fd]/30">
                <span className="text-4xl sm:text-5xl font-black tabular-nums text-[#21d4fd] drop-shadow-[0_0_10px_#21d4fd]">{pad(timeLeft.seconds)}</span>
                <span className="text-xs font-medium uppercase tracking-widest text-[#b0c4de] mt-2">Seconds</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {false && (
        <>
          {/* Event Overview Section */}
          <section className="bg-slate-50 dark:bg-background-dark/50 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div className="max-w-2xl">
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">Event Overview</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                    Our recruitment process is designed to find the best technical talent and innovative minds. Here's what you
                    can expect in the coming weeks.
                  </p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-lg border border-slate-300 dark:border-border-dark text-slate-400 hover:text-primary transition-colors">
                      <FaChevronLeft />
                    </button>
                    <button className="p-2 rounded-lg border border-slate-300 dark:border-border-dark text-slate-400 hover:text-primary transition-colors">
                      <FaChevronRight />
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="group bg-white dark:bg-card-dark p-8 rounded-2xl border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-all shadow-sm hover:shadow-xl">
                    <div className="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                      <FaCogs className="text-3xl" />
                    </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">01. Discovery</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Explore our various robotics units, from AI and Computer Vision to Mechanical Design and Electronics. Find
                    where your passion lies.
                  </p>
                  <hr className="my-6 border-slate-100 dark:border-border-dark" />
                  <div className="flex items-center gap-2 font-bold text-sm cursor-pointer group-hover:gap-3 transition-all">
                    Learn More <FaArrowRight className="text-sm" />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="group bg-white dark:bg-card-dark p-8 rounded-2xl border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-all shadow-sm hover:shadow-xl">
                    <div className="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                      <FaCogs className="text-3xl" />
                    </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">02. Validation</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Undergo technical assessments, problem-solving challenges, and hands-on engineering tests designed to push
                    your skills to the limit.
                  </p>
                  <hr className="my-6 border-slate-100 dark:border-border-dark" />
                  <div className="flex items-center gap-2 font-bold text-sm cursor-pointer group-hover:gap-3 transition-all">
                    Test Guidelines <FaArrowRight className="text-sm" />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="group bg-white dark:bg-card-dark p-8 rounded-2xl border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-all shadow-sm hover:shadow-xl">
                    <div className="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                      <FaUsers className="text-3xl" />
                    </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">03. Integration</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Final panel interviews and cultural fit assessments. Successful candidates will be officially onboarded
                    into the elite SEKURO team.
                  </p>
                  <hr className="my-6 border-slate-100 dark:border-border-dark" />
                  <div className="flex items-center gap-2 font-bold text-sm cursor-pointer group-hover:gap-3 transition-all">
                    Onboarding Details <FaArrowRight className="text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action / Materials Preview */}
          <section className="py-24 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-[2.5rem] p-8 sm:p-16 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 bg-gradient-to-br from-black via-slate-900 to-slate-800">
                {/* Abstract Design Elements */}
                <div className="absolute -bottom-24 -right-24 size-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -top-24 -left-24 size-64 bg-black/20 rounded-full blur-2xl" />

                <div className="relative z-10 lg:w-3/5 text-center lg:text-left">
                  <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                    Ready to start your engineering journey?
                  </h2>
                  <p className="text-white/80 text-lg mb-10 max-w-xl">
                    Download the selection handbook and study materials to prepare for Phase 1. Everything you need to succeed
                    is right here.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              tu      <button className="bg-white text-primary px-8 py-4 rounded-xl font-black text-lg shadow-xl hover:bg-slate-50 transition-colors flex items-center gap-2">
                      <FaDownload />
                      Study Handbook
                    </button>
                    <button className="bg-primary/20 text-white border border-white/30 px-8 py-4 rounded-xl font-black text-lg backdrop-blur-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                      <FaBook />
                      Technical Specs
                    </button>
                  </div>
                </div>

                <div className="relative z-10 lg:w-2/5 flex justify-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-black/40 blur-2xl group-hover:blur-3xl transition-all scale-90" />
                    <img
                      alt="Engineering workspace"
                      className="rounded-3xl shadow-2xl relative w-full max-w-xs rotate-3 group-hover:rotate-0 transition-transform duration-500"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcfEoG-65oomfySgilWXwY5ISy5Ny5pyfTkxjaf_mwgLGJkPiwj_EA1odwTL-yOnflH4kmPuqoboiPxQikbUHf3SWznl3hW4hCspEcPyZShmK0FF1UE4mN8BTZ9oTTZvlWCdxrCd4zteAa6-wLJcrEPn9Q453FC8VwwTp3inxHM5PhCZw-Noxa5jgTC4TeFURdsanLFhlNihGyNKSfVnsQqyZOUGbGQ1JN7rnO1cXP8BuRGd3psfIHLY9C5QhDfqwpOLd_v9HGkg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <ClientFooter />
    </div>
  );
}
