export const reviewSortOptions = [
  { value: "newest", label: "Most recent" },
  { value: "helpful", label: "Most helpful" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];
export const ratingOptions = [
  { value: "", label: "All ratings" },
  ...[5, 4, 3, 2, 1].map((n) => ({
    value: String(n),
    label: `${n} ${n === 1 ? "star" : "stars"}`,
  })),
];
