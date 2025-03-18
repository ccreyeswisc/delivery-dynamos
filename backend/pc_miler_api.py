import sqlite3

import requests
from urllib.parse import urlencode

con = sqlite3.connect('./routes.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

region = 'na'
apikey = '299354C7A83A67439273691EA750BB7F'

# Finds the coordinates of a string search of (City, State)
def address_to_coords(query: str) -> dict:

    url = f'https://singlesearch.alk.com/{region}/api/search'

    params = {
        'apikey' : apikey, 
        'query' : query
    }

    headers = {
        'Authorization': f'{apikey}',
        'Content-type': 'application/json'
    }
    response = requests.get(url, headers=headers, params=urlencode(params), timeout=10)
    obj = response.json()
    return obj['Locations'][0]

# Grabs all ZIP codes within `radius` miles of a coordinate pair
def radius_zips(query: str, lat: str, lng: str, radius: float) -> dict:

    url = f'https://pcmiler.alk.com/apis/rest/v1.0/service.svc/poi'

    currentLonLat = f'{lng},{lat}'

    params = {
        'apikey' : apikey, 
        'center' : currentLonLat, 
        'radius' : radius, 
        'poiCategories' : query
    }

    headers = {
        'Authorization': f'{apikey}',
        'Content-type': 'application/json'
    }
    response = requests.get(url, headers=headers, params=urlencode(params), timeout=10)
    obj = response.json()
    zip_codes = [x['POILocation']['Address']['Zip'][0:5] for x in obj]

    return list(set(zip_codes))

# Finds all Locations from the SQLite database that match any of the zip codes in `zips`
def places_in_zip(zips: list[str]) -> list[dict]:
    zips_str = ', '.join(f"'{z}'" for z in zips)
    placeholders = ', '.join('?' for _ in zips)

    query = cur.execute(f"SELECT * FROM locations WHERE SUBSTR(POSTAL_CODE, 1, 5) IN ({placeholders})", (zips))

    rows = [dict(row) for row in query.fetchall()]

    return rows

if __name__ == "__main__":
    location = 'Madison, WI'
    query = 'all'

    address = address_to_coords(location)

    lat, lng = address['Coords']['Lat'], address['Coords']['Lon']
    radius_miles = 25.0

    zips = radius_zips(query, lat, lng, radius_miles)

    places = places_in_zip(zips)
    print(zips)