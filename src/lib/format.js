import moment from "moment";

export const todayISO = () => moment().format("YYYY-MM-DD");

export const formatDate = (value) => (value ? moment(value).format("MMM D, YYYY") : "");

export const formatDayLabel = (value) => {
  const m = moment(value);
  if (!m.isValid()) return "";
  const diff = m.startOf("day").diff(moment().startOf("day"), "days");
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return m.format("ddd, MMM D");
};

export const formatTime = (value) => {
  if (!value) return "";
  const m = moment(value, ["HH:mm", "H:mm", "HH:mm:ss"]);
  return m.isValid() ? m.format("h:mm A") : value;
};

export const timeAgo = (value) => (value ? moment(value).fromNow() : "");

export const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export const initials = (name) =>
  String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";