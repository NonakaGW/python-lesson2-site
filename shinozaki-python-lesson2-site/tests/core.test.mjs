import test from "node:test";
import assert from "node:assert/strict";

import { gradeQuiz, isValidFString, normalizeAnswer } from "../quiz-core.mjs";

const correctAnswers = {
  q1: "print",
  q2: "#",
  q3: "イ",
  q4_1: "str",
  q4_2: "int",
  q4_3: "str",
  q4_4: "int",
  q5_1: "15",
  q5_2: "105",
  q6: "市川",
  q7_1: "イ",
  q7_2: "ア",
  q8: 'f"名前は{name}です"',
};

test("全問正解を8問として判定する", () => {
  const result = gradeQuiz(correctAnswers);
  assert.equal(result.score, 8);
  assert.equal(result.total, 8);
  assert.ok(result.questionResults.every((question) => question.correct));
});

test("複数欄のうち1つでも違えば、その問題は不正解になる", () => {
  const result = gradeQuiz({ ...correctAnswers, q4_4: "str" });
  assert.equal(result.score, 7);
  assert.equal(result.questionResults.find((question) => question.questionId === 4).correct, false);
});

test("未回答を判定できる", () => {
  const result = gradeQuiz({ ...correctAnswers, q5_2: "" });
  const question = result.questionResults.find((item) => item.questionId === 5);
  assert.equal(question.correct, false);
  assert.equal(question.unanswered, true);
});

test("全角英数字や空白を正規化する", () => {
  assert.equal(normalizeAnswer(" ＰＲＩＮＴ "), "print");
});

test("f文字列はダブルクォーテーションとシングルクォーテーションを受け付ける", () => {
  assert.equal(isValidFString('f"名前は{name}です"'), true);
  assert.equal(isValidFString("f'名前は{name}です'"), true);
  assert.equal(isValidFString('"名前は野中です"'), false);
});
