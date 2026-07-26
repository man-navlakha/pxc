import { ArrowLeft, Bot, CheckCircle2, Download, FileArchive, MessageCircle, Wrench } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { assetSrc, buildProjectPackText, findProject } from "./projectsData";

const DOWNLOADS_KEY = "pxcProjectDownloads";

function writeDownload(project) {
  let downloads = [];
  try {
    const stored = JSON.parse(localStorage.getItem(DOWNLOADS_KEY) || "[]");
    downloads = Array.isArray(stored) ? stored : [];
  } catch {
    downloads = [];
  }

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

  localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(nextDownloads));
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
  writeDownload(project);
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = findProject(projectId);

  if (!project) {
    return (
      <main className="chat-font flex min-h-[100dvh] items-center justify-center bg-[#101010] px-4 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Project not found</h1>
          <Link to="/projects" className="mt-5 inline-flex h-11 items-center rounded-2xl bg-white px-5 text-sm font-semibold text-[#171717]">
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  const openPixelChat = (message) => {
    const query = new URLSearchParams({
      prefillMessage: encodeURIComponent(message),
      autoSend: "1",
      source: "project-detail",
    });
    navigate(`/chat/pixel?${query.toString()}`);
  };

  const requestCustomization = () => {
    const query = new URLSearchParams({
      topic: project.title,
      subjectSemester: project.semester,
      techStack: project.techStack.join(", "),
    });
    navigate(`/request-project?${query.toString()}`);
  };

  return (
    <main className="chat-font min-h-[100dvh] bg-[#101010] text-white">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <Link to="/projects" className="mb-5 inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-zinc-100 transition hover:bg-white/[0.08]">
          <ArrowLeft size={16} />
          Back
        </Link>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#191919]">
            <div className="relative h-[min(54dvh,520px)] min-h-[320px] overflow-hidden bg-[#242424]">
              <img
                src={assetSrc(project.previewImage)}
                alt={`${project.title} preview`}
                className="h-full w-full object-cover opacity-82"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-sm font-semibold text-blue-200">{project.category}</p>
                <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
                  {project.title}
                </h1>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-[#191919] p-6">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-xs font-semibold text-blue-100">
                {project.semester}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-zinc-200">
                {project.difficulty}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-zinc-200">
                {project.status}
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-zinc-300">{project.summary}</p>

            <div className="mt-6">
              <h2 className="text-sm font-semibold text-white">Tech stack</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span key={tech} className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-zinc-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => downloadTextFile(project)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#3b82f6] px-5 text-sm font-semibold text-white transition hover:bg-[#2f78ed]"
              >
                <Download size={17} />
                Download
              </button>
              <button
                type="button"
                onClick={requestCustomization}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-semibold text-zinc-100 transition hover:bg-white/[0.09]"
              >
                <Wrench size={17} />
                Customize
              </button>
              <button
                type="button"
                onClick={() => openPixelChat(`I need help running this project: ${project.title}`)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-semibold text-zinc-100 transition hover:bg-white/[0.09] sm:col-span-2"
              >
                <MessageCircle size={17} />
                Chat with Pixel Help Buddy
              </button>
            </div>
          </aside>
        </section>

        <section className="mt-7 grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-[#191919] p-5 lg:col-span-1">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <CheckCircle2 size={18} />
              Features
            </h2>
            <div className="mt-4 grid gap-3">
              {project.features.map((feature) => (
                <div key={feature} className="rounded-2xl bg-white/[0.045] px-4 py-3 text-sm text-zinc-300">
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#191919] p-5 lg:col-span-1">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <FileArchive size={18} />
              What is included
            </h2>
            <div className="mt-4 grid gap-3">
              {project.includes.map((item) => (
                <div key={item} className="rounded-2xl bg-white/[0.045] px-4 py-3 text-sm text-zinc-300">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#22201f] p-5 lg:col-span-1">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Bot size={18} />
              Ask before download
            </h2>
            <div className="mt-4 grid gap-2">
              {[
                "Can you customize this?",
                "Can you explain setup steps?",
                "Can you add my college format?",
              ].map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => openPixelChat(`${question}\n\nProject: ${project.title}`)}
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
