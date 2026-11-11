/* =====================================================================
   MUSÉ TENTACIÓN — Edge Function "crear-preferencia"
   =====================================================================
   Recibe el carrito desde checkout.js, vuelve a leer los precios desde
   la base (NUNCA confía en los precios del navegador), revisa los topes
   de compra online y crea una preferencia de Mercado Pago (Checkout Pro).
   Devuelve { init_point } para redirigir al cliente a pagar.

   Secretos (Supabase > Edge Functions > Secrets):
     MP_ACCESS_TOKEN  Access Token de la app "MUSE TENTACION" (OBLIGATORIO)
     SITIO_URL        Dirección pública de la web, ej. https://musetentacion.com.ar
                      (opcional; si falta se usa la dirección desde donde se
                      abrió el checkout)
   SUPABASE_URL lo pone Supabase solo. Para leer productos usa la clave
   pública (SUPABASE_ANON_KEY si existe, si no la que manda la web).

   La web la llama con la clave publicable en el header "apikey"
   (probado: funciona con "Verify JWT" encendido).
===================================================================== */

/*
   Topes por categoría en UNIDADES. Tienen que coincidir con
   TOPES_PEDIDO_WEB de checkout.js (si se cambia uno, cambiar el otro).
*/
const TOPES_PEDIDO_WEB: Record<string, number> = {
    donas: 20,
    cuchareables: 10
};

const MAX_ITEMS = 30;
const MAX_CANTIDAD_POR_ITEM = 50;

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function responder(cuerpo: unknown, estado = 200) {
    return new Response(JSON.stringify(cuerpo), {
        status: estado,
        headers: { ...CORS, "Content-Type": "application/json" }
    });
}

function textoCorto(valor: unknown, max: number) {
    return String(valor ?? "").trim().slice(0, max);
}

/* Lectura de la base con la clave pública (respeta RLS: solo activos). */
async function leerTabla(tabla: string, ids: number[], clave: string) {
    const url =
        `${Deno.env.get("SUPABASE_URL")}/rest/v1/${tabla}` +
        `?select=*&activo=eq.true&id=in.(${ids.join(",")})`;

    const respuesta = await fetch(url, {
        headers: { apikey: clave, Authorization: `Bearer ${clave}` }
    });

    if (!respuesta.ok) {
        throw new Error(`No se pudo leer ${tabla}: ${respuesta.status}`);
    }

    return await respuesta.json() as Record<string, any>[];
}

Deno.serve(async (pedido) => {

    if (pedido.method === "OPTIONS") {
        return new Response("ok", { headers: CORS });
    }

    if (pedido.method !== "POST") {
        return responder({ error: "Método no permitido." }, 405);
    }

    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");

    if (!accessToken) {
        console.error("Falta el secreto MP_ACCESS_TOKEN.");
        return responder({ error: "Pago online no configurado." }, 503);
    }

    let datos: any;

    try {
        datos = await pedido.json();
    } catch {
        return responder({ error: "Pedido inválido." }, 400);
    }

    /* ---------- Validar ítems ---------- */

    const items = Array.isArray(datos?.items) ? datos.items : [];

    if (items.length === 0 || items.length > MAX_ITEMS) {
        return responder({ error: "El carrito está vacío o es demasiado grande." }, 400);
    }

    const itemsLimpios = [];

    for (const item of items) {
        const productoId = Number(item?.producto_id);
        const varianteId =
            item?.variante_id == null ? null : Number(item.variante_id);
        const cantidad = Number(item?.cantidad);

        if (
            !Number.isInteger(productoId) || productoId <= 0 ||
            (varianteId !== null && (!Number.isInteger(varianteId) || varianteId <= 0)) ||
            !Number.isInteger(cantidad) || cantidad < 1 ||
            cantidad > MAX_CANTIDAD_POR_ITEM
        ) {
            return responder({ error: "Hay un producto inválido en el carrito." }, 400);
        }

        itemsLimpios.push({ productoId, varianteId, cantidad });
    }

    /* ---------- Precios reales desde la base ---------- */

    const clavePublica =
        Deno.env.get("SUPABASE_ANON_KEY") ||
        pedido.headers.get("apikey") ||
        "";

    let productos: Record<string, any>[];
    let variantes: Record<string, any>[] = [];

    try {
        productos = await leerTabla(
            "productos",
            [...new Set(itemsLimpios.map(i => i.productoId))],
            clavePublica
        );

        const idsVariantes = itemsLimpios
            .map(i => i.varianteId)
            .filter((id): id is number => id !== null);

        if (idsVariantes.length > 0) {
            variantes = await leerTabla(
                "variantes_producto",
                [...new Set(idsVariantes)],
                clavePublica
            );
        }
    } catch (error) {
        console.error(error);
        return responder({ error: "No pudimos verificar los productos." }, 502);
    }

    const unidadesPorCategoria: Record<string, number> = {};
    const itemsMercadoPago = [];

    for (const item of itemsLimpios) {
        const producto = productos.find(p => p.id === item.productoId);

        if (!producto) {
            return responder({ error: "Un producto del carrito ya no está disponible." }, 409);
        }

        let variante = null;

        if (item.varianteId !== null) {
            variante = variantes.find(
                v => v.id === item.varianteId && v.producto_id === producto.id
            );

            if (!variante) {
                return responder({ error: "Una opción del carrito ya no está disponible." }, 409);
            }
        } else if (producto.tiene_variantes) {
            return responder({ error: "Falta elegir una opción de un producto." }, 400);
        }

        const precio = Number(variante?.precio ?? producto.precio);

        if (!Number.isFinite(precio) || precio <= 0) {
            return responder({ error: "Un producto no tiene precio cargado." }, 409);
        }

        const categoria = String(producto.categoria);

        unidadesPorCategoria[categoria] =
            (unidadesPorCategoria[categoria] ?? 0) +
            item.cantidad * (Number(producto.unidades_por_item) || 1);

        const detalle = [variante?.sabor, variante?.tamano]
            .filter(Boolean)
            .join(" · ");

        itemsMercadoPago.push({
            id: String(variante ? `${producto.id}-${variante.id}` : producto.id),
            title: textoCorto(
                detalle ? `${producto.nombre} (${detalle})` : producto.nombre,
                250
            ),
            category_id: "food",
            quantity: item.cantidad,
            unit_price: precio,
            currency_id: "ARS"
        });
    }

    /* ---------- Topes de compra online ---------- */

    for (const [categoria, unidades] of Object.entries(unidadesPorCategoria)) {
        const tope = TOPES_PEDIDO_WEB[categoria];

        if (tope !== undefined && unidades > tope) {
            return responder({
                error: "El pedido supera el máximo de compra online.",
                tope_superado: true
            }, 409);
        }
    }

    /* ---------- Crear la preferencia ---------- */

    const codigo = textoCorto(datos?.codigo, 40) || `MT-${Date.now()}`;

    const sitio = (
        Deno.env.get("SITIO_URL") ||
        pedido.headers.get("origin") ||
        ""
    ).replace(/\/+$/, "");

    const cliente = datos?.cliente ?? {};

    const preferencia: Record<string, unknown> = {
        items: itemsMercadoPago,
        external_reference: codigo,
        statement_descriptor: "MUSE TENTACION",
        payer: {
            name: textoCorto(cliente.nombre, 60),
            surname: textoCorto(cliente.apellido, 60),
            email: textoCorto(cliente.email, 120)
        },
        metadata: {
            codigo_pedido: codigo,
            envio: textoCorto(datos?.envio, 20)
        }
    };

    if (/^https?:\/\//.test(sitio)) {
        const volver = (estado: string) =>
            `${sitio}/checkout.html?pago=${estado}&pedido=${encodeURIComponent(codigo)}`;

        preferencia.back_urls = {
            success: volver("aprobado"),
            pending: volver("pendiente"),
            failure: volver("rechazado")
        };

        /* Mercado Pago solo vuelve solo a la web si la dirección es https. */
        if (sitio.startsWith("https://")) {
            preferencia.auto_return = "approved";
        }
    }

    const respuestaMp = await fetch(
        "https://api.mercadopago.com/checkout/preferences",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "X-Idempotency-Key": crypto.randomUUID()
            },
            body: JSON.stringify(preferencia)
        }
    );

    const resultado = await respuestaMp.json().catch(() => null);

    if (!respuestaMp.ok || !resultado?.init_point) {
        console.error("Error de Mercado Pago:", respuestaMp.status, resultado);
        return responder({ error: "No pudimos generar el link de pago." }, 502);
    }

    return responder({
        id: resultado.id,
        init_point: resultado.init_point,
        codigo
    });
});
