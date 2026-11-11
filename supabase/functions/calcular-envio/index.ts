/* =====================================================================
   MUSÉ TENTACIÓN — Edge Function "calcular-envio"
   =====================================================================
   Recibe { direccion, localidad } y devuelve los km por calle desde el
   showroom y el costo del envío según TARIFAS_ENVIO.

   La dirección del showroom NO está en este código (el repo es público):
   sus coordenadas van como secretos en Supabase > Edge Functions > Secrets:
     ORIGEN_LAT   latitud del showroom  (ej. -34.59...)
     ORIGEN_LON   longitud del showroom (ej. -58.38...)

   Servicios gratuitos:
     - Georef (Argentina) / Photon (OpenStreetMap): dirección -> coordenadas.
     - OSRM (OpenStreetMap): distancia manejando por calle.
   Si OSRM no responde se usa la distancia en línea recta x 1,35.

   La usan checkout.js (para mostrar el costo) y crear-preferencia
   (para cobrar el envío en Mercado Pago sin confiar en el navegador).
===================================================================== */

/*
   ⚙ TARIFAS (único lugar a tocar). Se busca el primer tramo cuyo
   hastaKm sea mayor o igual a los km del envío. Más allá del último
   tramo no se hacen envíos por la web (se coordina por WhatsApp).
*/
const TARIFAS_ENVIO = [
    { hastaKm: 2, precio: 4000 },
    { hastaKm: 3.5, precio: 5500 },
    { hastaKm: 5, precio: 7000 }
];

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const AGENTE = "MuseTentacionWeb/1.0 (https://www.musetentacion.com.ar)";

function responder(cuerpo: unknown, estado = 200) {
    return new Response(JSON.stringify(cuerpo), {
        status: estado,
        headers: { ...CORS, "Content-Type": "application/json" }
    });
}

function texto(valor: unknown, max: number) {
    return String(valor ?? "").trim().slice(0, max);
}

function lineaRectaKm(a: [number, number], b: [number, number]) {
    const rad = (g: number) => g * Math.PI / 180;
    const dLat = rad(b[0] - a[0]);
    const dLon = rad(b[1] - a[1]);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/*
   Convierte la dirección en coordenadas.
   1) Georef (API oficial de direcciones de Argentina, gratis): CABA.
   2) Photon (OpenStreetMap) como respaldo, limitado al AMBA.
   (Nominatim bloquea los pedidos desde los servidores de Supabase.)
*/
async function geocodificar(direccion: string, localidad: string) {

    try {
        const georef = new URLSearchParams({
            direccion,
            provincia: "02",
            max: "1"
        });

        const respuesta = await fetch(
            `https://apis.datos.gob.ar/georef/api/direcciones?${georef}`,
            { headers: { "User-Agent": AGENTE }, signal: AbortSignal.timeout(6000) }
        );

        if (respuesta.ok) {
            const datos = await respuesta.json();
            const ubicacion = datos?.direcciones?.[0]?.ubicacion;

            if (ubicacion && Number.isFinite(ubicacion.lat) && Number.isFinite(ubicacion.lon)) {
                return [Number(ubicacion.lat), Number(ubicacion.lon)] as [number, number];
            }
        } else {
            console.warn("Georef respondió", respuesta.status);
        }
    } catch (error) {
        console.warn("Georef no respondió:", error);
    }

    const photon = new URLSearchParams({
        q: `${direccion}, ${localidad}, Buenos Aires, Argentina`,
        limit: "1",
        bbox: "-58.75,-34.85,-58.15,-34.35"
    });

    const respuesta = await fetch(`https://photon.komoot.io/api/?${photon}`, {
        headers: { "User-Agent": AGENTE },
        signal: AbortSignal.timeout(6000)
    });

    if (!respuesta.ok) {
        console.warn("Photon respondió", respuesta.status);
        return null;
    }

    const datos = await respuesta.json();
    const coordenadas = datos?.features?.[0]?.geometry?.coordinates;

    /* Solo resultados con altura: evita ubicar direcciones inventadas. */
    if (!Array.isArray(coordenadas) || !datos?.features?.[0]?.properties?.housenumber) {
        return null;
    }

    return [Number(coordenadas[1]), Number(coordenadas[0])] as [number, number];
}

async function kmPorCalle(origen: [number, number], destino: [number, number]) {
    try {
        const url =
            "https://router.project-osrm.org/route/v1/driving/" +
            `${origen[1]},${origen[0]};${destino[1]},${destino[0]}?overview=false`;

        const respuesta = await fetch(url, {
            headers: { "User-Agent": AGENTE },
            signal: AbortSignal.timeout(6000)
        });

        const datos = await respuesta.json();
        const metros = datos?.routes?.[0]?.distance;

        if (typeof metros === "number") {
            return metros / 1000;
        }
    } catch (error) {
        console.warn("OSRM no respondió, se usa línea recta:", error);
    }

    return lineaRectaKm(origen, destino) * 1.35;
}

Deno.serve(async (pedido) => {

    if (pedido.method === "OPTIONS") {
        return new Response("ok", { headers: CORS });
    }

    if (pedido.method !== "POST") {
        return responder({ error: "Método no permitido." }, 405);
    }

    const origen: [number, number] = [
        Number(Deno.env.get("ORIGEN_LAT")),
        Number(Deno.env.get("ORIGEN_LON"))
    ];

    if (!Number.isFinite(origen[0]) || !Number.isFinite(origen[1]) || !origen[0]) {
        console.error("Faltan los secretos ORIGEN_LAT / ORIGEN_LON.");
        return responder({ error: "Cálculo de envío no configurado." }, 503);
    }

    let datos: any;

    try {
        datos = await pedido.json();
    } catch {
        return responder({ error: "Pedido inválido." }, 400);
    }

    const direccion = texto(datos?.direccion, 120);
    const localidad = texto(datos?.localidad, 80);

    if (direccion.length < 4 || localidad.length < 2) {
        return responder({ error: "Completá la dirección y la localidad." }, 400);
    }

    let destino: [number, number] | null;

    try {
        destino = await geocodificar(direccion, localidad);
    } catch (error) {
        console.error(error);
        return responder({ error: "No pudimos calcular el envío ahora." }, 502);
    }

    if (!destino) {
        return responder({
            encontrada: false,
            error: "No encontramos esa dirección. Revisá calle, altura y localidad."
        });
    }

    const km = Math.round(await kmPorCalle(origen, destino) * 10) / 10;

    const tramo = TARIFAS_ENVIO.find(t => km <= t.hastaKm);

    const maxKm = TARIFAS_ENVIO[TARIFAS_ENVIO.length - 1].hastaKm;

    return responder({
        encontrada: true,
        km,
        dentro_de_zona: Boolean(tramo),
        costo: tramo ? tramo.precio : null,
        max_km: maxKm
    });
});
