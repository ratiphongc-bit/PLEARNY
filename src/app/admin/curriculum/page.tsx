import { Plus, GripVertical, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCurriculum() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Curriculum Management</h1>
          <p className="text-slate-500 mt-1">Manage grades, domains, and skills</p>
        </div>
        <Button className="bg-primary text-white gap-2">
          <Plus className="w-4 h-4" /> Add Grade
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex gap-4 text-sm font-bold text-slate-500">
          <div className="w-8"></div>
          <div className="flex-1">Grade Level / Domain</div>
          <div className="w-32 text-center">Skills</div>
          <div className="w-32 text-center">Status</div>
          <div className="w-24 text-right">Actions</div>
        </div>

        {/* Grade Rows */}
        <div className="divide-y divide-slate-100">
          {/* Grade 4 */}
          <div className="p-4 flex items-center gap-4 bg-white hover:bg-slate-50 transition-colors group">
            <div className="w-8 text-slate-300 cursor-grab hover:text-slate-500">
              <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                G4
              </div>
              <span className="font-bold text-slate-800">Grade 4 Mathematics</span>
            </div>
            <div className="w-32 text-center text-slate-600 font-medium">42 Skills</div>
            <div className="w-32 text-center">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Active</span>
            </div>
            <div className="w-24 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 text-slate-400 hover:text-primary"><Edit2 className="w-4 h-4" /></button>
              <button className="p-1 text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Sub Domains for Grade 4 */}
          <div className="bg-slate-50/50 p-0">
            <div className="pl-16 pr-4 py-3 flex items-center gap-4 border-t border-slate-100 hover:bg-slate-50 transition-colors group">
              <div className="flex-1 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-700">Multiplication & Division</span>
              </div>
              <div className="w-32 text-center text-slate-500 text-sm">12 Skills</div>
              <div className="w-32 text-center"></div>
              <div className="w-24 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 text-slate-400 hover:text-primary"><Edit2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="pl-16 pr-4 py-3 flex items-center gap-4 border-t border-slate-100 hover:bg-slate-50 transition-colors group">
              <div className="flex-1 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-700">Fractions</span>
              </div>
              <div className="w-32 text-center text-slate-500 text-sm">8 Skills</div>
              <div className="w-32 text-center"></div>
              <div className="w-24 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 text-slate-400 hover:text-primary"><Edit2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Grade 5 */}
          <div className="p-4 flex items-center gap-4 bg-white hover:bg-slate-50 transition-colors group">
            <div className="w-8 text-slate-300 cursor-grab hover:text-slate-500">
              <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                G5
              </div>
              <span className="font-bold text-slate-800">Grade 5 Mathematics</span>
            </div>
            <div className="w-32 text-center text-slate-600 font-medium">48 Skills</div>
            <div className="w-32 text-center">
              <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">Draft</span>
            </div>
            <div className="w-24 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 text-slate-400 hover:text-primary"><Edit2 className="w-4 h-4" /></button>
              <button className="p-1 text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
