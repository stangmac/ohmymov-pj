# ======================== IMPORTS ========================
import pandas as pd
import numpy as np
from lightfm import LightFM
from lightfm.data import Dataset
from pymongo import MongoClient
from sklearn.cluster import DBSCAN
from collections import Counter
from collections import defaultdict
from sklearn.model_selection import train_test_split
from bson import ObjectId
import ast

# ======================== CONNECT TO MONGODB ========================
client = MongoClient('mongodb+srv://stang:Satang13@cluster0.tah8c.mongodb.net/ohmymov')
db = client['ohmymov']
movie_collection = db['movie']
group_collection = db['test_group']  # ✅ ยังใช้ได้ถ้ายังต้องการจัดเก็บกลุ่ม
user_collection = db['users']  # ✅ เปลี่ยนจาก test_user → users

# ======================== HELPER: Get Movie Titles ========================
def get_movie_names(movie_ids):
    movies = movie_collection.find({"movie_id": {"$in": movie_ids}}, {"movie_id": 1, "title": 1})
    movie_lookup = {str(doc["movie_id"]): doc["title"] for doc in movies}
    return [movie_lookup.get(str(mid), "Unknown Title") for mid in movie_ids]
# ======================== LOAD USER BEHAVIOR FROM users COLLECTION ========================
user_data = list(user_collection.find({}, {"_id": 1, "like": 1, "dislike": 1, "wishlist": 1, "seen": 1}))
action_weights = {"like": 2, "dislike": -1, "wishlist": 0.5, "seen": 1}
records = []

for user in user_data:
    user_id = str(user["_id"])
    for action, weight in action_weights.items():
        for movie_id in user.get(action, []):
            records.append({
                "userId": user_id,
                "movieId": str(movie_id),
                "interaction": weight
            })

df = pd.DataFrame(records)
if df.empty:
    raise Exception("❌ No user activity from users collection.")


# ======================== LOAD MOVIES ========================
movies = list(movie_collection.find({}, {"_id": 1, "movie_id": 1, "title": 1, "genres": 1, "year": 1, "recommendations": 1}))
movies_df = pd.DataFrame(movies)
movies_df['_id'] = movies_df['_id'].astype(str)
movies_df['movie_id'] = movies_df['movie_id'].astype(str)
def parse_genres(genres):
    if isinstance(genres, list):
        return genres
    elif isinstance(genres, str):
        try:
            return ast.literal_eval(genres)  # แปลง string เป็น list
        except:
            return []
    return []

movies_df['genres_list'] = movies_df['genres'].apply(parse_genres)
# ======================== LIGHTFM DATASET ========================
dataset = Dataset()
dataset.fit((x for x in df['userId']), (x for x in df['movieId']))
(interactions, weights) = dataset.build_interactions(
    ((row['userId'], row['movieId'], row['interaction']) for _, row in df.iterrows())
)

# ======================== ITEM FEATURES ========================
recommended_movie_ids = set()
for movie in movies_df.itertuples():
    if isinstance(movie.recommendations, list):
        recs = [str(rec.get('movie_id')) for rec in movie.recommendations if 'movie_id' in rec]
        recommended_movie_ids.update(recs)

# Collect all unique movie IDs including those inside recommendations
all_movie_ids = set(df['movieId'].unique())

for movie in movies_df.itertuples():
    all_movie_ids.add(str(movie.movie_id))
    if isinstance(movie.recommendations, list):
        rec_ids = [str(rec.get('movie_id')) for rec in movie.recommendations if 'movie_id' in rec]
        all_movie_ids.update(rec_ids)

# Register all movie IDs in LightFM's dataset
dataset.fit_partial(items=all_movie_ids)

item_features_tuples = []
for movie in movies_df.itertuples():
    base_id = str(movie.movie_id)
    if isinstance(movie.recommendations, list):
        recs = [str(rec.get('movie_id')) for rec in movie.recommendations if 'movie_id' in rec]
        for r in recs:
            item_features_tuples.append((base_id, [r]))

item_features_matrix = dataset.build_item_features(item_features_tuples)

# ======================== TRAIN-TEST SPLIT ========================
train, test = train_test_split(df, test_size=0.2, random_state=42)
train_interactions, _ = dataset.build_interactions(((row['userId'], row['movieId'], row['interaction']) for _, row in train.iterrows()))
test_interactions, _ = dataset.build_interactions(((row['userId'], row['movieId'], row['interaction']) for _, row in test.iterrows()))

# ======================== TRAIN LIGHTFM MODEL ========================
model = LightFM(loss='warp')
model.fit(train_interactions, item_features=item_features_matrix, epochs=30, num_threads=1)
print("Model training completed.")

# ======================== USER CLUSTERING ========================
user_vectors = model.user_embeddings
inv_user_id_map = {v: k for k, v in dataset._user_id_mapping.items()}
user_ids = [inv_user_id_map[i] for i in range(len(inv_user_id_map))]

user_vectors = model.user_embeddings
cluster_assignments = DBSCAN(eps=0.5, min_samples=2).fit_predict(user_vectors)

cluster_df = pd.DataFrame({
    'userId': user_ids,
    'cluster': cluster_assignments
})


# ======================== CLUSTER LABELS ========================
from collections import Counter

df['movieId'] = df['movieId'].astype(str)
movies_df['movie_id'] = movies_df['movie_id'].astype(str)

merged_df = df.merge(movies_df, left_on='movieId', right_on='movie_id', how='left')
print(movies_df['movie_id'])
print(df['movieId'])


def generate_cluster_labels(cluster_df, df, movies_df):
    genre_labels = {}

    for cluster_num in cluster_df['cluster'].unique():
        if cluster_num == -1:
            genre_labels[cluster_num] = "outliers"
            continue

        users = cluster_df[cluster_df['cluster'] == cluster_num]['userId'].tolist()
        cluster_activity = df[(df['userId'].isin(users)) & (df['interaction'] > 0)]

        merged = cluster_activity.merge(
            movies_df[['genres_list', '_id']],
            left_on='movieId',
            right_on='_id',
            how='left'
        )

        all_genres = []
        for genres in merged['genres_list']:
            if isinstance(genres, list):
                all_genres.extend(genres)

        # Count genre frequencies
        genre_counter = Counter(all_genres)
        most_common_genres = genre_counter.most_common(2)

        if most_common_genres:
            label = " & ".join([genre for genre, _ in most_common_genres]).lower() + " fans"
        else:
            label = f"cluster_{cluster_num}"

        genre_labels[cluster_num] = label


    return genre_labels

cluster_labels = generate_cluster_labels(cluster_df, df, movies_df)
print(cluster_labels)

# ======================== SAVE GROUPS ========================
for cluster_num, label in cluster_labels.items():
    users_str_ids = cluster_df[cluster_df['cluster'] == cluster_num]['userId'].tolist()
    user_docs = user_collection.find({"_id": {"$in": [ObjectId(uid) for uid in users_str_ids]}}, {"_id": 1})
    user_object_ids = [user["_id"] for user in user_docs]
    group_collection.insert_one({
        "group": label,  # ✅ use genre label here, NOT "cluster0"
        "users": user_object_ids
    })

# ======================== GET USER RECOMMENDATIONS ========================

def get_user_recommendations(user_id, top_n=20):
    if user_id not in dataset._user_id_mapping:
        print(f"User {user_id} not found in the dataset.")
        return []

    user_index = dataset._user_id_mapping[user_id]
    movie_ids = list(dataset._item_id_mapping.keys())
    seen_movies = df[df['userId'] == user_id]['movieId'].tolist()

    scores = model.predict(user_index, np.arange(len(movie_ids)), item_features=item_features_matrix)
    scored_df = pd.DataFrame({'movieId': movie_ids, 'score': scores})
    scored_df = scored_df[~scored_df['movieId'].isin(seen_movies)].sort_values(by='score', ascending=False)

    top = scored_df.head(top_n)

    try:
        top_ids_obj = []
        for mid in top['movieId']:
            if ObjectId.is_valid(mid):
                top_ids_obj.append(ObjectId(mid))
            else:
                print(f"⚠️ Invalid ObjectId: {mid}")
    except Exception as e:
        print(f"Error converting movieId to ObjectId: {e}")
        return []

    docs = movie_collection.find(
        {"_id": {"$in": top_ids_obj}},
        {"_id": 1, "movie_id": 1, "title": 1, "genres": 1}
    )
    movie_lookup = {
        str(doc["_id"]): {
            "recommend_id": str(doc["_id"]),
            "movie_id": doc.get("movie_id"),
            "title": doc.get("title", "Unknown"),
            "genres": doc.get("genres", [])
        } for doc in docs
    }

    cluster = cluster_df[cluster_df['userId'] == user_id]['cluster'].values[0]
    group_label = cluster_labels.get(cluster, "Unknown Group")

    genre_groups = defaultdict(list)

    for mid, score in zip(top['movieId'], top['score']):
        movie_data = movie_lookup.get(mid, {})
        if movie_data:
            genres = movie_data.get("genres", ["others"])
            for genre in genres[:1]:  # ใช้ genre แรกเท่านั้น หรือแก้เป็น `for genre in genres:` ถ้าจะใส่ทุก genre
                genre_groups[genre.lower()].append({
                    "recommend_id": movie_data["recommend_id"],
                    "movie_id": movie_data["movie_id"],
                    "title": movie_data["title"],
                    "similarity_score": float(score)
                })

    recommendations = []
    for genre, movies in genre_groups.items():
        recommendations.append({
            "group_name": f"{genre} fans",
            "movies": movies[:5]  # จำกัด 5 เรื่องต่อกลุ่ม
        })

    return recommendations

# ======================== UPDATE USER RECOMMENDATIONS IN DB ========================

def update_user_recommendations(user_id, recommendations):
    if not recommendations:
        print(f"User {user_id} has no recommendations to update.")
        return

    try:
        user_obj_id = ObjectId(user_id)
    except Exception as e:
        print(f"Invalid user_id format: {user_id} – {e}")
        return

    result = user_collection.update_one(
        {"_id": user_obj_id},
        {"$set": {"Recommend": recommendations}},
        upsert=False  # Avoid creating a new doc by mistake
    )

    if result.matched_count == 0:
        print(f"❌ No user found with _id {user_id}")
    elif result.modified_count == 0:
        print(f"⚠️ User {user_id} found but recommendations were not changed.")
    else:
        print(f"✅ User {user_id} recommendations updated successfully.")

# ======================== RECOMMEND FOR ALL USERS ========================
user_ids = df['userId'].unique()
for user_id in user_ids:
    recommendations = get_user_recommendations(user_id)
    update_user_recommendations(user_id, recommendations)  # Update recommendations in DB

print("\n📊 === สรุปผลการแนะนำหนัง ===")
for user_id in user_ids[:5]:  # ทดสอบแค่ 5 คนก่อน (จะได้ไม่เยอะเกินไป)
    print(f"\n👤 User: {user_id}")
    recommendations = get_user_recommendations(user_id)
    if not recommendations:
        print("⚠️ ไม่พบคำแนะนำ")
        continue
    for group in recommendations:
        print(f"\n🎯 กลุ่ม: {group['group_name']}")
        for i, rec in enumerate(group["movies"], start=1):
            print(f"{i}. {rec['title']} (Score: {rec['similarity_score']:.2f})")
