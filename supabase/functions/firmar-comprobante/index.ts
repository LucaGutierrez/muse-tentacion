/* =====================================================================
   MUSÉ TENTACIÓN — Edge Function "firmar-comprobante"
   =====================================================================
   Recibe { ruta } de un comprobante recién subido al bucket privado
   "comprobantes" y devuelve un link firmado (válido 1 año) para verlo
   con un clic desde el mail del pedido, sin entrar a Supabase.

   Seguridad:
   - El nombre tiene que tener el formato MT-AAMMDD-1234-xxxxxxxx.ext
     (8 caracteres al azar: imposible de adivinar).
   - Solo firma archivos subidos hace menos de 15 minutos, así nadie
     puede pedir links de comprobantes viejos.
   Usa SUPABASE_SERVICE_ROLE_KEY, que Supabase pone solo (nunca va
   en la web).
===================================================================== */

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const FORMATO = /^MT-[0-9]{6}-[0-9]{4}-[0-9a-f]{8}\.(jpg|png|webp|heic|pdf)$/;
const MAX_MINUTOS = 15;
const VALIDEZ_SEGUNDOS = 365 * 24 * 60 * 60;

function responder(cuerpo: unknown, estado = 200) {
    return new Response(JSON.stringify(cuerpo), {
        status: estado,
        headers: { ...CORS, "Content-Type": "application/json" }
    });
}

Deno.serve(async (pedido) => {

    if (pedido.method === "OPTIONS") {
        return new Response("ok", { headers: CORS });
    }

    if (pedido.method !== "POST") {
        return responder({ error: "Método no permitido." }, 405);
    }

    const base = Deno.env.get("SUPABASE_URL");
    const clave = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!base || !clave) {
        return responder({ error: "No configurado." }, 503);
    }

    let ruta = "";

    try {
        ruta = String((await pedido.json())?.ruta ?? "");
    } catch {
        return responder({ error: "Pedido inválido." }, 400);
    }

    if (!FORMATO.test(ruta)) {
        return responder({ error: "Comprobante inválido." }, 400);
    }

    const cabeceras = {
        apikey: clave,
        Authorization: `Bearer ${clave}`,
        "Content-Type": "application/json"
    };

    /* ¿Existe y es reciente? */
    const listado = await fetch(
        `${base}/storage/v1/object/list/comprobantes`,
        {
            method: "POST",
            headers: cabeceras,
            body: JSON.stringify({ prefix: "", search: ruta, limit: 5 })
        }
    );

    const archivos = listado.ok ? await listado.json() : [];
    const archivo = Array.isArray(archivos)
        ? archivos.find((a: any) => a?.name === ruta)
        : null;

    if (!archivo) {
        return responder({ error: "Comprobante no encontrado." }, 404);
    }

    const minutos =
        (Date.now() - new Date(archivo.created_at).getTime()) / 60000;

    if (!(minutos >= 0 && minutos <= MAX_MINUTOS)) {
        return responder({ error: "Comprobante vencido." }, 403);
    }

    /* Link firmado */
    const firma = await fetch(
        `${base}/storage/v1/object/sign/comprobantes/${ruta}`,
        {
            method: "POST",
            headers: cabeceras,
            body: JSON.stringify({ expiresIn: VALIDEZ_SEGUNDOS })
        }
    );

    const resultado = await firma.json().catch(() => null);

    const relativo = resultado?.signedURL || resultado?.signedUrl;

    if (!firma.ok || !relativo) {
        console.error("No se pudo firmar:", firma.status, resultado);
        return responder({ error: "No se pudo generar el link." }, 502);
    }

    return responder({
        url: `${base}/storage/v1${relativo}`
    });
});
