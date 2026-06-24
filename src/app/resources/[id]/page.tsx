import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { getArticleById, ARTICLES } from "@/data/articles";
import type { ArticleBlock } from "@/types/article";

const sora  = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

// Static params for pre-rendering all known articles
export function generateStaticParams() {
  return ARTICLES.map((a) => ({ id: a.id }));
}

function Block({ block }: { block: ArticleBlock }) {
  if (block.kind === "paragraph") {
    return (
      <p style={{ fontFamily: inter, fontSize: "18px", color: "#868686", lineHeight: "1.4" }}>
        {block.text}
      </p>
    );
  }

  if (block.kind === "list") {
    return (
      <div style={{ fontFamily: inter, fontSize: "18px", color: "#868686", lineHeight: "1.4" }}>
        {block.intro && <p className="mb-3">{block.intro}</p>}
        <ul className="list-disc pl-6 space-y-1">
          {block.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
        {block.outro && <p className="mt-3">{block.outro}</p>}
      </div>
    );
  }

  if (block.kind === "subsections") {
    return (
      <div className="flex flex-col gap-5">
        {block.items.map((sub, i) => (
          <div key={i} className="flex flex-col gap-4">
            <p
              className="font-semibold"
              style={{ fontFamily: inter, fontSize: "18px", color: "#272727", lineHeight: "1.4" }}
            >
              {sub.title}
            </p>
            <p style={{ fontFamily: inter, fontSize: "16px", color: "#868686", lineHeight: "1.4" }}>
              {sub.body}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

export default async function ResourceArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getArticleById(id);
  if (!article) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15 py-12">
          <div className="flex flex-col gap-10">

            {/* Title */}
            <h1
              className="font-semibold"
              style={{ fontFamily: sora, fontSize: "clamp(32px,4vw,56px)", color: "#272727", lineHeight: "1.3" }}
            >
              {article.title}
            </h1>

            {/* Cover image */}
            <div
              className="w-full rounded-[20px] overflow-hidden border border-[#e6e6e6]"
              style={{ height: "clamp(260px, 44vw, 638px)" }}
            >
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Intro */}
            <p style={{ fontFamily: inter, fontSize: "18px", color: "#868686", lineHeight: "1.4" }}>
              {article.intro}
            </p>

            {/* Sections */}
            {article.sections.map((section, si) => (
              <div key={si} className="flex flex-col gap-5">
                <h2
                  className="font-semibold"
                  style={{ fontFamily: sora, fontSize: "24px", color: "#272727", lineHeight: "1.3" }}
                >
                  {section.heading}
                </h2>
                {section.blocks.map((block, bi) => (
                  <Block key={bi} block={block} />
                ))}
              </div>
            ))}

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
