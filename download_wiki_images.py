import requests
import json
import urllib.parse
import sys

# Hand-picked specific wikipedia image pages that are guaranteed to exist and look like the products
image_files = {
    'iphone': 'File:IPhone_14_Pro_vector.svg', # We will query for its PNG translation if possible
    'macbook': 'File:MacBook_Air_M2_Silver.png',
    'cash': 'File:100_USD_notes.jpg',
    'tiago': 'File:2022_Tata_Tiago_XZA%2B_front_20230512.jpg',
    'nexon': 'File:Tata_Nexon_Blue_Dual_Tone.jpg',
    'harrier': 'File:Tata_Buzzard_Sport,_GIMS_2019,_Le_Grand-Saconnex_(GIMS0651).jpg',
    'mercedes': 'File:Mercedes-Benz_W206_1X7A6265.jpg'
}

for key, title in image_files.items():
    # https://en.wikipedia.org/w/api.php?action=query&titles=File:Test.jpg&prop=imageinfo&iiprop=url&format=json
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        r = requests.get(url, headers=headers).json()
        pages = r.get('query', {}).get('pages', {})
        for page_id, page_data in pages.items():
            if 'imageinfo' in page_data:
                # Get the thumburl if it's an svg, or just the url
                info = page_data['imageinfo'][0]
                img_url = info.get('thumburl') if 'thumburl' in info else info.get('url')
                
                print(f"Downloading {key} from {img_url}")
                img_data = requests.get(img_url, headers=headers).content
                with open(f'{key}.jpg', 'wb') as f:
                    f.write(img_data)
                print(f"Saved {key}.jpg")
            else:
                print(f"Could not find imageinfo for {title}")
    except Exception as e:
        print(f"Failed for {title}: {e}")

