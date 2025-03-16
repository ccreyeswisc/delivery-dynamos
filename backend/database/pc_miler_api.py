import requests
from urllib.parse import urlencode

region = 'na'
apikey = '299354C7A83A67439273691EA750BB7F'

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
    return obj

def radius_locations(query: str, lat: str, lng: str, radius: float) -> dict:

    url = f'https://singlesearch.alk.com/{region}/api/search'

    lng_str = str(lng).replace('.', '')
    lat_str = str(lat).replace('.', '')
    currentLonLat = f'{lng_str},{lat_str}'

    params = {
        'apikey' : apikey, 
        'query' : query, 
        'currentLonLat' : currentLonLat, 
        'radiusFromCurrentLonLat' : radius
    }

    headers = {
        'Authorization': f'{apikey}',
        'Content-type': 'application/json'
    }
    response = requests.get(url, headers=headers, params=urlencode(params), timeout=10)
    obj = response.json()
    print(obj)

    return obj

def main():
    city = 'Madison'
    state = 'WI'
    query = f'city:{city} state:{state}'

    address = address_to_coords('Madison, WI')['Locations'][0]

    lat, lng = address['Coords']['Lat'], address['Coords']['Lon']
    radius = 10.0

    places = radius_locations(query, lat, lng, radius)

if __name__ == "__main__":
    main()