import unittest

from backend.main import STAGES, grade_attempt, make_attempt, make_question, seeded_rng


class GameServiceTests(unittest.TestCase):
    def test_campaign_has_twelve_ordered_stages(self):
        self.assertEqual(len(STAGES), 12)
        self.assertEqual([stage.id for stage in STAGES], list(range(1, 13)))

    def test_attempt_is_deterministic_and_hides_answers(self):
        first = make_attempt(4, "attempt-test-0001")
        second = make_attempt(4, "attempt-test-0001")
        self.assertEqual(first, second)
        self.assertEqual(len(first["questions"]), 5)
        for question in first["questions"]:
            self.assertEqual(len(question["choices"]), 4)
            self.assertEqual(len(set(question["choices"])), 4)
            self.assertNotIn("_answer", question)

    def test_three_correct_answers_pass_and_two_do_not(self):
        stage = STAGES[0]
        rng = seeded_rng(stage.id, "attempt-test-0002")
        correct = []
        for index in range(5):
            question = make_question(stage, index, rng)
            correct.append({"question_id": question["id"], "answer": question["_answer"]})
        self.assertTrue(grade_attempt(stage.id, "attempt-test-0002", correct[:3])["passed"])
        self.assertFalse(grade_attempt(stage.id, "attempt-test-0002", correct[:2])["passed"])

    def test_invalid_attempt_and_stage_are_rejected(self):
        with self.assertRaises(ValueError):
            make_attempt(1, "tiny")
        with self.assertRaises(ValueError):
            make_attempt(13, "attempt-test-0003")


if __name__ == "__main__":
    unittest.main()
