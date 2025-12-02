#creates a compressed version
# using joblib to reduce the file size for faster deployment and loading
import joblib
model = joblib.load("best_place_model.pkl")
joblib.dump(model, "best_place_small.pkl", compress=5)
print("seved")