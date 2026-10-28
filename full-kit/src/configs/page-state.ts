export const PAGE_STATES = ["loading", "empty", "error", "forbidden"] as const
export type PageStateVariant = (typeof PAGE_STATES)[number]

/** Default wording per state; callers may override any part. */
export const pageStateCopy: Record<
  PageStateVariant,
  { title: string; description: string }
> = {
  loading: { title: "Loading", description: "Fetching the latest data." },
  empty: {
    title: "Nothing here yet",
    description: "There is no data to show.",
  },
  error: {
    title: "Something went wrong",
    description: "The data could not be loaded. Try again.",
  },
  forbidden: {
    title: "No permission",
    description: "Your role does not include access to this.",
  },
}
