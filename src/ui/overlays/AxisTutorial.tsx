import * as React from "react";
import { Icon, type IconName } from "../components/Icon";

type Slide = {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  examples?: string[];
  subtext?: string;
  isFinal?: boolean;
};

const slides: Slide[] = [
  {
    id: "voice",
    icon: "mic",
    title: "Say it, play it",
    description: "Use voice commands to control your music without touching your screen.",
    examples: ['"Play my liked songs"', '"Skip this track"', '"What\'s playing?"'],
  },
  {
    id: "quick-actions",
    icon: "zap",
    title: "One tap, instant music",
    description: "Quick actions give you shortcuts to your favorites — no digging through menus.",
    subtext: "Pin your most-played playlists, albums, and searches for instant access.",
  },
  {
    id: "command-palette",
    icon: "command",
    title: "Everything at your fingertips",
    description: "Tap the mic icon to open Axis controls. Search, play, and manage your music all from one place.",
  },
  {
    id: "enable",
    icon: "sparkles",
    title: "Ready to try Axis?",
    description: "You can turn Axis on or off anytime in your profile settings.",
    isFinal: true,
  },
];

export function AxisTutorial(props: { isOpen: boolean; onClose: () => void; onEnable: () => void }) {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    if (props.isOpen) setCurrentSlide(0);
  }, [props.isOpen]);

  if (!props.isOpen) return null;

  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  const handleSkip = () => {
    props.onClose();
    setCurrentSlide(0);
  };

  const handleNext = () => {
    if (isLast) return;
    setCurrentSlide((p) => p + 1);
  };

  const handleEnable = () => {
    props.onEnable();
    props.onClose();
    setCurrentSlide(0);
  };

  return (
    <div className="axisTutorialOverlay" role="dialog" aria-modal="true" aria-label="Axis tutorial">
      <div className="axisTutorialContent">
        <div className="axisTutorialProgress">
          {slides.map((_, index) => (
            <div
              key={slides[index].id}
              className={`axisTutorialDot${index === currentSlide ? " active" : ""}${index < currentSlide ? " completed" : ""}`}
            />
          ))}
        </div>

        <div className="axisTutorialSlide" key={slide.id}>
          <div className="axisTutorialIcon" aria-hidden="true">
            <Icon name={slide.icon} size={48} />
          </div>
          <h2 className="axisTutorialTitle">{slide.title}</h2>
          <p className="axisTutorialDescription">{slide.description}</p>
          {slide.examples ? (
            <div className="axisTutorialExamples">
              {slide.examples.map((example, i) => (
                <div key={i} className="axisTutorialExample">
                  {example}
                </div>
              ))}
            </div>
          ) : null}
          {slide.subtext ? <p className="axisTutorialSubtext">{slide.subtext}</p> : null}
        </div>

        <div className="axisTutorialActions">
          {slide.isFinal ? (
            <>
              <button type="button" className="axisTutorialPrimary" onClick={handleEnable}>
                Enable Axis
              </button>
              <button type="button" className="axisTutorialSecondary" onClick={handleSkip}>
                Maybe later
              </button>
            </>
          ) : (
            <>
              <button type="button" className="axisTutorialPrimary" onClick={handleNext}>
                Next
                <Icon name="chevronRight" size={18} />
              </button>
              <button type="button" className="axisTutorialSecondary" onClick={handleSkip}>
                Skip
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
