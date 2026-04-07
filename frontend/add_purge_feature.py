import re

file_path = r'c:\Users\saivi\Desktop\sentinel-aurora\frontend\src\App.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Trash2 to imports
content = content.replace('ExternalLink', 'ExternalLink, Trash2')

# 2. Add purgeIntelligence function after the stats state
purge_fn = """    const purgeIntelligence = () => {
        setPosts([]);
        setStats({ total: 0, positive: 0, negative: 0, neutral: 0 });
        console.log("Global Intelligence Purge Executed.");
    };"""

content = re.sub(r'(const \[stats, setStats\] = useState\(\{[\s\S]*?\}\);)', r'\1\n\n' + purge_fn, content)

# 3. Add the Purge Button in the header
purge_button = """                    <button 
                        onClick={purgeIntelligence}
                        className="px-4 py-2 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center gap-2 group"
                    >
                        <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>Purge Intelligence</span>
                    </button>"""

# Find the Live Connection container
pattern = r'(<div className="mt-4 md:mt-0 flex items-center gap-6">)'
content = re.sub(pattern, r'\1\n' + purge_button, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
