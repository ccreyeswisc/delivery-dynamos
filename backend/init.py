# init.py

import helpers
import pc_miler_api as pc
import pandas as pd
import sqlite3
from tqdm import tqdm

# -----------------------------------------------------------------------------
# coordinates of each location for each stop is not natively in dataset
# this function pre-processes all coordinates for each location
def get_location_coords(df: pd.DataFrame) -> None:
    df['latitude'] = None
    df['longitude'] = None

    for idx, row in tqdm(df.iterrows(), total=df.shape[0], desc="Adding Coordinates to Location Data"):
        # ADDRESS_LINE_1, CITY, STATE POSTAL_CODE
        address_line = row['ADDRESS_LINE_1']
        city = row['CITY']
        state = row['STATE']
        postal_code = row['POSTAL_CODE']
        address = f'{address_line}, {city}, {state} {postal_code}'

        data = pc.address_to_coords(address)

        if not data or not data['Locations'] or not data['Locations'][0]:
            df.at[idx, 'latitude'] = None
            df.at[idx, 'longitude'] = None
            continue

        latitude = data['Locations'][0]['Coords']['Lat']
        longitude = data['Locations'][0]['Coords']['Lon']
        
        df.at[idx, 'latitude'] = latitude
        df.at[idx, 'longitude'] = longitude

if __name__ == '__main__':
    locations_xlsx_path = './data/locations.xlsx'
    routes_xlsx_path = './data/routes.xlsx'
    db_path = './routes.db'

    con = helpers.check_connection(db_path)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    # Create pandas dataframes from .xlsx files
    locations_df = helpers.create_df(locations_xlsx_path)
    routes_df = helpers.create_df(routes_xlsx_path)

    # For each row in locations_df, use PC Miler API to get the address's coordinates
    get_location_coords(locations_df)

    # Create the tables from the dataframes
    helpers.create_table(locations_df, db_path, 'locations')
    helpers.create_table(routes_df, db_path, 'routes')
    
    # Insert the data into the SQLite table
    helpers.insert(locations_df, con, cur, 'locations')
    helpers.insert(routes_df, con, cur, 'routes')

    # Fetch and display locations data from SQLite
    num_location_rows = helpers.fetch_rows(cur, 'locations')
    first_location_row = helpers.fetch_first(cur, 'locations')
    print(f'Locations data successfully loaded {num_location_rows} rows.')
    print('Location Data:')
    for row in [dict(row) for row in first_location_row]:
        print(row)

    num_routes_rows = helpers.fetch_rows(cur, 'routes')
    first_routes_row = helpers.fetch_first(cur, 'routes')
    print(f'Routes data successfully loaded {num_routes_rows} rows.')
    print('Routes Data:')
    for row in [dict(row) for row in first_routes_row]:
        print(row)
    
    # Close the SQLite connection
    con.close()