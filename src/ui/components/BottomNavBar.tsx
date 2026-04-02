import type { TabId } from "../types";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "now", label: "Now" },
  { id: "search", label: "Search" },
  { id: "library", label: "Library" },
  { id: "discover", label: "Discover" },
  { id: "support", label: "Support" },
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
          <div style={{ fontWeight: 800 }}>{t.label}</div>
        </button>
      ))}
    </nav>
  );
}

