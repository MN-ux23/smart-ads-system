import joblib
model = joblib.load("best_place_model.pkl")
joblib.dump(model, "best_place_small.pkl", compress=5)
print("seved")