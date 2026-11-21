import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "./session";
import { userRepository, type PublicUser } from "./user-repository";

/** The signed-in user, or null. `cache` dedupes it within one request. */
export const findCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const session = await readSession();
  return session ? userRepository.findById(session.userId) : null;
});

/** For pages and actions that need a user: redirects to /login otherwise. This is the real auth check. */
export async function getCurrentUser(): Promise<PublicUser> {
  const user = await findCurrentUser();
  if (!user) redirect("/login");
  return user;
}
