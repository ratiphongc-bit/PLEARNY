import { BarChart3, Database, Users, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Students", value: "24,592", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
          { title: "Active Skills", value: "128", icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
          { title: "Question Bank", value: "14,025", icon: Database, color: "text-amber-500", bg: "bg-amber-50" },
          { title: "Avg Accuracy", value: "82.4%", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-50" },
        ].map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="text-slate-500 text-sm font-medium">{stat.title}</div>
            <div className="text-2xl font-black text-slate-800">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Recent AI Generations</h2>
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm">
                  <th className="p-4 font-medium border-b border-slate-100">Batch ID</th>
                  <th className="p-4 font-medium border-b border-slate-100">Topic</th>
                  <th className="p-4 font-medium border-b border-slate-100">Questions</th>
                  <th className="p-4 font-medium border-b border-slate-100">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "B-842", topic: "Grade 4 Fractions", q: 50, status: "Pending Review", sColor: "text-amber-600 bg-amber-50 border-amber-200" },
                  { id: "B-841", topic: "Grade 3 Multiplication", q: 100, status: "Approved", sColor: "text-green-600 bg-green-50 border-green-200" },
                  { id: "B-840", topic: "Grade 5 Division", q: 20, status: "Rejected", sColor: "text-rose-600 bg-rose-50 border-rose-200" },
                  { id: "B-839", topic: "Grade 1 Addition", q: 150, status: "Approved", sColor: "text-green-600 bg-green-50 border-green-200" },
                ].map((row) => (
                  <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 text-sm font-medium text-slate-700">{row.id}</td>
                    <td className="p-4 text-sm text-slate-600">{row.topic}</td>
                    <td className="p-4 text-sm text-slate-600">{row.q}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold border ${row.sColor}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
              Generate Questions
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors flex justify-between">
              Review Pending 
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">12</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
              Upload PDF Textbook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
