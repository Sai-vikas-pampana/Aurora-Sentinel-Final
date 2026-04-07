import re

file_path = r'c:\Users\saivi\Desktop\sentinel-aurora\frontend\src\App.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the 'Trending Topics' logic from All-Time to Velocity (Moving Window)
# Using a 15-post slice to determine the 'Momentum' of topics hitting the feed.
velocity_logic = """    // Dynamic Velocity-Based Topic Momentum (Moving 15-post Window)
    const trendingTopics = useMemo(() => {
        const counts = {};
        const recentWindow = posts.slice(0, 15); // Velocity Logic: Only look at the current momentum
        recentWindow.forEach(p => counts[p.topic] = (counts[p.topic] || 0) + 1);
        
        return Object.entries(counts)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 4)
            .map(([topic, count]) => ({
                name: topic,
                percentage: recentWindow.length > 0 ? (count / recentWindow.length) * 100 : 0
            }));
    }, [posts]);"""

# Match the old trendingTopics useMemo block
pattern = r'    // Dynamic Trending Topics derived from posts\s*const trendingTopics = useMemo\(\(\) => \{[\s\S]*?\}, \[posts\]\);'
content = re.sub(pattern, velocity_logic, content)

# 2. Update the 'Total Signals' metric to be 'Session Signal Throughput'
# (Industry standard for high-frequency streaming)
sugar_math = r'Total Intelligence Signals</span>'
dynamic_math = r'Session Signal Throughput</span>'
content = re.sub(sugar_math, dynamic_math, content)

# 3. Add 'Signal Intelligence Momentum' to the header indicator
sugar_math_2 = r'Active Stream Processing Phase'
dynamic_math_2 = r'Signal Velocity: {(stats.total / 60).toFixed(1)}Hz / Alpha Stream Pulse'
content = re.sub(sugar_math_2, dynamic_math_2, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
