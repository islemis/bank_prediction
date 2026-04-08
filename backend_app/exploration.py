import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
 
 
def run_advanced_eda(file_path="data/bank-full.csv"):
    """
    Performs Advanced Exploratory Data Analysis on the Bank Marketing dataset.
    Dataset: UCI Bank Marketing (bank-full.csv, sep=';')
    Target variable: y (yes/no — client subscribed a term deposit)
    """
 
    # ── Load data ──────────────────────────────────────────────────────────────
    df = pd.read_csv(file_path, sep=";")
 
    print(df.shape)
 
    df.info()
 
    print(df.head())
 
    print(df['y'].value_counts())
    print(df['y'].value_counts(normalize=True) * 100)
 
    # Encode target for correlation
    df['y_encoded'] = df['y'].map({'yes': 1, 'no': 0})
 
    # ── 1. Target Imbalance Analysis ───────────────────────────────────────────
    plt.figure(figsize=(8, 5))
    df['y'].value_counts(normalize=True).plot(
        kind='bar',
        color=['#dc2626', '#059669'],
        edgecolor='white'
    )
    plt.title('Churn Proportion (no: Did not subscribe, yes: Subscribed)', fontsize=13)
    plt.ylabel('Percentage')
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig('data/target_imbalance.png')
    plt.close()
    print("✔ Saved: data/target_imbalance.png")
 
    # ── 2. Categorical Analysis: Impact on Subscription ───────────────────────
    categorical_features = ['job', 'marital', 'education', 'contact', 'poutcome', 'housing']
    fig, axes = plt.subplots(3, 2, figsize=(16, 18))
    axes = axes.flatten()
 
    for i, feature in enumerate(categorical_features):
        sns.countplot(x=feature, hue='y', data=df, ax=axes[i],
                      palette=['#dc2626', '#059669'])
        axes[i].set_title(f'Subscription by {feature}', fontsize=12)
        axes[i].legend(title='Subscribed ?', loc='upper right')
        axes[i].tick_params(axis='x', rotation=45)
        axes[i].set_xlabel("")
 
    plt.suptitle("Categorical Features — Impact on Subscription", fontweight='bold', fontsize=14)
    plt.tight_layout()
    plt.savefig('data/categorical_impact.png')
    plt.close()
    print("✔ Saved: data/categorical_impact.png")
 
 
    # ── 3. Numerical Analysis: Outlier Detection via Boxplots ─────────────────
    numerical_features = ['age', 'balance',  'campaign', 'pdays', 'previous']
    plt.figure(figsize=(16, 12))
 
    for i, feature in enumerate(numerical_features):
        plt.subplot(2, 3, i + 1)
        sns.boxplot(y=df[feature], x=df['y'],
                    palette=['#dc2626', '#059669'])
        plt.title(f'{feature} Distribution by Subscription', fontsize=11)
        plt.xlabel("")
 
    plt.suptitle("Numerical Features — Outlier Detection & Distribution by Target",
                 fontweight='bold', fontsize=14)
    plt.tight_layout()
    plt.savefig('data/numerical_boxplots.png')
    plt.close()
    print("✔ Saved: data/numerical_boxplots.png")
 
    # ── 4. Univariate Analysis — Age ──────────────────────────────────────────
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
 
    sns.histplot(df['age'], kde=True, color='#2563eb', ax=axes[0])
    axes[0].set_title("Distribution de l'âge")
    axes[0].set_xlabel("Âge")
 
    sns.boxplot(y=df['age'], color='#93c5fd', ax=axes[1])
    axes[1].set_title("Boxplot de l'âge — Outliers")
 
    plt.suptitle("Univariate Analysis — Age", fontweight='bold', fontsize=13)
    plt.tight_layout()
    plt.savefig('data/univariate_age.png')
    plt.close()
 
    print("\n--- Age Stats ---")
    print("Mean  :", df['age'].mean().round(1))
    print("Median:", df['age'].median())
    print("Min/Max:", df['age'].min(), "/", df['age'].max())
    print("✔ Saved: data/univariate_age.png")
 
    # ── 5. Univariate Analysis — Balance ──────────────────────────────────────
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
 
    sns.histplot(df['balance'], kde=True, ax=axes[0], color='#059669')
    axes[0].set_title("Distribution du Solde (Balance)")
    axes[0].set_xlabel("Solde")
 
    sns.boxplot(y=df['balance'], ax=axes[1], color='#6ee7b7')
    axes[1].set_title("Boxplot Solde — Détection Outliers")
 
    plt.suptitle("Univariate Analysis — Balance", fontweight='bold', fontsize=13)
    plt.tight_layout()
    plt.savefig('data/univariate_balance.png')
    plt.close()
    print("✔ Saved: data/univariate_balance.png")
 
    # ── 6. Multivariate Analysis: Pairplot (Sampled for performance) ──────────
    df_sample = df[['age', 'balance', 'campaign', 'y']].sample(1000, random_state=42)
 
    sns.pairplot(df_sample, hue='y', diag_kind='kde',
                 palette=['#dc2626', '#059669'])
    plt.suptitle("Multivariate Analysis — Pairplot (sample n=1000)", y=1.02, fontsize=13)
    plt.savefig('data/multivariate_pairplot.png')
    plt.close()
    print("✔ Saved: data/multivariate_pairplot.png")
 
    # ── 7. Correlation Heatmap ─────────────────────────────────────────────────
    num_cols = df.select_dtypes(include=np.number)
 
    plt.figure(figsize=(10, 8))
    corr = num_cols.corr()
    sns.heatmap(corr, annot=True, cmap='coolwarm', fmt='.2f', linewidths=0.5)
    plt.title('Feature Correlation Heatmap', fontsize=13)
    plt.tight_layout()
    plt.savefig('data/correlation_heatmap.png')
    plt.close()
    print("✔ Saved: data/correlation_heatmap.png")
 
    print("\n✅ Advanced EDA completed. All plots saved in 'data/' directory.")
 
 
if __name__ == "__main__":
    run_advanced_eda()