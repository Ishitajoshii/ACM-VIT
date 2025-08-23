// Domain configuration data for ACM-VIT website
export interface DomainConfig {
  title: string;
  description: string;
  themeColor: string;
  techIcons: Array<{
    src: string;
    alt: string;
  }>;
}

export const domainConfigs: Record<string, DomainConfig> = {
  app: {
    title: "APP",
    description: "Building innovative mobile applications with modern frameworks and technologies. From native iOS and Android apps to cross-platform solutions.",
    themeColor: "app",
    techIcons: [
      { src: "/domains/app/android.svg", alt: "Android" },
      { src: "/domains/app/dart.svg", alt: "Dart" },
      { src: "/domains/app/flutter.svg", alt: "Flutter" },
      { src: "/domains/app/java.svg", alt: "Java" },
      { src: "/domains/app/kotlin.svg", alt: "Kotlin" },
      { src: "/domains/app/reactjs.svg", alt: "React Native" },
      { src: "/domains/app/swift.svg", alt: "Swift" },
      { src: "/domains/app/typescript.svg", alt: "TypeScript" }
    ]
  },
  cc: {
    title: "COMPETITIVE CODING",
    description: "Mastering algorithms and data structures through competitive programming. Solving complex problems with optimal solutions and efficient code.",
    themeColor: "competitive",
    techIcons: [
      { src: "/domains/cc/codeforces_icon 1.svg", alt: "Codeforces" },
      { src: "/domains/cc/c++.svg", alt: "C++" },
      { src: "/domains/cc/ICPC_Foundation_logo 1.svg", alt: "ICPC" },
      { src: "/domains/cc/vim.svg", alt: "Vim" }
    ]
  },
  design: {
    title: "DESIGN",
    description: "Creating beautiful and intuitive user experiences through thoughtful design. From wireframes to pixel-perfect interfaces.",
    themeColor: "design",
    techIcons: [
      { src: "/domains/design/ae.svg", alt: "AE" },
      { src: "/domains/design/ai.svg", alt: "AI" },
      { src: "/domains/design/figma.svg", alt: "Figma" },
      { src: "/domains/design/final-cut-pro-new 1.svg", alt: "FinalCut" },
      { src: "/domains/design/ps.svg", alt: "PS" },
      { src: "/domains/design/blender.svg", alt: "Blender" }
    ]
  },
  web: {
    title: "WEB",
    description: "Building modern, responsive web applications with cutting-edge technologies. From frontend frameworks to full-stack solutions.",
    themeColor: "web",
    techIcons: [
      { src: "/domains/web/cloudflare.svg", alt: "Cloudflare" },
      { src: "/domains/web/cockroachdb 1.svg", alt: "CockroachDB" },
      { src: "/domains/web/docker.svg", alt: "Docker" },
      { src: "/domains/web/go-gopher-svgrepo-com 1.svg", alt: "Go" },
      { src: "/domains/web/Group.svg", alt: "Group" },
      { src: "/domains/web/nextjs2.svg", alt: "Next.js" },
      { src: "/domains/web/nodejs.svg", alt: "Node.js" },
      { src: "/domains/web/npm2.svg", alt: "npm" },
      { src: "/domains/web/postgresql.svg", alt: "PostgreSQL" },
      { src: "/domains/web/postman.svg", alt: "Postman" },
      { src: "/domains/web/prisma.svg", alt: "Prisma" },
      { src: "/domains/web/redis.svg", alt: "Redis" },
      { src: "/domains/web/tailwindcss.svg", alt: "TailwindCSS" },
      { src: "/domains/web/typescript.svg", alt: "TypeScript" }
    ]
  },
  research: {
    title: "RESEARCH",
    description: "Exploring cutting-edge technologies and contributing to the advancement of computer science through innovative research projects.",
    themeColor: "research",
    techIcons: [
      { src: "/domains/research/icons8-google-colab 1.svg", alt: "Collab" },
      { src: "/domains/research/icons8-burp-suite 1.svg", alt: "BurpSuite" },
      { src: "/domains/research/Owasp--Streamline-Simple-Icons 1.svg", alt: "Owasp" },
      { src: "/domains/research/LLVM 1.svg", alt: "LLVM" },
      { src: "/domains/research/icons8-tensorflow 1.svg", alt: "TensorFlow" },
      { src: "/domains/research/pytorch.svg", alt: "PyTorch" },
      { src: "/domains/research/Pandas 1.svg", alt: "Pandas" },
      { src: "/domains/research/python.svg", alt: "Python" },
      { src: "/domains/research/qiskit 1.svg", alt: "Qiskit" }
    ]
  },
  management: {
    title: "MANAGEMENT",
    description: "Leading teams and projects to success through strategic planning, effective communication, and innovative management practices.",
    themeColor: "management",
    techIcons: [
      { src: "/domains/management/slack.svg", alt: "Slack" },
      { src: "/domains/management/icons8-discord 1.svg", alt: "Discord" },
      { src: "/domains/management/icons8-notion-512 1.svg", alt: "Notion" },
      { src: "/domains/management/icons8-gmail 1.svg", alt: "Gmail" },
      { src: "/domains/management/icons8-microsoft-word 1.svg", alt: "Word" },
      { src: "/domains/management/icons8-excel-240 1.svg", alt: "Excel" }
    ]
  }
};

// Theme colors configuration
export const themeColors = {
  app: "#9B51E0",
  web: "#B4E35B", 
  design: "#FF7777",
  research: "#9AF3FF",
  management: "#008080",
  competitive: "#42CD9D"
};