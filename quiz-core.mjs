export const QUESTION_RULES = [
  { id: 1, fields: [{ name: "q1", answers: ["print"] }] },
  { id: 2, fields: [{ name: "q2", answers: ["#"] }] },
  { id: 3, fields: [{ name: "q3", answers: ["イ"] }] },
  {
    id: 4,
    fields: [
      { name: "q4_1", answers: ["str"] },
      { name: "q4_2", answers: ["int"] },
      { name: "q4_3", answers: ["str"] },
      { name: "q4_4", answers: ["int"] },
    ],
  },
  {
    id: 5,
    fields: [
      { name: "q5_1", answers: ["15"] },
      { name: "q5_2", answers: ["105"] },
    ],
  },
  { id: 6, fields: [{ name: "q6", answers: ["市川"] }] },
  {
    id: 7,
    fields: [
      { name: "q7_1", answers: ["イ"] },
      { name: "q7_2", answers: ["ア"] },
    ],
  },
  { id: 8, fields: [{ name: "q8", validator: isValidFString }] },
];

export function normalizeAnswer(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("ja-JP")
    .replace(/[\s\u3000]/g, "")
    .replace(/[「」『』【】()（）\[\]［］]/g, "")
    .trim();
}

export function normalizeCode(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[\s\u3000]/g, "")
    .trim();
}

export function isValidFString(value) {
  const normalized = normalizeCode(value);
  return /^f(["'])名前は\{name\}です\1$/i.test(normalized);
}

function fieldResult(field, rawValue) {
  const normalized = normalizeAnswer(rawValue);
  const unanswered = normalized.length === 0;
  const correct = field.validator
    ? field.validator(rawValue)
    : !unanswered && field.answers.map(normalizeAnswer).includes(normalized);

  return { name: field.name, correct, unanswered };
}

export function gradeQuiz(values) {
  const questionResults = QUESTION_RULES.map((question) => {
    const fields = question.fields.map((field) => fieldResult(field, values[field.name]));
    return {
      questionId: question.id,
      correct: fields.every((field) => field.correct),
      unanswered: fields.some((field) => field.unanswered),
      fields,
    };
  });

  return {
    score: questionResults.filter((question) => question.correct).length,
    total: questionResults.length,
    questionResults,
  };
}
