import type { Article } from "@/types/article";

export const ARTICLES: Article[] = [
  {
    id: "mba-interview-preparation",
    title: "The Complete Guide to MBA Interview Preparation",
    category: "Interview Prep",
    readTime: "12 min read",
    coverImage: "/figma-assets/7805d694-9a54-4fa5-8e2c-27b54252d7d3.jpg",
    excerpt:
      "Master the fundamentals of MBA interviews with our comprehensive guide covering behavioral questions, case studies, and storytelling frameworks...",
    intro:
      "Securing an MBA interview is a major milestone in your business school journey. It means your application stood out — but the final decision often depends on your interview performance. This guide will walk you through everything you need to know to prepare confidently, structure your answers effectively, and leave a lasting impression.",
    sections: [
      {
        heading: "Why the MBA Interview Matters",
        blocks: [
          {
            kind: "list",
            intro:
              "The MBA interview helps admissions committees evaluate qualities that can't be fully measured on paper. Beyond your GPA and test scores, schools assess:",
            items: [
              "Communication skills",
              "Leadership potential",
              "Clarity of career goals",
              "Cultural fit",
              "Self-awareness",
            ],
            outro:
              "Top programs such as Harvard, Wharton, INSEAD, and other leading schools use interviews to understand who you are beyond your resume.",
          },
        ],
      },
      {
        heading: "Step 1: Understand the Interview Format",
        blocks: [
          { kind: "paragraph", text: "MBA interviews generally fall into three formats:" },
          {
            kind: "subsections",
            items: [
              {
                title: "1. Behavioral Interviews",
                body: 'Focused on past experiences. Questions usually start with: "Tell me about a time when…"',
              },
              {
                title: "2. Fit & Motivation Interviews",
                body: 'Focused on your fit with their program. Questions might include: "Why do you want to attend our school?"',
              },
              {
                title: "3. Video-Based Interviews (e.g., Kira-style)",
                body: 'Can be behavioral, personal interests/qualities or broader cultural or societal topics. Questions might sound like: "What is your favorite art form and why"',
              },
            ],
          },
        ],
      },
      {
        heading: "Step 2: Master the STAR Method",
        blocks: [
          {
            kind: "list",
            intro:
              "Most MBA interviews are behavioral. The best way to answer is using the STAR framework:",
            items: [
              "Situation – Set context",
              "Task – Explain your responsibility",
              "Action – Describe what you did",
              "Result – Share measurable outcomes",
            ],
            outro:
              "Keep answers structured, concise, and focused on your personal contribution.",
          },
        ],
      },
      {
        heading: "Step 3: Prepare Your Core Stories",
        blocks: [
          {
            kind: "paragraph",
            text: "You don't need 50 answers — you need 6–8 strong stories that can adapt to different questions. Prepare stories about:",
          },
          {
            kind: "subsections",
            items: [
              {
                title: "Leadership under pressure",
                body: "A time you led a team through a difficult challenge, conflict, or ambiguous situation.",
              },
              {
                title: "Failure and recovery",
                body: "A setback you experienced, what you learned, and how it shaped your approach going forward.",
              },
              {
                title: "Cross-functional collaboration",
                body: "A time you worked with people from different backgrounds, functions, or geographies to achieve a shared goal.",
              },
            ],
          },
        ],
      },
      {
        heading: "Step 4: Research Each School Deeply",
        blocks: [
          {
            kind: "paragraph",
            text: "Generic answers about 'the brand' won't impress. Admissions committees expect you to know their program intimately. Research specific courses, professors, clubs, and alumni networks that align with your goals.",
          },
          {
            kind: "list",
            intro: "Your school research should cover:",
            items: [
              "Signature courses and curriculum structure",
              "Faculty whose research aligns with your interests",
              "Student clubs and extracurricular communities",
              "Career placement statistics in your target industry",
              "Notable alumni in your field",
            ],
          },
        ],
      },
      {
        heading: "Step 5: Practice Out Loud",
        blocks: [
          {
            kind: "paragraph",
            text: "Reading answers silently is not preparation. You must practice speaking them aloud — ideally on camera — to build fluency, manage filler words, and calibrate your pacing.",
          },
          {
            kind: "list",
            intro: "Effective practice methods include:",
            items: [
              "Mock interviews with a partner or coach",
              "Recording yourself and reviewing playback",
              "Timed video essay practice using Kira-style prompts",
              "Shadowing high-quality interview examples",
            ],
            outro:
              "Aim for at least 10–15 full practice runs before your actual interview.",
          },
        ],
      },
    ],
  },
  {
    id: "kira-talent-video-essay",
    title: "How to Ace Your Kira Talent Video Essay",
    category: "Kira",
    readTime: "12 min read",
    coverImage: "/figma-assets/ed48303b-b49d-4cf4-8c77-4153369347b8.jpg",
    excerpt:
      "Learn proven strategies for video essay success, including body language tips, time management, and content structuring techniques...",
    intro:
      "Kira Talent video essays are a distinctive and often nerve-wracking part of the MBA admissions process. Unlike traditional interviews, you have limited prep time and must respond directly to a camera. This guide gives you the tools to present your best self.",
    sections: [
      {
        heading: "What is Kira Talent?",
        blocks: [
          {
            kind: "paragraph",
            text: "Kira Talent is a digital interview platform used by top business schools including Rotman, Smith, Schulich, and others. Applicants are given questions and must record video or written responses within a set time limit — typically 1–2 minutes per video response.",
          },
        ],
      },
      {
        heading: "Types of Kira Questions",
        blocks: [
          {
            kind: "subsections",
            items: [
              {
                title: "Behavioral",
                body: 'Past experience questions: "Tell me about a time you led a team through change."',
              },
              {
                title: "Personal / Interest",
                body: '"What is your favorite book and why?" or "Describe a passion outside of work."',
              },
              {
                title: "Cultural / Societal",
                body: '"What social issue do you care most about?" or "If you could change one thing about the world, what would it be?"',
              },
            ],
          },
        ],
      },
      {
        heading: "Top Tips for a Strong Video Response",
        blocks: [
          {
            kind: "list",
            items: [
              "Look directly at the camera lens, not the screen",
              "Use the prep time to outline 2–3 key points",
              "Open with a direct answer, then support it",
              "Speak at a measured pace — nervousness speeds you up",
              "End with a confident, complete sentence — no trailing off",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "top-10-mba-interview-questions",
    title: "Top 10 MBA Interview Questions and How to Answer Them",
    category: "Interview Prep",
    readTime: "12 min read",
    coverImage: "/figma-assets/c29600ee-a198-4b82-9baa-860e5a22bb84.jpg",
    excerpt:
      "Discover the most common MBA interview questions and learn frameworks for crafting compelling, memorable responses...",
    intro:
      "While every program has its own style, a small set of questions appear in nearly every MBA interview. Here are the ten you should prepare cold — along with a short framework for how to think about each one.",
    sections: [
      {
        heading: "The Ten Questions Every MBA Candidate Should Prepare",
        blocks: [
          {
            kind: "subsections",
            items: [
              { title: "1. Walk me through your resume.", body: "Spend ~90 seconds. Highlight inflection points, not job titles." },
              { title: "2. Why do you want an MBA, and why now?", body: "Tie the timing to a specific gap your career can't bridge without one." },
              { title: "3. Why this school?", body: "Name two specific courses, one professor, and one club. Generic answers signal weak research." },
              { title: "4. What are your short-term and long-term goals?", body: "Be concrete about the short-term role; the long-term can be a vision rather than a job title." },
              { title: "5. Tell me about a time you led a team.", body: "Use STAR. Focus on a moment where your leadership specifically changed an outcome." },
              { title: "6. Describe a failure and what you learned.", body: "Pick a real failure with measurable consequences. Avoid humblebrags." },
              { title: "7. What's your biggest weakness?", body: "Pick a real one and describe an active mitigation, not a fake-positive." },
              { title: "8. How will you contribute to our community?", body: "Reference a specific club, conference, or initiative — not just 'diversity of thought'." },
              { title: "9. Tell me about a difficult ethical decision.", body: "Show the trade-off, the people affected, and the rationale you used." },
              { title: "10. What questions do you have for me?", body: "Always have at least three. Skip ones answerable on the website." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "mba-admissions-strategy",
    title: "MBA Admissions Strategy: What Top Schools Look For",
    category: "MBA Admissions",
    readTime: "8 min read",
    coverImage: "/figma-assets/71bd826d-f1fe-4427-862f-85d0536480fd.jpg",
    excerpt:
      "Understand what admissions committees at HBS, Wharton, and other top programs look for in candidates and how to position yourself effectively...",
    intro:
      "Top MBA programs aren't just looking for high GMAT scores. They are building a class — and they evaluate candidates on a portfolio of attributes that signal future leadership and contribution.",
    sections: [
      {
        heading: "The Four Lenses Adcoms Use",
        blocks: [
          {
            kind: "list",
            intro: "Most admissions committees evaluate every applicant through four overlapping lenses:",
            items: [
              "Academic readiness — can you survive the curriculum?",
              "Career trajectory — does the MBA make sense for your story?",
              "Leadership impact — what have you actually changed?",
              "Personal qualities — will classmates want to learn alongside you?",
            ],
          },
        ],
      },
      {
        heading: "Positioning Yourself",
        blocks: [
          {
            kind: "paragraph",
            text: "The best applications choose a clear narrative thread and reinforce it across the resume, essays, and recommenders. Your goal is to make it impossible for the adcom to summarize you in one sentence and have that sentence be wrong.",
          },
        ],
      },
    ],
  },
  {
    id: "kira-written-response-best-practices",
    title: "Kira Talent Written Response Best Practices",
    category: "Kira",
    readTime: "10 min read",
    coverImage: "/figma-assets/ed48303b-b49d-4cf4-8c77-4153369347b8.jpg",
    excerpt:
      "Maximise your written response scores with structured thinking, concise language, and targeted school-specific insights...",
    intro:
      "Kira's written response section is a chance to slow down and demonstrate the structured thinking your video answers couldn't fully convey. Treat it like a mini essay — every sentence should earn its place.",
    sections: [
      {
        heading: "Pick a Clear Frame",
        blocks: [
          {
            kind: "paragraph",
            text: "Open with a one-sentence thesis. Build two or three short paragraphs of evidence. Close with a forward-looking statement that ties back to the program.",
          },
        ],
      },
      {
        heading: "Common Pitfalls to Avoid",
        blocks: [
          {
            kind: "list",
            items: [
              "Don't restate the question — get to your answer immediately",
              "Don't pad with jargon — adcoms read hundreds of these",
              "Don't run over the word count — concision is part of the test",
              "Don't recycle essay material verbatim — show range",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "behavioral-interview-mastery-star-method",
    title: "Behavioral Interview Mastery: STAR Method for MBA Programs",
    category: "Interview Prep",
    readTime: "15 min read",
    coverImage: "/figma-assets/c29600ee-a198-4b82-9baa-860e5a22bb84.jpg",
    excerpt:
      "Use the STAR framework to craft powerful, evidence-backed answers that highlight leadership, impact, and growth across any MBA interview format...",
    intro:
      "The STAR method is the single most useful tool for MBA behavioral interviews. It helps you stay structured under pressure and gives the interviewer a clean narrative to evaluate.",
    sections: [
      {
        heading: "Why STAR Works",
        blocks: [
          {
            kind: "paragraph",
            text: "Behavioral questions are diagnostic — interviewers want a specific past example, not a hypothetical. STAR forces you to ground your answer in something you actually did.",
          },
          {
            kind: "list",
            items: [
              "Situation — set the stage in one or two sentences",
              "Task — clarify what was on you specifically",
              "Action — focus on your decisions, not the team's",
              "Result — quantify the outcome whenever possible",
            ],
          },
        ],
      },
      {
        heading: "Practice Stories You Should Have Ready",
        blocks: [
          {
            kind: "subsections",
            items: [
              { title: "A leadership win", body: "A time you led a team or initiative to a measurable outcome." },
              { title: "A leadership failure", body: "Something that didn't work — and what you specifically would do differently." },
              { title: "A cross-cultural moment", body: "Working with someone from a very different background and finding alignment." },
              { title: "A pivot", body: "A point where you changed direction based on new information." },
            ],
          },
        ],
      },
    ],
  },
];

export function getArticleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id);
}
