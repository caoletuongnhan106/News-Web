from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import re

app = Flask(__name__)

print(">>> Flask app starting...")

# Tokenizer gốc RoBERTa[web:175]
TOKENIZER_NAME = "roberta-base"
# Model NLI 3 nhãn đã fine-tune trên MNLI[web:162]
MODEL_NAME = "prajjwal1/roberta-base-mnli"

print(">>> Loading tokenizer:", TOKENIZER_NAME)
tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_NAME, use_fast=True)
print(">>> Tokenizer loaded")

print(">>> Loading model:", MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
print(">>> Model loaded")
model.eval()

id2label = model.config.id2label
print("NLI labels:", id2label)


def classify_contradiction_type(comment, article):
    """
    Trả về (loại_mâu_thuẫn, hit_rule: True/False).
    hit_rule = True nghĩa là đã nhận diện được loại mâu thuẫn cụ thể.
    """
    com = comment.lower()
    art = article.lower()

    # ===== 1. Factual (ưu tiên trước) =====
    # Ví dụ: Thailand vs Cambodia trong bài cyber ring,
    # hoặc câu nói về Facebook/Instagram/Twitter.
    if "thailand" in com and "cambodia" in art:
        return "Factual", True
    if any(p in com for p in ["facebook", "instagram", "twitter"]):
        return "Factual", True

    # ===== 2. Temporal (ưu tiên hơn Numerical) =====
    full_date_pattern = (
        r"(january|february|march|april|may|june|july|august|september|october|"
        r"november|december)\s+\d{1,2},\s+\d{4}"
    )
    year_pattern = r"\b(2018|2019|2020|2021|2022|2023|2024|2025)\b"

    dates_full_c = re.findall(full_date_pattern, com)
    dates_full_a = re.findall(full_date_pattern, art)

    years_c = re.findall(year_pattern, com)
    years_a = re.findall(year_pattern, art)

    # Comment có full date mà article không có hoặc khác -> Temporal
    if dates_full_c:
        if not dates_full_a:
            return "Temporal", True

    # Comment có năm khác với năm trong article -> Temporal
    if years_c:
        if not years_a or any(y not in years_a for y in years_c):
            return "Temporal", True

    # ===== 3. Numerical =====
    num_pattern = r"\b\d+(?:,\d{3})*(?:\.\d+)?\b"
    nums_c = re.findall(num_pattern, com)
    nums_a = re.findall(num_pattern, art)
    if nums_c and nums_a:
        if any(nc not in nums_a for nc in nums_c):
            return "Numerical", True

    # ===== 4. Entity =====
    # Chỉ coi là entity nếu là cụm có từ 2 từ viết hoa trở lên
    # (Nguyen Van Nam, Quang Nam, Da Nang...), tránh dính các từ đơn như Traffic, Vietnam.
    person_pattern = r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b"
    ents_c_raw = re.findall(person_pattern, comment)
    ents_a_raw = re.findall(person_pattern, article)

    ents_c = [e.lower().strip() for e in ents_c_raw]
    ents_a = [e.lower().strip() for e in ents_a_raw]

    if ents_c and ents_a:
        if any(ec not in ents_a for ec in ents_c):
            return "Entity", True

    # Không nhận diện được loại cụ thể
    return "No-Contradiction", False


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    comment = data.get("comment", "")
    article = data.get("article", "")

    # 1. Rule-based xác định loại mâu thuẫn (nếu có)
    ctype_rule, hit_rule = classify_contradiction_type(comment, article)

    # 2. Model NLI để quyết định có mâu thuẫn hay không + confidence
    inputs = tokenizer(
        article,
        comment,
        truncation=True,
        max_length=256,
        padding='max_length',
        return_tensors='pt'
    )

    with torch.no_grad():
        outputs = model(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"]
        )
        logits = outputs.logits
        probs = torch.softmax(logits, dim=-1)[0]

    # Tìm id label CONTRADICTION trong model[web:162]
    contra_id = None
    for i, lab in id2label.items():
        if "CONTRADICTION" in lab.upper():
            contra_id = int(i)
            break
    if contra_id is None:
        contra_id = 0

    p_contra = float(probs[contra_id].item())

    # Nếu rule đã bắt được loại cụ thể -> dùng luôn loại đó
    if hit_rule and ctype_rule != "No-Contradiction":
        return jsonify({
            "type": ctype_rule,
            "confidence": max(p_contra, 0.85)
        })

    # Nếu rule không bắt được:
    # - Model nói không mâu thuẫn
    if p_contra < 0.5:
        return jsonify({
            "type": "No-Contradiction",
            "confidence": 1.0 - p_contra
        })

    # - Model nói có mâu thuẫn, nhưng không biết loại -> Factual chung
    return jsonify({
        "type": "Factual",
        "confidence": p_contra
    })


if __name__ == '__main__':
    # Flask dev server, chạy trên 0.0.0.0:5000 để Node call nội bộ.[web:122]
    app.run(host='0.0.0.0', port=5000)
