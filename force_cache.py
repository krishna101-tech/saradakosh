import os
import re

def bust_cache():
    for root, _, files in os.walk('.'):
        for file in files:
            if file.endswith('.py') or file.endswith('.html'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = re.sub(r'css/style_main\.css\?v=\d+', 'css/style_main.css?v=14', content)
                new_content = re.sub(r'css/style\.css\?v=\d+', 'css/style_main.css?v=14', new_content)
                new_content = re.sub(r'css/style\.css', 'css/style_main.css?v=14', new_content)
                new_content = re.sub(r'css/style_main\.css"', 'css/style_main.css?v=14"', new_content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Busted cache in {filepath}")

if __name__ == '__main__':
    bust_cache()
