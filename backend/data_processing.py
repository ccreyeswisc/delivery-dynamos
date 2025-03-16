import sqlite3
import pandas as pd
import json
import pc_miler_api as pc

con = sqlite3.connect('./routes.db')
cur = con.cursor()
all_routes_df = pd.read_sql_query('SELECT * FROM routes', con)
# print(len(all_routes_df))

# Formats the combined routes/locations data by renaming columns and removing unnecessary columns in place
def format_routes(df: pd.DataFrame) -> None:

    def remove_locations(locations):
        removed_locations_columns = ['LOAD_ID', 'STOP_TYPE', 'ACTIVITY_TYPE', 'CREATED_DATE', 'UPDATED_DATE']
        return [{k : v for k, v in location.items() if k not in removed_locations_columns} for location in locations]

    def rename_locations(locations):
        renamed_locations_columns = {'STOP_ID' : 'stop_id', 'STOP_SEQUENCE' : 'stop_sequence', 'APPOINTMENT_FROM' : 'pickup_time', 	'APPOINTMENT_TO' : 'dropoff_time', 'CITY' : 'city', 'STATE' : 'state', 'POSTAL_CODE' : 'postal_code', 'TIME_ZONE' : 'time_zone', 'COUNTRY' : 'country', 'LOCATION_NAME' : 'location_name', 'ADDRESS_LINE_1' : 'address_line_1', 'ADDRESS_LINE_2' : 'address_line_2', 'APPOINTMENT_STATE' : 'state'}
        return [{renamed_locations_columns.get(k, k) : v for k, v in location.items()} for location in locations]
 
    # remove redundant Routes columns
    removed_routes_columns = ['POSTING_STATUS', 'SOURCE_SYSTEM', 'HAS_APPOINTMENTS', 'DISTANCE_UOM', 'WEIGHT_UOM', 'TRANSPORT_MODE', 'CREATED_DATE', 'UPDATED_DATE', 'MANAGED_EQUIPMENT', 'LOAD_NUMBER_ALIAS', 'IS_CARB', 'FPC', 'FPO', 'DIVISION', 'CAPACITY_TYPE', 'EXTENDED_NETWORK']
    df.drop(columns=removed_routes_columns, inplace=True)

    # remove redundant Locations columns
    df['stops'] = df['stops'].apply(remove_locations)

    # rename Routes column headers
    renamed_routes_columns = {'LOAD_ID' : 'load_id', 'TOTAL_DISTANCE' : 'total_distance', 'TOTAL_WEIGHT' : 'total_weight', 'NUMBER_OF_STOPS' : 'number_of_stops', 'IS_HAZARDOUS' : 'hazardous', 'IS_HIGH_VALUE' : 'high_value', 'IS_TEMPERATURE_CONTROLLED' : 'temperature_controlled'}
    df.rename(columns=renamed_routes_columns, inplace=True)

    # rename Locations column headers
    df['stops'] = df['stops'].apply(rename_locations)


# GET Request for Flask API
def all_routes():

    # grab all Locations from the locations table
    all_locations_df = pd.read_sql_query('SELECT * FROM locations', con)

    # remove duplicates and sort values by LOAD_ID and STOP_SEQUENCE
    sorted_locations = all_locations_df.drop_duplicates(subset=['LOAD_ID', 'STOP_SEQUENCE'], keep='first').sort_values(by=['LOAD_ID', 'STOP_SEQUENCE'])
    
    # group each set of locations based on their LOAD_ID
    locations_grouped = sorted_locations.groupby('LOAD_ID').apply(lambda x: x.to_dict(orient='records')).reset_index()
    locations_grouped.columns = ['LOAD_ID', 'stops']

    # merge each set of locations into a column on the routes_df and return
    routes = all_routes_df.merge(locations_grouped, on='LOAD_ID', how='inner')

    # process the resulting df to remove unnecessary columns and rename columns
    format_routes(routes)
    
    return routes

# POST Request for Flask API
def search_routes(start_lng, start_lat, start_radius, start_day, end_lng, end_lat, end_radius, end_day):
    pass

routes = all_routes()

print(routes.loc[0].to_dict())