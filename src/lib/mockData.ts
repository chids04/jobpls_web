import { Resume } from "./schemas";

// --- Mock ResumeData 1: Full, Comprehensive Resume ---
export const mockResumeFullStackDev: Resume = {
  full_name: "Eleanor Vance",
  email: `eleanor.vance@example.com`,
  github: "eleanorv-dev",
  residency: "San Francisco, CA",
  about_me: "Full-stack developer with 5+ years of experience building scalable web applications using TypeScript, React, and Node.js. Passionate about clean code, robust architecture, and delivering exceptional user experiences.",
  languages: ["TypeScript", "JavaScript", "Python", "Go", "SQL", "Bash"],
  frameworks: [
    "React",
    "Next.js",
    "Node.js",
    "Express.js",
    "Django",
    "FastAPI",
    "Docker",
  ],
  developer_tools: [
    "Git",
    "Kubernetes",
    "AWS",
    "GCP",
    "MongoDB",
    "PostgreSQL",
    "Jira",
    "VS Code",
  ],
  work_exp: [
    {
      title: "Senior Software Engineer",
      start_date: "01/2025",
      end_date: "Ongoing",
      company: "Innovate Solutions Inc.",
      b1: "Led a team of 4 engineers in developing a new microservices architecture, improving system scalability by 40%.",
      b2: "Implemented CI/CD pipelines with GitHub Actions, reducing deployment time by 50% and increasing release frequency.",
    },
    {
      title: "Software Engineer",
      start_date: "04/2022",
      end_date: "01/2023",
      company: "DataDriven Tech",
      b1: "Developed and maintained RESTful APIs for customer-facing applications, serving over 1 million daily users.",
      b2: "Migrated legacy Python 2 codebase to Python 3, technical debt and improving application performance.",
    },
  ],
  projects: [
    {
      title: "AI-Powered Recipe Generator",
      b1: "Built a full-stack application using Next.js and Flask that generates recipes based on user-provided ingredients and dietary preferences, leveraging OpenAI's GPT API.",
      b2: "Designed and implemented a PostgreSQL database with advanced search capabilities and user authentication.",
      languages: ["TypeScript", "React", "Python", "Flask", "PostgreSQL"],
      url: "https://github.com/eleanorv-dev/recipe-ai",
    },
    {
      title: "Real-time Collaboration Platform",
      b1: "Developed a collaborative whiteboard application with real-time syncing using WebSockets (Socket.IO) and Node.js, supporting multiple users and persistent canvas states.",
      b2: "Utilized Redis for caching frequently accessed data and optimizing server response times.",
      languages: ["JavaScript", "Node.js", "Express.js", "Socket.IO", "Redis"],
      url: "https://github.com/eleanorv-dev/realtime-whiteboard",
    },
  ],
  education: [
    {
      title: "M.Sc. Computer Science",
      grade: "Distinction",
      name: "Stanford University",
      start_date: "04/2022",
      end_date: "01/2023",
      location: "Stanford, CA",
      modules: [
        "Advanced Algorithms",
        "Distributed Systems",
        "Machine Learning",
        "Cloud Computing",
      ],
    },
    {
      title: "B.Sc. Software Engineering",
      grade: "First Class Honours",
      name: "University of California, Berkeley",
      start_date: "04/2022",
      end_date: "01/2023",
      location: "Berkeley, CA",
      modules: [
        "Data Structures",
        "Operating Systems",
        "Software Design Patterns",
      ],
    },
  ],
};
