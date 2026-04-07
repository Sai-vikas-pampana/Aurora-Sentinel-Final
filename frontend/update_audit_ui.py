import re

file_path = r'c:\Users\saivi\Desktop\sentinel-aurora\frontend\src\App.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

audit_block = """                                                     <div className="mb-4 flex items-center gap-3 p-2.5 bg-white/5 rounded-2xl border border-white/5">
                                                         <div className="flex-1 space-y-1">
                                                             <div className="flex justify-between items-center text-[7px] uppercase tracking-widest text-slate-500 font-black">
                                                                 <span>L1 VADER Baseline</span>
                                                                 <span>{(post.audit.l1_vader * 100).toFixed(0)}%</span>
                                                             </div>
                                                             <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden">
                                                                 <div className="h-full bg-indigo-500/30 rounded-full transition-all duration-1000" style={{ width: `${post.audit.l1_vader * 100}%` }}></div>
                                                             </div>
                                                         </div>
                                                         <div className="flex-1 space-y-1 border-l border-white/5 pl-3">
                                                             <div className="flex justify-between items-center text-[7px] uppercase tracking-widest text-slate-500 font-black">
                                                                 <span>L2 RoBERTa Pulse</span>
                                                                 <span>{(post.audit.l2_roberta * 100).toFixed(0)}%</span>
                                                             </div>
                                                             <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden">
                                                                 <div className="h-full bg-emerald-500/30 rounded-full transition-all duration-1000" style={{ width: `${post.audit.l2_roberta * 100}%` }}></div>
                                                             </div>
                                                         </div>
                                                         {post.audit.l3_ollama === 'VERIFIED_BY_OLLAMA' && (
                                                             <div className="px-2 py-1 bg-indigo-500/20 rounded-lg flex items-center gap-1 border border-indigo-500/30 animate-pulse">
                                                                 <Shield className="w-2.5 h-2.5 text-indigo-400" />
                                                                 <span className="text-[7px] font-black text-indigo-400">L3 OLLAMA VERIFIED</span>
                                                             </div>
                                                         )}
                                                     </div>"""

# Match the <p> tag with its content
pattern = r'(<p className="text-\[13px\] leading-relaxed text-slate-300 font-medium mb-3">\s*\{post\.text\}\s*<\/p>)'
new_content = re.sub(pattern, rf'\1\n{audit_block}', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
