from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import logging
import os
import json
import csv
from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import logging
import os
import json
import csv

app = Flask(__name__)
CORS(app)
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.DEBUG)
logging.basicConfig(level=logging.DEBUG)

# Replace with your actual API keys and tokens
YOUTUBE_API_KEY = "AIzaSyD5IazXt8bGXsfTuLGVl08-TSuhP8eAbj8"  # Your YouTube API key
INSTAGRAM_CLIENT_ID = "1464038514233566"  # Your Instagram App ID
INSTAGRAM_CLIENT_SECRET = "c9cca2ee6e3056fd95a0ef61a194da147"  # Your Instagram App Secret
INSTAGRAM_REDIRECT_URI = "http://localhost:5000/auth/instagram/callback"  # Redirect URI
INSTAGRAM_ACCESS_TOKEN = ""  # Placeholder for the Instagram access token
GOOGLE_SEARCH_API_KEY = "AIzaSyD5IazXt8bGXsfTuLGVl08-TSuhP8eAbj8"  # Your Google Search API key
CUSTOM_SEARCH_ENGINE_ID = "873b42cca10ac4126"  # Your Custom Search Engine ID
# Replace with your actual API keys and tokens
YOUTUBE_API_KEY = "AIzaSyD5IazXt8bGXsfTuLGVl08-TSuhP8eAbj8"  # Your YouTube API key
INSTAGRAM_CLIENT_ID = "1464038514233566"  # Your Instagram App ID
INSTAGRAM_CLIENT_SECRET = "c9cca2ee6e3056fd95a0ef61a194da147"  # Your Instagram App Secret
INSTAGRAM_REDIRECT_URI = "http://localhost:5000/auth/instagram/callback"  # Redirect URI
INSTAGRAM_ACCESS_TOKEN = ""  # Placeholder for the Instagram access token
GOOGLE_SEARCH_API_KEY = "AIzaSyD5IazXt8bGXsfTuLGVl08-TSuhP8eAbj8"  # Your Google Search API key
CUSTOM_SEARCH_ENGINE_ID = "873b42cca10ac4126"  # Your Custom Search Engine ID

def get_youtube_data(username):
    url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername={username}&key={YOUTUBE_API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data["pageInfo"]["totalResults"] > 0:
            return data
        else:
            return {"error": "No YouTube channel found"}
    else:
        return {"error": "Failed to retrieve YouTube data"}

def get_instagram_data(user_id):
    url = f"https://graph.instagram.com/{user_id}?fields=id,username,account_type,media_count&access_token={INSTAGRAM_ACCESS_TOKEN}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to retrieve Instagram data"}

def get_google_search_country(username):
    query = f"{username} instagram country"
    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={GOOGLE_SEARCH_API_KEY}&cx={CUSTOM_SEARCH_ENGINE_ID}"
    response = requests.get(url)
    if response.status_code == 200:
        results = response.json()
        if "items" in results:
            snippet = results["items"][0]["snippet"]
            # Improved parsing logic to extract country information
            words = snippet.split()
            country_candidates = ["USA", "Canada", "UK", "India", "Australia", "Germany"]  # Example list, add more as needed
            country = next((word for word in words if word in country_candidates), "Unknown")
            return country
        else:
            return "Country not found"
    else:
        return {"error": "Failed to retrieve country data"}

def scrape_tiktok_data(username):
    try:
        url = f"https://www.tiktok.com/@{username}"
        logging.info(f"Requesting URL: {url}")
        response = requests.get(url)
        if response.status_code != 200:
            logging.error(f"Failed to retrieve data from {url}. Status code: {response.status_code}")
            raise ValueError("Failed to retrieve data")

        soup = BeautifulSoup(response.text, 'html.parser')
        user_data = {
            "country": "Unknown",
            "tiktok": url,
            "photo": "https://example.com/photo.jpg"  # Placeholder
        }
        logging.info(f"Scraped TikTok user data: {user_data}")
        return user_data

    except Exception as e:
        logging.exception("Error scraping TikTok user data")
        raise

@app.route('/auth/instagram')
def instagram_auth():
    auth_url = f"https://api.instagram.com/oauth/authorize?client_id={INSTAGRAM_CLIENT_ID}&redirect_uri={INSTAGRAM_REDIRECT_URI}&scope=user_profile,user_media&response_type=code"
    return redirect(auth_url)

@app.route('/auth/instagram/callback')
def instagram_callback():
    code = request.args.get('code')
    token_url = f"https://api.instagram.com/oauth/access_token"
    payload = {
        'client_id': INSTAGRAM_CLIENT_ID,
        'client_secret': INSTAGRAM_CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'redirect_uri': INSTAGRAM_REDIRECT_URI,
        'code': code
    }
    response = requests.post(token_url, data=payload)
    if response.status_code == 200:
        access_token = response.json().get('access_token')
        logging.info(f"Instagram Access Token: {access_token}")
        global INSTAGRAM_ACCESS_TOKEN
        INSTAGRAM_ACCESS_TOKEN = access_token
        return jsonify({"access_token": access_token})
    else:
        return jsonify({"error": "Failed to retrieve access token"}), 400

@app.route('/scrape', methods=['POST'])
def scrape():
    data = request.get_json()
    logging.debug(f"Received data: {data}")
    username = data.get('username')
    if not username:
        logging.error("Username is required")
        return jsonify({"error": "Username is required"}), 400

    try:
        # Get YouTube data
        youtube_data = get_youtube_data(username)
        # Get Instagram data (assume user_id is same as username for demo purposes)
        instagram_data = get_instagram_data(username)
        # Get country using Google Search API
        country_data = get_google_search_country(username)
        # Scrape TikTok data
        tiktok_data = scrape_tiktok_data(username)

        user_data = {
            "country": country_data,
            "instagram": instagram_data,
            "youtube": youtube_data,
            "tiktok": tiktok_data,
            "photo": "https://example.com/photo.jpg"  # Placeholder
        }
        logging.info(f"Aggregated user data: {user_data}")
        return jsonify(user_data)

    except Exception as e:
        logging.error(f"Failed to scrape user data for username: {username}. Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and (file.filename.endswith('.json') or file.filename.endswith('.csv')):
        filepath = os.path.join("/tmp", file.filename)
        file.save(filepath)
        users = []
        if file.filename.endswith('.json'):
            with open(filepath) as f:
                users = json.load(f)
        elif file.filename.endswith('.csv'):
            with open(filepath) as f:
                reader = csv.DictReader(f)
                users = list(reader)
        os.remove(filepath)
        return jsonify({"message": "File uploaded successfully", "users": users}), 200
    else:
        return jsonify({"error": "Unsupported file type"}), 400

if __name__ == '__main__':
    app.run(debug=True)

# ... (keep all the existing functions)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Here you would typically check the credentials
        # For now, we'll just return a success message
        return jsonify({"message": "Login successful"})
    return render_template('login.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

# ... (keep all the existing routes)
if __name__ == '__main__':
    app.run(debug=True)
