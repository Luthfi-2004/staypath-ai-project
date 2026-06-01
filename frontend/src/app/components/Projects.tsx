import { FolderClock } from "lucide-react";

export function Projects() {
  return (
    <div className="w-full h-[70vh] flex flex-col items-center justify-center fade-in">
      <div className="w-24 h-24 bg-slate-100 text-slate-900 rounded-full flex items-center justify-center mb-6">
        <FolderClock size={48} />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Projects</h1>
      <p className="text-slate-500 text-lg mb-8 text-center max-w-md">
        Project Management & Task Tracking feature is currently under development. Stay tuned!
      </p>
      <div className="px-6 py-2 bg-slate-900 text-white font-bold rounded-full text-sm shadow-md shadow-slate-900/30">
        Coming Soon
      </div>
    </div>
  );
}
