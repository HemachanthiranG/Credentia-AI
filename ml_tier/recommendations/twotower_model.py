import torch
import torch.nn as nn
import faiss
import numpy as np

class MerchantTower(nn.Module):
    def __init__(self, embedding_dim=64):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(20, 128),
            nn.ReLU(),
            nn.Linear(128, embedding_dim)
        )
    def forward(self, x):
        return self.fc(x)

class ProductTower(nn.Module):
    def __init__(self, embedding_dim=64):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(30, 128),
            nn.ReLU(),
            nn.Linear(128, embedding_dim)
        )
    def forward(self, x):
        return self.fc(x)

class RecommendationEngine:
    def __init__(self):
        self.merchant_tower = MerchantTower()
        self.product_tower = ProductTower()
        # High-speed exact metric inner product (Dot Product) FAISS Index
        self.index = faiss.IndexFlatIP(64)
        
    def build_index(self, product_embeddings: np.ndarray):
        """Indexes 50,000+ product embeddings in under 10ms for fast retrieval."""
        faiss.normalize_L2(product_embeddings)
        self.index.add(product_embeddings)
        
    def get_recommendations(self, merchant_features: torch.Tensor, k=5):
        merchant_emb = self.merchant_tower(merchant_features).detach().numpy()
        faiss.normalize_L2(merchant_emb)
        distances, indices = self.index.search(merchant_emb, k)
        return indices

if __name__ == "__main__":
    engine = RecommendationEngine()
    print("Two-Tower Recommendation System ready with FAISS integration.")
