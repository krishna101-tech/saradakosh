"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  ExternalLink,
  Trophy,
  RotateCcw,
  Languages,
  Check,
  X,
  BookOpen,
  Sparkles
} from "lucide-react";
import ThemeSelector from "@/components/ThemeSelector";
import {
  SUPPORTED_LANGUAGES,
  SET_DIFFICULTIES,
  getQuestionsBySet
} from "@/data/quizQuestions";

const UI_STRINGS = {
  en: {
    quizTitle: "Saradakosh Quiz",
    quizSubtitle: "Test your knowledge on the lives and teachings of Sri Ramakrishna, Holy Mother Sri Sarada Devi, and Swami Vivekananda.",
    selectLanguagePrompt: "Select Your Preferred Language",
    selectLanguageDesc: "Choose the language in which you would like to take the quiz. You can change it at any time without losing your progress.",
    startQuiz: "Start Quiz",
    quizSetProgress: (current, total) => `Quiz ${current} of ${total}`,
    levelLabel: "Level",
    questionNumber: (num) => `Question ${num}`,
    checkAnswers: "Check Answers",
    newQuiz: "New Quiz",
    scorecard: "Scorecard",
    resultsTitle: "Quiz Results",
    attempted: "Attempted",
    correct: "Correct",
    incorrect: "Incorrect",
    skipped: "Skipped",
    yourSelectionCorrect: "Your Selection (Correct)",
    yourSelectionIncorrect: "Your Selection (Incorrect)",
    correctAnswer: "Correct Answer",
    skippedQuestion: "Question Skipped",
    verifySource: "Verify Source",
    scorecardTitle: "Scorecard & Progress",
    scorecardBadge: "Coming in Account Phase",
    scorecardDesc: "Authentication and persistent scorecards will be introduced in the upcoming account phase to record your progress, track your scores across quizzes, and earn certificates. For now, enjoy exploring Saradakosh as a guest!",
    closeDialog: "Close",
    backToHome: "Saradakosh Home",
    allQuestionsAnsweredNote: "Review your choices and click Check Answers when ready."
  },
  bn: {
    quizTitle: "সারদা কোষ কুইজ",
    quizSubtitle: "শ্রীরামকৃষ্ণ, শ্রীশ্রীমা সারদা দেবী ও স্বামী বিবেকানন্দের জীবন ও বাণীর উপর আপনার জ্ঞান পরীক্ষা করুন।",
    selectLanguagePrompt: "আপনার পছন্দের ভাষা নির্বাচন করুন",
    selectLanguageDesc: "যে ভাষায় আপনি কুইজ দিতে চান তা বেছে নিন। আপনি যেকোনো সময় অগ্রগতি না হারিয়ে ভাষা পরিবর্তন করতে পারবেন।",
    startQuiz: "কুইজ শুরু করুন",
    quizSetProgress: (current, total) => `কুইজ ${current} / ${total}`,
    levelLabel: "স্তর",
    questionNumber: (num) => `প্রশ্ন ${num}`,
    checkAnswers: "উত্তর যাচাই করুন",
    newQuiz: "পরবর্তী কুইজ",
    scorecard: "স্কোরকার্ড",
    resultsTitle: "কুইজের ফলাফল",
    attempted: "প্রয়াস",
    correct: "সঠিক",
    incorrect: "ভুল",
    skipped: "অনুত্তরিত",
    yourSelectionCorrect: "আপনার নির্বাচন (সঠিক)",
    yourSelectionIncorrect: "আপনার নির্বাচন (ভুল)",
    correctAnswer: "সঠিক উত্তর",
    skippedQuestion: "প্রশ্নটি বাদ দেওয়া হয়েছে",
    verifySource: "উৎস যাচাই করুন",
    scorecardTitle: "স্কোরকার্ড ও অগ্রগতি",
    scorecardBadge: "পরবর্তী সংস্করণে আসছে",
    scorecardDesc: "পরবর্তী ধাপে সাইন-ইন ও অ্যাকাউন্ট সুবিধা যুক্ত হলে স্থায়ী স্কোর ট্র্যাকিং ও অগ্রগতি সংরক্ষণ চালু হবে। বর্তমানে অতিথি হিসেবে সারদা কোষ কুইজ উপভোগ করুন!",
    closeDialog: "বন্ধ করুন",
    backToHome: "সারদা কোষ মূল পাতা",
    allQuestionsAnsweredNote: "আপনার উত্তর নির্বাচন সম্পন্ন করে উত্তর যাচাই করুন বোতামে চাপুন।"
  },
  hi: {
    quizTitle: "शारदा कोश प्रश्नोत्तरी",
    quizSubtitle: "श्रीरामकृष्ण, श्रीमाँ शारदा देवी और स्वामी विवेकानंद के जीवन एवं शिक्षाओं पर अपने ज्ञान का परीक्षण करें।",
    selectLanguagePrompt: "अपनी पसंदीदा भाषा चुनें",
    selectLanguageDesc: "जिस भाषा में आप प्रश्नोत्तरी देना चाहते हैं उसे चुनें। आप अपनी प्रगति खोए बिना कभी भी भाषा बदल सकते हैं।",
    startQuiz: "प्रश्नोत्तरी शुरू करें",
    quizSetProgress: (current, total) => `प्रश्नोत्तरी ${current} / ${total}`,
    levelLabel: "स्तर",
    questionNumber: (num) => `प्रश्न ${num}`,
    checkAnswers: "उत्तर जाँचें",
    newQuiz: "अगली प्रश्नोत्तरी",
    scorecard: "स्कोरकार्ड",
    resultsTitle: "प्रश्नोत्तरी परिणाम",
    attempted: "प्रयास किया",
    correct: "सही",
    incorrect: "गलत",
    skipped: "अनुत्तरित",
    yourSelectionCorrect: "आपका चयन (सही)",
    yourSelectionIncorrect: "आपका चयन (गलत)",
    correctAnswer: "सही उत्तर",
    skippedQuestion: "प्रश्न छोड़ दिया गया",
    verifySource: "स्रोत सत्यापित करें",
    scorecardTitle: "स्कोरकार्ड और प्रगति",
    scorecardBadge: "खाता चरण में उपलब्ध होगा",
    scorecardDesc: "आगामी खाता चरण में साइन-इन की सुविधा उपलब्ध कराई जाएगी जिससे आप अपना स्कोर सहेज सकेंगे और निरंतर प्रगति देख सकेंगे। अभी अतिथि के रूप में आनंद लें!",
    closeDialog: "बंद करें",
    backToHome: "शारदा कोश मुख्य पृष्ठ",
    allQuestionsAnsweredNote: "अपने विकल्पों की समीक्षा करें और तैयार होने पर उत्तर जाँचें पर क्लिक करें।"
  }
};

const CHOICE_LABELS = ["A", "B", "C", "D"];

// Fisher-Yates array shuffle helper
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate an independent shuffled options map for a list of questions
function generateShuffledOptions(questionsList) {
  const map = {};
  let attempts = 0;
  let allFirst = true;

  while (allFirst && attempts < 10) {
    attempts++;
    allFirst = true;
    questionsList.forEach((q) => {
      map[q.id] = shuffleArray(q.options);
      // Check if correct option is at index 0
      const correctIdx = map[q.id].findIndex((opt) => opt.id === q.correctOptionId);
      if (correctIdx !== 0) {
        allFirst = false;
      }
    });
    if (questionsList.length === 0) break;
  }
  return map;
}

export default function QuizClient() {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [currentSet, setCurrentSet] = useState(1);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [shuffledOptionsMap, setShuffledOptionsMap] = useState(() => {
    return generateShuffledOptions(getQuestionsBySet(1));
  });

  // Active language helper (defaults to English for initial prompt)
  const activeLang = selectedLanguage || "en";
  const strings = UI_STRINGS[activeLang] || UI_STRINGS.en;
  const currentDifficulty = SET_DIFFICULTIES[currentSet];

  // 5 questions for active set
  const questions = useMemo(() => getQuestionsBySet(currentSet), [currentSet]);

  // Handle ESC key for Scorecard dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isScorecardOpen) {
        setIsScorecardOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isScorecardOpen]);

  // Select an option for a question
  const handleSelectOption = (questionId, optionId) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  // Submit and check answers
  const handleCheckAnswers = () => {
    setIsSubmitted(true);
    // Scroll smoothly to results summary
    const summaryElem = document.getElementById("quiz-results-summary");
    if (summaryElem) {
      summaryElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Next quiz set (1 -> 2 -> 3 -> 4 -> 5 -> 1)
  const handleNewQuiz = () => {
    const nextSet = currentSet >= 5 ? 1 : currentSet + 1;
    setCurrentSet(nextSet);
    setUserAnswers({});
    setIsSubmitted(false);
    setShuffledOptionsMap(generateShuffledOptions(getQuestionsBySet(nextSet)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate scores
  const scoreSummary = useMemo(() => {
    let attempted = 0;
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    questions.forEach((q) => {
      const selected = userAnswers[q.id];
      if (selected !== undefined) {
        attempted += 1;
        if (selected === q.correctOptionId) {
          correct += 1;
        } else {
          incorrect += 1;
        }
      } else {
        skipped += 1;
      }
    });

    return { attempted, correct, incorrect, skipped };
  }, [questions, userAnswers]);

  return (
    <div className="min-h-screen bg-bg-theme text-text-theme font-sans flex flex-col selection:bg-primary-theme/20 overflow-x-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-bg-theme/95 backdrop-blur-md border-b border-glass-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-text-theme hover:text-primary-theme transition-colors font-serif font-bold text-lg tracking-tight"
          >
            <Image
              src="/images/cosmetics.png"
              alt="Saradakosh Logo"
              width={24}
              height={24}
              className="h-6 w-auto object-contain opacity-90"
            />
            <span>Saradakosh</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher (shown always when a language has been selected) */}
            {selectedLanguage && (
              <nav aria-label="Language selection" className="flex items-center bg-glass-bg border border-glass-border rounded-lg p-0.5">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isActive = selectedLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`px-2.5 py-1 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer min-h-[36px] ${
                        isActive
                          ? "bg-primary-theme text-white shadow-xs"
                          : "text-text-theme/80 hover:text-text-theme hover:bg-glass-hover"
                      }`}
                      aria-pressed={isActive}
                      aria-label={`Switch to ${lang.label}`}
                    >
                      {lang.nativeLabel}
                    </button>
                  );
                })}
              </nav>
            )}

            <ThemeSelector />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* State 1: Initial Language Selection Required */}
        {!selectedLanguage ? (
          <section
            aria-labelledby="lang-prompt-title"
            className="bg-glass-bg border border-glass-border rounded-2xl p-6 sm:p-10 text-center shadow-sm max-w-xl mx-auto mt-4 sm:mt-8"
          >
            <div className="w-12 h-12 rounded-full bg-primary-theme/10 text-primary-theme mx-auto flex items-center justify-center mb-4">
              <Languages className="size-6" />
            </div>

            <h1 id="lang-prompt-title" className="h2-heading text-xl sm:text-2xl font-serif mb-2">
              {UI_STRINGS.en.selectLanguagePrompt}
            </h1>
            <p className="text-sm font-serif text-secondary-theme font-semibold mb-1">
              {UI_STRINGS.bn.selectLanguagePrompt} • {UI_STRINGS.hi.selectLanguagePrompt}
            </p>
            <p className="text-sm text-text-theme/75 mb-8 max-w-md mx-auto leading-relaxed">
              {UI_STRINGS.en.selectLanguageDesc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-glass-border bg-bg-theme hover:border-primary-theme hover:bg-primary-glow/50 text-text-theme transition-all cursor-pointer group min-h-[72px] focus-visible:ring-2 focus-visible:ring-primary-theme outline-none"
                  aria-label={`Select ${lang.label}`}
                >
                  <span className="text-lg font-bold group-hover:text-primary-theme transition-colors">
                    {lang.nativeLabel}
                  </span>
                  <span className="text-xs text-text-theme/60">{lang.label}</span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          /* State 2: Active Quiz Page */
          <div className="space-y-8">
            {/* Set Banner & Progress */}
            <section
              aria-label="Quiz Progress"
              className="bg-glass-bg border border-glass-border rounded-2xl p-5 sm:p-6 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs uppercase tracking-widest font-bold text-secondary-theme">
                    {strings.quizSetProgress(currentSet, 5)}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text-theme leading-tight mt-0.5">
                    {strings.quizTitle}
                  </h1>
                </div>

                <div className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1 rounded-full bg-primary-theme/10 text-primary-theme text-xs font-semibold border border-primary-theme/20">
                  <span>{strings.levelLabel}:</span>
                  <span>{currentDifficulty[activeLang] || currentDifficulty.label}</span>
                </div>
              </div>

              {/* 5-step progress track */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1" aria-label={`Progress: Set ${currentSet} of 5`}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all ${
                      s < currentSet
                        ? "bg-primary-theme"
                        : s === currentSet
                        ? "bg-primary-theme ring-2 ring-primary-theme/30"
                        : "bg-glass-border"
                    }`}
                    title={`Set ${s}`}
                  />
                ))}
              </div>
            </section>

            {/* Results Summary Box (Shown when answers are checked) */}
            {isSubmitted && (
              <section
                id="quiz-results-summary"
                aria-label="Quiz Results Summary"
                className="bg-glass-bg border-2 border-primary-theme/30 rounded-2xl p-6 sm:p-7 shadow-sm animate-fade-in"
              >
                <div className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-glass-border">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary-theme/10 text-primary-theme">
                      <Sparkles className="size-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-text-theme">
                      {strings.resultsTitle}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-secondary-theme">
                    {strings.quizSetProgress(currentSet, 5)}
                  </span>
                </div>

                {/* 4 Score Tiles: Attempted, Correct, Incorrect, Skipped */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {/* Attempted */}
                  <div className="p-3.5 rounded-xl border border-glass-border bg-bg-theme flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-text-theme/70 font-medium mb-1">
                      {strings.attempted}
                    </span>
                    <span className="text-2xl font-bold font-serif text-text-theme">
                      {scoreSummary.attempted} / 5
                    </span>
                  </div>

                  {/* Correct */}
                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium mb-1 flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> {strings.correct}
                    </span>
                    <span className="text-2xl font-bold font-serif text-emerald-700 dark:text-emerald-300">
                      {scoreSummary.correct}
                    </span>
                  </div>

                  {/* Incorrect */}
                  <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-rose-800 dark:text-rose-300 font-medium mb-1 flex items-center gap-1">
                      <XCircle className="size-3.5" /> {strings.incorrect}
                    </span>
                    <span className="text-2xl font-bold font-serif text-rose-700 dark:text-rose-300">
                      {scoreSummary.incorrect}
                    </span>
                  </div>

                  {/* Skipped */}
                  <div className="p-3.5 rounded-xl border border-glass-border bg-bg-theme flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-text-theme/70 font-medium mb-1 flex items-center gap-1">
                      <MinusCircle className="size-3.5" /> {strings.skipped}
                    </span>
                    <span className="text-2xl font-bold font-serif text-text-theme/80">
                      {scoreSummary.skipped}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions for Results */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                  <button
                    onClick={handleNewQuiz}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-theme text-white hover:bg-primary-theme/90 font-medium transition-all shadow-sm cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-primary-theme outline-none"
                    aria-label={strings.newQuiz}
                  >
                    <RotateCcw className="size-4" />
                    <span>{strings.newQuiz}</span>
                  </button>

                  <button
                    onClick={() => setIsScorecardOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-secondary-theme/40 bg-bg-theme hover:bg-glass-hover text-text-theme font-medium transition-all cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-secondary-theme outline-none"
                    aria-label={strings.scorecard}
                  >
                    <Trophy className="size-4 text-secondary-theme" />
                    <span>{strings.scorecard}</span>
                  </button>
                </div>
              </section>
            )}

            {/* List of 5 Questions */}
            <div className="space-y-6">
              {questions.map((q, qIndex) => {
                const selectedOptionId = userAnswers[q.id];
                const isCorrect = selectedOptionId === q.correctOptionId;
                const isSkipped = selectedOptionId === undefined;
                const isIncorrect = !isSkipped && !isCorrect;

                return (
                  <article
                    key={q.id}
                    aria-labelledby={`q-${q.id}-title`}
                    className="bg-glass-bg border border-glass-border rounded-2xl p-5 sm:p-7 shadow-xs space-y-5"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3 pb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary-theme">
                          {strings.questionNumber(qIndex + 1)}
                        </span>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-glass-border/40 text-text-theme/60">
                          {q.id}
                        </span>
                      </div>

                      {/* Status indicator after checking */}
                      {isSubmitted && (
                        <div>
                          {isCorrect && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="size-3.5" />
                              {strings.correct}
                            </span>
                          )}
                          {isIncorrect && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              <XCircle className="size-3.5" />
                              {strings.incorrect}
                            </span>
                          )}
                          {isSkipped && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <MinusCircle className="size-3.5" />
                              {strings.skipped}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Question Text */}
                    <h2
                      id={`q-${q.id}-title`}
                      className="text-lg sm:text-xl font-serif font-semibold text-text-theme leading-relaxed"
                    >
                      {q.question[activeLang] || q.question.en}
                    </h2>

                    {/* 4 Choices */}
                    <fieldset className="space-y-3" aria-label={`Choices for question ${qIndex + 1}`}>
                      <legend className="sr-only">{`Choices for question ${qIndex + 1}`}</legend>

                      {(shuffledOptionsMap[q.id] || q.options).map((opt, optIndex) => {
                        const isChosen = selectedOptionId === opt.id;
                        const isThisCorrect = opt.id === q.correctOptionId;
                        const choiceLabel = CHOICE_LABELS[optIndex] || String.fromCharCode(65 + optIndex);

                        // Calculate styling when submitted vs not submitted
                        let optionStyle =
                          "border-glass-border bg-bg-theme/80 hover:bg-glass-hover text-text-theme";
                        let letterStyle = "bg-glass-border/60 text-text-theme";
                        let statusTag = null;

                        if (!isSubmitted) {
                          if (isChosen) {
                            optionStyle =
                              "border-primary-theme bg-primary-theme/10 text-primary-theme font-medium ring-1 ring-primary-theme";
                            letterStyle = "bg-primary-theme text-white";
                          }
                        } else {
                          if (isThisCorrect) {
                            // Correct option
                            optionStyle =
                              "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-600 font-semibold";
                            letterStyle = "bg-emerald-600 text-white";
                            statusTag = isChosen ? (
                              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                <Check className="size-3.5" /> {strings.yourSelectionCorrect}
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                <Check className="size-3.5" /> {strings.correctAnswer}
                              </span>
                            );
                          } else if (isChosen && !isThisCorrect) {
                            // Chosen incorrect option
                            optionStyle =
                              "border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 ring-1 ring-rose-600 font-medium";
                            letterStyle = "bg-rose-600 text-white";
                            statusTag = (
                              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                                <X className="size-3.5" /> {strings.yourSelectionIncorrect}
                              </span>
                            );
                          } else {
                            // Other unselected options
                            optionStyle =
                              "border-glass-border/60 bg-bg-theme/40 text-text-theme/50 opacity-60";
                            letterStyle = "bg-glass-border/40 text-text-theme/60";
                          }
                        }

                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer min-h-[52px] ${optionStyle} ${
                              isSubmitted ? "cursor-default" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                value={opt.id}
                                data-option-id={opt.id}
                                data-display-position={optIndex}
                                checked={isChosen}
                                disabled={isSubmitted}
                                onChange={() => handleSelectOption(q.id, opt.id)}
                                className="sr-only"
                                aria-label={`Option ${choiceLabel}: ${opt.text[activeLang] || opt.text.en}`}
                              />
                              <span
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${letterStyle}`}
                              >
                                {choiceLabel}
                              </span>
                              <span className="text-sm sm:text-base leading-snug">
                                {opt.text[activeLang] || opt.text.en}
                              </span>
                            </div>

                            {statusTag && <div className="shrink-0 pl-2">{statusTag}</div>}
                          </label>
                        );
                      })}
                    </fieldset>

                    {/* Verify Source Button (Shown after results) */}
                    {isSubmitted && (
                      <div className="pt-2 border-t border-glass-border/60 flex items-center justify-between">
                        <a
                          href={q.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-theme hover:underline py-1.5 px-2.5 rounded-md hover:bg-primary-theme/5 transition-colors focus-visible:ring-2 focus-visible:ring-primary-theme outline-none min-h-[44px]"
                          aria-label={`Verify Source for Question ${qIndex + 1}`}
                        >
                          <BookOpen className="size-4" />
                          <span>{strings.verifySource}</span>
                          <ExternalLink className="size-3 opacity-70" />
                        </a>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {/* Bottom Primary Action Bar */}
            <div className="pt-4 pb-12 flex flex-col items-center justify-center gap-4">
              {!isSubmitted ? (
                <button
                  onClick={handleCheckAnswers}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-3.5 rounded-xl bg-primary-theme text-white hover:bg-primary-theme/90 font-semibold text-base transition-all shadow-md cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-primary-theme outline-none"
                  aria-label="Check Answers for this set"
                >
                  <CheckCircle2 className="size-5" />
                  <span>{strings.checkAnswers}</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
                  <button
                    onClick={handleNewQuiz}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary-theme text-white hover:bg-primary-theme/90 font-semibold text-base transition-all shadow-md cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-primary-theme outline-none"
                    aria-label={strings.newQuiz}
                  >
                    <RotateCcw className="size-5" />
                    <span>{strings.newQuiz}</span>
                  </button>

                  <button
                    onClick={() => setIsScorecardOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-secondary-theme/40 bg-bg-theme hover:bg-glass-hover text-text-theme font-semibold text-base transition-all cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-secondary-theme outline-none"
                    aria-label={strings.scorecard}
                  >
                    <Trophy className="size-5 text-secondary-theme" />
                    <span>{strings.scorecard}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Accessible Scorecard Informational Modal */}
      {isScorecardOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scorecard-modal-title"
          onClick={() => setIsScorecardOpen(false)}
        >
          <div
            className="bg-glass-bg border border-glass-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsScorecardOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-glass-hover text-text-theme/70 hover:text-text-theme transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close dialog"
            >
              <X className="size-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-secondary-theme/15 text-secondary-theme mx-auto flex items-center justify-center mb-1">
              <Trophy className="size-7" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-secondary-theme px-2.5 py-0.5 rounded-full bg-secondary-theme/10">
                {strings.scorecardBadge}
              </span>
              <h3 id="scorecard-modal-title" className="text-xl font-serif font-bold text-text-theme">
                {strings.scorecardTitle}
              </h3>
            </div>

            <p className="text-sm text-text-theme/80 leading-relaxed">
              {strings.scorecardDesc}
            </p>

            <div className="pt-2">
              <button
                onClick={() => setIsScorecardOpen(false)}
                className="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary-theme text-white hover:bg-primary-theme/90 font-medium text-sm transition-all cursor-pointer min-h-[44px]"
              >
                {strings.closeDialog}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
