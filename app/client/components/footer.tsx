"use client";

import Image from "next/image";
import uroLogo from "../assets/uro_inverted_remove_bg.png";

export function ClientFooter() {
	return (
		<footer className="border-t border-[#233648] bg-background-dark py-12 px-6 md:px-20 lg:px-40 mt-20">
			<div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
				<div className="flex items-center gap-3">
					<Image
						alt="URO Logo"
						className="h-10 w-10 rounded-xl object-cover"
						src={uroLogo}
					/>
					<span className="text-white font-bold">SEKURO 18</span>
				</div>
				<div className="flex flex-wrap gap-8 justify-center md:justify-end text-slate-400 text-sm">
					<span className="hover:text-white transition-colors cursor-default">Support</span>
					<span className="hover:text-white transition-colors cursor-default">Documentation</span>
					<span className="hover:text-white transition-colors cursor-default">Rules</span>
					<span className="hover:text-white transition-colors cursor-default">Privacy Policy</span>
				</div>
				<p className="text-slate-500 text-sm text-center md:text-right">
					© 2026 SEKURO 18 Unit Robotika ITB. All rights reserved.
				</p>
			</div>
		</footer>
	);
}

export default ClientFooter;

