/** Where signed-in users land. Override with NEXT_PUBLIC_HOME_PATHNAME. */
export const homePathname =
  process.env.NEXT_PUBLIC_HOME_PATHNAME || "/dashboards/engineering"
