"use client";

import { useEffect, useState } from "react";
import ClientNavbar from "../components/navbar";
import ClientFooter from "../components/footer";

type Event = {
	id: number;
	created_at: string;
	event_title: string;
	event_start: string;
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

	useEffect(() => {
		async function fetchEvents() {
			try {
				setLoading(true);
				const res = await fetch("/admin/api/event/list-event");
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

		fetchEvents();
	}, []);

	const upcomingEvent = events
		.filter((event) =>
			["UPCOMING", "COMING_SOON", "ONGOING"].includes(event.event_status),
		)
		.sort(
			(a, b) =>
				new Date(a.event_start).getTime() - new Date(b.event_start).getTime(),
		)[0];

	const upcomingTimeRemaining = upcomingEvent
		? getTimeRemaining(upcomingEvent.event_start)
		: null;

	return (
		<div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
			<ClientNavbar active="timeline" />

			<main className="max-w-[1200px] mx-auto px-6 md:px-20 lg:px-40 py-10">
				{/* Header Section */}
				<div className="mb-10">
					<h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">Event Timeline</h1>
					<p className="text-slate-400 text-lg max-w-2xl">
						Stay updated with the latest sessions, technical deep dives, and critical submission deadlines for the SEKURO 18
						cybersecurity challenge.
					</p>
				</div>

				{/* Day Selector Tabs */}
				<div className="flex flex-col gap-6 mb-12">
					<div className="flex border-b border-[#233648] gap-4 md:gap-8 overflow-x-auto no-scrollbar">
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
					<div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-slate-800 z-0" />
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
									events.map((event) => {
										const today = isToday(event.event_start);
										const past = isPastDate(event.event_start);

										const cardBase = "rounded-xl hover:border-primary/50 transition-all duration-300 shadow-sm";
										const sizeClasses = today ? "p-7 md:p-8" : "p-6";
										let cardColorClasses = "bg-[#1a2632] border border-[#233648]";
										if (today) {
											cardColorClasses = "bg-white border border-white";
										} else if (past) {
											cardColorClasses = "bg-[#050b10] border border-slate-800";
										}

										return (
											<div key={event.id} className="flex gap-6 group">
												<div className="flex flex-col items-center mt-1">
													<div className="w-10 h-10 rounded-full bg-white border-4 border-background-dark flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]">
														<span className="material-symbols-outlined text-lg font-bold">event</span>
													</div>
												</div>
												<div className="flex-1">
													<div className={`${cardBase} ${cardColorClasses} ${sizeClasses}`}>
														<div className="flex flex-wrap justify-between items-start gap-4 mb-3">
															<div>
																<h3 className={`text-xl font-bold mb-1 ${today ? "text-slate-900" : "text-white"}`}>
																	{event.event_title}
																</h3>
																<div className={`flex items-center gap-3 text-sm ${today ? "text-slate-600" : "text-slate-400"}`}>
																	<span className="flex items-center gap-1.5">
																		<span className="material-symbols-outlined text-sm">schedule</span>
																		{formatEventDate(event.event_start)}
																	</span>
																	<span className="flex items-center gap-1.5">
																		<span className="material-symbols-outlined text-sm">location_on</span>
																		{event.event_location}
																	</span>
																</div>
															</div>
															<span
																className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-tighter ${getStatusClasses(
																		event.event_status,
																	)}`}
															>
																{getStatusLabel(event.event_status)}
															</span>
														</div>
													</div>
												</div>
											</div>
										);
									})}
					</div>
				</div>

				{/* Sticky Progress Tracker (Side Info) */}
				<div className="mt-16 bg-[#1a2632] border rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden border-white/20">
					<div className="absolute left-0 top-0 w-2 h-full bg-white" />
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2 text-white">
							<span className="material-symbols-outlined animate-bounce">info</span>
							<span className="text-xs font-black uppercase tracking-[0.2em]">Next Milestone</span>
						</div>
						<h4 className="text-2xl font-bold text-white mb-2">
							{upcomingEvent ? upcomingEvent.event_title : "Belum ada milestone berikutnya"}
						</h4>
						<p className="text-slate-400">
							{upcomingEvent
								? `Jadwal berikutnya pada ${formatEventDate(upcomingEvent.event_start)} di ${upcomingEvent.event_location}.`
								: "Pantau terus jadwal untuk melihat milestone berikutnya."}
						</p>
					</div>
					<div className="w-full md:w-auto flex flex-col items-center justify-center bg-background-dark p-6 rounded-xl border border-[#233648]">
						<span className="text-xs text-slate-500 font-bold uppercase mb-1">Time Remaining</span>
						<span className="text-3xl font-black text-white font-mono">
							{upcomingTimeRemaining ?? "--:--:--"}
						</span>
						<div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
							<div className="h-full bg-white" style={{ width: "45%" }} />
						</div>
					</div>
				</div>
			</main>

			<ClientFooter />
		</div>
	);
}

