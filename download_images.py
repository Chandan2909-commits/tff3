import requests
import json
import urllib.parse
import sys

items = {
    'iphone': 'iPhone 13',
    'macbook': 'MacBook Air M2',
    'cash': 'Stack of United States dollar bills',
    'tiago': 'Tata Tiago',
    'nexon': 'Tata Nexon',
    'harrier': 'Tata Harrier',
    'mercedes': 'Mercedes-Benz W206'
}

def get_wiki_image(search_term):
    url = f"https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles={urllib.parse.quote(search_term)}"
    try:
        r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}).json()
        pages = r.get('query', {}).get('pages', {})
        for page_id, page_data in pages.items():
            if 'original' in page_data:
                return page_data['original']['source']
    except Exception as e:
        print(f"Failed for {search_term}: {e}")
    return None

for key, term in items.items():
    img_url = get_wiki_image(term)
    if img_url:
        print(f"Downloading {key} from {img_url}")
        try:
            img_data = requests.get(img_url).content
            ext = img_url.split('.')[-1].lower()
            if ext not in ['jpg', 'jpeg', 'png', 'webp', 'gif']:
                ext = 'jpg'
            with open(f'{key}.{ext}', 'wb') as f:
                f.write(img_data)
            print(f"Saved {key}.{ext}")
        except Exception as e:
            print(f"Error saving {key}: {e}")
    else:
        print(f"Could not find image for {term}")

