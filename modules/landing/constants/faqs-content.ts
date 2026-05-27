import { Contents } from "../types/content";

export const FAQS_CONTENT: Contents = [
  {
    id: "01",
    title: "Why did I build this?",
    body: "Tutorialspoint played a big part in my life while learning programming. That's why, when I discovered NotebookLM, I instantly wanted to feed it data from Tutorialspoint to boost my learning.",
  },
  {
    id: "02",
    title: "Where do the PDFs come from?",
    body: "Directly from TutorialsPoint. Docupal doesn't host or store any tutorial content — it only constructs the canonical URL and passes the file through to your browser.",
  },
  {
    id: "03",
    title: "What if a tutorial has no PDF?",
    body: "The verifier returns not found. Some tutorials are online-only; in that case the file genuinely doesn't exist and you'll have to read it on the source site.",
  },
  {
    id: "04",
    title: "Why does verification sometimes say “couldn't verify”?",
    body: "The reachability check goes through a public proxy. If that proxy is rate-limited or offline, Docupal falls back to opening the URL directly so you can still grab the file.",
  },
  {
    id: "05",
    title: "Where is my queue stored?",
    body: "In your browser's localStorage. Nothing is sent to a server, and clearing browser data clears the queue.",
  },
];
