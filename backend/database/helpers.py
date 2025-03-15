import sqlite3
import pandas as pd

def check_connection(dp_path: str) -> sqlite3.Connection:
    con = sqlite3.connect(dp_path)
    return con

def create_locations(xlsx_path, db_path):
    """ Create a table in SQLite from the columns in the xlsx file. """
    
    # Read the data from the xlsx file
    df = pd.read_excel(xlsx_path)
    
    # Open a connection to the SQLite database
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    
    # Dynamically create the table based on the column names and types in the xlsx
    columns = ", ".join([f"{col} TEXT" for col in df.columns])  # Assuming all columns are text type for simplicity
    create_table_query = f"CREATE TABLE IF NOT EXISTS locations ({columns})"
    
    # Create the table
    cur.execute(create_table_query)
    con.commit()
    
    return con, df

def insert_locations(df, con, cur):
    """ Insert data from the xlsx into the SQLite table. """
    
    # Generate the insert statement
    insert_query = f"INSERT INTO locations ({', '.join(df.columns)}) VALUES ({', '.join(['?' for _ in df.columns])})"
    
    # Insert each row from the DataFrame
    for row in df.itertuples(index=False, name=None):
        cur.execute(insert_query, row)
    con.commit()


def fetch_locations(cur):
    """ Fetch and print all data from the locations table. """

    query = cur.execute("SELECT COUNT(*) FROM locations")
    return query.fetchall()[0][0]





def create_routes(xlsx_path, db_path):
    """ Create a table in SQLite from the columns in the xlsx file. """
    
    # Read the data from the xlsx file
    df = pd.read_excel(xlsx_path)
    
    # Open a connection to the SQLite database
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    
    # Dynamically create the table based on the column names and types in the xlsx
    columns = ", ".join([f"{col} TEXT" for col in df.columns])  # Assuming all columns are text type for simplicity
    create_table_query = f"CREATE TABLE IF NOT EXISTS routes ({columns})"
    
    # Create the table
    cur.execute(create_table_query)
    con.commit()
    
    return con, df

def insert_routes(df, con, cur):
    """ Insert data from the xlsx into the SQLite table. """
    
    # Generate the insert statement
    insert_query = f"INSERT INTO routes ({', '.join(df.columns)}) VALUES ({', '.join(['?' for _ in df.columns])})"
    
    # Insert each row from the DataFrame
    for row in df.itertuples(index=False, name=None):
        cur.execute(insert_query, row)
    con.commit()


def fetch_routes(cur):
    """ Fetch and print all data from the locations table. """

    query = cur.execute("SELECT COUNT(*) FROM routes")
    return query.fetchall()[0][0]