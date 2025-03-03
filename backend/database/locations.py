import sqlite3
con = sqlite3.connect("./locations.db")
cur = con.cursor()

cur.execute("""
CREATE TABLE locations(
    id INT PRIMARY KEY, 
    name TEXT NOT NULL, 
    latitude REAL NOT NULL, 
    longitude REAL NOT NULL, 
    pickup INT NOT NULL
)
""")

res = cur.execute("SELECT * FROM locations")
print(res.fetchall())