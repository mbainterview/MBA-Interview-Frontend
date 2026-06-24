export type ArticleBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; intro?: string; items: string[]; outro?: string }
  | { kind: "subsections"; items: { title: string; body: string }[] };

export type ArticleSection = {
  heading: string;
  blocks: ArticleBlock[];
};

export type Article = {
  id: string;
  title: string;
  category: string;
  readTime: string;
  coverImage: string;
  /** Short marketing summary shown on the /resources index card. */
  excerpt: string;
  intro: string;
  sections: ArticleSection[];
};
