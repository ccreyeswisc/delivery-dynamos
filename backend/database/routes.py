import sqlite3
con = sqlite3.connect("./routes.db")
cur = con.cursor()

cur.execute("DROP TABLE IF EXISTS routes")
cur.execute("""
CREATE TABLE routes(
    id INT PRIMARY KEY, 
    start_location INT NOT NULL, 
    end_location INT NOT NULL, 
    start_date DATE, 
    end_date DATE,
    route_time INT, 
    route_distance REAL, 
    profit REAL NOT NULL, 
    load_name TEXT NOT NULL, 
    load_weight INT, 
    rpm REAL, 
    pickup_instructions TEXT, 
    dropoff instructions TEXT
)
""")

res = cur.execute("SELECT * FROM routes")
print(res.fetchall())