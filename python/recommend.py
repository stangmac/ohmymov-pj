# ======================== IMPORTS ========================
import pandas as pd
import numpy as np
from lightfm import LightFM
from lightfm.data import Dataset
from pymongo import MongoClient
from sklearn.cluster import DBSCAN
from collections import Counter, defaultdict
from sklearn.model_selection import train_test_split
from bson import ObjectId
import ast

# ===== เชื่อมต่อ MongoDB =====
client = MongoClient('mongodb+srv://stang:Satang13@cluster0.tah8c.mongodb.net/ohmymov')
db = client["ohmymov"]
user_collection = db["users"]
movie_collection = db["movies"]
group_collection = db["user_groups"]

# ===== โหลดพฤติกรรมผู้ใช้ =====
print("🔄 Loading user behaviors...")
user_behaviors = []
action_weights = {'seen': 1, 'like': 2, 'dislike': -1, 'wishlist': 0.5}

for user in user_collection.find({}, {"_id": 1, "like": 1, "dislike": 1, "seen": 1, "wishlist": 1}):
    user_id = str(user['_id'])
    for action in ['like', 'dislike', 'seen', 'wishlist']:
        for movie_oid in user.get(action, []):
            movie_id_str = str(movie_oid)
            user_behaviors.append({
                'userId': user_id,
                'movieId': movie_id_str,
                'action': action,
                'interaction': action_weights[action]
            })

df = pd.DataFrame(user_behaviors)
df = df.groupby(['userId', 'movieId']).sum().reset_index()
print(f"✅ Loaded {len(df)} user-movie interactions.")
print(df.head())

# ===== โหลดข้อมูลภาพยนตร์ =====
print("\n🔄 Loading movie data...")
movies = list(movie_collection.find({}, {"_id": 1, "movie_id": 1, "title": 1, "genres": 1, "recommendations": 1}))
movies_df = pd.DataFrame(movies)
print(f"✅ Loaded {len(movies_df)} movies.")
print(movies_df[['title', 'genres']].head())

# ===== เตรียม Dataset ให้ LightFM =====
print("\n📦 Preparing LightFM dataset...")
dataset = Dataset()
user_ids = df['userId'].unique().tolist()
movie_ids = df['movieId'].unique().tolist()
dataset.fit((x for x in user_ids), (x for x in movie_ids))

(interactions, weights) = dataset.build_interactions(((row['userId'], row['movieId'], row['interaction']) for _, row in df.iterrows()))
print(f"✅ Interaction matrix shape: {interactions.shape}")

item_features_matrix = dataset.build_item_features(((row['movieId'], []) for _, row in df.iterrows()))
print("✅ Item features built.")

# ===== ฝึก Model =====
print("\n🚀 Training model...")
train, _ = train_test_split(df, test_size=0.2, random_state=42)
train_interactions, _ = dataset.build_interactions(((row['userId'], row['movieId'], row['interaction']) for _, row in train.iterrows()))

model = LightFM(loss='warp')
model.fit(train_interactions, item_features=item_features_matrix, epochs=30, num_threads=4)
print("✅ Model training completed.")

# ===== Clustering ผู้ใช้ =====
print("\n🔍 Clustering users...")
inv_user_id_map = {v: k for k, v in dataset._user_id_mapping.items()}
user_ids = [inv_user_id_map[i] for i in range(len(inv_user_id_map))]
user_vectors = model.user_embeddings
cluster_assignments = DBSCAN(eps=0.5, min_samples=2).fit_predict(user_vectors)
cluster_df = pd.DataFrame({'userId': user_ids, 'cluster': cluster_assignments})
print(f"✅ Clusters found: {Counter(cluster_assignments)}")
print(cluster_df.head())

# ===== สร้าง label สำหรับ cluster =====
def generate_cluster_labels(cluster_df, df, movies_df):
    cluster_labels = {}
    for cluster_id in cluster_df['cluster'].unique():
        if cluster_id == -1:
            continue
        users_in_cluster = cluster_df[cluster_df['cluster'] == cluster_id]['userId'].tolist()
        cluster_data = df[df['userId'].isin(users_in_cluster)]
        top_movies = cluster_data.groupby('movieId').sum().sort_values(by='interaction', ascending=False).head(5)
        top_genres = []

        for movie_id in top_movies.index:
            movie_row = movies_df[movies_df['_id'] == ObjectId(movie_id)]
            if not movie_row.empty:
                top_genres.extend(movie_row.iloc[0].get('genres', []))

        genre_counts = pd.Series(top_genres).value_counts()
        label = ", ".join(genre_counts.head(2).index.tolist()) if not genre_counts.empty else "Unknown"
        cluster_labels[cluster_id] = label
    return cluster_labels

print("\n🧠 Generating cluster labels...")
cluster_labels = generate_cluster_labels(cluster_df, df, movies_df)
print("✅ Cluster labels:", cluster_labels)

# ===== บันทึกลง MongoDB =====
print("\n💾 Saving user groups to MongoDB...")
group_collection.delete_many({})
for cluster_num, label in cluster_labels.items():
    users_str_ids = cluster_df[cluster_df['cluster'] == cluster_num]['userId'].tolist()
    user_docs = user_collection.find({"_id": {"$in": [ObjectId(uid) for uid in users_str_ids]}}, {"_id": 1})
    user_object_ids = [user["_id"] for user in user_docs]
    group_collection.insert_one({"group": label, "users": user_object_ids})
print("✅ User groups saved.")

# ===== แนะนำกลุ่มให้ผู้ใช้ =====
def get_user_recommendations_by_groups(user_id):
    user_group = cluster_df[cluster_df['userId'] == user_id]['cluster'].values
    if len(user_group) == 0 or user_group[0] == -1:
        return []
    cluster_id = user_group[0]
    label = cluster_labels.get(cluster_id, "Unknown")
    return [{"group_name": label, "score": 1.0}]

print("\n📢 Updating recommendations for users...")
for user_id in df['userId'].unique():
    recs = get_user_recommendations_by_groups(user_id)
    print(f"👤 User {user_id} → Recommendations: {[r['group_name'] for r in recs]}")
    user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"Recommend": recs}}
    )
print("✅ Recommendations updated.")
