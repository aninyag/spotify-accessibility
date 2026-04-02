export function WhereAmIToast(props: { open: boolean; text: string }) {
  if (!props.open) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 84,
        transform: "translateX(-50%)",
        width: "min(520px, calc(100% - 24px))",
        background: "rgba(40,40,40,0.96)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 12px 48px rgba(0,0,0,0.55)",
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 6 }}>Where am I</div>
      <div style={{ color: "#B3B3B3" }}>{props.text}</div>
    </div>
  );
}

