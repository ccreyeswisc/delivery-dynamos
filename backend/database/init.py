import helpers

def init_locations():
    locations_xlsx_path = "./locations.xlsx"
    locations_db_path = "./locations.db"

    helpers.check_connection(locations_db_path)

    # Create the table from the xlsx file
    locations_con, locations_df = helpers.create_locations(locations_xlsx_path, locations_db_path)
    locations_cur = locations_con.cursor()

    # Insert the data into the SQLite table
    helpers.insert_locations(locations_df, locations_con, locations_cur)

    # Fetch and display locations data from SQLite
    num_location_rows = helpers.fetch_locations(locations_cur)
    print(f"Locations data successfully loaded {num_location_rows} rows.")
    

    # Close the SQLite connection
    locations_con.close()

def init_routes():
    routes_xlsx_path = "./routes.xlsx"
    routes_db_path = "./routes.db"

    helpers.check_connection(routes_db_path)

    # Create the table from the xlsx file
    routes_con, routes_df = helpers.create_routes(routes_xlsx_path, routes_db_path)
    routes_cur = routes_con.cursor()

    # Insert the data into the SQLite table
    helpers.insert_routes(routes_df, routes_con, routes_cur)

    # Fetch and display routes data from SQLite
    num_routes_rows = helpers.fetch_routes(routes_cur)
    print(f"Routes data successfully loaded {num_routes_rows} rows.")

    # Close the SQLite connection
    routes_con.close()

if __name__ == "__main__":
    init_locations()
    init_routes()