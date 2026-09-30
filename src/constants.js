/** Shown in the About dialog. Keep in sync with the version field in package.json. */
export const APP_VERSION = "1.0.0";

export const EXPENSE_CATEGORIES = [
  "Food",
  "Groceries",
  "Transport",
  "Rent",
  "Bills",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

export const CATEGORY_COLORS = {
  Food: "#E39C8F",
  Groceries: "#A3B18A",
  Transport: "#7FA3C4",
  Rent: "#B08968",
  Bills: "#D3A85C",
  Shopping: "#B48CC7",
  Entertainment: "#E8C468",
  Health: "#6FA98A",
  Education: "#8996A6",
  Other: "#BDB4A6",
};

export const INCOME_SOURCES = ["Salary", "Freelance", "Gift", "Other"];
export const PAYMENT_METHODS = ["Cash", "Card", "Online"];
export const CURRENCIES = ["GBP", "EUR", "USD", "INR"];
export const RECURRENCE_TYPES = ["monthly", "weekly", "yearly", "onetime"];
export const RECURRENCE_LABELS = {
  monthly: "Monthly",
  weekly: "Weekly",
  yearly: "Yearly",
  onetime: "One-time",
};

export const BUDGET_CATEGORIES = [
  "Housing",
  "Transportation",
  "Insurance",
  "Subscriptions",
  "Utilities",
  "Debt",
  "Savings",
  "Healthcare",
  "Personal",
  "Education",
  "Family",
  "Other",
];

/** Maps the old fixed expense categories to a sensible default budget category during migration. */
export const OLD_CATEGORY_TO_BUDGET_CATEGORY = {
  Rent: "Housing",
  Bills: "Utilities",
  Health: "Healthcare",
  Education: "Education",
  Entertainment: "Subscriptions",
  Transport: "Transportation",
  Shopping: "Personal",
  Food: "Personal",
  Groceries: "Personal",
  Other: "Other",
};

/** Keyword lists used to guess an expense category from free-typed quick-add text. */
export const CATEGORY_KEYWORDS = {
  Food: ["coffee", "lunch", "dinner", "breakfast", "snack", "restaurant", "cafe", "tea", "pizza", "burger"],
  Groceries: ["grocery", "groceries", "supermarket", "market"],
  Transport: ["bus", "taxi", "uber", "fuel", "gas", "metro", "train", "parking", "ticket", "cab"],
  Rent: ["rent"],
  Bills: [
    "bill",
    "electricity",
    "water bill",
    "internet",
    "phone",
    "subscription",
    "wifi",
    "insurance",
    "credit card",
    "loan",
  ],
  Shopping: ["shopping", "clothes", "amazon", "store", "shoes"],
  Entertainment: ["movie", "netflix", "game", "concert", "party", "spotify", "cinema", "prime"],
  Health: ["doctor", "pharmacy", "medicine", "gym", "clinic", "hospital"],
  Education: ["book", "course", "tuition", "school", "class"],
};

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
