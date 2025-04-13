import requests
from selenium import webdriver
import folium
import datetime
import time
from geopy.geocoders import Nominatim # Used for obtaining address
import geocoder
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the CORS package; used for tracking location

app = Flask(__name__)
CORS(app)

@app.route('/receive-location', methods=['POST'])
def receive_location():
    data = request.get_json()  # Get JSON data from the request
    lat = data.get('latitude')
    lng = data.get('longitude')
    print(data)
    
    if lat is not None and lng is not None:
        # Process the coordinates (e.g., save to database, use in API call, etc.)

        # calling the nominatim tool
        geoLoc = Nominatim(user_agent="GetLoc")

        latlng = str(lat) + ", " + str(lng)
 
        # passing the coordinates
        locname = geoLoc.reverse(latlng)
 
        # printing the address/location name
        print(locname.address)

        return jsonify({"message": "Location received", "latitude": lat, "longitude": lng}), 200
    else:
        return jsonify({"error": "Missing latitude or longitude"}), 400

if __name__ == "__main__":
    app.run(debug=True)

# # this method will return us our actual coordinates
# # using our ip address

# def locationCoordinates():
#     try:
#         # calling the nominatim tool
#         geoLoc = Nominatim(user_agent="GetLoc")
#         g = geocoder.ip('me')
#         if g.latlng:
#             lat, lng = g.latlng
#             coords = str(lat) + ", " + str(lng)
#             locname = geoLoc.reverse(coords)
#             loc = locname.address
#             return loc
#         else:
#             return "Location not found"

#         # Based on IP Address
#         # response = requests.get('https://ipinfo.io')
#         # data = response.json()
#         # loc = data['loc'].split(',')
#         # lat, long = float(loc[0]), float(loc[1])
#         # city = data.get('city', 'Unknown')
#         # state = data.get('region', 'Unknown')
#         return lat, long, city, state
#         # return lat, long
#     except:
#         # Displaying ther error message
#         print("Internet Not avialable")
#         # closing the program
#         exit()
#         return False


# # this method will fetch our coordinates and create a html file
# # of the map
# def gps_locator():

#     obj = folium.Map(location=[0, 0], zoom_start=2)

#     try:
#         print(locationCoordinates())
#         # lat, long, city, state = locationCoordinates()
#         # print("You Are in {},{}".format(city, state))
#         # print("Your latitude = {} and longitude = {}".format(lat, long))
#         # folium.Marker([lat, long], popup='Current Location').add_to(obj)

#         fileName = "/Users/caseyreyes/cs620/delivery-dynamos/backend/Location" + \
#             str(datetime.date.today()) + ".html"

#         obj.save(fileName)

#         return fileName

#     except:
#         return False


# # Main method
# if __name__ == "__main__":

#     print("---------------GPS Using Python---------------\n")

#     # function Calling
#     page = gps_locator()
#     print("\nOpening File.............")
#     dr = webdriver.Chrome()
#     dr.get(page)
#     time.sleep(30)
#     dr.quit()
#     print("\nBrowser Closed..............")