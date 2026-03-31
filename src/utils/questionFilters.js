export const ACTIVE_STATUS = "READ";

export const getActiveQuestions = (questions) =>
  questions.filter((question) => question.status !== ACTIVE_STATUS);

export const filterQuestions = (
  questions,
  activeFilter,
  { includeLive = false, animatingQuestionId = null } = {},
) => {
  const isAnimating = (question) => animatingQuestionId === question.id;

  if (activeFilter === "TODO") {
    return questions.filter((question) =>
      includeLive
        ? question.status !== ACTIVE_STATUS || isAnimating(question)
        : true,
    );
  }

  if (activeFilter === "SIN_CLASIFICAR") {
    return questions.filter(
      (question) =>
        (!question.categoryId &&
          (!includeLive || question.status !== ACTIVE_STATUS)) ||
        isAnimating(question),
    );
  }

  if (includeLive && activeFilter === "DIRECTO") {
    return questions.filter(
      (question) =>
        (!question.categoryId && question.status !== ACTIVE_STATUS) ||
        isAnimating(question),
    );
  }

  return questions.filter(
    (question) =>
      (question.categoryId === activeFilter &&
        (!includeLive || question.status !== ACTIVE_STATUS)) ||
      isAnimating(question),
  );
};

export const getQuestionStats = (questions, activeFilter, categories = []) => {
  const total = questions.length;
  const unclassified = questions.filter(
    (question) => !question.categoryId,
  ).length;
  const live = unclassified;

  const activeCategory = categories.find(
    (category) => category.id === activeFilter,
  );
  const activeCategoryTotal = activeCategory
    ? questions.filter((question) => question.categoryId === activeCategory.id)
        .length
    : 0;

  return {
    total,
    unclassified,
    live,
    activeCategory,
    activeCategoryTotal,
  };
};
