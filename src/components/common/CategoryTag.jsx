import { CATEGORY_COLORS } from "../../constants.js";
import { CategoryIcon } from "./Icons.jsx";

export function CategoryTag({ category }) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
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
