const STATUS_CLASSES = {
  Completed: "status-completed",
  Partial: "status-partial",
  Overdue: "status-overdue",
  Upcoming: "status-upcoming",
};

export function StatusPill({ status }) {
  return <span className={"status-pill " + (STATUS_CLASSES[status] || "status-upcoming")}>{status}</span>;
}
