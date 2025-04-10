import sqlite3

con = sqlite3.connect('./routes.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

route = cur.execute('SELECT * FROM routes LIMIT 1').fetchall()
for row in [dict(row) for row in route]:
    print(row)

location = cur.execute('SELECT * FROM locations LIMIT 1').fetchall()
for row in [dict(row) for row in location]:
    print(row)