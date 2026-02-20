"use client";

import Image from "next/image";
import Link from "next/link";
import uroLogo from "../assets/uro_inverted_remove_bg.png";

type NavbarProps = {
	active?: "home" | "timeline" | "materials";
};

export function ClientNavbar({ active }: NavbarProps) {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-solid border-[#21d4fd]/30 bg-[#0a1a2f] bg-opacity-95 px-6 md:px-20 lg:px-40 py-3 shadow-[0_2px_20px_#21d4fd22] backdrop-blur-md">
			<div className="flex items-center justify-between max-w-[1200px] mx-auto">
				<div className="flex items-center gap-3 text-white">
					<Link href="/client/countdown" className="flex items-center gap-3">
						<Image
							alt="URO Logo"
							className="h-14 w-14 rounded-xl object-cover"
							src={uroLogo}
						/>
						<h2 className="text-white text-xl font-bold leading-tight tracking-tight drop-shadow-[0_2px_20px_#21d4fd55]">SEKURO 18</h2>
					</Link>
				</div>
				<nav className="hidden md:flex items-center gap-10">
					<Link
						href="/client/countdown"
						className={
							active === "home"
								? "text-[#21d4fd] text-sm font-semibold transition-colors border-b-2 pb-1 border-[#21d4fd] drop-shadow-[0_2px_10px_#21d4fd55]"
								: "text-[#b0c4de] hover:text-[#21d4fd] text-sm font-medium transition-colors"
						}
					>
						Home
					</Link>
					<Link
						href="/client/timeline"
						className={
							active === "timeline"
								? "text-[#21d4fd] text-sm font-semibold transition-colors border-b-2 pb-1 border-[#21d4fd] drop-shadow-[0_2px_10px_#21d4fd55]"
								: "text-[#b0c4de] hover:text-[#21d4fd] text-sm font-medium transition-colors"
						}
					>
						Timeline
					</Link>
					<Link
						href="/client/links"
						className={
							active === "materials"
								? "text-[#21d4fd] text-sm font-semibold transition-colors border-b-2 pb-1 border-[#21d4fd] drop-shadow-[0_2px_10px_#21d4fd55]"
								: "text-[#b0c4de] hover:text-[#21d4fd] text-sm font-medium transition-colors"
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

