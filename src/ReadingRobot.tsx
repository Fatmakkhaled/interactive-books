import { useEffect, useId, useState } from "react";
import "./ReadingRobot.css";

type Activity = "idle" | "reading" | "thinking" | "success" | "retry";
type Expression = "reading" | "curious" | "thinking" | "happy" | "surprised";
const expressions: Expression[] = [
  "reading",
  "curious",
  "thinking",
  "happy",
  "surprised",
];
const automatic: Record<Activity, Expression> = {
  idle: "reading",
  reading: "curious",
  thinking: "thinking",
  success: "happy",
  retry: "curious",
};
const captions: Record<Expression, string> = {
  reading: "One page. So many possibilities.",
  curious: "Ooh, what are we learning?",
  thinking: "Connecting the little dots…",
  happy: "A little more understanding. A big smile!",
  surprised: "There’s always something new to discover!",
};

export default function ReadingRobot({
  activity = "idle",
  motionPaused,
  reducedMotion,
  onToggleMotion,
}: {
  activity?: Activity;
  motionPaused: boolean;
  reducedMotion: boolean;
  onToggleMotion: () => void;
}) {
  const id = `reading-robot-${useId().replace(/:/g, "")}`;
  const [playful, setPlayful] = useState<{
    expression: Expression;
    activity: Activity;
  } | null>(null);
  useEffect(() => {
    if (!playful) return;
    const timer = window.setTimeout(() => setPlayful(null), 4500);
    return () => window.clearTimeout(timer);
  }, [playful]);
  const expression =
    playful?.activity === activity ? playful.expression : automatic[activity];
  const paint = (name: string) => `url(#${id}-${name})`;
  function changeExpression() {
    setPlayful({
      activity,
      expression:
        expressions[(expressions.indexOf(expression) + 1) % expressions.length],
    });
  }
  return (
    <figure
      className={`reading-robot expression-${expression}`}
      data-expression={expression}
      data-activity={activity}
    >
      <button
        type="button"
        className="robot-play"
        onClick={changeExpression}
        aria-label={`Change reading robot expression (currently ${expression})`}
        aria-describedby={`${id}-hint`}
      >
        <svg
          className="robot-illustration"
          viewBox="0 0 360 340"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={`${id}-shell`}
              x1="111"
              y1="55"
              x2="253"
              y2="190"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#fff" />
              <stop offset=".5" stopColor="#fff" />
              <stop offset="1" stopColor="#d7c9ef" />
            </linearGradient>
            <linearGradient
              id={`${id}-purple`}
              x1="118"
              y1="195"
              x2="245"
              y2="290"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#c2a1ef" />
              <stop offset=".5" stopColor="#a77bdf" />
              <stop offset="1" stopColor="#7c45ba" />
            </linearGradient>
            <linearGradient
              id={`${id}-screen`}
              x1="130"
              y1="80"
              x2="235"
              y2="157"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#64408d" />
              <stop offset="1" stopColor="#35204f" />
            </linearGradient>
            <linearGradient
              id={`${id}-cover`}
              x1="91"
              y1="225"
              x2="264"
              y2="293"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#a575da" />
              <stop offset="1" stopColor="#6a399e" />
            </linearGradient>
            <linearGradient
              id={`${id}-page`}
              x1="111"
              y1="215"
              x2="184"
              y2="280"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#fff" />
              <stop offset="1" stopColor="#ede2fc" />
            </linearGradient>
            <radialGradient id={`${id}-shadow`}>
              <stop stopColor="#9964c9" stopOpacity=".23" />
              <stop offset="1" stopColor="#9964c9" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${id}-orb`} cx=".3" cy=".2" r=".8">
              <stop stopColor="#f6eaff" />
              <stop offset=".3" stopColor="#c59aef" />
              <stop offset="1" stopColor="#9661cb" />
            </radialGradient>
            <filter
              id={`${id}-soft-shadow`}
              x="-25%"
              y="-25%"
              width="150%"
              height="160%"
            >
              <feDropShadow
                dx="0"
                dy="7"
                stdDeviation="5"
                floodColor="#6a3591"
                floodOpacity=".14"
              />
            </filter>
          </defs>
          <circle cx="180" cy="173" r="137" fill="#ebdefb" fillOpacity=".45" />
          <circle
            cx="180"
            cy="173"
            r="117"
            stroke="#fff"
            strokeOpacity=".55"
            strokeDasharray="2 8"
          />
          <g
            className="robot-sparkles"
            stroke="#b28bd2"
            strokeWidth="1.7"
            strokeLinecap="round"
          >
            <path d="m64 108 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z" />
            <path d="m280 69 2-6 2 6 6 2-6 2-2 6-2-6-6-2Z" />
            <path d="m295 209 2-5 2 5 5 2-5 2-2 5-2-5-5-2Z" />
          </g>
          <g className="robot-thinking-dots" fill="#a781ce">
            <circle cx="273" cy="97" r="3" />
            <circle cx="287" cy="87" r="4" />
            <circle cx="304" cy="73" r="5" />
          </g>
          <ellipse
            className="robot-floor-shadow"
            cx="180"
            cy="316"
            rx="115"
            ry="18"
            fill={paint("shadow")}
          />
          <g className="robot-float">
            <g className="robot-legs">
              <rect
                x="133"
                y="265"
                width="27"
                height="36"
                rx="13"
                fill="#ceb5eb"
              />
              <rect
                x="201"
                y="265"
                width="27"
                height="36"
                rx="13"
                fill="#bea0dd"
              />
              <path
                d="M129 292c0-7 8-10 18-10s20 5 20 12v6h-38Z"
                fill={paint("shell")}
                stroke="#e2d5ef"
              />
              <path
                d="M194 294c0-7 8-12 19-12 10 0 20 3 20 10v8h-39Z"
                fill={paint("shell")}
                stroke="#e2d5ef"
              />
            </g>
            <path d="M142 173h76v27h-76Z" fill="#c9ade5" />
            <rect
              x="125"
              y="182"
              width="111"
              height="104"
              rx="40"
              fill={paint("purple")}
              filter={paint("soft-shadow")}
            />
            <path
              d="M138 208c4-13 18-18 43-18 24 0 38 6 42 20v29h-85Z"
              fill="#dac4f5"
              fillOpacity=".65"
            />
            <circle cx="181" cy="210" r="12" fill="#f5eaff" fillOpacity=".85" />
            <path d="m181 202 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#b291d6" />
            <g className="robot-head" filter={paint("soft-shadow")}>
              <path
                className="robot-antenna"
                d="M180 54V31"
                stroke="#d2b5ec"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle
                className="robot-antenna-light"
                cx="180"
                cy="24"
                r="10"
                fill={paint("orb")}
              />
              <circle cx="177" cy="21" r="3" fill="#fff" fillOpacity=".65" />
              <rect
                x="87"
                y="101"
                width="31"
                height="52"
                rx="15"
                fill={paint("shell")}
                stroke="#dbc9ee"
              />
              <rect
                x="94"
                y="114"
                width="9"
                height="25"
                rx="4.5"
                fill="#c6a5e6"
              />
              <rect
                x="244"
                y="101"
                width="30"
                height="52"
                rx="15"
                fill={paint("shell")}
                stroke="#d5bfe9"
              />
              <rect
                x="258"
                y="114"
                width="9"
                height="25"
                rx="4.5"
                fill="#ad84cf"
              />
              <rect
                x="105"
                y="49"
                width="151"
                height="135"
                rx="46"
                fill={paint("shell")}
                stroke="#ede4f7"
                strokeWidth="2"
              />
              <path
                d="M129 64c21-9 67-12 98 1"
                stroke="#fff"
                strokeWidth="6"
                strokeLinecap="round"
                opacity=".8"
              />
              <rect
                x="120"
                y="76"
                width="121"
                height="82"
                rx="28"
                fill={paint("screen")}
              />
              <path
                d="M133 88c20-8 66-8 91-1"
                stroke="#b49acc"
                strokeWidth="2"
                strokeLinecap="round"
                opacity=".2"
              />
              <g
                className="robot-face-features"
                stroke="#efddff"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {expression === "reading" && (
                  <>
                    <path className="robot-eye" d="M145 111v11m45-11v11" />
                    <path d="M164 136q7 5 14 0" strokeWidth="3" />
                  </>
                )}
                {expression === "curious" && (
                  <>
                    <path className="robot-eye" d="M150 109v13m51-17v17" />
                    <path d="m145 99 10-3m42-3 10 3" strokeWidth="2.5" />
                    <path d="M173 138q6-5 12 0" strokeWidth="3" />
                  </>
                )}
                {expression === "thinking" && (
                  <>
                    <path className="robot-eye" d="m144 112 13 2m39 0 12-5" />
                    <path d="M170 138h12" strokeWidth="3" />
                  </>
                )}
                {expression === "happy" && (
                  <>
                    <path
                      className="robot-eye"
                      d="M142 119q8-15 16 0m35 0q8-15 16 0"
                    />
                    <path
                      d="M166 134q10 13 20 0"
                      fill="#c79ce8"
                      strokeWidth="3"
                    />
                  </>
                )}
                {expression === "surprised" && (
                  <>
                    <ellipse
                      className="robot-eye"
                      cx="151"
                      cy="113"
                      rx="5"
                      ry="8"
                      fill="#efddff"
                      stroke="none"
                    />
                    <ellipse
                      className="robot-eye"
                      cx="202"
                      cy="113"
                      rx="5"
                      ry="8"
                      fill="#efddff"
                      stroke="none"
                    />
                    <ellipse cx="177" cy="137" rx="5" ry="6" strokeWidth="3" />
                  </>
                )}
              </g>
              <ellipse
                cx="137"
                cy="135"
                rx="7"
                ry="3.5"
                fill="#d995dc"
                opacity=".4"
              />
              <ellipse
                cx="219"
                cy="135"
                rx="7"
                ry="3.5"
                fill="#d995dc"
                opacity=".4"
              />
              <path
                d="M165 172h30"
                stroke="#d9c6eb"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
            <g className="robot-book">
              <path
                d="M93 225q47-12 87 10 43-22 88-9l-7 55q-43-7-81 12-42-19-81-12Z"
                fill={paint("cover")}
                stroke="#8b5cb9"
                strokeWidth="2"
              />
              <path
                d="m105 218-1 52q38-5 76 13 35-18 77-14l1-51q-42-8-78 13-36-21-75-13Z"
                fill={paint("page")}
                stroke="#e6d7f3"
                strokeWidth="1.5"
              />
              <path d="M180 232v50" stroke="#b992d9" strokeWidth="2" />
              <g stroke="#d3bce9" strokeWidth="2" strokeLinecap="round">
                <path d="m119 231 42 8m-42 1 39 8m-39 2 29 6m49-16 43-9m-43 18 43-8m-43 17 31-7" />
              </g>
              <path
                className="robot-turning-page"
                d="M181 232q23-29 64-16v48q-34-9-64 19Z"
                fill="#fff"
                stroke="#e3d0f1"
                strokeWidth="1.5"
              />
              <path
                d="M179 285v7"
                stroke="#5f328d"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path d="m227 266 4 19 6-6 7 4-5-21" fill="#c3a0e3" />
            </g>
            <g
              className="robot-hands"
              fill={paint("shell")}
              stroke="#dfcdec"
              strokeWidth="1.5"
            >
              <path d="M111 208c-10-3-20 7-19 18l4 21c2 8 16 7 19-1l4-13c2-6-4-12-9-9l-3 6 1-12" />
              <path d="M249 207c10-3 20 7 19 18l-4 21c-2 8-16 7-19-1l-4-13c-2-6 4-12 9-9l3 6-1-12" />
            </g>
          </g>
        </svg>
        <span className="robot-action-hint" id={`${id}-hint`}>
          Tap for a little personality <span aria-hidden="true">✧</span>
        </span>
      </button>
      <figcaption>
        <strong>Your little study buddy</strong>
        <span className="robot-caption" aria-live="polite">
          {activity === "retry" && playful?.activity !== activity
            ? "A little pause. We can try again."
            : captions[expression]}
        </span>
        <button
          type="button"
          className="robot-motion-toggle"
          disabled={reducedMotion}
          aria-pressed={motionPaused}
          aria-label={
            reducedMotion
              ? "Robot motion reduced by your device"
              : motionPaused
                ? "Resume animations"
                : "Pause animations"
          }
          onClick={onToggleMotion}
        >
          {reducedMotion
            ? "Reduced motion"
            : motionPaused
              ? "▷ Resume motion"
              : "Ⅱ Pause motion"}
        </button>
      </figcaption>
    </figure>
  );
}
