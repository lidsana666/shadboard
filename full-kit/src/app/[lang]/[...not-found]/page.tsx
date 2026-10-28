import { notFound } from "next/navigation"

// A catch-all that renders a page answers 200. Calling notFound() hands the
// request to the nearest not-found boundary ([lang]/not-found.tsx) with a 404.
export default function NotFoundPage() {
  notFound()
}
