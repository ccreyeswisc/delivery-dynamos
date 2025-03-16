import sqlite3
import pandas as pd

def check_connection(dp_path: str) -> sqlite3.Connection:
    con = sqlite3.connect(dp_path)
    return con

def create_df(xlsx_path):
    """ Create a Pandas.DataFrame from an .xlsx file. """
    return pd.read_excel(xlsx_path)

def create_table(df, db_path, table_name):
    """ Create a table in SQLite from the columns in the data frame. """
    
    # Open a connection to the SQLite database
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    # Drop table if it exists
    cur.execute(f'DROP TABLE IF EXISTS {table_name}')
    
    # Dynamically create the table based on the column names and types in the xlsx
    columns = ", ".join([f"{col} TEXT" for col in df.columns])  # Assuming all columns are text type for simplicity

    # Create the table
    cur.execute(f'CREATE TABLE {table_name} ({columns})')
    con.commit()

def insert(df, con, cur, table_name):
    """ Insert data from the xlsx into the SQLite table. """
    
    # Generate the insert statement
    insert_query = f"INSERT INTO {table_name} ({', '.join(df.columns)}) VALUES ({', '.join(['?' for _ in df.columns])})"
    
    # Insert each row from the DataFrame
    for row in df.itertuples(index=False, name=None):
        cur.execute(insert_query, row)
    con.commit()


def fetch_rows(cur, table_name):
    """ Fetch and print row counts from a table. """

    query = cur.execute(f"SELECT COUNT(*) FROM {table_name}")
    return query.fetchall()[0][0]

def fetch_first(cur, table_name):
    """ Fetch and print first row values and column names from a table. """

    query = cur.execute(f"SELECT * FROM {table_name} LIMIT 1")
    return query