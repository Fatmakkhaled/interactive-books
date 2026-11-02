import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { courses } from "./courses";
import { studyModes } from "./study-types";
import type { StudyMode, StudyResult } from "./study-types";
import "./StudyAssistant.css";
import ReadingRobot from "./ReadingRobot";

type Props = {
  onBack: () => void;
  motionPaused: boolean;
  reducedMotion: boolean;
  onToggleMotion: () => void;
};
function References({ ids, result }: { ids: number[]; result: StudyResult }) {
  return (
    <div className="study-references">
      {ids.map((id) => {
        const source = result.sources.find((item) => item.id === id);
        return source ? (
          <details key={id}>
            <summary>Source {id}</summary>
            <p>{source.text}</p>
          </details>
        ) : null;
      })}
    </div>
  );
}
export default function StudyAssistant({
  onBack,
  motionPaused,
  reducedMotion,
  onToggleMotion,
}: Props) {
  const [mode, setMode] = useState<StudyMode>("summary");
  const [courseCode, setCourseCode] = useState("");
  const [notes, setNotes] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<"checking" | "ready" | "unavailable">(
    "checking",
  );
  const [busy, setBusy] = useState(false);
  const [readingPdf, setReadingPdf] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StudyResult | null>(null);
  const [resultMode, setResultMode] = useState<StudyMode>("summary");
  const [fileName, setFileName] = useState("");
  const [revealed, setRevealed] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState<number[]>([]);
  const requestRef = useRef<AbortController | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/study", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable");
        const data = await response.json();
        setStatus(data.available ? "ready" : "unavailable");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("unavailable");
      });
    return () => {
      controller.abort();
      requestRef.current?.abort();
    };
  }, []);
  const hasDraft =
    notes.trim().length >= 120 &&
    notes.trim().length <= 30000 &&
    (mode !== "answer" || question.trim().length >= 5);
  async function upload(file: File | undefined) {
    if (!file) return;
    setReadingPdf(true);
    setError("");
    try {
      const { readPdf } = await import("./pdf-text");
      const extracted = await readPdf(file);
      setNotes(extracted);
      setFileName(file.name);
      setResult(null);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "This PDF could not be read.",
      );
    } finally {
      setReadingPdf(false);
      if (uploadRef.current) uploadRef.current.value = "";
    }
  }
  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasDraft || busy || readingPdf) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setBusy(true);
    setError("");
    setResult(null);
    setRevealed([]);
    setAnswers({});
    setChecked([]);
    try {
      const response = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ mode, courseCode, notes, question }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "The assistant could not complete your request.",
        );
      if (
        !data.title ||
        !Array.isArray(data.sources) ||
        !Array.isArray(data.sections) ||
        !Array.isArray(data.flashcards) ||
        !Array.isArray(data.quiz) ||
        !Array.isArray(data.missingInformation)
      )
        throw new Error(
          "The assistant returned an incomplete response. Please try again.",
        );
      setResult(data);
      setResultMode(mode);
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ block: "start" }),
      );
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure instanceof Error
            ? failure.message
            : "The assistant could not connect. Please try again.",
        );
    } finally {
      if (requestRef.current === controller) {
        setBusy(false);
        requestRef.current = null;
      }
    }
  }
  function cancel() {
    requestRef.current?.abort();
    requestRef.current = null;
    setBusy(false);
  }
  function clear() {
    setNotes("");
    setQuestion("");
    setFileName("");
    setResult(null);
    setError("");
  }
  const locked = busy || readingPdf;
  return (
    <section className="study-assistant" aria-labelledby="study-heading">
      <button className="study-back" onClick={onBack}>
        ← Back to the library
      </button>
      <div className="study-welcome">
        <div className="study-welcome-copy">
          <span className="study-ai-badge">✧ YOUR PERSONAL STUDY PARTNER</span>
          <h1 id="study-heading">
            Big ideas.
            <br />
            <em>A little more clarity.</em>
          </h1>
          <p>
            Turn your course material into moments of understanding.
            <br />
            Bring your notes. Choose your way to learn.
          </p>
        </div>
        <ReadingRobot
          motionPaused={motionPaused}
          reducedMotion={reducedMotion}
          onToggleMotion={onToggleMotion}
          activity={
            busy || readingPdf
              ? "thinking"
              : error
                ? "retry"
                : result
                  ? "success"
                  : notes.trim()
                    ? "reading"
                    : "idle"
          }
        />
      </div>
      <div
        className="study-tool-grid"
        role="group"
        aria-label="Choose a study tool"
      >
        {studyModes.map((item) => (
          <button
            disabled={locked}
            key={item.id}
            className={mode === item.id ? "study-tool active" : "study-tool"}
            aria-pressed={mode === item.id}
            onClick={() => {
              setMode(item.id);
              setError("");
            }}
          >
            <span aria-hidden="true">{item.symbol}</span>
            <strong>{item.title}</strong>
            <small>{item.description}</small>
          </button>
        ))}
      </div>
      <div className="study-layout">
        <form className="study-input-panel" onSubmit={generate}>
          <div className="study-panel-heading">
            <span>01</span>
            <div>
              <h2>Your learning material</h2>
              <p>Answers start with the sources you bring.</p>
            </div>
          </div>
          <label className="study-label" htmlFor="study-course">
            Choose your course <span>Optional</span>
          </label>
          <select
            id="study-course"
            value={courseCode}
            onChange={(event) => setCourseCode(event.target.value)}
            disabled={locked}
          >
            <option value="">General study</option>
            {courses.map((course) => (
              <option key={course.code} value={course.code}>
                {course.code} · {course.title}
              </option>
            ))}
          </select>
          <div className="study-label-row">
            <label className="study-label" htmlFor="study-notes">
              Paste your notes or textbook excerpt
            </label>
            <button type="button" onClick={clear} disabled={locked || !notes}>
              Clear
            </button>
          </div>
          <textarea
            id="study-notes"
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setFileName("");
            }}
            disabled={locked}
            placeholder="Paste a section from your lecture notes or interactive book here…"
            aria-describedby="notes-help notes-count"
            maxLength={30000}
          />
          <div className="study-notes-meta">
            <span id="notes-help">120–30,000 characters</span>
            <span id="notes-count">
              {notes.length.toLocaleString()} / 30,000
            </span>
          </div>
          <div className="study-upload">
            <span aria-hidden="true">↑</span>
            <div>
              <strong>
                {readingPdf
                  ? "Reading your PDF…"
                  : fileName || "Have your notes as a PDF?"}
              </strong>
              <small>Text-based PDFs · up to 10 MB and 60 pages</small>
            </div>
            <button
              type="button"
              disabled={locked}
              onClick={() => uploadRef.current?.click()}
            >
              {fileName ? "Replace PDF" : "Choose PDF"}
            </button>
            <input
              ref={uploadRef}
              type="file"
              accept="application/pdf,.pdf"
              aria-label="Upload a PDF"
              onChange={(event) => void upload(event.target.files?.[0])}
              hidden
            />
          </div>
          {mode === "answer" && (
            <>
              <label
                className="study-label question-label"
                htmlFor="study-question"
              >
                What would you like to understand?
              </label>
              <textarea
                className="study-question"
                id="study-question"
                disabled={locked}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a question about your material…"
                minLength={5}
                maxLength={1000}
                required
              />
            </>
          )}
          <p className="study-privacy">
            PDF text is extracted in your browser. Material is sent to Google
            Gemini only when you choose Generate, under its{" "}
            <a
              href="https://ai.google.dev/gemini-api/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              API terms
            </a>
            . Your notes and answers aren’t saved by this library.
          </p>
          {status === "checking" && (
            <p className="study-status" role="status">
              Checking your study partner’s availability…
            </p>
          )}
          {status === "unavailable" && (
            <div className="study-status" role="status">
              <strong>Your study partner is being prepared.</strong>
              <p>
                You can add your notes now. AI generation will be available once
                the library team finishes setup.
              </p>
              <button
                type="button"
                disabled={locked}
                onClick={() => {
                  setStatus("checking");
                  fetch("/api/study")
                    .then((response) => response.json())
                    .then((data) =>
                      setStatus(data.available ? "ready" : "unavailable"),
                    )
                    .catch(() => setStatus("unavailable"));
                }}
              >
                Check again
              </button>
            </div>
          )}
          {error && (
            <p className="study-error" role="alert">
              {error}
            </p>
          )}
          <div className="study-submit-row">
            <button
              className="study-generate"
              type="submit"
              disabled={!hasDraft || locked || status !== "ready"}
            >
              {busy
                ? "Creating your study material…"
                : `Generate ${mode === "answer" ? "answer" : mode === "quiz" ? "practice quiz" : mode === "summary" ? "summary" : mode === "explain" ? "explanation" : "flashcards"}`}{" "}
              <span aria-hidden="true">{busy ? "◌" : "↗"}</span>
            </button>
            {busy && (
              <button type="button" className="study-cancel" onClick={cancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
        <aside className="study-guide">
          <div className="study-guide-icon">✧</div>
          <p className="eyebrow">A BETTER WAY TO STUDY</p>
          <h2>
            Understanding
            <br /> over memorizing.
          </h2>
          <ol>
            <li>
              <span>1</span>
              <div>
                <strong>Bring a little context.</strong>
                <p>A focused chapter or a few pages of notes work best.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>Make it your own.</strong>
                <p>Start with a summary, then test yourself with a quiz.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>Follow the source.</strong>
                <p>Open source references to check the original excerpt.</p>
              </div>
            </li>
          </ol>
          <div className="study-guide-note">
            Choosing a course adds context. It doesn’t give the assistant access
            to that course’s external book.
          </div>
          <p className="study-ai-caution">
            AI can make mistakes. Check important details against your course
            material and instructor’s guidance.
          </p>
        </aside>
      </div>
      <div
        ref={resultRef}
        className="study-result-anchor"
        aria-live="polite"
        aria-busy={busy}
      >
        {busy && (
          <div className="study-loading">
            <span aria-hidden="true">✧</span>
            <h2>A little clarity is on its way.</h2>
            <p>Reading your material and connecting the ideas…</p>
          </div>
        )}
        {result && (
          <section
            className="study-results"
            aria-labelledby="study-result-title"
          >
            <div className="study-result-topline">
              <span>
                ✧{" "}
                {studyModes
                  .find((item) => item.id === resultMode)
                  ?.title.toUpperCase()}
              </span>
              <button
                onClick={() => {
                  setResult(null);
                  setRevealed([]);
                  setAnswers({});
                  setChecked([]);
                }}
              >
                Clear result
              </button>
            </div>
            <h2 id="study-result-title">{result.title}</h2>
            <p className="study-overview">{result.overview}</p>
            {result.missingInformation.length > 0 && (
              <div className="study-missing">
                <strong>What the material doesn’t tell us</strong>
                <ul>
                  {result.missingInformation.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.sections.map((section, index) => (
              <section className="study-answer-section" key={index}>
                <h3>{section.heading}</h3>
                <p>{section.body}</p>
                <References ids={section.sourceIds} result={result} />
              </section>
            ))}
            {result.flashcards.length > 0 && (
              <div className="study-flashcards">
                {result.flashcards.map((card, index) => (
                  <article
                    key={index}
                    className={
                      revealed.includes(index)
                        ? "study-flashcard revealed"
                        : "study-flashcard"
                    }
                  >
                    <span className="study-card-number">
                      CARD {index + 1} / {result.flashcards.length}
                    </span>
                    <h3>{card.question}</h3>
                    <button
                      aria-expanded={revealed.includes(index)}
                      onClick={() =>
                        setRevealed((previous) =>
                          previous.includes(index)
                            ? previous.filter((item) => item !== index)
                            : [...previous, index],
                        )
                      }
                    >
                      {revealed.includes(index)
                        ? "Hide answer ↑"
                        : "Reveal answer ↗"}
                    </button>
                    {revealed.includes(index) && (
                      <div className="study-flashcard-answer">
                        <p>{card.answer}</p>
                        <References ids={card.sourceIds} result={result} />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
            {result.quiz.length > 0 && (
              <div className="study-quiz">
                {result.quiz.map((item, index) => (
                  <fieldset className="study-quiz-question" key={index}>
                    <legend>
                      <span>QUESTION {index + 1}</span>
                      {item.question}
                    </legend>
                    {item.options.map((option, optionIndex) => (
                      <label
                        className={`study-quiz-option ${checked.includes(index) && optionIndex === item.answerIndex ? "correct" : ""}`}
                        key={optionIndex}
                      >
                        <input
                          type="radio"
                          name={`quiz-${index}`}
                          value={optionIndex}
                          disabled={checked.includes(index)}
                          checked={answers[index] === optionIndex}
                          onChange={() =>
                            setAnswers((previous) => ({
                              ...previous,
                              [index]: optionIndex,
                            }))
                          }
                        />
                        <span>{String.fromCharCode(65 + optionIndex)}</span>
                        {option}
                      </label>
                    ))}
                    {!checked.includes(index) ? (
                      <button
                        className="study-check-answer"
                        disabled={answers[index] === undefined}
                        onClick={() =>
                          setChecked((previous) => [...previous, index])
                        }
                      >
                        Check answer
                      </button>
                    ) : (
                      <div className="study-quiz-feedback">
                        <strong>
                          {answers[index] === item.answerIndex
                            ? "That’s right!"
                            : `Keep learning. The answer is ${String.fromCharCode(65 + item.answerIndex)}.`}
                        </strong>
                        <p>{item.explanation}</p>
                        <References ids={item.sourceIds} result={result} />
                      </div>
                    )}
                  </fieldset>
                ))}
                <button
                  className="study-reset-quiz"
                  onClick={() => {
                    setAnswers({});
                    setChecked([]);
                  }}
                >
                  Try the quiz again ↻
                </button>
              </div>
            )}
            <p className="study-result-footnote">
              Study support, grounded in your supplied material. Always check
              the original sources.
            </p>
          </section>
        )}
      </div>
    </section>
  );
}
