// app/api/instagram/route.ts
import fs from "fs";
import path from "path";

export const revalidate = 86400; // 1 dia

export async function GET() {
  const token = process.env.INSTA_API!;

  async function fetchInstagramData(accessToken: string) {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp,media_type,username&access_token=${accessToken}`,
      { next: { revalidate } }
    );
    return res;
  }

  // 1️⃣ Primeira tentativa
  let res = await fetchInstagramData(token);

  // 2️⃣ Se token expirou → tentar renovar
  if (!res.ok) {
    const errorData = await res.json()

    console.log(errorData)
    if (
      errorData?.error?.code === 190 ||
      errorData?.error?.message?.includes("Session has expired")
    ) {
      console.warn("[Instagram] Token expirado. Renovando...");

      // 3️⃣ Chama endpoint de refresh
      const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`;
      const refreshRes = await fetch(refreshUrl);
      const refreshData = await refreshRes.json();

      if (refreshRes.ok && refreshData?.access_token) {
        const newToken = refreshData.access_token;

        // 5️⃣ Refaz a requisição com o token novo
        res = await fetchInstagramData(newToken);
      } else {
        console.error("[Instagram] Falha ao renovar token:", refreshData);
        return new Response("Erro ao renovar token do Instagram", { status: 500 });
      }
    } else {
      return new Response(
        `Erro ao buscar do Instagram: ${errorData?.error?.message || "desconhecido"}`,
        { status: res.status }
      );
    }
  }

  // 6️⃣ Retorna dados se tudo deu certo
  const data = await res.json();
  return Response.json(data);
}