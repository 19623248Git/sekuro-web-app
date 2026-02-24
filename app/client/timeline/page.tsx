"use client";

import { useEffect, useState, useRef } from "react";
import { FaRegCalendarAlt, FaClock, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import ClientNavbar from "../components/navbar";
import ClientFooter from "../components/footer";

type Event = {
	id: number;
	created_at: string;
	event_title: string;
	event_start: string;
	event_end: string;
	event_location: string;
	event_status: "UPCOMING" | "COMING_SOON" | "ONGOING" | "OVER";
};

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

function getStatusClasses(status: Event["event_status"]) {
	switch (status) {
		case "UPCOMING":
			return "bg-primary/10 text-primary border border-primary/20";
		case "COMING_SOON":
			return "bg-slate-800 text-slate-300 border border-slate-700";
		case "ONGOING":
			return "bg-green-500/10 text-green-400 border border-green-500/30";
		case "OVER":
		default:
			return "bg-slate-900 text-slate-400 border border-slate-700";
	}
}

function getStatusLabel(status: Event["event_status"]) {
	switch (status) {
		case "UPCOMING":
			return "Upcoming";
		case "COMING_SOON":
			return "Coming Soon";
		case "ONGOING":
			return "Ongoing";
		case "OVER":
		default:
			return "Completed";
	}
}

function getTimeRemaining(targetIso: string) {
	const target = new Date(targetIso).getTime();
	const now = Date.now();
	if (Number.isNaN(target) || target <= now) return "00:00:00";
	const totalSeconds = Math.floor((target - now) / 1000);
	const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
	const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
	const seconds = String(totalSeconds % 60).padStart(2, "0");
	return `${hours}:${minutes}:${seconds}`;
}

function isToday(dateIso: string) {
	const date = new Date(dateIso);
	if (Number.isNaN(date.getTime())) return false;
	const now = new Date();
	return (
		date.getFullYear() === now.getFullYear() &&
		date.getMonth() === now.getMonth() &&
		date.getDate() === now.getDate()
	);
}

function isPastDate(dateIso: string) {
	const date = new Date(dateIso);
	if (Number.isNaN(date.getTime())) return false;
	const eventDate = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
	);
	const now = new Date();
	const today = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	);
	return eventDate < today;
}

export default function TimelinePage() {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showAll, setShowAll] = useState(false);
	const [ongoingEvents, setOngoingEvents] = useState<Event[]>([]);

	useEffect(() => {
		async function fetchEvents() {
			try {
				setLoading(true);
				const res = await fetch("/api/eventList");
				const json = await res.json();

				if (!res.ok) {
					throw new Error(json.error || "Failed to fetch events");
				}

				const data: Event[] = json.data ?? [];
				data.sort(
					(a, b) =>
						new Date(a.event_start).getTime() -
						new Date(b.event_start).getTime(),
				);
				setEvents(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Gagal memuat event");
			} finally {
				setLoading(false);
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

		fetchEvents();
		fetchOngoingEvent();
	}, []);

	   // State for nextMilestone and countdown, so all time logic runs only on client
	   const [nextMilestone, setNextMilestone] = useState<Event | null>(null);
	   const [countdown, setCountdown] = useState<string>("--:--:--");
	   const countdownInterval = useRef<NodeJS.Timeout | null>(null);

	   useEffect(() => {
		   // Only run on client
		   const now = Date.now();
		   const upcoming = events
			   .filter((event) => new Date(event.event_start).getTime() > now)
			   .sort((a, b) => new Date(a.event_start).getTime() - new Date(b.event_start).getTime())[0];
		   setNextMilestone(upcoming || null);
	   }, [events]);

	   useEffect(() => {
		   if (!nextMilestone) {
			   setCountdown("--:--:--");
			   return;
		   }
		   function updateCountdown() {
			   if (nextMilestone) {
				   setCountdown(getTimeRemaining(nextMilestone.event_start));
			   } else {
				   setCountdown("--:--:--");
			   }
		   }
		   updateCountdown();
		   if (countdownInterval.current) clearInterval(countdownInterval.current);
		   countdownInterval.current = setInterval(updateCountdown, 1000);
		   return () => {
			   if (countdownInterval.current) clearInterval(countdownInterval.current);
		   };
	   }, [nextMilestone?.event_start]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0a1a2f] via-[#1a2632] to-[#050b10] text-white">
			<ClientNavbar active="timeline" />

			<main className="max-w-[1200px] mx-auto px-6 md:px-20 lg:px-40 py-10 relative overflow-hidden">
				{/* Header Section */}
				<div className="mb-10 relative z-10">
					<h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 drop-shadow-[0_2px_20px_#21d4fd55]">Event Timeline</h1>
					<p className="text-[#b0c4de] text-lg max-w-2xl">
						Timeline kegiatan SEKURO 18
					</p>
				</div>

				{/* Ongoing Events Cards */}
				{ongoingEvents.length > 0 && (
					<div className="mt-8 flex flex-col gap-6">
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
									<div className="flex flex-col gap-2 text-slate-400 text-sm">
										<div className="flex items-center gap-3">
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
							</div>
						))}
					</div>
				)}

				<div className="mt-16 bg-[#182a3a] border border-[#21d4fd]/30 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
					<div className="absolute left-0 top-0 w-2 h-full bg-[#21d4fd]" />
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2 text-[#21d4fd]">
							<FaInfoCircle className="animate-bounce" />
							<span className="text-xs font-black uppercase tracking-[0.2em]">Next Milestone</span>
						</div>
						<h4 className="text-2xl font-bold text-white mb-2">
							{nextMilestone ? nextMilestone.event_title : "Belum ada milestone berikutnya"}
						</h4>
						{nextMilestone ? (
							<div className="flex flex-col gap-1 text-sm text-[#b0c4de]">
								<span className="flex items-center gap-1.5">
									<FaClock className="text-sm" />
									Starts: {formatEventDate(nextMilestone.event_start)}
								</span>
								<span className="flex items-center gap-1.5">
									<FaClock className="text-sm" />
									Ends: {formatEventDate(nextMilestone.event_end)}
								</span>
								<span className="flex items-center gap-1.5">
									<FaMapMarkerAlt className="text-sm" />
									{nextMilestone.event_location}
								</span>
							</div>
						) : (
							<p className="text-slate-400 text-sm">Pantau terus jadwal untuk melihat milestone berikutnya.</p>
						)}
					</div>
					<div className="w-full md:w-auto flex flex-col items-center justify-center bg-[#233648] p-6 rounded-xl border border-[#21d4fd]/30">
						<span className="text-xs text-[#b0c4de] font-bold uppercase mb-1">Time Remaining</span>
						<span className="text-3xl font-black text-[#21d4fd] font-mono drop-shadow-[0_0_10px_#21d4fd]">
							{countdown}
						</span>
						<div className="w-full bg-[#1a2632] h-1.5 rounded-full mt-4 overflow-hidden">
							<div className="h-full bg-[#21d4fd] transition-all duration-500" style={{ width: nextMilestone ? "45%" : "0%" }} />
						</div>
					</div>
				</div>

				{/* Day Selector Tabs */}
				<div className="flex flex-col gap-6 mb-12 relative z-10">
					<div className="flex border-b border-[#21d4fd]/30 gap-4 md:gap-8 overflow-x-auto no-scrollbar">
						{/* <button className="flex items-center gap-2 border-b-2 border-white text-white pb-4 px-2 whitespace-nowrap">
							<span className="text-sm font-bold uppercase tracking-wider">Day 1</span>
							<span className="text-xs text-black bg-white px-2 py-0.5 rounded-full font-semibold">Introduction</span>
						</button>
						<button className="flex items-center gap-2 border-b-2 border-transparent text-slate-500 hover:text-slate-300 pb-4 px-2 transition-all whitespace-nowrap">
							<span className="text-sm font-bold uppercase tracking-wider">Day 2</span>
							<span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-semibold">Sensors</span>
						</button>
						<button className="flex items-center gap-2 border-b-2 border-transparent text-slate-500 hover:text-slate-300 pb-4 px-2 transition-all whitespace-nowrap">
							<span className="text-sm font-bold uppercase tracking-wider">Day 3</span>
							<span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-semibold">Control Systems</span>
						</button> */}
					</div>
				</div>

				{/* Timeline Section */}
				<div className="relative">
					{/* Central Line */}
					<div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-[#21d4fd]/20 z-0" />
					<div className="flex flex-col gap-12 relative z-10">
						{loading && (
							<p className="text-slate-400 text-sm">Loading events...</p>
						)}
						{!loading && error && (
							<p className="text-red-400 text-sm">{error}</p>
						)}
						{!loading && !error && events.length === 0 && (
							<p className="text-slate-400 text-sm">Belum ada event yang terdaftar.</p>
						)}
						{!loading && !error &&
						(showAll ? events : events.slice(0, 5)).map((event) => {
						const today = isToday(event.event_start);
						const past = isPastDate(event.event_start);

								// Make border width consistent to prevent shifting
								const cardBase = "rounded-xl border-2 hover:border-[#21d4fd] transition-all duration-300 shadow-sm";
								const sizeClasses = today ? "p-7 md:p-8" : "p-6";
								let cardColorClasses = "bg-[#182a3a] border-[#21d4fd]/20";
								if (today) {
									cardColorClasses = "bg-white border-white";
								} else if (past) {
									cardColorClasses = "bg-[#050b10] border-[#233648]";
								}

						return (
							<div key={event.id} className="flex gap-6 group">
								<div className="flex flex-col items-center mt-1">
								<div className="w-10 h-10 rounded-full bg-[#21d4fd] border-4 border-[#182a3a] flex items-center justify-center text-black shadow-[0_0_15px_#21d4fd55]">
									<FaRegCalendarAlt className="text-lg font-bold" />
								</div>
								</div>
								<div className="flex-1">
									<div className={`${cardBase} ${cardColorClasses} ${sizeClasses}`}>
										<div className="flex flex-wrap justify-between items-start gap-4 mb-3">
											<div>
												<h3 className={`text-xl font-bold mb-1 ${today ? "text-slate-900" : "text-white"}`}>
													{event.event_title}
												</h3>
												<div className={`flex flex-col gap-1 text-sm ${today ? "text-slate-600" : "text-slate-400"}`}>
													<div className="flex items-center gap-3">
														<span className="flex items-center gap-1.5">
																<FaClock className="text-sm" />
																Start: {formatEventDate(event.event_start)}
														</span>
														<span className="flex items-center gap-1.5">
																<FaMapMarkerAlt className="text-sm" />
																{event.event_location}
														</span>
													</div>
													<span className="flex items-center gap-1.5">
														<FaClock className="text-sm" />
														End: {formatEventDate(event.event_end)}
													</span>
												</div>
											</div>
											<span
											className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-tighter ${getStatusClasses(event.event_status,)} border-[#21d4fd]/30`}
											>
												{getStatusLabel(event.event_status)}
											</span>
										</div>
									</div>
								</div>
							</div>
						);
					})}
		
						{/* Show More Button */}
						{!loading && !error && events.length > 5 && !showAll && (
							<div className="flex gap-6 group">
								<div className="flex flex-col items-center mt-1">
									<div className="w-10 h-10 rounded-full bg-slate-800 border-4 border-background-dark flex items-center justify-center text-slate-400">
										<span className="text-xs font-bold">...</span>
									</div>
								</div>
								<div className="flex-1">
									<button
										onClick={() => setShowAll(true)}
										className="w-full bg-[#1a2632] border border-[#233648] rounded-xl p-6 hover:border-white/30 transition-all duration-300 text-left group-hover:bg-[#1f2f3f]"
									>
										<span className="text-white font-bold text-lg">Show More Events</span>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</main>

			<ClientFooter />
		</div>
	);
}

