from flask import Flask, request, jsonify
from flask_cors import CORS
import keras
import tensorflow as tf
import json

# ── Custom Layer ───────────────────────────────────────────────────────────────
@keras.saving.register_keras_serializable(package="Custom")
class FeatureGateLayer(keras.layers.Layer):
    def __init__(self, units=256, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.dense = keras.layers.Dense(units, activation='sigmoid')

    def build(self, input_shape):
        self.dense.build(input_shape)

    def call(self, inputs):
        return inputs * self.dense(inputs)

    def get_config(self):
        config = super().get_config()
        config.update({"units": self.units})
        return config

# ── Init app ───────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # ← harus setelah app dibuat

# ── Load model ─────────────────────────────────────────────────────────────────
print("Memuat model AI Clean... (Tunggu sebentar)")
model = keras.saving.load_model(
    'staypath_ai_clean.keras',
    custom_objects={'FeatureGateLayer': FeatureGateLayer},
    compile=False
)

with open('metadata.json', 'r') as f:
    metadata = json.load(f)

print("✅ Model AI dan Metadata berhasil menyala dan siap menerima perintah!")

# ── Endpoint prediksi ──────────────────────────────────────────────────────────
@app.route('/api/predict-risk', methods=['POST'])
def predict_risk():
    try:
        data = request.json
        tf_inputs = {}

        for col in metadata['categorical_cols']:
            val = str(data.get(col, "Unknown"))
            tf_inputs[col] = tf.constant([[val]])

        num_values = []
        for col in metadata['numeric_cols']:
            default_val = metadata.get('num_medians', {}).get(col, 0.0)
            val = float(data.get(col, default_val))
            num_values.append(val)

        tf_inputs['numeric'] = tf.constant([num_values])

        prediction = model.predict(tf_inputs, verbose=0)
        risk_score = float(prediction[0][0])

        if risk_score >= 0.70:
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
        print("Error saat prediksi:", str(e))
        return jsonify({"error": str(e)}), 500

# ── Health check (untuk Render) ────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    app.run(port=5002, debug=False)