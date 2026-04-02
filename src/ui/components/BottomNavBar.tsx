import type { TabId } from "../types";
import { Icon, type IconName } from "./Icon";

const tabs: Array<{ id: TabId; label: string; icon: IconName }> = [
  { id: "discover", label: "Home", icon: "home" },
  { id: "search", label: "Search", icon: "search" },
  { id: "library", label: "Your Library", icon: "library" },
  { id: "now", label: "Control", icon: "compass" },
];

export function BottomNavBar(props: { currentTab: TabId; onTabChange: (t: TabId) => void }) {
  return (
    <nav className="bottomNav" aria-label="Spotify navigation">
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
          <div className="navIcon" aria-hidden="true">
            <Icon name={t.icon} size={22} />
          </div>
          <div className="navLabel">{t.label}</div>
        </button>
      ))}
    </nav>
  );
}

