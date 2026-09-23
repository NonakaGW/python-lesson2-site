import { gradeQuiz } from "./quiz-core.mjs";

const MATERIALS = {
  guide: {
    title: "TechNexus 利用ガイド",
    path: "./assets/tech-nexus-guide.pdf",
  },
  lesson: {
    title: "第2回 Pythonを動かしてみよう",
    path: "./assets/lesson-2.pdf",
  },
};

const VALID_VIEWS = new Set(["materials", "quiz"]);

const elements = {
  navButtons: [...document.querySelectorAll("[data-view]")],
  viewPanels: [...document.querySelectorAll("[data-view-panel]")],
  goViewButtons: [...document.querySelectorAll("[data-go-view]")],
  materialButtons: [...document.querySelectorAll("[data-material]")],
  documentTitle: document.querySelector("#document-title"),
  documentFrame: document.querySelector("#document-frame"),
  openDocument: document.querySelector("#open-document"),
  downloadDocument: document.querySelector("#download-document"),
  quizForm: document.querySelector("#quiz-form"),
  quizResult: document.querySelector("#quiz-result"),
  quizScore: document.querySelector("#quiz-score"),
  quizResultTitle: document.querySelector("#quiz-result-title"),
  quizResultMessage: document.querySelector("#quiz-result-message"),
};

function showView(view, updateHash = true) {
  const nextView = VALID_VIEWS.has(view) ? view : "materials";

  for (const panel of elements.viewPanels) {
    const active = panel.dataset.viewPanel === nextView;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  }

  for (const button of elements.navButtons) {
    const active = button.dataset.view === nextView;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  }

  if (updateHash) history.replaceState(null, "", `#${nextView}`);
  window.scrollTo({ top: 0, behavior: "auto" });
}

function viewFromHash() {
  const view = location.hash.replace(/^#/, "");
  return VALID_VIEWS.has(view) ? view : "materials";
}

function showMaterial(key) {
  const material = MATERIALS[key] ?? MATERIALS.guide;
  elements.documentTitle.textContent = material.title;
  elements.documentFrame.src = `${material.path}#view=FitH`;
  elements.documentFrame.title = material.title;
  elements.openDocument.href = material.path;
  elements.downloadDocument.href = material.path;

  for (const button of elements.materialButtons) {
    const active = button.dataset.material === key;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}

function collectAnswers() {
  const data = new FormData(elements.quizForm);
  return Object.fromEntries(data.entries());
}

function clearQuestionState(questionId) {
  const item = document.querySelector(`[data-question-id="${questionId}"]`);
  if (!item) return;
  item.classList.remove("is-correct", "is-wrong");
  const feedback = item.querySelector(`[data-feedback="${questionId}"]`);
  if (feedback) feedback.textContent = "";
  elements.quizResult.hidden = true;
}

function gradeCurrentQuiz(event) {
  event.preventDefault();
  const grade = gradeQuiz(collectAnswers());

  for (const result of grade.questionResults) {
    const item = document.querySelector(`[data-question-id="${result.questionId}"]`);
    const feedback = item.querySelector(`[data-feedback="${result.questionId}"]`);
    item.classList.remove("is-correct", "is-wrong");
    item.classList.add(result.correct ? "is-correct" : "is-wrong");

    if (result.correct) {
      feedback.textContent = "正解！";
    } else if (result.unanswered) {
      feedback.textContent = "未回答の欄があります。入力または選択して、もう一度解答しよう。";
    } else {
      feedback.textContent = "資料を確認して、もう一度挑戦しよう。";
    }
  }

  elements.quizScore.textContent = String(grade.score);
  if (grade.score === grade.total) {
    elements.quizResultTitle.textContent = "全問正解！";
    elements.quizResultMessage.textContent = "第2回で使ったPythonの書き方を理解できています。";
  } else if (grade.score >= 6) {
    elements.quizResultTitle.textContent = "よくできました！";
    elements.quizResultMessage.textContent = "間違えた問題を授業資料で確認して、もう一度挑戦してみよう。";
  } else {
    elements.quizResultTitle.textContent = "ここから覚えればOK！";
    elements.quizResultMessage.textContent = "授業資料の例と自分の答えを見比べてみよう。";
  }

  elements.quizResult.hidden = false;
  elements.quizResult.focus({ preventScroll: true });
  elements.quizResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

elements.navButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

elements.goViewButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.goView));
});

elements.materialButtons.forEach((button) => {
  button.addEventListener("click", () => showMaterial(button.dataset.material));
});

elements.quizForm.addEventListener("input", (event) => {
  const item = event.target.closest("[data-question-id]");
  if (item) clearQuestionState(item.dataset.questionId);
});
elements.quizForm.addEventListener("change", (event) => {
  const item = event.target.closest("[data-question-id]");
  if (item) clearQuestionState(item.dataset.questionId);
});
elements.quizForm.addEventListener("submit", gradeCurrentQuiz);

window.addEventListener("hashchange", () => showView(viewFromHash(), false));

showMaterial("guide");
showView(viewFromHash(), false);
