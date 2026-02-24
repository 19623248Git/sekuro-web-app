"use client";

import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaExternalLinkAlt } from "react-icons/fa";
import ClientNavbar from "../components/navbar";
import ClientFooter from "../components/footer";

type LinkItem = {
  id: number;
  created_at: string;
  title: string;
  link: string;
  group_type: string | null;
  valid: string;
};


const FILTER_GROUPS = ["SOCIAL", "MATERIAL", "TEST", "FORM", "MISC"];

export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("ALL");

  useEffect(() => {
    async function fetchLinks() {
      try {
        setLoading(true);
        const res = await fetch("/api/links");
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch links");
        }

        setLinks((json.data as LinkItem[]) ?? []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat links");
      } finally {
        setLoading(false);
      }
    }

    fetchLinks();
  }, []);

  const filteredLinks = useMemo(
    () =>
      links
        .filter((item) => (activeGroup === "ALL" ? true : item.group_type === activeGroup))
        .filter((item) => {
          const q = search.trim().toLowerCase();
          if (!q) return true;
          return (
            item.title.toLowerCase().includes(q) ||
            item.link.toLowerCase().includes(q) ||
            (item.group_type ?? "").toLowerCase().includes(q)
          );
        }),
    [links, activeGroup, search],
  );

  function normalizeUrl(url: string) {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a2f] via-[#1a2632] to-[#050b10] text-white">
      <ClientNavbar active="materials" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
        {/* Hero Section */}
        <div className="mb-12 relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4 drop-shadow-[0_2px_20px_#21d4fd55]">Link Storage</h1>
          <p className="text-lg text-[#b0c4de] max-w-2xl">
            Semua link yang bisa diakses untuk keperluan SEKURO 18
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col gap-6 mb-10 relative z-10">
          {/* Search Bar */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#21d4fd]">
              <FaSearch className="text-sm" />
            </span>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-[#21d4fd]/30 rounded-lg bg-[#182a3a] focus:ring-2 focus:ring-[#21d4fd] focus:border-[#21d4fd] text-sm placeholder:text-[#b0c4de] text-white"
              placeholder="Search by topic, keyword, or day..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
            />
          </div>

          {/* Radio-style Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeGroup === "ALL"
                  ? "bg-[#21d4fd] text-black shadow-md"
                  : "bg-[#233648] text-[#b0c4de] hover:bg-[#21d4fd]/10 border border-[#21d4fd]/30"
              }`}
              onClick={() => setActiveGroup("ALL")}
            >
              All
            </button>
            {FILTER_GROUPS.map((group) => (
              <button
                key={group}
                className={`px-4 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${
                  activeGroup === group
                    ? "bg-[#21d4fd] text-black shadow-md"
                    : "bg-[#233648] text-[#b0c4de] hover:bg-[#21d4fd]/10 border border-[#21d4fd]/30"
                }`}
                onClick={() => setActiveGroup(group)}
              >
                {group.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        {loading && (
          <p className="text-sm text-[#b0c4de]">Loading materials...</p>
        )}
        {!loading && error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        {!loading && !error && filteredLinks.length === 0 && (
          <p className="text-sm text-[#b0c4de]">
            Link not found
          </p>
        )}
        {!loading && !error && filteredLinks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((item) => {
              const isOpen = item.valid === "OPEN";
              return (
                <div
                  key={item.id}
                  className={`group flex flex-col bg-[#182a3a] border border-[#21d4fd]/20 rounded-xl overflow-hidden transition-all ${
                    isOpen 
                      ? "hover:border-[#21d4fd] hover:shadow-[0_0_30px_#21d4fd]" 
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className={`text-xl font-bold leading-tight flex-1 ${
                        isOpen ? "text-white" : "text-gray-400"
                      }`}>
                        {item.title}
                      </h3>
                      <span className="px-2.5 py-1 text-[#21d4fd] text-[10px] font-bold uppercase tracking-wider rounded-md bg-[#233648] whitespace-nowrap">
                        {item.group_type ?? "UNGROUPED"}
                      </span>
                    </div>
                    {isOpen && (
                      <p className="text-xs text-[#b0c4de] mb-4 break-all">
                        {item.link}
                      </p>
                    )}
                    <div className="flex flex-col gap-2 mt-auto">
                      {isOpen ? (
                        <a
                          href={normalizeUrl(item.link)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2 bg-[#21d4fd] hover:bg-[#00eaff] text-black rounded-lg text-sm font-semibold transition-colors"
                        >
                          <FaExternalLinkAlt className="text-sm" />
                          Open Link
                        </a>
                      ) : (
                        <div className="flex items-center justify-center w-full py-2 bg-gray-600 text-gray-300 rounded-lg text-sm font-semibold cursor-not-allowed">
                          Link is not available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
      <ClientFooter />
    </div>
  )
}
