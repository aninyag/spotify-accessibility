export type AppToast = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

export function ToastContainer(props: { toasts: AppToast[] }) {
  if (props.toasts.length === 0) return null;

  return (
    <div className="toastContainer" role="region" aria-label="Notifications">
      {props.toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role="status">
          {t.message}
        </div>
      ))}
    </div>
  );
}
