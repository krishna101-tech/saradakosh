from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__)
DB_PATH = 'c:/Saradakosh antigravity/saradakosh.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

# API Routes
@app.route('/api/events', methods=['GET'])
def get_events():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 50))
    offset = (page - 1) * limit
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM events ORDER BY sequence LIMIT ? OFFSET ?', (limit, offset))
    events = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute('SELECT COUNT(*) FROM events')
    total = cursor.fetchone()[0]
    conn.close()
    
    return jsonify({'data': events, 'total': total, 'page': page, 'limit': limit})

@app.route('/api/parameters', methods=['GET'])
def get_parameters():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM parameters')
    params = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(params)

if __name__ == '__main__':
    # Running locally for the Admin CMS
    app.run(debug=True, port=5000)
