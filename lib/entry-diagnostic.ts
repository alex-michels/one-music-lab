import { diagnosticQuestions } from './content/adapters';
export { diagnosticQuestions };

export function diagnosticResult(answers: readonly (string | null)[]) {
  if (
    answers.length !== diagnosticQuestions.length ||
    diagnosticQuestions.some(
      (question, i) =>
        answers[i] !== null &&
        !question.options.some((option) => option.id === answers[i]),
    )
  )
    return null;
  const review = diagnosticQuestions
    .filter((question, i) => answers[i] !== question.answer)
    .map((question) => question.topic);
  return { review, recommended: review[0] ?? null };
}
