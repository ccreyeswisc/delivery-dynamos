from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import sqlite3
import requests
from urllib.parse import urlencode
from json import loads
import requests
from selenium import webdriver
import folium
import datetime
import time

import data_processing as dp

app = Flask(__name__)
CORS(app)

# Database connection function
def get_db_connection():
    con = sqlite3.connect('./routes.db')
    con.row_factory = sqlite3.Row
    return con

region = 'na'
apikey = '299354C7A83A67439273691EA750BB7F'

# Converts an address string to coordinates
@app.route('/api/address-to-coords', methods=['GET'])
def address_to_coords():
    query = request.args.get('query')

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

# Gets ZIP codes within a given radius of coordinates
@app.route('/api/radius-zips', methods=['GET'])
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

###########################################################################

@app.route('/api/all_routes', methods=['GET'])
def all_routes():
    routes = dp.all_routes()
    return jsonify({'routes' : routes.to_dict(orient="records")})

@app.route('/api/search_routes', methods=['POST'])
def search_routes():
    data = loads(request.data.decode('utf8').replace("'", '"'))
    start_location = data['start_location']
    start_radius = data['start_radius']
    start_pickup_time = data['start_pickup_time']
    start_dropoff_time = data['start_dropoff_time']
    end_location = data['end_location']
    end_radius = data['end_radius']
    end_pickup_time = data['end_pickup_time']
    end_dropoff_time = data['end_dropoff_time']

    # print(data)

    filtered_routes = dp.search_routes(start_location, start_radius, start_pickup_time, start_dropoff_time, end_location, end_radius, end_pickup_time, end_dropoff_time)
    return jsonify({'routes' : filtered_routes.to_dict(orient='records')})

# get the user's current locaiton
def location_coordinates():
    try:
        response = requests.get('https://ipinfo.io')
        data = response.json()
        loc = data['loc'].split(',')
        lat, long = float(loc[0]), float(loc[1])
        city = data.get('city', 'Unknown')
        state = data.get('region', 'Unknown')
        return {'lat': lat, 'long': long, 'city': city, 'state': state}
    except:
        return {'error': 'Internet Not Available'}

# SSE route to send live updates
@app.route('/stream')
def stream():
    def event_stream():
        while True:
            coords = location_coordinates()
            yield f"data: {coords}\n\n"
            time.sleep(5)  # Send updates every 5 seconds

    return Response(event_stream(), mimetype="text/event-stream")


# Default route
@app.route('/')
def home():
    return jsonify({'message': 'This is the default route for the Flask App'}), 200

if __name__ == '__main__':
    app.run(debug=True)