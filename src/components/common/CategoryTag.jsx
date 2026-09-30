import { useSettings } from "../../context/SettingsContext.jsx";
import { CategoryIcon } from "./Icons.jsx";

export function CategoryTag({ category }) {
  const { categoryColor } = useSettings();
  const color = categoryColor(category);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: color + "26", color }}
    >
      <CategoryIcon category={category} size={12} />
      {category}
    </span>
  );
}
