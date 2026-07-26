import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Download,
  FileArchive,
  FolderKanban,
  MessageCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  assetSrc,
  buildProjectPackText,
  popularCategories,
  readyMadeProjects,
  requestStatuses,
} from "./projectsData";

const DOWNLOADS_KEY = "pxcProjectDownloads";
const REQUESTS_KEY = "pxcProjectRequests";

function readStoredList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeStoredList(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function difficultyClass(difficulty) {
  if (difficulty === "Easy") return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  if (difficulty === "Advanced") return "border-rose-300/20 bg-rose-300/10 text-rose-100";
  return "border-blue-300/20 bg-blue-300/10 text-blue-100";
}

function requestStatusClass(status) {
  if (status === "Accepted") return "border-blue-300/20 bg-blue-300/10 text-blue-100";
  if (status === "In Progress") return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  if (status === "Completed") return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  return "border-zinc-300/20 bg-white/[0.06] text-zinc-200";
}

function downloadTextFile(project) {
  const blob = new Blob([buildProjectPackText(project)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.id}-project-pack.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildSupportPrompt(project, action) {
  return [
    `I want to ${action} this ready-made project.`,
    "",
    `Project: ${project.title}`,
    `Category: ${project.category}`,
    `Semester: ${project.semester}`,
    `Tech stack: ${project.techStack.join(", ")}`,
  ].join("\n");
}

function ProjectCard({ project, onDownload, onSupport }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b] text-left shadow-[0_16px_42px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-white/18">
      <Link to={`/projects/${project.id}`} className="block">
        <div className="relative h-44 overflow-hidden bg-[#262626]">
          <img
            src={assetSrc(project.previewImage)}
            alt={`${project.title} preview`}
            className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${difficultyClass(project.difficulty)}`}>
              {project.difficulty}
            </span>
            <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-zinc-100">
              {project.semester}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-blue-200">{project.category}</p>
            <h2 className="mt-1 line-clamp-2 text-lg font-semibold leading-6 text-white">
              {project.title}
            </h2>
          </div>
          <FileArchive size={18} className="mt-1 shrink-0 text-zinc-500" />
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-zinc-400">{project.summary}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.techStack.slice(0, 4).map((tech) => (
            <span key={tech} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Link
            to={`/projects/${project.id}`}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-zinc-100 transition hover:bg-white/[0.08]"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={() => onDownload(project)}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#3b82f6] text-xs font-semibold text-white transition hover:bg-[#2f78ed]"
          >
            <Download size={14} />
            Download
          </button>
          <button
            type="button"
            onClick={() => onSupport(project, "customize")}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-zinc-100 transition hover:bg-white/[0.08]"
          >
            Customize
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [downloads, setDownloads] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    setDownloads(readStoredList(DOWNLOADS_KEY));
    setRequests(readStoredList(REQUESTS_KEY));
  }, []);

  const visibleProjects = useMemo(() => {
    if (activeCategory === "All") return readyMadeProjects;
    return readyMadeProjects.filter((project) => project.category === activeCategory);
  }, [activeCategory]);

  const openPixelChat = (message) => {
    const query = new URLSearchParams({
      prefillMessage: encodeURIComponent(message),
      autoSend: "1",
      source: "projects",
    });
    navigate(`/chat/pixel?${query.toString()}`);
  };

  const handleDownload = (project) => {
    downloadTextFile(project);
    const nextDownloads = [
      {
        id: `${project.id}-${Date.now()}`,
        projectId: project.id,
        title: project.title,
        status: project.status,
        downloadedAt: new Date().toISOString(),
      },
      ...downloads.filter((item) => item.projectId !== project.id),
    ].slice(0, 5);
    setDownloads(nextDownloads);
    writeStoredList(DOWNLOADS_KEY, nextDownloads);
  };

  const handleSupport = (project, action) => {
    openPixelChat(buildSupportPrompt(project, action));
  };

  const requestProjectCustomization = (project) => {
    const query = new URLSearchParams({
      topic: project.title,
      subjectSemester: project.semester,
      techStack: project.techStack.join(", "),
    });
    navigate(`/request-project?${query.toString()}`);
  };

  return (
    <main className="chat-font min-h-[100dvh] bg-[#101010] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#101010]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/projects" className="flex items-center gap-3">
            <img src="/logo.png" alt="Pixel Class" className="h-9 w-9 rounded-xl object-contain" />
            <span className="hidden text-sm font-semibold text-white sm:inline">Pixel Projects</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            <Link to="/request-project" className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.07] hover:text-white">
              Request
            </Link>
            <Link to="/chat/pixel" className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.07] hover:text-white">
              Chat
            </Link>
            <Link to="/profile" className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.07] hover:text-white">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-[#191919] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-blue-200">
              <FolderKanban size={23} />
            </div>
            <p className="text-sm font-semibold text-blue-200">Student project hub</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Download ready-made projects or request custom builds.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
              Browse source-code packages, request customization, and continue every project discussion with Pixel Help Buddy.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/request-project" className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#3b82f6] px-5 text-sm font-semibold text-white transition hover:bg-[#2f78ed]">
                Need a custom project?
                <ArrowRight size={17} />
              </Link>
              <button
                type="button"
                onClick={() => openPixelChat("Can you make a project on my topic?")}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-semibold text-zinc-100 transition hover:bg-white/[0.09]"
              >
                <Bot size={17} />
                Chat with Pixel Help Buddy
              </button>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-[#22201f] p-6">
            <h2 className="text-lg font-semibold text-white">Custom project creation</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              The request form collects topic, semester, deadline, budget, tech stack, and college PDF/image requirements.
            </p>
            <div className="mt-5 grid gap-2 text-sm text-zinc-300">
              {["Project topic", "Subject/semester", "Deadline", "Budget", "Required tech stack", "Upload PDF/image"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-black/20 px-3 py-2">
                  <CheckCircle2 size={16} className="text-blue-200" />
                  {item}
                </div>
              ))}
            </div>
            <Link to="/request-project" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-[#171717] transition hover:bg-zinc-200">
              Request Project
              <ArrowRight size={16} />
            </Link>
          </aside>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Ready-Made Projects</h2>
              <p className="mt-1 text-sm text-zinc-400">Preview, download, or request customization.</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#191919] px-3 py-2 text-sm text-zinc-400">
              <Search size={16} />
              {visibleProjects.length} projects
            </div>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {["All", ...popularCategories].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`h-10 shrink-0 rounded-2xl px-4 text-sm font-semibold transition ${
                  activeCategory === category
                    ? "bg-white text-[#171717]"
                    : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDownload={handleDownload}
                onSupport={(selectedProject, action) => {
                  if (action === "customize") {
                    requestProjectCustomization(selectedProject);
                    return;
                  }
                  handleSupport(selectedProject, action);
                }}
              />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-[#191919] p-5 lg:col-span-1">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Download size={18} />
              My Downloads
            </h2>
            <div className="mt-4 grid gap-3">
              {downloads.length ? downloads.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white/[0.045] p-3">
                  <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-400">{item.status}</p>
                  <button
                    type="button"
                    onClick={() => {
                      const project = readyMadeProjects.find((entry) => entry.id === item.projectId);
                      if (project) handleDownload(project);
                    }}
                    className="mt-3 h-9 rounded-xl border border-white/10 px-3 text-xs font-semibold text-zinc-100 transition hover:bg-white/[0.08]"
                  >
                    Download again
                  </button>
                </div>
              )) : (
                <p className="rounded-2xl bg-white/[0.045] p-4 text-sm leading-6 text-zinc-400">
                  Download a project to see recent files and docs here.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#191919] p-5 lg:col-span-1">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Sparkles size={18} />
              My Requests
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {requestStatuses.map((status) => (
                <span key={status} className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${requestStatusClass(status)}`}>
                  {status}
                </span>
              ))}
            </div>
            <div className="mt-4 grid gap-3">
              {requests.length ? requests.slice(0, 3).map((request) => (
                <div key={request.id} className="rounded-2xl bg-white/[0.045] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-semibold text-white">{request.topic}</p>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${requestStatusClass(request.status || "Pending")}`}>
                      {request.status || "Pending"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-zinc-400">{request.subjectSemester}</p>
                  <button
                    type="button"
                    onClick={() => openPixelChat(`I want to discuss my custom project request: ${request.topic}`)}
                    className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-zinc-100 transition hover:bg-white/[0.08]"
                  >
                    <MessageCircle size={14} />
                    Chat
                  </button>
                </div>
              )) : (
                <p className="rounded-2xl bg-white/[0.045] p-4 text-sm leading-6 text-zinc-400">
                  Your custom project requests will appear here after submission.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#22201f] p-5 lg:col-span-1">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Bot size={18} />
              Chat / Support
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Chat with Pixel Help Buddy for download help, customization, or setup issues.</p>
            <div className="mt-4 grid gap-2">
              {[
                "Can you customize this?",
                "Can you make project on this topic?",
                "How to run this project?",
              ].map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => openPixelChat(question)}
                  className="rounded-2xl bg-black/20 px-4 py-3 text-left text-sm text-zinc-200 transition hover:bg-black/30"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
