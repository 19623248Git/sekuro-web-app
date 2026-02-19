"use client";

import { useEffect, useMemo, useState } from "react";
import ClientNavbar from "../components/navbar";
import ClientFooter from "../components/footer";

type LinkItem = {
  id: number;
  created_at: string;
  title: string;
  link: string;
  group_type: string | null;
};

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

  const groupTypes = useMemo(
    () => Array.from(new Set(links.map((l) => l.group_type).filter(Boolean))) as string[],
    [links],
  );

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
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
      <ClientNavbar active="materials" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">Learning Materials</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Access all lecture notes, slides, and video recordings from the SEKURO 18 Cyber Security program. Updated daily.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <span className="material-symbols-outlined text-sm">search</span>
            </span>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-[#1a2632] focus:ring-2 focus:ring-primary focus:border-transparent text-sm placeholder:text-slate-500"
              placeholder="Search by topic, keyword, or day..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex bg-[#1a2632] p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <button
                className={`px-4 py-1.5 text-xs font-semibold rounded-md ${
                  activeGroup === "ALL"
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
                onClick={() => setActiveGroup("ALL")}
              >
                All
              </button>
              {groupTypes.map((group) => (
                <button
                  key={group}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md capitalize ${
                    activeGroup === group
                      ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                  onClick={() => setActiveGroup(group)}
                >
                  {group.toLowerCase()}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg  bg-[#1a2632] text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filter
            </button>
          </div>
        </div>

        {/* Materials Grid */}
        {loading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading materials...</p>
        )}
        {!loading && error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        {!loading && !error && filteredLinks.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Belum ada materials yang terdaftar.
          </p>
        )}
        {!loading && !error && filteredLinks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col bg-[#1a2632] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-xl dark:hover:shadow-primary/5"
              >
                <div className="relative h-40 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-2.5 py-1 text-white text-[10px] font-bold uppercase tracking-wider rounded-md bg-black">
                      {item.group_type ?? "UNGROUPED"}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 break-all">
                    {item.link}
                  </p>
                  <div className="flex flex-col gap-2 mt-auto">
                    <a
                      href={normalizeUrl(item.link)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-black hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors dark:bg-white dark:text-black dark:hover:bg-slate-200"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      Open Material
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ClientFooter />
      </main>
    </div>
  );
}
