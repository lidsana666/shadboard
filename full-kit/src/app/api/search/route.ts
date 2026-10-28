import { NextResponse } from "next/server"
import { UnauthenticatedError } from "@/services/guard"
import { searchEntities } from "@/services/search"

import { ForbiddenError } from "@/lib/rbac"

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? ""
  try {
    return NextResponse.json(await searchEntities(q))
  } catch (e) {
    if (e instanceof UnauthenticatedError)
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 })
    if (e instanceof ForbiddenError)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    return NextResponse.json({ message: "Search failed" }, { status: 500 })
  }
}
