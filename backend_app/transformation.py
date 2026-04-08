import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, roc_curve, auc, accuracy_score, f1_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from imblearn.over_sampling import SMOTE
import mlflow
import numpy as np
import os
import joblib


# ======================
# Préparation des données
# ======================
def prepare_data(file_path="data/bank-full.csv"):
    df = pd.read_csv(file_path, sep=";")
    
    # Supprimer colonnes inutiles
    df = df.drop(columns=['day','month','duration','pdays'])
    
    X = df.drop('y', axis=1)
    y = df['y'].map({'yes':1,'no':0})
    
    numeric_features = ['age','balance','campaign','previous']
    categorical_features = ['job','marital','education','housing','default','loan','poutcome']
    
    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])
    
    return train_test_split(X, y, test_size=0.2, random_state=42, stratify=y), preprocessor

# ======================
# Fonctions utils pour plots
# ======================
def plot_confusion_matrix(y_true, y_pred, model_name):
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(6,5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False)
    plt.title(f'Confusion Matrix: {model_name}')
    plt.ylabel('Actual')
    plt.xlabel('Predicted')
    if not os.path.exists("data"):
        os.makedirs("data")
    filename = f"data/confusion_matrix_{model_name}.png"
    plt.savefig(filename)
    plt.close()
    return filename

def plot_roc_curve(y_true, y_prob, model_name):
    fpr, tpr, _ = roc_curve(y_true, y_prob)
    roc_auc = auc(fpr, tpr)
    plt.figure(figsize=(6,5))
    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC area = {roc_auc:.2f}')
    plt.plot([0,1],[0,1], color='navy', lw=2, linestyle='--')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title(f'ROC Curve: {model_name}')
    plt.legend(loc="lower right")
    if not os.path.exists("data"):
        os.makedirs("data")
    filename = f"data/roc_curve_{model_name}.png"
    plt.savefig(filename)
    plt.close()
    return filename

# ======================
# Expérience MLflow + SMOTE + Neural Network
# ======================
EXPERIMENT_NAME = "Bank_NN_Optimized"

def run_experiment(model_name="NN_SMOTE"):
    (X_train, X_test, y_train, y_test), preprocessor = prepare_data()
    
    mlflow.set_experiment(EXPERIMENT_NAME)
    
    with mlflow.start_run(run_name=model_name):
        # SMOTE sur train
        smote = SMOTE(random_state=42)
        X_train_res, y_train_res = smote.fit_resample(preprocessor.fit_transform(X_train), y_train)
        X_test_trans = preprocessor.transform(X_test)
        
        # Neural Network
        model = Sequential([
            Dense(16, activation='relu', input_dim=X_train_res.shape[1]),
            Dense(8, activation='relu'),
            Dense(1, activation='sigmoid')
        ])
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        model.fit(X_train_res, y_train_res, epochs=10, verbose=1)
        
        # Prédictions
        y_pred_prob = model.predict(X_test_trans)
        y_pred = (y_pred_prob > 0.5).astype(int)
        
        # Metrics
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        mlflow.log_metric("accuracy", acc)
        mlflow.log_metric("f1_score", f1)
        
        print(f"Accuracy: {acc:.4f}, F1: {f1:.4f}")
        
        # Plots
        cm_path = plot_confusion_matrix(y_test, y_pred, model_name)
        mlflow.log_artifact(cm_path)
        roc_path = plot_roc_curve(y_test, y_pred_prob, model_name)
        mlflow.log_artifact(roc_path)
        
        # Save model
        if not os.path.exists("models"):
            os.makedirs("models")
        joblib.dump(preprocessor, "models/preprocessor.pkl")

        model.save("models/nn_model.keras")
        mlflow.tensorflow.log_model(model, "nn_model")
        
        return model

if __name__ == "__main__":
    model = run_experiment()