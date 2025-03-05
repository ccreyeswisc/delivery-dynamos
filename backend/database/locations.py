import sqlite3
import pandas as pd

def create_table(xlsx_path, db_path):
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


def insert_data(df, con):
    """ Insert data from the xlsx into the SQLite table. """
    cur = con.cursor()
    
    # Generate the insert statement
    insert_query = f"INSERT INTO locations ({', '.join(df.columns)}) VALUES ({', '.join(['?' for _ in df.columns])})"
    
    # Insert each row from the DataFrame
    for row in df.itertuples(index=False, name=None):
        cur.execute(insert_query, row)
    con.commit()


def fetch_data(con):
    """ Fetch and print all data from the locations table. """
    cur = con.cursor()
    cur.execute("SELECT * FROM locations")
    rows = cur.fetchall()
    for row in rows:
        print(row)

# con = sqlite3.connect("./locations.db")
# cur = con.cursor()

# cur.execute("""
# CREATE TABLE locations(
#     id INT PRIMARY KEY, 
#     name TEXT NOT NULL, 
#     latitude REAL NOT NULL, 
#     longitude REAL NOT NULL, 
#     pickup INT NOT NULL
# )
# """)

# res = cur.execute("SELECT * FROM locations")
# print(res.fetchall())