"use client";

import Image from "next/image";
import uroLogo from "../assets/uro_inverted_remove_bg.png";

export function ClientFooter() {
	return (
		<footer className="border-t border-[#233648] bg-background-dark py-12 px-6 md:px-20 lg:px-40 mt-20">
			<div className="max-w-[1200px] mx-auto flex flex-col items-center text-center gap-6">
				<div className="flex flex-col md:flex-row w-full justify-center items-center gap-8">
					<div className="flex items-center gap-3 justify-center md:justify-start flex-1 min-w-[180px]">
						<Image
							alt="URO Logo"
							className="h-10 w-10 rounded-xl object-cover"
							src={uroLogo}
						/>
						<span className="text-white font-bold">SEKURO 18</span>
					</div>
					<div className="flex flex-wrap gap-8 justify-center flex-1 min-w-[180px] text-slate-400 text-sm">
						<a
							href="https://wa.me/6281385444175"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-white transition-colors"
						>
							WhatsApp
						</a>
						<a
							href="https://instagram.com/sekuro.itb"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-white transition-colors"
						>
							Instagram
						</a>
					</div>
					<div className="flex-1 min-w-[180px] text-slate-500 text-sm flex items-center justify-center md:justify-end">
						<p>
							© 2026 SEKURO 18 Unit Robotika ITB.
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default ClientFooter;

