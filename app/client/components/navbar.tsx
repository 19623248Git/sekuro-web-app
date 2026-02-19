"use client";

import Image from "next/image";
import Link from "next/link";
import uroLogo from "../assets/uro_inverted_remove_bg.png";

type NavbarProps = {
	active?: "home" | "timeline" | "materials";
};

export function ClientNavbar({ active }: NavbarProps) {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-solid border-[#233648] bg-background dark:bg-background px-6 md:px-20 lg:px-40 py-3">
			<div className="flex items-center justify-between max-w-[1200px] mx-auto">
				<div className="flex items-center gap-3 text-white">
					<Link href="/client/countdown" className="flex items-center gap-3">
						<Image
							alt="URO Logo"
							className="h-14 w-14 rounded-xl object-cover"
							src={uroLogo}
						/>
						<h2 className="text-white text-xl font-bold leading-tight tracking-tight">SEKURO 18</h2>
					</Link>
				</div>
				<nav className="hidden md:flex items-center gap-10">
					<Link
						href="/client/countdown"
						className={
							active === "home"
								? "text-white text-sm font-semibold transition-colors border-b-2 pb-1 border-white"
								: "text-slate-400 hover:text-white text-sm font-medium transition-colors"
						}
					>
						Home
					</Link>
					<Link
						href="/client/timeline"
						className={
							active === "timeline"
								? "text-white text-sm font-semibold transition-colors border-b-2 pb-1 border-white"
								: "text-slate-400 hover:text-white text-sm font-medium transition-colors"
						}
					>
						Timeline
					</Link>
					<Link
						href="/client/links"
						className={
							active === "materials"
								? "text-white text-sm font-semibold transition-colors border-b-2 pb-1 border-white"
								: "text-slate-400 hover:text-white text-sm font-medium transition-colors"
						}
					>
						Links
					</Link>
				</nav>
			</div>
		</header>
	);
}

export default ClientNavbar;

