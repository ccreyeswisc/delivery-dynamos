import sqlite3
import pandas as pd
from tqdm import tqdm
import asyncio
import random
from datetime import datetime

import pc_miler_api as pc

# Cache results of all_routes() after first call
cached_routes = None

# Formats the combined routes/locations data by renaming columns and removing unnecessary columns in place
def format_routes(df: pd.DataFrame) -> None:

    def remove_locations(locations):
        removed_locations_columns = ['LOAD_ID', 'STOP_TYPE', 'ACTIVITY_TYPE', 'CREATED_DATE', 'UPDATED_DATE', 'APPOINTMENT_STATE']
        return [{k : v for k, v in location.items() if k not in removed_locations_columns} for location in locations]

    def rename_locations(locations):
        renamed_locations_columns = {'STOP_ID' : 'stop_id', 'STOP_SEQUENCE' : 'stop_sequence', 'APPOINTMENT_FROM' : 'pickup_time', 	'APPOINTMENT_TO' : 'dropoff_time', 'CITY' : 'city', 'STATE' : 'state', 'POSTAL_CODE' : 'postal_code', 'TIME_ZONE' : 'time_zone', 'COUNTRY' : 'country', 'LOCATION_NAME' : 'location_name', 'ADDRESS_LINE_1' : 'address_line_1', 'ADDRESS_LINE_2' : 'address_line_2'}
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

    # add fake costs for each route
    df['cost'] = None
    for i in range(len(df)):
        df.at[i, 'cost'] = "{:.2f}".format(round(random.random() * 1000, 2))

def save_all_routes() -> None:

    # routes.to_json('./all_routes.json')
    pass

# GET Request for Flask API
def all_routes() -> pd.DataFrame:

    con = sqlite3.connect('./routes.db')
    all_routes_df = pd.read_sql_query('SELECT * FROM routes', con)

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

    global cached_routes
    cached_routes = routes
    
    return routes

async def get_start_info(start_location, start_radius):
    start_coords = await asyncio.to_thread(pc.address_to_coords, start_location)
    start_lat = start_coords['Coords']['Lat']
    start_lng = start_coords['Coords']['Lon']
    start_zips = await asyncio.to_thread(pc.radius_zips, 'all', start_lat, start_lng, start_radius)
    return start_zips

async def get_end_info(end_location, end_radius):
    end_coords = await asyncio.to_thread(pc.address_to_coords, end_location)
    end_lat = end_coords['Coords']['Lat']
    end_lng = end_coords['Coords']['Lon']
    end_zips = await asyncio.to_thread(pc.radius_zips, 'all', end_lat, end_lng, end_radius)
    return end_zips

# POST Request for Flask API
# TODO: Test out date filters and date formatting against frontend date format
def search_routes(start_location: str = None, start_radius: str = None, start_pickup_datetime_threshold: str = None, start_dropoff_datetime_threshold: str = None, end_location: str = None, end_radius: str = None, end_pickup_datetime_threshold: str = None, end_dropoff_datetime_threshold: str = None) -> pd.DataFrame:
    
    # debug_start_time = datetime.now()
    unfiltered_routes = cached_routes if isinstance(cached_routes, pd.DataFrame) else all_routes()
    # print(f'Time to grab all routes: {round((datetime.now() - debug_start_time).total_seconds(), 3)}')

    async def resolve_zip_codes():
        tasks = []
        if start_location and start_radius:
            tasks.append(get_start_info(start_location, start_radius))
        else:
            tasks.append(asyncio.sleep(0, result=None))

        if end_location and end_radius:
            tasks.append(get_end_info(end_location, end_radius))
        else:
            tasks.append(asyncio.sleep(0, result=None))

        return await asyncio.gather(*tasks)

    # debug_start_time = datetime.now()
    start_zips, end_zips = asyncio.run(resolve_zip_codes())
    # print(f'Time to grab start and end zips: {round((datetime.now() - debug_start_time).total_seconds(), 3)}')

    # empty dataframe to fill with filtered routes
    filtered_routes = unfiltered_routes.iloc[0:0].copy()

    def check_dates(start: pd.Series, end: pd.Series, start_pickup_datetime_threshold: str = None, start_dropoff_datetime_threshold: str = None, end_pickup_datetime_threshold: str = None, end_dropoff_datetime_threshold: str = None) -> bool:
        
        format_routes = lambda x: datetime.strptime(x[:26], "%Y-%m-%dT%H:%M:%S.%f")

        start_pickup_time = format_routes(start['pickup_time'])
        start_dropoff_time = format_routes(start['dropoff_time'])
        end_pickup_time = format_routes(end['pickup_time'])
        end_dropoff_time = format_routes(end['dropoff_time'])

        start_pickup_time_check = False
        start_dropoff_time_check = False
        end_pickup_time_check = False
        end_dropoff_time_check = False

        if start_pickup_datetime_threshold is None or start_pickup_datetime_threshold < start_pickup_time:
            start_pickup_time_check = True

        if start_dropoff_datetime_threshold is None or start_dropoff_datetime_threshold > start_dropoff_time:
            start_dropoff_time_check = True

        if end_pickup_datetime_threshold is None or end_pickup_datetime_threshold < end_pickup_time:
            end_pickup_time_check = True

        if end_dropoff_datetime_threshold is None or end_dropoff_datetime_threshold > end_dropoff_time:
            end_dropoff_time_check = True

        return start_pickup_time_check and start_dropoff_time_check and end_pickup_time_check and end_dropoff_time_check

    for index, row in tqdm(unfiltered_routes.iterrows(), total=len(unfiltered_routes), desc='Filtering Routes'):

        # Grab pickup and dropoff locations
        stops = row['stops']
        start, end = stops[0], stops[-1]

        start_postal_code = start['postal_code'][0:5]
        end_postal_code = end['postal_code'][0:5]

        if start_zips and start_postal_code not in start_zips:
            continue
        
        if end_zips and end_postal_code not in end_zips:
            continue

        if not check_dates(start, end, start_pickup_datetime_threshold, start_dropoff_datetime_threshold, end_dropoff_datetime_threshold, end_dropoff_datetime_threshold):
            continue

        filtered_routes.loc[len(filtered_routes)] = row

    return filtered_routes

if __name__ == '__main__':

    # routes = all_routes()
    # print(routes.loc[0].to_dict())

    ############################################

    start_location = 'Madison, WI'
    start_radius = '50.0'
    # start_day = '03-01-2025'

    end_location = 'Chicago, IL'
    end_radius = '50.0'
    # end_day = '03-02-2025'

    mad_to_chi = search_routes(start_location=start_location, start_radius=start_radius, end_location=end_location, end_radius=end_radius).to_dict(orient="records")
    print(mad_to_chi)