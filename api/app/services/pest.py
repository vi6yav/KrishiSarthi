from PIL import Image
import io

# Vision Transformer fine-tuned specifically for crop leaf disease detection
# (corn, and other common crops). Downloads once on first run, then cached locally.
MODEL_NAME = "wambugu1738/crop_leaf_diseases_vit"

_processor = None
_model = None


def _load_model():
    """Lazy-load the model only once, the first time it's actually needed."""
    global _processor, _model
    if _model is None:
        # Imported here (not at the top of the file) so the server starts fast and
        # uses little memory until someone actually uses the pest detector.
        import torch
        from transformers import ViTImageProcessor, ViTForImageClassification

        _processor = ViTImageProcessor.from_pretrained(MODEL_NAME)
        # bfloat16 keeps the model's weights in half the memory
        _model = ViTForImageClassification.from_pretrained(
            MODEL_NAME, ignore_mismatched_sizes=True, dtype=torch.bfloat16
        )
        _model.eval()
    return _processor, _model


def predict_disease(image_bytes: bytes, top_k: int = 3):
    import torch

    processor, model = _load_model()

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    pixel_values = inputs["pixel_values"].to(torch.bfloat16)

    with torch.inference_mode():
        outputs = model(pixel_values=pixel_values)
        probabilities = torch.nn.functional.softmax(outputs.logits.float(), dim=-1)[0]

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