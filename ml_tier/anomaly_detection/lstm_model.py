import torch
import torch.nn as nn

class PaymentRhythmLSTM(nn.Module):
    """
    PyTorch LSTM to learn individual merchant payment rhythms and flag 
    statistically significant deviations in real time.
    """
    def __init__(self, input_size=8, hidden_size=64, num_layers=2):
        super(PaymentRhythmLSTM, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, input_size) # Reconstruct input for anomaly detection

    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.fc(out[:, -1, :])
        return out

if __name__ == "__main__":
    model = PaymentRhythmLSTM()
    print("LSTM Anomaly Detector model graph initialized:\n", model)
