"use client";

import { useState } from "react";
import { Sparkles, Settings2, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminAIGenerator() {
  const [generating, setGenerating] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setComplete(true);
    }, 3000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          AI Question Generator
        </h1>
        <p className="text-slate-500 mt-1">Batch generate questions using AI and curriculum data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Settings2 className="w-5 h-5 text-slate-400" />
              Generation Parameters
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Grade Level</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>Grade 4</option>
                  <option>Grade 5</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Skill</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>Multiplication</option>
                  <option>Division</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Difficulty (1-5)</label>
                <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Basic</span>
                  <span>Advanced</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Context / Theme</label>
                <input type="text" placeholder="e.g. Fantasy Adventure, Space" defaultValue="Fantasy Adventure" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Number of Questions</label>
                <input type="number" defaultValue="10" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <Button 
              className="w-full mt-6 gap-2" 
              onClick={handleGenerate}
              disabled={generating || complete}
            >
              {generating ? (
                <>Generating... <span className="animate-spin text-xl">⏳</span></>
              ) : complete ? (
                <>Generated <CheckCircle2 className="w-4 h-4" /></>
              ) : (
                <>Generate Questions <Sparkles className="w-4 h-4" /></>
              )}
            </Button>
            
            {complete && (
              <Button variant="outline" className="w-full mt-2" onClick={() => setComplete(false)}>
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Preview & Validation Pipeline
              </h2>
              {complete && (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  10 Questions Ready
                </span>
              )}
            </div>
            
            <div className="p-6 flex-1 bg-slate-50/50">
              {generating ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6 text-slate-400">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <div className="space-y-2 text-center text-sm font-medium">
                    <p className="animate-pulse text-primary">Generating math problems...</p>
                    <p className="opacity-50">Applying Fantasy Adventure context...</p>
                    <p className="opacity-25">Validating difficulty constraints...</p>
                  </div>
                </div>
              ) : complete ? (
                <div className="space-y-4">
                  {/* Generated Question Mock */}
                  <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm relative">
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm">
                      ✓
                    </div>
                    <div className="flex gap-2 mb-3">
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Grade 4</span>
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Multiplication</span>
                      <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Diff: 3</span>
                    </div>
                    <p className="text-slate-800 font-medium text-sm leading-relaxed mb-4">
                      <strong>Context:</strong> &quot;Build the Dragon Bridge&quot;
                      <br/>
                      <strong>Setup:</strong> A bridge requires pieces of wood. The total length is 24m. Each piece is 3m.
                      <br/>
                      <strong>Question:</strong> How many pieces of wood are needed?
                    </p>
                    <div className="flex gap-2">
                      <div className="bg-rose-50 text-rose-700 px-3 py-1 rounded-md text-sm border border-rose-100">6</div>
                      <div className="bg-rose-50 text-rose-700 px-3 py-1 rounded-md text-sm border border-rose-100">7</div>
                      <div className="bg-green-50 text-green-700 px-3 py-1 rounded-md text-sm font-bold border border-green-200">8 (Correct)</div>
                      <div className="bg-rose-50 text-rose-700 px-3 py-1 rounded-md text-sm border border-rose-100">9</div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white">
                    Send to Validation Queue
                  </Button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="text-6xl mb-4 opacity-20">🤖</div>
                  <p>Configure parameters and click Generate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
