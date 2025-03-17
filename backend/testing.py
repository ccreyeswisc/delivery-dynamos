import sqlite3

con = sqlite3.connect('./routes.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

query = cur.execute('SELECT * FROM locations LIMIT 1').fetchall()
for row in [dict(row) for row in query]:
    print(row)