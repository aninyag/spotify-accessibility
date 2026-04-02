import type { TabId } from "../types";

const tabs: Array<{ id: TabId; label: string; icon: string }> = [
  { id: "now", label: "Home", icon: "⌂" },
  { id: "search", label: "Search", icon: "⌕" },
  { id: "library", label: "Your Library", icon: "▥" },
  { id: "discover", label: "IV Mode", icon: "◉" },
  { id: "support", label: "Support", icon: "?" },
];

export function BottomNavBar(props: { currentTab: TabId; onTabChange: (t: TabId) => void }) {
  return (
    <nav className="bottomNav" aria-label="Accessible Mode navigation">
      {tabs.map((t, idx) => (
        <button
          key={t.id}
          className="tabBtn"
          type="button"
          role="tab"
          aria-selected={props.currentTab === t.id}
          aria-label={`${t.label}, tab, ${idx + 1} of ${tabs.length}`}
          onClick={() => props.onTabChange(t.id)}
        >
          <div className="navIcon" aria-hidden="true">{t.icon}</div>
          <div className="navLabel">{t.label}</div>
        </button>
      ))}
    </nav>
  );
}

