import sys
sys.stdout.reconfigure(encoding='utf-8')
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb+srv://stang:Satang13@cluster0.tah8c.mongodb.net/ohmymov")
db = client['ohmymov']
movies_collection = db['movie']

# Load data
movies_df = pd.DataFrame(list(movies_collection.find()))

# Fill missing values
movies_df = movies_df.fillna({
    'title': '', 'synopsis': '', 'keywords': '', 
    'genres': '', 'year': '', 'cast': '', 'crew': ''
})

# Feature preparation
movies_df['title'] = movies_df['title'].apply(lambda x: ' '.join(x) if isinstance(x, list) else str(x))
movies_df['synopsis'] = movies_df['synopsis'].apply(lambda x: ' '.join(x) if isinstance(x, list) else str(x))
movies_df['keywords'] = movies_df['keywords'].apply(lambda x: ' '.join(x) if isinstance(x, list) else str(x))
movies_df['genres'] = movies_df['genres'].apply(lambda x: ' '.join(x) if isinstance(x, list) else str(x))
movies_df['title'] = movies_df['title'].str.lower().str.strip()
movies_df['synopsis'] = movies_df['synopsis'].str.lower().str.strip()

movies_df['cast'] = movies_df['cast'].apply(lambda x: ' '.join(
    [member['national_name'] + ' ' + ' '.join(member.get('aka_names', [])) for member in x]
) if isinstance(x, list) else '')

movies_df['crew'] = movies_df['crew'].apply(lambda x: ' '.join(
    [str(member['members']) for member in x if isinstance(member, dict) and member.get('role') == 'Director']
) if isinstance(x, list) else '')

# Combined features with weighted emphasis
movies_df['combined_features'] = (
    movies_df['title'] * 3 + ' ' +
    movies_df['keywords'] * 5 + ' ' +
    movies_df['synopsis'] * 3 + ' ' +
    movies_df['genres'] * 10 + ' ' +
    movies_df['cast'] * 2 + ' ' +   
    movies_df['crew'] * 3 + ' ' +  
    movies_df['year'].astype(str)
)


# Vectorization
vectorizer = TfidfVectorizer(
    stop_words='english',
    min_df=2,             
    max_df=0.7,          
    ngram_range=(1, 2)    
)
feature_vectors = vectorizer.fit_transform(movies_df['combined_features'])

# Similarity Calculation
similarity = cosine_similarity(feature_vectors, feature_vectors)

# Recommendations with threshold
THRESHOLD = 0.8  # Ignore low-relevance recommendations

for idx in range(len(movies_df)):
    similarity_score = list(enumerate(similarity[idx]))
    sorted_similar_movies = sorted(similarity_score, key=lambda x: x[1], reverse=True)

    recommended_movies = [
        {
            'movie_id': int(movies_df.iloc[movie[0]]['movie_id']),
            'title': movies_df.iloc[movie[0]]['title'],
            'similarity_score': float(movie[1])
        }
        for movie in sorted_similar_movies
        if movie[0] != idx  
    ][:5]  # Select exactly 5 highest-scoring movies

    movies_collection.update_one(
        {'_id': movies_df.iloc[idx]['_id']},
        {'$set': {'recommendations': recommended_movies}}
    )

print("Recommendations updated successfully!")


