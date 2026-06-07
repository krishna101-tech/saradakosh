import urllib.request
import re
import html
import sys

url = "https://gemini.google.com/share/ef669af6299e"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
        
    # Gemini share links often store the content in huge JSON strings.
    # Let's try to find code blocks.
    # Code blocks might be encoded as \u003c ( < ) etc or raw.
    
    # Try to unescape unicode escapes
    content = content.encode('utf-8').decode('unicode_escape', 'ignore')
    
    # Look for common code block markers or just long strings.
    code_blocks = re.findall(r'```[a-zA-Z]*\n(.*?)\n```', content, re.DOTALL)
    if not code_blocks:
        # try searching for standard class names or generic HTML
        code_blocks = re.findall(r'class=[\'"](.*?)[\'"]', content)
        
    with open('gemini_code.txt', 'w', encoding='utf-8') as f:
        f.write("Extracted Content:\n\n")
        # Try to find the prompt
        prompts = re.findall(r'\"(.*?)\"', content)
        for p in prompts:
            if len(p) > 100 and '{' not in p and '<' not in p:
                f.write("Possible Text:\n" + p + "\n\n")
                
        f.write("\nCode blocks found:\n")
        for i, block in enumerate(code_blocks):
            f.write(f"--- Block {i} ---\n{block}\n\n")
            
    print("Extraction complete. Check gemini_code.txt")
except Exception as e:
    print(f"Error: {e}")
