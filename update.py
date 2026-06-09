import re

file_path = r'c:\Users\shubh\OneDrive\Desktop\Major project\src\components\IotMonitor.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    '#070b10': 'var(--bg-app)',
    '#0a0f14': 'var(--bg-sidebar)',
    '#0d1117': 'var(--bg-card)',
    '#0f2a1a': 'var(--bg-card-selected)',
    '#161d26': 'var(--bg-inner)',
    '#1e293b': 'var(--border-main)',
    '#334155': 'var(--border-light)',
    '#64748b': 'var(--text-subtitle)',
    '#94a3b8': 'var(--text-label)',
    '#475569': 'var(--text-muted)',
    '"white"': '"var(--text-title)"',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Add imports
content = content.replace('import { Activity, AlertTriangle } from "lucide-react";', 'import { Activity, AlertTriangle, Sun, Moon } from "lucide-react";')

# Add state
func_start = 'export default function IotMonitor() {\n'
func_new = 'export default function IotMonitor() {\n  const [isDarkMode, setIsDarkMode] = useState(true);\n'
content = content.replace(func_start, func_new)

# Add class to main div
main_div_old = 'return (\n    <div style={{'
main_div_new = 'return (\n    <div className={`iot-container ${isDarkMode ? "dark" : "light"}`} style={{'
content = content.replace(main_div_old, main_div_new)

# Update style
style_new = """<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .iot-container {
          --bg-app: #070b10;
          --bg-sidebar: #0a0f14;
          --bg-card: #0d1117;
          --bg-card-selected: #0f2a1a;
          --bg-inner: #161d26;
          --border-main: #1e293b;
          --border-light: #334155;
          --text-title: white;
          --text-subtitle: #64748b;
          --text-label: #94a3b8;
          --text-muted: #475569;
        }
        .iot-container.light {
          --bg-app: #f8fafc;
          --bg-sidebar: #ffffff;
          --bg-card: #ffffff;
          --bg-card-selected: #f0fdf4;
          --bg-inner: #f1f5f9;
          --border-main: #e2e8f0;
          --border-light: #cbd5e1;
          --text-title: #0f172a;
          --text-subtitle: #64748b;
          --text-label: #475569;
          --text-muted: #94a3b8;
        }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: var(--bg-card); }
        ::-webkit-scrollbar-thumb { background: var(--border-main); border-radius: 3px; }
        .nav-item { transition: all 0.2s ease; }
        .nav-item:hover { background: var(--bg-card-selected) !important; }
      `}</style>"""
style_regex = re.compile(r'<style>\{`.*?`\}</style>', re.DOTALL)
content = style_regex.sub(style_new, content)

# Inject Toggle Button
top_bar_old = '</div>\n            <div style={{ display: "flex", gap: 8 }}>'
top_bar_new = """</div>
            <div style={{ display: "flex", gap: 8, alignItems: 'center' }}>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                style={{ 
                  background: "var(--bg-inner)", 
                  border: "1px solid var(--border-main)", 
                  padding: "6px 12px", 
                  borderRadius: "8px", 
                  color: "var(--text-title)", 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px",
                  marginRight: "12px"
                }}
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
              <div style={{ display: "flex", gap: 8 }}>"""

content = content.replace(top_bar_old, top_bar_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Script executed successfully')
