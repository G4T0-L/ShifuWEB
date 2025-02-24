import type { APIRoute } from "astro";
import { clearUserSession } from "../../../utils/auth"; // ✅ Ruta corregida

export const GET: APIRoute = async ({ cookies, redirect }) => {
  clearUserSession(cookies);
  return redirect("/");
};
