from __future__ import annotations

import hashlib
import random
import re
from dataclasses import asdict, dataclass
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field


@dataclass(frozen=True)
class Stage:
    id: int
    title: str
    zone: str
    emoji: str
    skill: str
    operation: str
    story: str
    reward_item_id: str


STAGES: tuple[Stage, ...] = (
    Stage(1, "รังมังกรน้อย", "หมู่บ้าน", "🏕️", "การบวก", "addition", "ช่วย Sparky นับไข่มังกรให้ครบ", "compass_pin"),
    Stage(2, "ทางเดินเก็บไม้", "ป่า", "🌲", "การลบ", "subtraction", "เก็บไม้ที่เหลือให้พอซ่อมสะพาน", "forest_bag"),
    Stage(3, "สะพานคูณเลข", "ป่า", "🌉", "การคูณ", "multiplication", "คำนวณจำนวนไม้ในแต่ละแถว", "sparkle_trail"),
    Stage(4, "ลำธารหารชวนคิด", "ป่า", "💧", "การหาร", "division", "แบ่งผลไม้ให้มังกรทุกตัวเท่า ๆ กัน", "moon_cape"),
    Stage(5, "ทุ่งเศษส่วน", "ภูเขา", "🍰", "เศษส่วน", "fractions", "แบ่งขนมให้เพื่อนโดยไม่ให้ใครได้มากกว่า", "star_glasses"),
    Stage(6, "เชิงเขารูปทรง", "ภูเขา", "🏔️", "การวัด", "geometry", "วัดขอบเขตเพื่อวางทางเดินปลอดภัย", "mountain_boots"),
    Stage(7, "ตลาดเวทมนตร์", "เมืองเมฆ", "🛍️", "โจทย์เงิน", "money", "ช่วยพ่อค้าแม่ค้าคิดเงินทอน", "cloud_hat"),
    Stage(8, "สะพานลอยฟ้า", "เมืองเมฆ", "☁️", "โจทย์หลายขั้น", "two_step", "วางแผนขนวัสดุผ่านสะพานลอยฟ้า", "sky_wings"),
    Stage(9, "ถ้ำรูปทรงลับ", "ถ้ำคริสตัล", "💎", "พื้นที่และรอบรูป", "area", "หาพื้นที่วางผลึกเรืองแสง", "crystal_shield"),
    Stage(10, "หอคอยเศษส่วน", "หอคอย", "🗼", "บวกเศษส่วน", "fraction_add", "รวมพลังจากเศษส่วนที่มีตัวส่วนเดียวกัน", "wizard_robe"),
    Stage(11, "ประตูตัวเลข", "ปราสาท", "🚪", "คำนวณหลายแบบ", "mixed", "ไขรหัสประตูด้วยลำดับการคำนวณ", "royal_crown"),
    Stage(12, "มังกรพิทักษ์ Numeria", "ปราสาท", "🐉", "ภารกิจบอส", "boss", "ใช้ทุกทักษะช่วยปกป้องดินแดน Numeria", "dragon_aura"),
)

ITEMS: tuple[dict[str, Any], ...] = (
    {"id": "pet_sparky", "name": "Sparky มังกรน้อย", "slot": "pet", "category": "สัตว์เลี้ยง", "icon": "🐉", "rarity": "rare", "unlock_stage": 1, "starter": True},
    {"id": "outfit_scout", "name": "ชุดนักสำรวจ", "slot": "outfit", "category": "ชุด", "icon": "🧭", "rarity": "common", "unlock_stage": 1, "starter": True},
    {"id": "compass_pin", "name": "เข็มกลัดเข็มทิศ", "slot": "accessory", "category": "อุปกรณ์", "icon": "🧭", "rarity": "common", "unlock_stage": 1, "starter": False},
    {"id": "forest_bag", "name": "กระเป๋าป่าไม้", "slot": "accessory", "category": "อุปกรณ์", "icon": "🎒", "rarity": "rare", "unlock_stage": 2, "starter": False},
    {"id": "sparkle_trail", "name": "ประกายดาว", "slot": "effect", "category": "เอฟเฟกต์", "icon": "✨", "rarity": "epic", "unlock_stage": 3, "starter": False},
    {"id": "moon_cape", "name": "ผ้าคลุมจันทร์", "slot": "outfit", "category": "ชุด", "icon": "🌙", "rarity": "rare", "unlock_stage": 4, "starter": False},
    {"id": "star_glasses", "name": "แว่นดาว", "slot": "accessory", "category": "อุปกรณ์", "icon": "🤓", "rarity": "epic", "unlock_stage": 5, "starter": False},
    {"id": "mountain_boots", "name": "รองเท้าปีนเขา", "slot": "outfit", "category": "ชุด", "icon": "🥾", "rarity": "rare", "unlock_stage": 6, "starter": False},
    {"id": "cloud_hat", "name": "หมวกเมฆ", "slot": "accessory", "category": "อุปกรณ์", "icon": "☁️", "rarity": "epic", "unlock_stage": 7, "starter": False},
    {"id": "sky_wings", "name": "ปีกแห่งท้องฟ้า", "slot": "effect", "category": "เอฟเฟกต์", "icon": "🪽", "rarity": "epic", "unlock_stage": 8, "starter": False},
    {"id": "crystal_shield", "name": "โล่คริสตัล", "slot": "accessory", "category": "อุปกรณ์", "icon": "🛡️", "rarity": "rare", "unlock_stage": 9, "starter": False},
    {"id": "wizard_robe", "name": "เสื้อคลุมจอมเวท", "slot": "outfit", "category": "ชุด", "icon": "🧙", "rarity": "epic", "unlock_stage": 10, "starter": False},
    {"id": "royal_crown", "name": "มงกุฎราชัน", "slot": "accessory", "category": "อุปกรณ์", "icon": "👑", "rarity": "legendary", "unlock_stage": 11, "starter": False},
    {"id": "dragon_aura", "name": "ออร่ามังกร", "slot": "effect", "category": "เอฟเฟกต์", "icon": "🔥", "rarity": "legendary", "unlock_stage": 12, "starter": False},
)

_STAGE_BY_ID = {stage.id: stage for stage in STAGES}
_ATTEMPT_ID_PATTERN = r"^[A-Za-z0-9_-]{8,80}$"


class AnswerInput(BaseModel):
    question_id: str = Field(min_length=1, max_length=64)
    answer: str = Field(max_length=128)


class GradeInput(BaseModel):
    attempt_id: str = Field(min_length=8, max_length=80, pattern=_ATTEMPT_ID_PATTERN)
    answers: list[AnswerInput] = Field(max_length=5)


class CheckAnswerInput(BaseModel):
    attempt_id: str = Field(min_length=8, max_length=80, pattern=_ATTEMPT_ID_PATTERN)
    question_id: str = Field(min_length=1, max_length=64)
    answer: str = Field(max_length=128)


def public_stage(stage: Stage) -> dict[str, Any]:
    return {**asdict(stage), "question_count": 5, "pass_score": 3}


def seeded_rng(stage_id: int, attempt_id: str) -> random.Random:
    digest = hashlib.sha256(f"plearny:{stage_id}:{attempt_id}".encode()).digest()
    return random.Random(int.from_bytes(digest[:8], "big"))


def number_question(question_id: str, prompt: str, answer: int, hint: str, rng: random.Random, unit: str = "") -> dict[str, Any]:
    candidates = {answer}
    step = max(1, abs(answer) // 8)
    offsets = [-step * 2, -step, step, step * 2, step * 3, 1, -1, 2, -2]
    rng.shuffle(offsets)
    for offset in offsets:
        if len(candidates) >= 4:
            break
        candidate = answer + offset
        if candidate >= 0 and candidate != answer:
            candidates.add(candidate)
    while len(candidates) < 4:
        candidates.add(answer + rng.randint(1, 12))
    choices = [str(value) for value in candidates]
    rng.shuffle(choices)
    suffix = f" {unit}" if unit else ""
    return {"id": question_id, "prompt": prompt, "hint": hint, "choices": [f"{value}{suffix}" for value in choices], "_answer": f"{answer}{suffix}"}


def fraction_question(question_id: str, rng: random.Random) -> dict[str, Any]:
    denominator = rng.choice([4, 5, 6, 8, 10])
    left = rng.randint(1, denominator - 2)
    right = rng.randint(1, denominator - left)
    total = left + right
    answer = f"{total}/{denominator}"
    values = {answer, f"{max(1, total - 1)}/{denominator}", f"{min(denominator, total + 1)}/{denominator}", f"{left}/{denominator}"}
    while len(values) < 4:
        values.add(f"{rng.randint(1, denominator)}/{denominator}")
    choices = sorted(values)
    rng.shuffle(choices)
    return {
        "id": question_id,
        "prompt": f"{left}/{denominator} + {right}/{denominator} ได้เท่าไร?",
        "hint": "ตัวส่วนเท่ากัน ให้นำตัวเศษมาบวกกัน",
        "choices": choices,
        "_answer": answer,
    }


def make_question(stage: Stage, index: int, rng: random.Random) -> dict[str, Any]:
    question_id = f"s{stage.id}-q{index + 1}"
    scale = stage.id
    if stage.operation == "addition":
        a, b = rng.randint(3, 20 + scale), rng.randint(2, 15 + scale)
        return number_question(question_id, f"{a} + {b} = ?", a + b, "ลองนับต่อจากจำนวนที่มากกว่า", rng)
    if stage.operation == "subtraction":
        a, b = rng.randint(25, 70 + scale * 3), rng.randint(3, 24 + scale)
        return number_question(question_id, f"มีไม้ {a} ท่อน ใช้ไป {b} ท่อน เหลือกี่ท่อน?", a - b, "นำจำนวนที่ใช้ไปลบออกจากจำนวนตั้งต้น", rng)
    if stage.operation == "multiplication":
        a, b = rng.randint(2, 12), rng.randint(2, 10)
        return number_question(question_id, f"มีไม้ {a} แถว แถวละ {b} ท่อน รวมกี่ท่อน?", a * b, "การคูณคือการบวกจำนวนเดิมซ้ำ ๆ", rng)
    if stage.operation == "division":
        divisor, quotient = rng.randint(2, 10), rng.randint(2, 12)
        dividend = divisor * quotient
        return number_question(question_id, f"แบ่งผลไม้ {dividend} ผล ให้มังกร {divisor} ตัวเท่า ๆ กัน ตัวละกี่ผล?", quotient, "หาจำนวนที่คูณกับจำนวนมังกรแล้วได้ผลไม้ทั้งหมด", rng)
    if stage.operation in {"fractions", "fraction_add"}:
        return fraction_question(question_id, rng)
    if stage.operation == "geometry":
        length, width = rng.randint(4, 15), rng.randint(3, 12)
        return number_question(question_id, f"สี่เหลี่ยมผืนผ้ากว้าง {width} เมตร ยาว {length} เมตร มีความยาวรอบรูปเท่าไร?", 2 * (length + width), "บวกด้านกว้างกับด้านยาว แล้วคูณสอง", rng, "เมตร")
    if stage.operation == "money":
        price, count, paid = rng.choice([5, 10, 15, 20]), rng.randint(2, 6), rng.randint(50, 150)
        while paid < price * count:
            paid += 50
        change = paid - price * count
        return number_question(question_id, f"ซื้อขนม {count} ชิ้น ชิ้นละ {price} บาท จ่าย {paid} บาท ได้เงินทอนเท่าไร?", change, "หาค่าขนมทั้งหมดก่อน แล้วลบออกจากเงินที่จ่าย", rng, "บาท")
    if stage.operation == "two_step":
        boxes, each, used = rng.randint(3, 8), rng.randint(4, 9), rng.randint(2, 10)
        total = boxes * each - used
        return number_question(question_id, f"มี {boxes} กล่อง กล่องละ {each} ชิ้น ใช้ไป {used} ชิ้น เหลือกี่ชิ้น?", total, "คูณหาจำนวนทั้งหมด แล้วจึงลบที่ใช้ไป", rng)
    if stage.operation == "area":
        length, width = rng.randint(3, 12), rng.randint(3, 10)
        return number_question(question_id, f"ลานสี่เหลี่ยมกว้าง {width} เมตร ยาว {length} เมตร มีพื้นที่กี่ตารางเมตร?", width * length, "พื้นที่สี่เหลี่ยมผืนผ้า = กว้าง × ยาว", rng, "ตารางเมตร")
    if stage.operation in {"mixed", "boss"}:
        mode = rng.choice(["add_mul", "sub_mul", "division"])
        if mode == "add_mul":
            a, b, c = rng.randint(2, 9), rng.randint(2, 9), rng.randint(2, 5)
            answer, prompt, hint = (a + b) * c, f"({a} + {b}) × {c} = ?", "คำนวณในวงเล็บก่อน แล้วคูณ"
        elif mode == "sub_mul":
            a, b, c = rng.randint(6, 15), rng.randint(2, 5), rng.randint(2, 8)
            answer, prompt, hint = (a - b) * c, f"({a} - {b}) × {c} = ?", "คำนวณในวงเล็บก่อน แล้วคูณ"
        else:
            divisor, quotient = rng.randint(2, 8), rng.randint(3, 12)
            answer, prompt, hint = quotient, f"{divisor * quotient} ÷ {divisor} = ?", "คิดย้อนกลับด้วยการคูณ"
        return number_question(question_id, prompt, answer, hint, rng)
    raise ValueError("unknown stage operation")


def make_attempt(stage_id: int, attempt_id: str) -> dict[str, Any]:
    stage = _STAGE_BY_ID.get(stage_id)
    if stage is None:
        raise ValueError("unknown stage")
    if not re.fullmatch(_ATTEMPT_ID_PATTERN, attempt_id):
        raise ValueError("invalid attempt id")
    rng = seeded_rng(stage_id, attempt_id)
    questions = [make_question(stage, index, rng) for index in range(5)]
    public_questions = [{key: value for key, value in question.items() if key != "_answer"} for question in questions]
    return {"attempt_id": attempt_id, "stage": public_stage(stage), "questions": public_questions}


def grade_attempt(stage_id: int, attempt_id: str, answers: list[dict[str, Any]]) -> dict[str, Any]:
    make_attempt(stage_id, attempt_id)
    rng = seeded_rng(stage_id, attempt_id)
    expected = {}
    for index in range(5):
        question = make_question(_STAGE_BY_ID[stage_id], index, rng)
        expected[question["id"]] = question["_answer"]
    submitted = {answer.get("question_id"): answer.get("answer") for answer in answers if isinstance(answer, dict)}
    score = sum(1 for question_id, correct in expected.items() if submitted.get(question_id) == correct)
    passed = score >= 3
    stage = _STAGE_BY_ID[stage_id]
    return {
        "stage_id": stage_id,
        "score": score,
        "total": 5,
        "passed": passed,
        "xp": 40 + score * 20 if passed else score * 5,
        "coins": 15 + score * 10 if passed else score * 2,
        "reward_item_id": stage.reward_item_id if passed else None,
        "answers": [{"question_id": key, "correct": submitted.get(key) == value, "correct_answer": value} for key, value in expected.items()],
    }


def check_answer(stage_id: int, attempt_id: str, question_id: str, answer: str) -> dict[str, Any]:
    make_attempt(stage_id, attempt_id)
    rng = seeded_rng(stage_id, attempt_id)
    for index in range(5):
        question = make_question(_STAGE_BY_ID[stage_id], index, rng)
        if question["id"] == question_id:
            return {"question_id": question_id, "correct": answer == question["_answer"]}
    raise ValueError("unknown question")


app = FastAPI(title="PLEARNY Game Service", docs_url=None, redoc_url=None, openapi_url=None)


@app.middleware("http")
async def limit_request_body(request: Request, call_next):
    try:
        content_length = int(request.headers.get("content-length", "0"))
    except ValueError:
        return JSONResponse(status_code=400, content={"error": "invalid content length"})
    if content_length < 0 or content_length > 32_000:
        return JSONResponse(status_code=413, content={"error": "request body too large"})
    return await call_next(request)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/levels")
def get_levels() -> dict[str, Any]:
    return {"levels": [public_stage(stage) for stage in STAGES]}


@app.get("/items")
def get_items() -> dict[str, Any]:
    return {"items": list(ITEMS)}


@app.get("/levels/{stage_id}/attempt")
def get_attempt(stage_id: int, attempt_id: str = "") -> dict[str, Any]:
    try:
        return make_attempt(stage_id, attempt_id)
    except ValueError as error:
        raise HTTPException(status_code=404 if str(error) == "unknown stage" else 400, detail=str(error)) from error


@app.post("/levels/{stage_id}/grade")
def post_grade(stage_id: int, body: GradeInput) -> dict[str, Any]:
    try:
        return grade_attempt(stage_id, body.attempt_id, [answer.model_dump() for answer in body.answers])
    except ValueError as error:
        raise HTTPException(status_code=404 if str(error) == "unknown stage" else 400, detail=str(error)) from error


@app.post("/levels/{stage_id}/answer")
def post_answer(stage_id: int, body: CheckAnswerInput) -> dict[str, Any]:
    try:
        return check_answer(stage_id, body.attempt_id, body.question_id, body.answer)
    except ValueError as error:
        raise HTTPException(status_code=404 if str(error) == "unknown stage" else 400, detail=str(error)) from error


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, access_log=False)
