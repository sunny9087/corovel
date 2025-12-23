import { getUserIdFromSession } from "./session";
import { getUserById } from "./auth";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return null;
  }

  return getUserById(userId);
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

