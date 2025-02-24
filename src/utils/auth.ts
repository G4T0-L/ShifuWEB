import type { APIContext, APIRoute } from "astro";

const CLIENT_ID = import.meta.env.CLIENT_ID;
const CLIENT_SECRET = import.meta.env.CLIENT_SECRET;
const DISCORD_REDIRECT_URI = import.meta.env.DISCORD_REDIRECT_URI;
const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";
const DISCORD_USER_URL = "https://discord.com/api/users/@me";

// Función para parsear cookies desde la cabecera HTTP
function parseCookies(cookieHeader: string) {
  return cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = decodeURIComponent(value || "");
    return acc;
  }, {} as Record<string, string>);
}

// Obtener usuario desde la sesión
export async function getUserFromSession(context: APIContext) {
  try {
    // 1️⃣ Obtener cookies desde la cabecera HTTP
    const cookieHeader = context.request.headers.get("cookie") || "";
    const cookies = parseCookies(cookieHeader);

    // 2️⃣ Leer la cookie "discord_user"
    const discordUserCookie = cookies["discord_user"];
    if (!discordUserCookie) {
      console.log("⚠️ No se encontró la cookie de usuario.");
      return null;
    }

    // 3️⃣ Parsear el JSON de la cookie
    const userData = JSON.parse(discordUserCookie);

    // 4️⃣ Retornar los datos del usuario
    return {
      id: userData.id,
      username: userData.username,
      displayName: userData.displayName || userData.globalName || userData.username, // Usar displayName si está disponible
      avatarUrl: userData.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`,
    };
  } catch (error) {
    console.error("❌ Error obteniendo el usuario desde la sesión:", error);
    return null;
  }
}

// Guardar sesión del usuario en cookies
export function setUserSession(cookies: APIContext["cookies"], user: any) {
  const userData = JSON.stringify({
    id: user.id,
    username: user.username,
    displayName: user.display_name || user.global_name || user.username, // Almacenar displayName si está disponible
    avatarUrl: user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/0.png`, // Avatar por defecto si no tiene uno
  });

  cookies.set("discord_user", userData, {
    httpOnly: true, // Seguridad mejorada
    secure: import.meta.env.PROD, // Solo seguro en producción
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // Expira en 7 días
  });

  console.log("✅ Sesión guardada en cookies:", userData);
}

// Cerrar sesión (borrar cookie)
export function clearUserSession(cookies: APIContext["cookies"]) {
  cookies.delete("discord_user", { path: "/" });
  console.log("🚪 Sesión cerrada.");
}

// Ruta de autenticación de Discord
export const GET: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  console.log("✅ Código recibido:", code);

  if (!code) {
    return new Response(JSON.stringify({ error: "No code provided" }), {
      status: 400,
    });
  }

  try {
    // 1️⃣ Intercambiar el código por un token de acceso
    const tokenResponse = await fetch(DISCORD_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log("🔑 Token recibido:", tokenData);

    if (!tokenData.access_token) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch access token" }),
        { status: 400 }
      );
    }

    // 2️⃣ Obtener datos del usuario
    const userResponse = await fetch(DISCORD_USER_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const discordUser = await userResponse.json();
    console.log("👤 Usuario obtenido:", discordUser);

    const userData = {
      id: discordUser.id,
      displayName: discordUser.display_name || discordUser.global_name || discordUser.username, // Obtener displayName si está disponible
      username: discordUser.username,
      avatarUrl: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : "https://cdn.discordapp.com/embed/avatars/0.png",
    };

    cookies.set("discord_user", JSON.stringify(userData), {
      httpOnly: true,
      secure: import.meta.env.PROD,
      path: "/",
    });

    return new Response(JSON.stringify(userData), { status: 200 });
  } catch (error) {
    console.error("❌ Error en la autenticación:", error);
    return new Response(
      JSON.stringify({ error: "Server error", details: error }),
      { status: 500 }
    );
  }
};
