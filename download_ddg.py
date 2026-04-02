import requests
import re
import urllib.parse

def search_image(query):
    print(f"Searching for {query}")
    url = 'https://html.duckduckgo.com/html/?q=' + urllib.parse.quote(query + ' filetype:jpg OR filetype:png')
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    try:
        r = requests.get(url, headers=headers)
        # Look for image links in the page
        links = re.findall(r'href="([^"]+\.jpg|[^"]+\.png)"', r.text, re.IGNORECASE)
        # DDG proxy links usually look like ?u=...
        proxy_links = re.findall(r'//external-content\.duckduckgo\.com/iu/\?u=([^&]+)', r.text)
        if proxy_links:
            # decode the proxy link
            img_url = urllib.parse.unquote(proxy_links[0])
            return img_url
    except Exception as e:
        print(f"Error: {e}")
    return None

queries = {
    'iphone': 'iPhone 14 transparent png isolated',
    'macbook': 'Macbook Air M2 isolated png',
    'cash': '$1500 cash stack transparent png',
    'tiago': 'Tata Tiago red car white background',
    'nexon': 'Tata Nexon front view clear background',
    'harrier': 'Tata Harrier SUV 2023',
    'mercedes': 'Mercedes C class W206 isolated transparent'
}

for key, q in queries.items():
    img_url = search_image(q)
    if img_url:
        print(f"Found {key}: {img_url}")
        try:
            ext = 'png' if 'png' in img_url.lower() else 'jpg'
            res = requests.get(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            if res.status_code == 200:
                with open(f'{key}.{ext}', 'wb') as f:
                    f.write(res.content)
                print(f"Saved {key}.{ext}")
            else:
                print(f"Failed to fetch {img_url}")
        except:
            print("Failed to save.")
    else:
        print(f"No image found for {key}")
