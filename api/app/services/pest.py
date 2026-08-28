from PIL import Image
import io

from transformers import ViTImageProcessor, ViTForImageClassification
import torch

# Vision Transformer fine-tuned specifically for crop leaf disease detection
# (corn, and other common crops). Downloads once on first run, then cached locally.
MODEL_NAME = "wambugu1738/crop_leaf_diseases_vit"

_processor = None
_model = None


def _load_model():
    """Lazy-load the model only once, the first time it's actually needed."""
    global _processor, _model
    if _model is None:
        _processor = ViTImageProcessor.from_pretrained(MODEL_NAME)
        _model = ViTForImageClassification.from_pretrained(MODEL_NAME, ignore_mismatched_sizes=True)
        _model.eval()
    return _processor, _model


def predict_disease(image_bytes: bytes, top_k: int = 3):
    processor, model = _load_model()

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probabilities = torch.nn.functional.softmax(logits, dim=-1)[0]

    k = min(top_k, probabilities.shape[0])
    top_probs, top_indices = torch.topk(probabilities, k)

    results = []
    for prob, idx in zip(top_probs, top_indices):
        label = model.config.id2label[idx.item()]
        results.append({
            "label": label,
            "confidence": round(prob.item() * 100, 2),
        })

    top_prediction = results[0]
    is_healthy = "healthy" in top_prediction["label"].lower()

    return {
        "predictions": results,
        "top_label": top_prediction["label"],
        "top_confidence": top_prediction["confidence"],
        "is_healthy": is_healthy,
    }