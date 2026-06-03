import streamlit as st
import pandas as pd
import plotly.express as px
import os

st.set_page_config(page_title="AI Worker Insights Dashboard", layout="wide")

# Custom CSS for minor adjustments
st.markdown("""
    <style>
    .main .block-container {
        padding-top: 2rem;
    }
    h1, h2, h3 {
        color: #030213;
    }
    </style>
""", unsafe_allow_html=True)

@st.cache_data
def load_data():
    file_path = "ai_worker_burnout_attrition_2026.csv"
    if not os.path.exists(file_path):
        file_path = "dataset.csv"
    if not os.path.exists(file_path):
        return pd.DataFrame() # Fallback
    
    df = pd.read_csv(file_path)
    return df

df = load_data()

if df.empty:
    st.error("Dataset not found! Please ensure 'ai_worker_burnout_attrition_2026.csv' exists.")
    st.stop()

# Title
st.title("📊 AI Worker Burnout & Attrition Insights Dashboard")
st.markdown("Dashboard ini menampilkan *insight* dan kesimpulan dari Exploratory Data Analysis mengenai dampak penggunaan AI terhadap burnout dan tingkat kepuasan kerja.")

# Sidebar Filters
st.sidebar.header("🔍 Filter Data")
selected_industry = st.sidebar.multiselect("Pilih Industri", options=df['industry'].unique(), default=df['industry'].unique())
selected_remote = st.sidebar.multiselect("Tipe Kerja Jarak Jauh", options=df['remote_work_type'].unique(), default=df['remote_work_type'].unique())

# Filter the dataframe
filtered_df = df[(df['industry'].isin(selected_industry)) & (df['remote_work_type'].isin(selected_remote))]

st.sidebar.markdown("---")
st.sidebar.markdown(f"**Total Data Karyawan:** {len(filtered_df)}")

# Metrics
col1, col2, col3 = st.columns(3)
with col1:
    st.metric("Total Karyawan", len(filtered_df))
with col2:
    st.metric("Rata-rata Burnout Score", round(filtered_df['burnout_score'].mean(), 2))
with col3:
    st.metric("Rata-rata Produktivitas", round(filtered_df['productivity_score'].mean(), 2))

st.markdown("---")

# ========================================
# Insight Bagian 1
# ========================================
st.header("📈 Insight Bagian 1: Distribusi Data")

c1, c2 = st.columns(2)

with c1:
    st.subheader("Distribusi Skor Burnout")
    fig_burnout = px.histogram(
        filtered_df, 
        x="burnout_score", 
        nbins=20, 
        marginal="box",
        color_discrete_sequence=["#d4183d"]
    )
    fig_burnout.update_layout(xaxis_title="Skor Burnout", yaxis_title="Frekuensi")
    st.plotly_chart(fig_burnout, use_container_width=True)

with c2:
    st.subheader("Tingkat Risiko Resign (Attrition Risk)")
    attrition_counts = filtered_df['attrition_risk'].value_counts().reset_index()
    attrition_counts.columns = ['Tingkat Risiko', 'Jumlah Karyawan']
    # Custom sort Low, Medium, High
    attrition_counts['Tingkat Risiko'] = pd.Categorical(attrition_counts['Tingkat Risiko'], categories=["Low", "Medium", "High"], ordered=True)
    attrition_counts = attrition_counts.sort_values('Tingkat Risiko')
    
    fig_attrition = px.bar(
        attrition_counts, 
        x="Tingkat Risiko", 
        y="Jumlah Karyawan",
        color="Tingkat Risiko",
        color_discrete_map={"Low": "#3b4a6b", "Medium": "#2a8074", "High": "#6eb566"}
    )
    st.plotly_chart(fig_attrition, use_container_width=True)

st.info("""
**Kesimpulan Bagian 1:**
- **Distribusi Skor Burnout**: Data skor burnout karyawan membentuk distribusi yang mendekati normal, dengan rata-rata berada di sekitar nilai 50. Mayoritas karyawan merasakan tingkat kelelahan mental pada level menengah.
- **Tingkat Risiko Resign (Attrition Risk)**: Sebagian besar karyawan berada pada tingkat risiko resign 'Low' dan 'Medium'. Kategori 'High' jauh lebih sedikit, menunjukkan mayoritas karyawan masih cenderung bertahan di perusahaan.
""")

st.markdown("---")

# ========================================
# Insight Bagian 2
# ========================================
st.header("🔗 Insight Bagian 2: Mencari Hubungan antar Variabel")

c3, c4 = st.columns(2)

with c3:
    st.subheader("Dampak Kepuasan Kerja terhadap Burnout")
    fig_sat = px.box(
        filtered_df, 
        x="job_satisfaction_1_5", 
        y="burnout_score",
        color_discrete_sequence=["#4a80db"]
    )
    fig_sat.update_layout(xaxis_title="Tingkat Kepuasan Kerja (1-5)", yaxis_title="Skor Burnout")
    st.plotly_chart(fig_sat, use_container_width=True)

with c4:
    st.subheader("Ketakutan pada AI vs Skor Burnout")
    # Custom order for fear
    filtered_df['fear_of_ai_replacement'] = pd.Categorical(filtered_df['fear_of_ai_replacement'], categories=["Low", "Medium", "High"], ordered=True)
    fig_fear = px.box(
        filtered_df.sort_values('fear_of_ai_replacement'), 
        x="fear_of_ai_replacement", 
        y="burnout_score",
        color="fear_of_ai_replacement",
        color_discrete_map={"Low": "#f5bc9f", "Medium": "#de7359", "High": "#b82b32"}
    )
    fig_fear.update_layout(xaxis_title="Ketakutan Digantikan AI", yaxis_title="Skor Burnout")
    st.plotly_chart(fig_fear, use_container_width=True)

st.info("""
**Kesimpulan Bagian 2:**
- **Dampak Kepuasan Kerja terhadap Burnout**: Terdapat hubungan terbalik yang sangat jelas (korelasi negatif). Karyawan dengan tingkat kepuasan kerja (*Job Satisfaction*) tinggi secara konsisten mencatatkan skor Burnout yang lebih rendah.
- **Ketakutan pada AI vs Skor Burnout**: Karyawan dengan tingkat ketakutan 'High' akan digantikan oleh AI memiliki rentang dan nilai rata-rata skor Burnout yang lebih tinggi dibandingkan tingkat ketakutan 'Low' atau 'Medium'. Kecemasan teknologi (teknofobia) berkontribusi signifikan pada peningkatan stres.
""")
