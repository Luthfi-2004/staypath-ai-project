from flask import Flask, request, jsonify
from flask_cors import CORS
import keras
import tensorflow as tf
import json
import os

# ── Custom Layer (harus identik dengan saat training) ─────────────────────────
@tf.keras.utils.register_keras_serializable(package="Custom")
class FeatureGateLayer(tf.keras.layers.Layer):
    def __init__(self, units, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.gate_dense = tf.keras.layers.Dense(units, activation="sigmoid")

    def call(self, inputs):
        gate = self.gate_dense(inputs)
        return inputs * gate

    def get_config(self):
        config = super().get_config()
        config.update({"units": self.units})
        return config

# ── Init app ───────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ── Load model ─────────────────────────────────────────────────────────────────
print("Memuat model AI... (Tunggu sebentar)")
model = tf.keras.models.load_model(
    'staypath_ai_clean.keras',
    custom_objects={'FeatureGateLayer': FeatureGateLayer}
)

with open('metadata.json', 'r') as f:
    metadata = json.load(f)

print("✅ Model siap!")

# ── Endpoint prediksi ──────────────────────────────────────────────────────────
@app.route('/api/predict-risk', methods=['POST'])
def predict_risk():
    try:
        data = request.json
        threshold = metadata.get('best_threshold', 0.59)

        feature_dict = {
            "numeric": [[
                float(data.get(col, metadata['num_medians'].get(col, 0.0)))
                for col in metadata['numeric_cols']
            ]]
        }

        for col in metadata['categorical_cols']:
            val = str(data.get(col, metadata['cat_modes'].get(col, 'Unknown')))
            feature_dict[col] = tf.constant([val])

        prediction = model.predict(feature_dict, verbose=0)
        risk_score = float(prediction.ravel()[0])

        if risk_score >= threshold:
            risk_level = "High"
        elif risk_score >= 0.40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return jsonify({
            "status":         "success",
            "predicted_risk": risk_level,
            "risk_score":     round(risk_score, 4)
        })

    except Exception as e:
        print("Error prediksi:", str(e))
        return jsonify({"error": str(e)}), 500

# ── Health check ───────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=False)