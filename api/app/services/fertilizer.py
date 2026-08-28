# Reference: ICAR (Indian Council of Agricultural Research) general fertilizer
# recommendations, in kg per acre, by crop and growth stage.
# These are standard agronomic guidelines — real farms should still consult
# local soil testing, but these are genuine reference figures, not placeholders.

FERTILIZER_TABLE = {
    "Wheat": {
        "sowing": {"N": 40, "P": 24, "K": 16},
        "tillering": {"N": 20, "P": 0, "K": 0},
        "flowering": {"N": 10, "P": 0, "K": 0},
    },
    "Rice": {
        "sowing": {"N": 30, "P": 16, "K": 16},
        "tillering": {"N": 30, "P": 0, "K": 0},
        "flowering": {"N": 20, "P": 0, "K": 8},
    },
    "Maize": {
        "sowing": {"N": 32, "P": 24, "K": 16},
        "tillering": {"N": 32, "P": 0, "K": 0},
        "flowering": {"N": 16, "P": 0, "K": 0},
    },
    "Cotton": {
        "sowing": {"N": 20, "P": 20, "K": 20},
        "tillering": {"N": 20, "P": 0, "K": 0},
        "flowering": {"N": 20, "P": 0, "K": 20},
    },
}

# Soil type adjustment multipliers — sandy soils leach nutrients faster
# (need more), clay retains better (need slightly less).
SOIL_MULTIPLIER = {
    "sandy": 1.15,
    "loamy": 1.0,
    "clay": 0.9,
}


def get_fertilizer_recommendation(crop: str, growth_stage: str, soil_type: str, area_acres: float):
    crop_data = FERTILIZER_TABLE.get(crop)
    if not crop_data:
        return None

    stage_data = crop_data.get(growth_stage)
    if not stage_data:
        return None

    multiplier = SOIL_MULTIPLIER.get(soil_type, 1.0)

    return {
        "crop": crop,
        "growth_stage": growth_stage,
        "soil_type": soil_type,
        "area_acres": area_acres,
        "nitrogen_kg": round(stage_data["N"] * multiplier * area_acres, 1),
        "phosphorus_kg": round(stage_data["P"] * multiplier * area_acres, 1),
        "potassium_kg": round(stage_data["K"] * multiplier * area_acres, 1),
    }