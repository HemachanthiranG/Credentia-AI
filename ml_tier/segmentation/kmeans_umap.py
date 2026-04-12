import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
import umap.umap_ as umap
import logging

class MerchantSegmenter:
    """
    Groups merchants into cohorts utilizing an 8-dimensional space reducing into 
    2D via UMAP for visual dashboard exploration.
    """
    def __init__(self, n_clusters=5):
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        self.reducer = umap.UMAP(n_components=2, random_state=42)
        
    def fit_transform(self, df_features: pd.DataFrame):
        """Fits K-Means and UMAP to group merchants into cohorts based on multi-dimensional BNPL behavior."""
        logging.info("Fitting K-Means clustering algorithm on behavior tensors...")
        clusters = self.kmeans.fit_predict(df_features)
        
        logging.info("Reducing dimensions transversally via UMAP for Metabase UI scatter plotting...")
        embedding = self.reducer.fit_transform(df_features)
        
        df_results = df_features.copy()
        df_results['cluster'] = clusters
        df_results['umap_x'] = embedding[:, 0]
        df_results['umap_y'] = embedding[:, 1]
        return df_results

if __name__ == "__main__":
    # Internal Mock test execution
    df_mock = pd.DataFrame(np.random.rand(100, 8), columns=[f'dim_{i}' for i in range(8)])
    segmenter = MerchantSegmenter()
    res = segmenter.fit_transform(df_mock)
    print("K-Means + UMAP Segmentation Module successfully initialized. Dimensionality output block shape:", res.shape)
