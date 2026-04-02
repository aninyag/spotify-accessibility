import type { TabId } from "../types";

const tabs: Array<{ id: TabId; label: string }> = [
  // Visual design v2 uses "IV Mode" as the mode label.
  { id: "now", label: "IV Mode" },
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
          <div
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "var(--text-nav-label)",
              fontWeight: "var(--weight-regular)",
              color: "var(--text-nav)",
              textAlign: "center",
              lineHeight: "16px",
              paddingTop: 6,
            }}
          >
            {t.label}
          </div>
        </button>
      ))}
    </nav>
  );
}

