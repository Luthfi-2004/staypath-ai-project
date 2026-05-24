import zipfile
import json

input_file = 'staypath_ai_best.keras'
output_file = 'staypath_ai_clean.keras'

# Fungsi untuk menghapus fitur Colab dari seluruh JSON
def remove_quantization_config(d):
    if isinstance(d, dict):
        d.pop('quantization_config', None)
        for k, v in d.items():
            remove_quantization_config(v)
    elif isinstance(d, list):
        for i in d:
            remove_quantization_config(i)

print(f"Membuka {input_file}...")
with zipfile.ZipFile(input_file, 'r') as zin:
    with zipfile.ZipFile(output_file, 'w') as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            # Kalau ketemu file config.json, kita cuci isinya!
            if item.filename == 'config.json':
                parsed = json.loads(data.decode('utf-8'))
                remove_quantization_config(parsed)
                data = json.dumps(parsed).encode('utf-8')
                print("✅ Berhasil mencuci 'quantization_config' dari dalam model!")
            zout.writestr(item, data)

print(f"Model super bersih berhasil disimpan sebagai: {output_file}")