import { ArrowRight, CalendarDays, FileText, IndianRupee, Layers3, Upload, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";

const REQUESTS_KEY = "pxcProjectRequests";

const initialForm = {
  topic: "",
  subjectSemester: "",
  deadline: "",
  budget: "",
  techStack: "",
};

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildProjectRequestMessage(form, uploadedFiles) {
  const fileLines = uploadedFiles.length
    ? uploadedFiles
        .map((file, index) => `${index + 1}. ${file.name} (${formatFileSize(file.size)})\n${file.url}`)
        .join("\n")
    : "No file selected";

  return [
    "New custom project request",
    "",
    `Project topic: ${form.topic.trim()}`,
    `Subject / semester: ${form.subjectSemester.trim()}`,
    `Deadline: ${form.deadline || "Not specified"}`,
    `Budget: ${form.budget.trim() || "Not specified"}`,
    `Required tech stack: ${form.techStack.trim()}`,
    "",
    "College requirement files:",
    fileLines,
  ].join("\n");
}

export default function ProjectRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const topic = params.get("topic");
    const subjectSemester = params.get("subjectSemester");
    const techStack = params.get("techStack");

    if (!topic && !subjectSemester && !techStack) return;

    setForm((current) => ({
      ...current,
      topic: topic || current.topic,
      subjectSemester: subjectSemester || current.subjectSemester,
      techStack: techStack || current.techStack,
    }));
  }, [location.search]);

  const selectedFileLabel = useMemo(() => {
    if (!files.length) return "Upload PDF/image";
    if (files.length === 1) return files[0].name;
    return `${files.length} files selected`;
  }, [files]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (error) setError("");
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
    if (error) setError("");
  };

  const uploadFiles = async () => {
    if (!files.length) return [];

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await api.post("/project-request/upload/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    return response.data?.files || [];
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.topic.trim() || !form.subjectSemester.trim() || !form.techStack.trim()) {
      setError("Project topic, subject/semester, and tech stack are required.");
      return;
    }

    try {
      setSubmitting(true);
      const uploadedFiles = await uploadFiles();
      const message = buildProjectRequestMessage(form, uploadedFiles).slice(0, 3900);
      const requestRecord = {
        id: `request-${Date.now()}`,
        topic: form.topic.trim(),
        subjectSemester: form.subjectSemester.trim(),
        deadline: form.deadline || "Not specified",
        budget: form.budget.trim() || "Not specified",
        techStack: form.techStack.trim(),
        status: "Pending",
        uploadedFiles,
        createdAt: new Date().toISOString(),
      };
      try {
        const existing = JSON.parse(localStorage.getItem(REQUESTS_KEY) || "[]");
        const list = Array.isArray(existing) ? existing : [];
        localStorage.setItem(REQUESTS_KEY, JSON.stringify([requestRecord, ...list].slice(0, 10)));
      } catch {
        localStorage.setItem(REQUESTS_KEY, JSON.stringify([requestRecord]));
      }
      const query = new URLSearchParams({
        prefillMessage: encodeURIComponent(message),
        autoSend: "1",
        source: "project-request",
      });

      navigate(`/chat/pixel?${query.toString()}`);
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || "Could not submit project request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="chat-font min-h-[100dvh] bg-[#101010] text-white">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid min-h-[min(760px,calc(100dvh-64px))] overflow-hidden rounded-[28px] border border-white/10 bg-[#171717] shadow-[0_30px_110px_rgba(0,0,0,0.42)] lg:grid-cols-[0.86fr_1.14fr]">
          <section className="flex flex-col justify-between border-b border-white/10 bg-[#22201f] p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-blue-200">
                <Wrench size={22} />
              </div>
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Request a custom student project
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-zinc-300">
                Send your requirements to Pixel Help Buddy and continue the discussion in chat.
              </p>
            </div>

            <div className="mt-8 grid gap-3 text-sm text-zinc-300">
              <div className="flex items-center gap-3">
                <Layers3 size={17} className="text-blue-200" />
                Source code, report, PPT, database
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays size={17} className="text-blue-200" />
                Deadline and budget reviewed in chat
              </div>
              <div className="flex items-center gap-3">
                <FileText size={17} className="text-blue-200" />
                College requirement files noted
              </div>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5 sm:p-7 lg:p-8">
            {error && (
              <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-200">Project topic</span>
              <input
                value={form.topic}
                onChange={updateField("topic")}
                placeholder="Online voting system"
                className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-300/60 focus:ring-2 focus:ring-blue-300/20"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-200">Subject / semester</span>
              <input
                value={form.subjectSemester}
                onChange={updateField("subjectSemester")}
                placeholder="BCA semester 5, DBMS"
                className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-300/60 focus:ring-2 focus:ring-blue-300/20"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-200">Deadline</span>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={updateField("deadline")}
                  className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition [color-scheme:dark] focus:border-blue-300/60 focus:ring-2 focus:ring-blue-300/20"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-200">Budget</span>
                <div className="relative">
                  <IndianRupee className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    value={form.budget}
                    onChange={updateField("budget")}
                    placeholder="3000"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 pl-10 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-300/60 focus:ring-2 focus:ring-blue-300/20"
                  />
                </div>
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-200">Required tech stack</span>
              <textarea
                value={form.techStack}
                onChange={updateField("techStack")}
                rows={4}
                placeholder="React, Node.js, PostgreSQL, Python, Java..."
                className="chat-scrollbar min-h-28 resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-300/60 focus:ring-2 focus:ring-blue-300/20"
              />
            </label>

            <label className="grid cursor-pointer gap-2">
              <span className="text-sm font-semibold text-zinc-200">College requirements PDF/image</span>
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              <span className="flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 text-sm text-zinc-300 transition hover:border-blue-300/60 hover:bg-blue-300/5">
                <span className="min-w-0 truncate">{selectedFileLabel}</span>
                <Upload size={18} className="shrink-0 text-zinc-400" />
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#3b82f6] px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(59,130,246,0.24)] transition hover:bg-[#2f78ed]"
            >
              {submitting ? "Sending..." : "Send to Pixel chat"}
              {!submitting && <ArrowRight size={17} />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
