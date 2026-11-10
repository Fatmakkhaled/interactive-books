import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { courses, levels } from "./courses";
import type { Course } from "./courses";
import "./App.css";
import ReadingRobot from "./ReadingRobot";

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    book: (
      <>
        <path d="M12 6C8 3 5 3 2 4v15c3-1 6-1 10 2 4-3 7-3 10-2V4c-3-1-6-1-10 2Z" />
        <path d="M12 6v15" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    bookmark: <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4Z" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 19 19 5M5 5h14v14" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    code: (
      <>
        <path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
      </>
    ),
    monitor: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8m-4-4v4" />
      </>
    ),
    math: (
      <>
        <path d="M19 4H5l8 8-8 8h14" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v18h17M8 16v-5m5 5V7m5 9v-7" />
      </>
    ),
    network: (
      <>
        <rect x="9" y="2" width="6" height="6" rx="1" />
        <rect x="2" y="16" width="6" height="6" rx="1" />
        <rect x="16" y="16" width="6" height="6" rx="1" />
        <path d="M12 8v4M5 16v-4h14v4" />
      </>
    ),
    chip: (
      <>
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4" />
        <rect x="10" y="10" width="4" height="4" />
      </>
    ),
    brain: (
      <>
        <path d="M12 5c-2-4-7-2-7 2-4 1-4 7-1 8-1 5 5 8 8 4 3 4 9 1 8-4 3-1 3-7-1-8 0-4-5-6-7-2Zm0 0v14M6 9l3 2m9-2-3 2M6 16l3-1m9 1-3-1" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.book}
    </svg>
  );
}
function initialBookmarks(): string[] {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem("iu-library-bookmarks") || "[]",
    );
    return Array.isArray(saved)
      ? saved.filter(
          (code): code is string =>
            typeof code === "string" &&
            courses.some((course) => course.code === code),
        )
      : [];
  } catch {
    return [];
  }
}

function readRecentCourses(): string[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("iu-library-recent") || "[]",
    );
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (code): code is string =>
                typeof code === "string" &&
                courses.some((course) => course.code === code),
            ),
          ),
        ].slice(0, 3)
      : [];
  } catch {
    return [];
  }
}
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function useCardReveal() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      prefersReducedMotion() ||
      !("IntersectionObserver" in window)
    )
      return;
    element.classList.add("motion-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return ref;
}
function tiltCard(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== "mouse" || prefersReducedMotion()) return;
  const element = event.currentTarget;
  const bounds = element.getBoundingClientRect();
  element.style.setProperty(
    "--tilt-x",
    `${((event.clientY - bounds.top) / bounds.height - 0.5) * -5}deg`,
  );
  element.style.setProperty(
    "--tilt-y",
    `${((event.clientX - bounds.left) / bounds.width - 0.5) * 5}deg`,
  );
}
function resetTilt(event: PointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty("--tilt-x", "0deg");
  event.currentTarget.style.setProperty("--tilt-y", "0deg");
}
const spotlightCourses = [
  {
    course: courses.find((course) => course.code === "CF117")!,
    description:
      "Every great solution starts with a first line of code. Discover the building blocks of programming.",
  },
  {
    course: courses.find((course) => course.code === "CF216")!,
    description:
      "Turn information into elegant solutions. Explore the structures behind smarter software.",
  },
  {
    course: courses.find((course) => course.code === "AI311")!,
    description:
      "Explore where minds meet machines, and discover a new perspective on intelligence.",
  },
  {
    course: courses.find((course) => course.code === "CF321")!,
    description:
      "Get to know the ideas shaping tomorrow. Take your next step into artificial intelligence.",
  },
];

function CourseCard({
  course,
  saved,
  toggle,
  onOpen,
  index,
}: {
  course: Course;
  saved: boolean;
  toggle: () => void;
  onOpen: (code: string) => void;
  index: number;
}) {
  const revealRef = useCardReveal();
  return (
    <article
      ref={revealRef}
      className={`course-card tone-${course.icon}`}
      style={{ "--reveal-delay": `${(index % 3) * 65}ms` } as CSSProperties}
      onPointerMove={tiltCard}
      onPointerLeave={resetTilt}
    >
      <div className="course-art">
        <div className="art-lines" />
        <span className="subject-icon">
          <Icon name={course.icon} size={28} />
        </span>
        <span className="art-code" aria-hidden="true">
          {course.code}
        </span>
        <span className="art-subject">{course.subject}</span>
        <button
          className={`save-button ${saved ? "is-saved" : ""}`}
          onClick={toggle}
          aria-pressed={saved}
          aria-label={`${saved ? "Remove" : "Save"} ${course.code} ${saved ? "from" : "to"} saved books`}
        >
          <Icon name="bookmark" size={17} />
        </button>
      </div>
      <div className="course-body">
        <div className="course-tags">
          <span className="course-code">{course.code}</span>
          <span className="interactive-label">
            <span /> Interactive book
          </span>
        </div>
        <h3>
          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onOpen(course.code)}
            onAuxClick={(event) => {
              if (event.button === 1) onOpen(course.code);
            }}
          >
            {course.title}
          </a>
        </h3>
        <div className="course-bottom">
          <span>
            {course.level === 0 ? "Foundation" : `Level ${course.level}`}
          </span>
          <a
            className="open-book"
            onClick={() => onOpen(course.code)}
            onAuxClick={(event) => {
              if (event.button === 1) onOpen(course.code);
            }}
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${course.code} ${course.title} (new tab)`}
          >
            Open book <Icon name="arrow" size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}
const copyrightYear = new Date().getFullYear();
function App() {
  const [level, setLevel] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [storageError, setStorageError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentCodes, setRecentCodes] = useState(readRecentCourses);
  const [recentStorageError, setRecentStorageError] = useState(false);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", changed);
    return () => preference.removeEventListener("change", changed);
  }, []);
  const motionOff = reducedMotion;
  const spotlight = spotlightCourses[spotlightIndex];
  const recentCourses = recentCodes
    .map((code) => courses.find((course) => course.code === code)!)
    .filter(Boolean);
  function rememberCourse(code: string) {
    const next = [code, ...recentCodes.filter((item) => item !== code)].slice(
      0,
      3,
    );
    setRecentCodes(next);
    try {
      localStorage.setItem("iu-library-recent", JSON.stringify(next));
      setRecentStorageError(false);
    } catch {
      setRecentStorageError(true);
    }
  }
  function clearRecent() {
    setRecentCodes([]);
    try {
      localStorage.removeItem("iu-library-recent");
      setRecentStorageError(false);
    } catch {
      setRecentStorageError(true);
    }
  }
  function moveHero(event: PointerEvent<HTMLElement>) {
    if (motionOff || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--hero-x",
      `${((event.clientX - bounds.left) / bounds.width - 0.5) * 12}px`,
    );
    event.currentTarget.style.setProperty(
      "--hero-y",
      `${((event.clientY - bounds.top) / bounds.height - 0.5) * 8}px`,
    );
  }
  const filtered = courses.filter(
    (course) =>
      (level === "all" || course.level === level) &&
      (!savedOnly || bookmarks.includes(course.code)) &&
      `${course.code} ${course.title} ${course.subject}`
        .toLowerCase()
        .replace(/\s/g, "")
        .includes(query.toLowerCase().replace(/\s/g, "")),
  );
  function navigate(next: number | "all", saved = false) {
    setLevel(next);
    setSavedOnly(saved);
    setQuery("");
  }
  function toggle(code: string) {
    const next = bookmarks.includes(code)
      ? bookmarks.filter((item) => item !== code)
      : [...bookmarks, code];
    setBookmarks(next);
    try {
      localStorage.setItem("iu-library-bookmarks", JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }
  return (
    <div
      className={`app-shell ${motionOff ? "motion-paused" : "motion-enabled"}`}
    >
      <aside className="sidebar">
        <a
          className="university-brand"
          aria-label="Innovation University interactive library home"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            navigate("all");
          }}
        >
          <img
            className="university-emblem"
            src="/university-emblem.png"
            alt=""
            width="1280"
            height="1280"
            decoding="async"
          />
          <span className="university-wordmark">
            <span className="university-name">
              Innovation
              <br />
              University
            </span>
            <small className="brand-library-label">INTERACTIVE LIBRARY</small>
          </span>
        </a>
        <div className="sidebar-content">
          <p className="nav-label">YOUR LEARNING SPACE</p>
          <nav aria-label="Library navigation">
            <button
              className={`nav-item ${!savedOnly && level === "all" ? "active" : ""}`}
              onClick={() => navigate("all")}
            >
              <Icon name="grid" />
              <span>All books</span>
              <span className="nav-count">{courses.length}</span>
            </button>
            <button
              className={`nav-item ${savedOnly ? "active" : ""}`}
              onClick={() => navigate("all", true)}
            >
              <Icon name="bookmark" />
              <span>Saved books</span>
              <span className="nav-count">{bookmarks.length}</span>
            </button>
            <p className="nav-label levels-label">BROWSE BY LEVEL</p>
            {levels.map((item) => (
              <button
                key={item.value}
                className={`nav-item level-nav ${!savedOnly && level === item.value ? "active" : ""}`}
                onClick={() => navigate(item.value)}
              >
                <span className="level-square">
                  {item.value === 0 ? "F" : `0${item.value}`}
                </span>
                <span>{item.name}</span>
                <Icon name="chevron" size={14} />
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-message">
            <span className="mini-spark">✧</span>
            <strong>Big ideas start here.</strong>
            <p>
              Your next discovery is
              <br />
              just a chapter away.
            </p>
          </div>
          <span className="university-caption">
            <span className="status-dot" /> Innovation University
          </span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            Learning resources <Icon name="chevron" size={13} />
            <strong>Interactive library</strong>
          </div>
          <a
            className="topbar-link"
            href="#collection"
            onClick={() => {
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
          >
            <Icon name="search" size={17} />
            <span>Find your next chapter</span>
          </a>
        </header>
        <main>
          <section className="welcome">
            <div>
              <p className="eyebrow">
                <span /> THE INNOVATION UNIVERSITY LIBRARY
              </p>
              <h1>
                Your knowledge.
                <br className="mobile-break" /> <span>Your next chapter.</span>
              </h1>
              <p className="welcome-copy">
                A world of ideas, organized for you. Explore your courses, open
                a book, and keep moving forward.
              </p>
            </div>
            <span className="welcome-decoration" aria-hidden="true">
              ✧
            </span>
          </section>
          <section
            className="hero-banner"
            onPointerMove={moveHero}
            onPointerLeave={(event) => {
              event.currentTarget.style.setProperty("--hero-x", "0px");
              event.currentTarget.style.setProperty("--hero-y", "0px");
            }}
          >
            <div className="hero-copy">
              <span className="hero-pill">
                <Icon name="spark" size={13} /> MADE FOR CURIOUS MINDS
              </span>
              <h2>
                Great minds.
                <br />
                <em>Limitless possibilities.</em>
              </h2>
              <p>
                Your interactive textbooks, all in one place.
                <br />
                Built around your journey. Ready when you are.
              </p>
              <a
                className="hero-cta"
                href="#collection"
                onClick={() => navigate("all")}
              >
                Explore the collection <Icon name="arrow" size={17} />
              </a>
            </div>
            <div className="hero-robot">
              <ReadingRobot
                activity={
                  query.trim()
                    ? "reading"
                    : savedOnly && bookmarks.length
                      ? "success"
                      : "idle"
                }
              />
            </div>
          </section>
          <div className="stats-strip">
            <div>
              <span className="stat-icon">
                <Icon name="book" />
              </span>
              <p>
                <strong>{courses.length}</strong>
                <span>Interactive books</span>
              </p>
            </div>
            <div>
              <span className="stat-icon">
                <Icon name="layers" />
              </span>
              <p>
                <strong>
                  3 <small>+ Foundation</small>
                </strong>
                <span>Academic levels</span>
              </p>
            </div>
            <div>
              <span className="stat-icon">
                <Icon name="globe" />
              </span>
              <p>
                <strong>One place.</strong>
                <span>A whole world of knowledge</span>
              </p>
            </div>
            <div className="stats-note">
              <span className="status-dot" /> Your learning journey, connected.
            </div>
          </div>
          <section
            className="spotlight-section"
            aria-labelledby="spotlight-heading"
          >
            <div className="spotlight-intro">
              <span className="spotlight-kicker">
                <Icon name="spark" size={14} /> IN THE SPOTLIGHT
              </span>
              <h2 id="spotlight-heading">
                One book.
                <br />
                <em>A whole new perspective.</em>
              </h2>
              <p>A little inspiration for your next learning adventure.</p>
              <div className="spotlight-controls">
                <button
                  aria-label="Previous featured course"
                  onClick={() =>
                    setSpotlightIndex(
                      (index) =>
                        (index + spotlightCourses.length - 1) %
                        spotlightCourses.length,
                    )
                  }
                >
                  ←
                </button>
                <div role="group" aria-label="Featured courses">
                  {spotlightCourses.map((item, index) => (
                    <button
                      key={item.course.code}
                      aria-label={`Feature ${item.course.code}`}
                      aria-pressed={index === spotlightIndex}
                      onClick={() => setSpotlightIndex(index)}
                    >
                      <span />
                    </button>
                  ))}
                </div>
                <button
                  aria-label="Next featured course"
                  onClick={() =>
                    setSpotlightIndex(
                      (index) => (index + 1) % spotlightCourses.length,
                    )
                  }
                >
                  →
                </button>
              </div>
            </div>
            <div className="spotlight-feature" key={spotlight.course.code}>
              <div
                className={`spotlight-art tone-${spotlight.course.icon}`}
                aria-hidden="true"
              >
                <span className="spotlight-orbit" />
                <Icon name={spotlight.course.icon} size={64} />
                <strong>{spotlight.course.code}</strong>
                <span className="spotlight-art-caption">
                  OPEN A NEW POSSIBILITY
                </span>
              </div>
              <div className="spotlight-content">
                <div className="spotlight-tags">
                  <span className="course-code">{spotlight.course.code}</span>
                  <span>
                    Level {spotlight.course.level} · {spotlight.course.subject}
                  </span>
                </div>
                <h3>{spotlight.course.title}</h3>
                <p>{spotlight.description}</p>
                <a
                  href={spotlight.course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => rememberCourse(spotlight.course.code)}
                  onAuxClick={(event) => {
                    if (event.button === 1)
                      rememberCourse(spotlight.course.code);
                  }}
                  className="spotlight-cta"
                  aria-label={`Start learning ${spotlight.course.code} (new tab)`}
                >
                  Start learning <Icon name="arrow" size={16} />
                </a>
              </div>
            </div>
          </section>
          {recentCourses.length > 0 && (
            <section
              className="recent-section"
              aria-labelledby="recent-heading"
            >
              <div className="recent-heading">
                <div>
                  <p className="eyebrow">PICK UP WHERE CURIOSITY LEFT YOU</p>
                  <h2 id="recent-heading">
                    Continue learning<span className="heading-dot">.</span>
                  </h2>
                  <p>Your recently opened courses, ready when you are.</p>
                </div>
                <button onClick={clearRecent}>Clear history</button>
              </div>
              <div className="recent-grid">
                {recentCourses.map((course, index) => (
                  <a
                    className="recent-course"
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={course.code}
                    onClick={() => rememberCourse(course.code)}
                    onAuxClick={(event) => {
                      if (event.button === 1) rememberCourse(course.code);
                    }}
                  >
                    <span className="recent-course-icon">
                      <Icon name={course.icon} size={23} />
                    </span>
                    <span>
                      <small>
                        {course.code}
                        {index === 0 ? " · Last opened" : ""}
                      </small>
                      <strong>{course.title}</strong>
                    </span>
                    <Icon name="arrow" size={17} />
                  </a>
                ))}
              </div>
              {recentStorageError && (
                <p className="storage-notice" role="status">
                  Recently opened courses are available for this session. Your
                  browser is preventing history from being saved for next time.
                </p>
              )}
            </section>
          )}
          <section id="collection" className="collection">
            <div className="collection-heading">
              <div>
                <p className="eyebrow">EXPLORE. LEARN. GROW.</p>
                <h2>
                  {savedOnly ? "Your saved collection" : "The book collection"}
                  <span className="heading-dot">.</span>
                </h2>
              </div>
              <label className="search-field">
                <Icon name="search" size={18} />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by title or course code..."
                  aria-label="Search books by title or course code"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                  >
                    <Icon name="close" size={15} />
                  </button>
                )}
              </label>
            </div>
            <div className="collection-controls">
              <div
                className="level-tabs"
                role="group"
                aria-label="Filter by academic level"
              >
                <button
                  aria-pressed={level === "all"}
                  className={level === "all" ? "selected" : ""}
                  onClick={() => setLevel("all")}
                >
                  All levels{" "}
                  <span>{savedOnly ? bookmarks.length : courses.length}</span>
                </button>
                {levels.map((item) => (
                  <button
                    key={item.value}
                    aria-pressed={level === item.value}
                    className={level === item.value ? "selected" : ""}
                    onClick={() => setLevel(item.value)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <span className="results-count" role="status">
                {filtered.length} {filtered.length === 1 ? "book" : "books"}
              </span>
            </div>
            {storageError && (
              <p className="storage-notice" role="status">
                Bookmarks are available for this session. Your browser is
                preventing them from being saved for next time.
              </p>
            )}
            {filtered.length ? (
              levels
                .filter((item) =>
                  filtered.some((course) => course.level === item.value),
                )
                .map((item) => (
                  <section
                    className="level-section"
                    key={`${item.value}-${level}-${savedOnly}-${query}`}
                    aria-labelledby={`level-${item.value}`}
                  >
                    <div className="level-heading">
                      <span
                        className={`level-heading-icon level-${item.value}`}
                      >
                        {item.value === 0 ? (
                          <Icon name="spark" size={19} />
                        ) : (
                          `0${item.value}`
                        )}
                      </span>
                      <div>
                        <h3 id={`level-${item.value}`}>
                          {item.name}
                          <span>
                            {
                              filtered.filter(
                                (course) => course.level === item.value,
                              ).length
                            }{" "}
                            {filtered.filter(
                              (course) => course.level === item.value,
                            ).length === 1
                              ? "book"
                              : "books"}
                          </span>
                        </h3>
                        <p>{item.description}</p>
                      </div>
                      <span className="section-rule" />
                    </div>
                    <div className="course-grid">
                      {filtered
                        .filter((course) => course.level === item.value)
                        .map((course, index) => (
                          <CourseCard
                            key={course.code}
                            course={course}
                            index={index}
                            onOpen={rememberCourse}
                            saved={bookmarks.includes(course.code)}
                            toggle={() => toggle(course.code)}
                          />
                        ))}
                    </div>
                  </section>
                ))
            ) : (
              <div className="empty-state">
                <span>
                  <Icon
                    name={savedOnly && !query ? "bookmark" : "search"}
                    size={32}
                  />
                </span>
                <h3>
                  {savedOnly && !query
                    ? "Your next favorites belong here."
                    : "No books found."}
                </h3>
                <p>
                  {savedOnly && !query
                    ? "Save a book using its bookmark icon to build your own collection."
                    : "Try a different title, course code, or academic level."}
                </p>
                <button onClick={() => navigate("all")}>
                  Browse all books <Icon name="arrow" size={15} />
                </button>
              </div>
            )}
          </section>
          <section className="closing-note">
            <span>
              <Icon name="spark" size={24} />
            </span>
            <div>
              <h2>A little curiosity goes a long way.</h2>
              <p>Make your next chapter a great one.</p>
            </div>
            <a href="#collection">
              Keep exploring <Icon name="arrow" size={16} />
            </a>
          </section>
          <footer>
            <span>
              © {copyrightYear} Innovation University{" "}
              <span className="footer-divider">/</span> Interactive Library
            </span>
            <span>Created for learning. Inspired by innovation.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
export default App;
