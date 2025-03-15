import sqlite3
import pathlib
import os
import pandas as pd
import locations


def check_connection(dp_path: str) -> sqlite3.Connection:
    connection = sqlite3.connect(dp_path)
    return connection


if __name__ == "__main__":

    local_xlsx_path = "./loadstopDump.xlsx"
    local_db_path = "./locations.db"

    check_connection(local_db_path)

    # Create the table from the xlsx file
    con, df = locations.create_table(local_xlsx_path, local_db_path)

    for col in df:
        print(col)
    
    # # Insert the data into the SQLite table
    # locations.insert_data(df, con)
    
    # # Fetch and display locations data from SQLite
    # print("Locations data from the database:")
    # locations.fetch_data(con)
    
    # Close the SQLite connection
    con.close()