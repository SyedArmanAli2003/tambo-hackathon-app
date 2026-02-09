import { motion } from "framer-motion";
import {
  Upload,
  MessageSquare,
  BarChart3,
  LineChart,
  PieChart,
  Table2,
  ScatterChart,
  FileText,
  Award,
  Zap,
  Layers,
  Download,
  Code2,
  Cpu,
  Database,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const componentList = [
  {
    name: "KPI Card",
    icon: <Award className="w-5 h-5 text-blue-500" />,
    description: "Display key metrics like total revenue, user count, or conversion rate with trend indicators.",
    example: `"Show me total revenue and active users"`,
  },
  {
    name: "Bar Chart",
    icon: <BarChart3 className="w-5 h-5 text-cyan-500" />,
    description: "Compare values across categories — regions, products, departments, etc.",
    example: `"Compare sales by region"`,
  },
  {
    name: "Line Chart",
    icon: <LineChart className="w-5 h-5 text-indigo-500" />,
    description: "Visualize trends over time — monthly revenue, user growth, weekly performance.",
    example: `"Show monthly revenue trend"`,
  },
  {
    name: "Pie Chart",
    icon: <PieChart className="w-5 h-5 text-pink-500" />,
    description: "Show proportions and distributions — market share, category breakdown.",
    example: `"Show revenue distribution by product"`,
  },
  {
    name: "Scatter Plot",
    icon: <ScatterChart className="w-5 h-5 text-purple-500" />,
    description: "Analyze correlations between two numeric variables.",
    example: `"Show correlation between customers and revenue"`,
  },
  {
    name: "Data Table",
    icon: <Table2 className="w-5 h-5 text-emerald-500" />,
    description: "Display sortable tabular data — top records, detailed lists, raw data views.",
    example: `"Show top 10 customers by revenue"`,
  },
  {
    name: "Stat Card",
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    description: "Simple metric display with optional change indicator.",
    example: `"What's the average order value?"`,
  },
  {
    name: "Text Block",
    icon: <FileText className="w-5 h-5 text-slate-500" />,
    description: "AI-written analysis, insights, and narrative explanations about your data.",
    example: `"Analyze the key trends in my data"`,
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function Documentation() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        {/* Hero */}
        <motion.section {...fadeIn}>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-7 h-7" />
              <h2 className="text-2xl font-bold">AI-Powered Dashboard Builder</h2>
            </div>
            <p className="text-indigo-100 text-lg mb-4 max-w-2xl">
              Describe what you want in plain English — our AI analyzes your data and
              renders the perfect dashboard components automatically.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="text-xs bg-white/20 rounded-full px-3 py-1">React 19</span>
              <span className="text-xs bg-white/20 rounded-full px-3 py-1">Tambo AI</span>
              <span className="text-xs bg-white/20 rounded-full px-3 py-1">TypeScript</span>
              <span className="text-xs bg-white/20 rounded-full px-3 py-1">Recharts</span>
              <span className="text-xs bg-white/20 rounded-full px-3 py-1">Tailwind CSS 4</span>
              <span className="text-xs bg-white/20 rounded-full px-3 py-1">Framer Motion</span>
            </div>
          </div>
        </motion.section>

        {/* Getting Started */}
        <motion.section {...fadeIn} transition={{ delay: 0.1 }}>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Getting Started
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-5 border-2 border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">1</div>
                <h3 className="font-semibold text-slate-900">Upload Your Data</h3>
              </div>
              <p className="text-sm text-slate-600">
                Click <strong>"Upload Data"</strong> to import a CSV or JSON file. The app auto-detects
                columns, data types, and computes statistics.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Upload className="w-3.5 h-3.5" />
                Supports CSV & JSON
              </div>
            </Card>

            <Card className="p-5 border-2 border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">2</div>
                <h3 className="font-semibold text-slate-900">Ask a Question</h3>
              </div>
              <p className="text-sm text-slate-600">
                Type what you want to see in plain English. The AI understands your intent
                and picks the best visualization.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <MessageSquare className="w-3.5 h-3.5" />
                Natural language input
              </div>
            </Card>

            <Card className="p-5 border-2 border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">3</div>
                <h3 className="font-semibold text-slate-900">Export & Share</h3>
              </div>
              <p className="text-sm text-slate-600">
                Once your dashboard is generated, click <strong>"Export"</strong> to
                download as PDF, JPG, or PNG and share with your team.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Download className="w-3.5 h-3.5" />
                PDF, JPG, PNG formats
              </div>
            </Card>
          </div>
        </motion.section>

        {/* Example Prompts */}
        <motion.section {...fadeIn} transition={{ delay: 0.15 }}>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            Example Prompts
          </h2>
          <Card className="p-6 border-2 border-slate-200">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { prompt: "Show me sales by region with revenue trends", desc: "Generates bar chart + line chart" },
                { prompt: "Create a user growth dashboard", desc: "Generates KPIs + line chart + stat cards" },
                { prompt: "Which product has the highest revenue?", desc: "Generates text analysis + bar chart" },
                { prompt: "Analyze revenue vs customer correlation", desc: "Generates scatter plot + text insight" },
                { prompt: "Show top 10 customers by revenue", desc: "Generates sortable data table" },
                { prompt: "What are the key trends in my data?", desc: "Generates text block with insights" },
                { prompt: "Show revenue distribution by category", desc: "Generates pie chart" },
                { prompt: "Compare performance across departments", desc: "Generates bar chart + KPI cards" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-indigo-500 mt-0.5 font-mono text-xs">→</span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">"{item.prompt}"</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.section>

        {/* Components */}
        <motion.section {...fadeIn} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-500" />
            Available Components
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            The AI automatically selects from these 8 dashboard components based on your request:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {componentList.map((comp, i) => (
              <motion.div
                key={comp.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Card className="p-5 border-2 border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    {comp.icon}
                    <h3 className="font-semibold text-slate-900">{comp.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{comp.description}</p>
                  <p className="text-xs text-indigo-600 bg-indigo-50 rounded px-2 py-1 inline-block">
                    Try: {comp.example}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Architecture */}
        <motion.section {...fadeIn} transition={{ delay: 0.25 }}>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-500" />
            Architecture
          </h2>
          <Card className="p-6 border-2 border-slate-200">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-slate-500" />
                  How It Works
                </h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-center">
                    <span className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium whitespace-nowrap">User Prompt</span>
                    <span className="text-slate-400">→</span>
                    <span className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium whitespace-nowrap">Data Analysis</span>
                    <span className="text-slate-400">→</span>
                    <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium whitespace-nowrap">Tambo AI</span>
                    <span className="text-slate-400">→</span>
                    <span className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium whitespace-nowrap">Component Rendering</span>
                    <span className="text-slate-400">→</span>
                    <span className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium whitespace-nowrap">Dashboard</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-500" />
                  Data Pipeline
                </h3>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span><strong>Upload:</strong> CSV/JSON files are parsed client-side using PapaParse with automatic type detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span><strong>Analysis:</strong> Statistics (min, max, mean, median, std dev), aggregations, and correlations are pre-computed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span><strong>Context:</strong> Analysis results + raw data are passed to the AI as additional context with each query</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span><strong>Rendering:</strong> Tambo selects components and fills them with correctly aggregated data</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "React 19", color: "bg-blue-100 text-blue-700" },
                    { label: "TypeScript", color: "bg-sky-100 text-sky-700" },
                    { label: "Vite", color: "bg-purple-100 text-purple-700" },
                    { label: "Tambo AI", color: "bg-indigo-100 text-indigo-700" },
                    { label: "Tailwind CSS 4", color: "bg-cyan-100 text-cyan-700" },
                    { label: "Recharts", color: "bg-emerald-100 text-emerald-700" },
                    { label: "Framer Motion", color: "bg-pink-100 text-pink-700" },
                    { label: "shadcn/ui", color: "bg-slate-100 text-slate-700" },
                    { label: "PapaParse", color: "bg-amber-100 text-amber-700" },
                    { label: "html2canvas", color: "bg-orange-100 text-orange-700" },
                    { label: "jsPDF", color: "bg-red-100 text-red-700" },
                    { label: "Zod", color: "bg-violet-100 text-violet-700" },
                  ].map((tech) => (
                    <span key={tech.label} className={`text-xs px-3 py-1.5 rounded-full font-medium ${tech.color}`}>
                      {tech.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Data Formats */}
        <motion.section {...fadeIn} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-500" />
            Supported Data Formats
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-5 border-2 border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">CSV Files</h3>
              <div className="bg-slate-50 rounded-lg p-3 font-mono text-xs text-slate-600">
                <p>Date,Product,Revenue,Quantity</p>
                <p>2026-01-01,Widget A,1500,25</p>
                <p>2026-01-02,Widget B,2300,40</p>
                <p>2026-01-03,Widget A,1800,30</p>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Headers auto-detected. Numeric columns parsed automatically.
              </p>
            </Card>
            <Card className="p-5 border-2 border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">JSON Files</h3>
              <div className="bg-slate-50 rounded-lg p-3 font-mono text-xs text-slate-600">
                <p>{"["}</p>
                <p>{"  { \"name\": \"Alice\", \"sales\": 1500 },"}</p>
                <p>{"  { \"name\": \"Bob\", \"sales\": 2300 },"}</p>
                <p>{"  { \"name\": \"Carol\", \"sales\": 1800 }"}</p>
                <p>{"]"}</p>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Array of objects format. Nested objects flattened automatically.
              </p>
            </Card>
          </div>
        </motion.section>

        {/* Features */}
        <motion.section {...fadeIn} transition={{ delay: 0.35 }}>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Natural Language AI", desc: "Describe dashboards in plain English — no coding needed", icon: <MessageSquare className="w-4 h-4" /> },
              { title: "Smart Data Analysis", desc: "Auto-computes statistics, aggregations, and correlations", icon: <Cpu className="w-4 h-4" /> },
              { title: "8 Component Types", desc: "Charts, tables, KPIs, text — AI picks the right one", icon: <Layers className="w-4 h-4" /> },
              { title: "CSV & JSON Upload", desc: "Drag & drop data import with auto type detection", icon: <Upload className="w-4 h-4" /> },
              { title: "PDF/JPG/PNG Export", desc: "Export dashboards to share with your team", icon: <Download className="w-4 h-4" /> },
              { title: "Generative UI", desc: "Powered by Tambo — AI decides what UI to render", icon: <Sparkles className="w-4 h-4" /> },
            ].map((feat, i) => (
              <Card key={i} className="p-4 border-2 border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2 text-indigo-600">
                  {feat.icon}
                  <h3 className="font-semibold text-slate-900 text-sm">{feat.title}</h3>
                </div>
                <p className="text-xs text-slate-600">{feat.desc}</p>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Footer */}
        <div className="text-center pb-8 pt-4">
          <p className="text-xs text-slate-400">
            Built for the Tambo AI Hackathon &bull; Powered by Tambo Generative UI
          </p>
        </div>
      </div>
    </div>
  );
}
