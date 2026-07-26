import iosPreview from "../assets/img/ios.png";
import javaPreview from "../assets/img/java.png";
import maintenancePreview from "../assets/img/Maintenance-bro.png";
import pythonPreview from "../assets/img/python.png";

export const readyMadeProjects = [
  {
    id: "student-project-marketplace",
    title: "Student Project Marketplace",
    category: "Web Development",
    semester: "BCA Sem 5",
    difficulty: "Medium",
    previewImage: maintenancePreview,
    techStack: ["React", "Node.js", "PostgreSQL", "JWT"],
    summary: "A ready marketplace for project listings, downloads, requests, and student support chat.",
    features: ["Project catalog", "User login", "Download tracking", "Custom request chat"],
    includes: ["Source code", "Database schema", "Setup guide", "Report outline"],
    status: "Ready package",
  },
  {
    id: "library-management-java",
    title: "Library Management System",
    category: "Java Projects",
    semester: "BCA Sem 3",
    difficulty: "Easy",
    previewImage: javaPreview,
    techStack: ["Java", "Swing", "MySQL", "JDBC"],
    summary: "Issue books, return books, manage students, and generate basic library reports.",
    features: ["Book inventory", "Issue and return flow", "Student records", "Fine calculator"],
    includes: ["Source code", "MySQL file", "Screenshots", "Mini report"],
    status: "Files and docs ready",
  },
  {
    id: "python-face-attendance",
    title: "Face Attendance System",
    category: "Python Projects",
    semester: "BCA Sem 6",
    difficulty: "Advanced",
    previewImage: pythonPreview,
    techStack: ["Python", "OpenCV", "SQLite", "Tkinter"],
    summary: "Mark attendance using face recognition and export daily attendance sheets.",
    features: ["Face registration", "Attendance logs", "CSV export", "Admin panel"],
    includes: ["Python source", "Dataset folder structure", "Setup guide", "Presentation"],
    status: "Customization available",
  },
  {
    id: "android-expense-tracker",
    title: "Mobile Expense Tracker",
    category: "Android Projects",
    semester: "BCA Sem 4",
    difficulty: "Medium",
    previewImage: iosPreview,
    techStack: ["Android", "Java", "SQLite", "XML UI"],
    summary: "Track income, expenses, categories, and monthly balance from a mobile app.",
    features: ["Expense entry", "Category filters", "Monthly summary", "Local database"],
    includes: ["Android project", "APK build notes", "SQLite schema", "Report"],
    status: "Ready package",
  },
  {
    id: "ai-resume-screening",
    title: "AI Resume Screening Tool",
    category: "AI/ML Projects",
    semester: "Final Year",
    difficulty: "Advanced",
    previewImage: pythonPreview,
    techStack: ["Python", "NLP", "scikit-learn", "Flask"],
    summary: "Rank resumes against a job description using NLP scoring and a simple web panel.",
    features: ["PDF resume parsing", "Skill matching", "Candidate ranking", "Admin dashboard"],
    includes: ["ML code", "Flask app", "Sample dataset", "Final year report outline"],
    status: "Customizable",
  },
  {
    id: "database-hospital-system",
    title: "Hospital Database System",
    category: "Database Projects",
    semester: "BCA Sem 4",
    difficulty: "Medium",
    previewImage: maintenancePreview,
    techStack: ["SQL", "ER Diagram", "MySQL", "PHP"],
    summary: "A database-focused hospital management project with reports and normalized schema.",
    features: ["Patient records", "Doctor schedule", "Billing tables", "SQL reports"],
    includes: ["ER diagram", "SQL dump", "PHP pages", "Viva questions"],
    status: "Docs ready",
  },
];

export const popularCategories = [
  "Web Development",
  "Python Projects",
  "Java Projects",
  "Android Projects",
  "AI/ML Projects",
  "Database Projects",
  "Final Year Projects",
];

export const requestStatuses = ["Pending", "Accepted", "In Progress", "Completed"];

export function assetSrc(asset) {
  return typeof asset === "string" ? asset : asset?.src;
}

export function findProject(projectId) {
  return readyMadeProjects.find((project) => project.id === projectId);
}

export function buildProjectPackText(project) {
  return [
    project.title,
    "",
    project.summary,
    "",
    `Category: ${project.category}`,
    `Semester: ${project.semester}`,
    `Difficulty: ${project.difficulty}`,
    `Tech stack: ${project.techStack.join(", ")}`,
    "",
    "Features:",
    ...project.features.map((feature) => `- ${feature}`),
    "",
    "Included:",
    ...project.includes.map((item) => `- ${item}`),
    "",
    "Full source ZIP can be connected here when the project file inventory is uploaded.",
  ].join("\n");
}
