import re;
with open('src/app/storytelling/StorytellingClient.js', 'r', encoding='utf-8') as f:
    text = f.read()

replacements = {
    'bg-stone-950': 'bg-bg-theme',
    'text-stone-100': 'text-text-theme',
    'text-stone-200': 'text-text-theme',
    'text-stone-300': 'text-text-theme/90',
    'text-stone-400': 'text-text-theme/70',
    'text-amber-500': 'text-quotes-accent',
    'text-amber-600': 'text-quotes-accent',
    'bg-amber-600': 'bg-quotes-accent',
    'bg-amber-500': 'bg-quotes-accent',
    'from-amber-600 via-amber-400 to-yellow-500': 'from-quotes-accent via-quotes-accent to-quotes-accent',
    'border-white/5': 'border-glass-border',
    'border-white/10': 'border-glass-border',
    'border-white/20': 'border-glass-border',
    'bg-stone-900': 'bg-bg-theme/90',
    'bg-stone-950/65': 'bg-bg-theme/80',
    'from-stone-950': 'from-bg-theme',
    'to-stone-950': 'to-bg-theme',
    'via-[#1f160e]': 'via-bg-theme/95',
    'selection:bg-amber-600': 'selection:bg-quotes-accent',
    'selection:text-white': 'selection:text-bg-theme',
    'bg-white': 'bg-quotes-accent',
}

for old, new in replacements.items():
    text = text.replace(old, new)

# Remove the thick gradient progress bar in favor of a 1px brass hairline (Udbodhan design)
text = text.replace('h-[3px] bg-gradient-to-r from-quotes-accent via-quotes-accent to-quotes-accent', 'h-[1px] bg-quotes-accent')

with open('src/app/storytelling/StorytellingClient.js', 'w', encoding='utf-8') as f:
    f.write(text)
print('Done replacing.')
