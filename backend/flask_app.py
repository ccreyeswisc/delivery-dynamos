# flask_app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from urllib.parse import urlencode
import sqlite3
from json import loads
from datetime import datetime
from geopy.geocoders import Nominatim
from dotenv import load_dotenv
from os import getenv
import data_processing as dp

app = Flask(__name__)
CORS(app)

load_dotenv()

# Database connection function
def get_db_connection():
    con = sqlite3.connect('./routes.db')
    con.row_factory = sqlite3.Row
    return con

region = 'na'
apikey = getenv('PC_MILER_API_KEY')

# -----------------------------------------------------------------------------
# Converts an address string to coordinates
@app.route('/api/address-to-coords', methods=['POST'])
def address_to_coords():

    query = loads(request.data.decode('utf8').replace("'", '"'))['query']

    if not query:
        return jsonify({'error': 'Missing query parameter'}), 400

    url = f'https://singlesearch.alk.com/{region}/api/search'
    params = {'apikey': apikey, 'query': query}
    headers = {'Authorization': f'{apikey}', 'Content-type': 'application/json'}

    response = requests.get(url, headers=headers, params=urlencode(params), timeout=10)
    
    if response.status_code != 200:
        return jsonify({'error': 'API request failed'}), response.status_code

    obj = response.json()
    return jsonify(obj['Locations'][0])

# -----------------------------------------------------------------------------
# Gets ZIP codes within a given radius of coordinates
@app.route('/api/radius-zips', methods=['POST'])
def radius_zips():
    query = request.args.get('query', 'all')
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    radius = request.args.get('radius', type=float, default=25.0)

    if not lat or not lng:
        return jsonify({'error': 'Missing lat or lng parameters'}), 400

    url = f'https://pcmiler.alk.com/apis/rest/v1.0/service.svc/poi'
    params = {'apikey': apikey, 'center': f'{lng},{lat}', 'radius': radius, 'poiCategories': query}
    headers = {'Authorization': f'{apikey}', 'Content-type': 'application/json'}

    response = requests.get(url, headers=headers, params=urlencode(params), timeout=10)

    if response.status_code != 200:
        return jsonify({'error': 'API request failed'}), response.status_code

    obj = response.json()
    zip_codes = list(set(x['POILocation']['Address']['Zip'][0:5] for x in obj))

    return jsonify({'zip_codes': zip_codes})

# -----------------------------------------------------------------------------
# Finds places in the database matching given ZIP codes
@app.route('/api/places-in-zip', methods=['POST'])
def places_in_zip():
    data = request.get_json()

    if not data or 'zips' not in data:
        return jsonify({'error': 'Missing ZIP codes list'}), 400

    zips = data['zips']

    conn = get_db_connection()
    cur = conn.cursor()

    placeholders = ', '.join('?' for _ in zips)
    query = f"SELECT * FROM locations WHERE SUBSTR(POSTAL_CODE, 1, 5) IN ({placeholders})"

    cur.execute(query, zips)
    rows = [dict(row) for row in cur.fetchall()]
    
    conn.close()

    return jsonify({'places': rows})


# -----------------------------------------------------------------------------
@app.route('/api/all_routes', methods=['GET'])
def all_routes():
    routes = dp.all_routes()
    return jsonify({'routes' : routes.to_dict(orient="records")})

# -----------------------------------------------------------------------------
@app.route('/api/search_routes', methods=['POST'])
def search_routes():
    
    start_time = datetime.now()

    data = loads(request.data.decode('utf8').replace("'", '"'))
    start_location = data['start_location']
    start_radius = data['start_radius']
    start_pickup_time = data['start_pickup_time']
    start_dropoff_time = data['start_dropoff_time']
    end_location = data['end_location']
    end_radius = data['end_radius']
    end_pickup_time = data['end_pickup_time']
    end_dropoff_time = data['end_dropoff_time']

    # format dates correctly
    format_dates = lambda x: datetime.strptime(x.replace('Z', ''), "%Y-%m-%dT%H:%M:%S.%f")

    start_pickup_time = format_dates(start_pickup_time) if start_pickup_time else None
    start_dropoff_time = format_dates(start_dropoff_time) if start_dropoff_time else None
    end_pickup_time = format_dates(end_pickup_time) if end_pickup_time else None
    end_dropoff_time = format_dates(end_dropoff_time) if end_dropoff_time else None

    filtered_routes = dp.search_routes(start_location, start_radius, start_pickup_time, start_dropoff_time, end_location, end_radius, end_pickup_time, end_dropoff_time)

    print(f'Time to run filtered search: {round((datetime.now() - start_time).total_seconds(), 3)}')
    return jsonify({'routes' : filtered_routes.to_dict(orient='records')})

# -----------------------------------------------------------------------------
@app.route('/receive-user-location', methods=['POST'])
def receive_location():
    data = request.get_json()  # Get JSON data from the request
    lat = data.get('latitude')
    lng = data.get('longitude')
    print(data)
    
    if lat is not None and lng is not None:
        geoLoc = Nominatim(user_agent="GetLoc")

        latlng = str(lat) + ", " + str(lng)
 
        # passing the coordinates to obtain address
        locname = geoLoc.reverse(latlng)
 
        # printing the address/location name
        full_address = locname.address
        print(full_address)

        address_components = full_address.split(',')
        city = address_components[-5]
        county = address_components[-4]
        state = address_components[-3]
        zipcode = address_components[-2]
        country = address_components[-1]


        return jsonify({"message": "Location received", "latitude": lat, "longitude": lng, "city": city, "county": county, 
                        "stat": state, "zipcode": zipcode, "country": country}), 200
    else:
        return jsonify({"error": "Missing latitude or longitude"}), 400

# Default route
@app.route('/')
def home():
    return jsonify({'message': 'This is the default route for the Flask App'}), 200

if __name__ == '__main__':
    app.run(debug=True)