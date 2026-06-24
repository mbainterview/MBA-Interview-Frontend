"use client";

import { useState } from "react";
import Link from "next/link";
import { ARTICLES } from "@/data/articles";
import type { Article } from "@/types/article";

const imgSearch = "https://www.figma.com/api/mcp/asset/a6402df6-1179-44ef-8679-42ab38aaefc9";
const imgClock  = "https://www.figma.com/api/mcp/asset/309fa122-b2da-4162-95ee-15b649ea6380";

const sora  = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

type Category = "All" | "Kira" | "MBA Admissions" | "Interview Prep";

const CATEGORIES: Category[] = ["All", "Kira", "MBA Admissions", "Interview Prep"];

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/resources/${article.id}`}
      className="bg-white border border-[#e6e6e6] rounded-[20px] overflow-hidden flex flex-col hover:shadow-md transition-shadow"
      style={{ minHeight: "427px" }}
    >
      {/* Cover image */}
      <div className="relative h-49.75 shrink-0 rounded-t-[16px] overflow-hidden bg-[#bebebe]">
        <img
          src={article.coverImage}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-4 flex-1">
        {/* Category + read time badges */}
        <div className="flex gap-1 items-center flex-wrap">
          <span
            className="px-4 py-2 rounded-[20px]"
            style={{
              background: "#eeeefc",
              fontFamily: inter,
              fontSize: "14px",
              color: "#5450d8",
              lineHeight: "1.3",
            }}
          >
            {article.category}
          </span>
          <span
            className="flex items-center gap-2.5 px-4 py-2 rounded-[20px]"
            style={{ background: "#f9f9f9" }}
          >
            <img src={imgClock} alt="" className="w-4 h-4 object-contain" aria-hidden="true" />
            <span
              style={{
                fontFamily: inter,
                fontSize: "14px",
                color: "#222c44",
                lineHeight: "1.3",
              }}
            >
              {article.readTime}
            </span>
          </span>
        </div>

        {/* Title + excerpt */}
        <div className="flex flex-col gap-2">
          <h3
            className="font-semibold"
            style={{
              fontFamily: sora,
              fontSize: "20px",
              color: "#222c44",
              lineHeight: "1.3",
            }}
          >
            {article.title}
          </h3>
          <p
            style={{
              fontFamily: inter,
              fontSize: "16px",
              color: "#808080",
              lineHeight: "1.4",
            }}
          >
            {article.excerpt}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function ResourcesArticlesSection() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");

  const filtered = ARTICLES.filter((a) => {
    const matchesCategory = activeCategory === "All" || a.category === activeCategory;
    const matchesSearch =
      search.trim() === "" ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-20 bg-white">
      <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">

        {/* Section heading */}
        <h2
          className="font-semibold mb-8"
          style={{ fontFamily: sora, fontSize: "24px", color: "#222c44", lineHeight: "1.3" }}
        >
          Featured Articles
        </h2>

        {/* Search + filter bar */}
        <div
          className="bg-white rounded-[16px] border border-[#f0f0f0] p-4 flex items-center justify-between gap-4 mb-15"
        >
          {/* Search input */}
          <div
            className="relative flex items-center"
            style={{ width: "343px" }}
          >
            <img
              src={imgSearch}
              alt=""
              className="absolute left-4.25 w-3.5 h-3.5 object-contain pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14.75 pl-11.25 pr-4 rounded-[13px] outline-none"
              style={{
                background: "#f9f9f9",
                fontFamily: inter,
                fontSize: "15.5px",
                color: "#272727",
                border: "none",
              }}
            />
          </div>

          {/* Category filter tabs */}
          <div className="flex gap-2 items-center">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="h-14.75 px-4 rounded-[13px] transition-colors"
                  style={{
                    minWidth: "150px",
                    background: isActive ? "#dfddff" : "#f9f9f9",
                    border: isActive ? "1px solid #4742ef" : "none",
                    fontFamily: inter,
                    fontSize: "15.5px",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#5450d8" : "#8f9bba",
                    cursor: "pointer",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Article grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p
            className="text-center py-20"
            style={{ fontFamily: inter, fontSize: "16px", color: "#868686" }}
          >
            No articles found. Try a different search or filter.
          </p>
        )}
      </div>
    </section>
  );
}
