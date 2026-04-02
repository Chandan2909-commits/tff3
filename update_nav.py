import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
new_nav = """<ul class="nav-links" id="nav-links">
        <li><a href="index.html" class="nav-link">Home</a></li>
        <li><a href="trading_rules.html" class="nav-link">Trading Rules</a></li>
        <li><a href="affiliate_program.html" class="nav-link">Affiliates</a></li>
        <li><a href="#" class="nav-link">Contact Us</a></li>
      </ul>"""

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    # replace the ul block
    new_content = re.sub(r'<ul class="nav-links" id="nav-links">.*?</ul>', new_nav, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file, 'w') as f:
            f.write(new_content)
        print(f"Updated {file}")

