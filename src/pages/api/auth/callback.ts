import type { APIRoute } from "astro";

const CLIENT_ID = import.meta.env.CLIENT_ID;
const CLIENT_SECRET = import.meta.env.CLIENT_SECRET;
const DISCORD_REDIRECT_URI = import.meta.env.DISCORD_REDIRECT_URI;
const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";
const DISCORD_USER_URL = "https://discord.com/api/users/@me";

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
      displayName:
        discordUser.display_name ||
        discordUser.global_name ||
        discordUser.username, // Obtener displayName
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

    // 3️⃣ Enviar una respuesta HTML que redirige la ventana principal a /Dashboard (donde se carga tu componente Dashboard.astro)
    // y cierra la pestaña emergente.
    const html = `<!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Autenticación Completa</title>
      </head>
      <body>
        <script>
          // Si se abrió como ventana emergente, redirige la ventana principal y cierra esta pestaña.
          if (window.opener) {
            window.opener.location.href = "/dashboardIndex";
            window.close();
          } else {
            // Si no es una ventana emergente, redirige a /dashboardIndex directamente.
            window.location.href = "/dashboardIndex";
          }
        </script>
      </body>
    </html>`;

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  } catch (error) {
    console.error("❌ Error en la autenticación:", error);
    return new Response(
      JSON.stringify({ error: "Server error", details: error }),
      { status: 500 }
    );
  }
};
