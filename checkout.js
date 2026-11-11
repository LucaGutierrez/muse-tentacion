/* ===========================
   CHECKOUT MUSÉ TENTACIÓN
=========================== */


/* =====================================================
   ⚙ CONFIGURACIÓN DEL PEDIDO WEB (único lugar a tocar)
   =====================================================

   TOPES_PEDIDO_WEB: máximo de UNIDADES por categoría que
   se pueden comprar online en un solo pedido.

   - maxUnidades:     tope de unidades reales de esa categoría.
   - unidadesPorItem: cuántas unidades trae cada ítem del
                      carrito (las donas se venden en combos
                      de 2). Si el producto en Supabase tiene
                      `unidades_por_item`, manda ese valor.
   - nombre:          cómo se muestra en el aviso.

   Ejemplo: donas con maxUnidades 20 y unidadesPorItem 2
   → hasta 10 combos de 2 donas.

   Para cambiar un tope: modificar maxUnidades.
   Para quitar el tope de una categoría: borrar su línea.
   Categorías que no figuran acá: sin límite.
   Para sumar una categoría nueva: agregar una línea con
   la misma clave que la columna `categoria` de Supabase.

   Si se supera algún tope, el checkout no deja pagar online
   y ofrece escribir por WhatsApp o mail con el detalle.

   ⚠ Los mismos topes están repetidos en el servidor
   (supabase/functions/crear-preferencia/index.ts), que es
   el que manda de verdad. Si se cambia uno, cambiar el otro.
*/

const TOPES_PEDIDO_WEB = {
    donas: {
        nombre: "Donas",
        maxUnidades: 20,
        unidadesPorItem: 2
    },
    cuchareables: {
        nombre: "Cuchareables",
        maxUnidades: 10,
        unidadesPorItem: 1
    }
};

/*
    PAGO POR TRANSFERENCIA
    - descuentoPorcentaje: % OFF sobre los productos (no sobre el
      envío). Se toma de promociones.js; 0 = sin descuento.
    - alias / cbu / banco: datos de la cuenta donde transfieren.
      Se muestran solo en el checkout al elegir transferencia.
    El cliente tiene que subir el comprobante (foto o PDF) para
    confirmar. Se guarda en Supabase Storage, bucket privado
    "comprobantes" (solo se ve desde el panel de Supabase).
*/

const PAGO_TRANSFERENCIA = {
    // El % se cambia en promociones.js (DESCUENTO_TRANSFERENCIA).
    descuentoPorcentaje:
        typeof DESCUENTO_TRANSFERENCIA === "number" ? DESCUENTO_TRANSFERENCIA : 10,
    alias: "muse.ar",
    cbu: "0000003100004474595473",
    banco: "Mercado Pago"
};

const MAX_MB_COMPROBANTE = 5;

/*
    Datos de contacto para pedidos grandes.
    whatsapp: solo números, con código de país y sin "+".
              Ej: "5491112345678"
*/

/*
    Fecha de la versión vigente de terminos.html y privacidad.html.
    Si se cambian esas páginas, actualizar también esta fecha.
*/

const VERSION_LEGALES = "11/11/2026";

/*
    Al tildar la casilla de aceptación se borra el aviso de error.
*/

document
    .getElementById("aceptoLegales")
    ?.addEventListener("change", evento => {

        if (evento.target.checked) {
            document
                .getElementById("bloqueAceptoLegales")
                ?.classList.remove("con-error");
        }

    });

const CONTACTO_PEDIDOS = {
    whatsapp: "5491133491144",
    email: "musetentacionarg@gmail.com"
};


/* ================================================== */

/*
    Clave del carrito en localStorage. Es la misma que usa
    script.js. Se cambió respecto de la web anterior para
    descartar carritos viejos.
*/

const CLAVE_CARRITO = "carritoMuseTentacion";

const carritoCheckout = JSON.parse(
    localStorage.getItem(CLAVE_CARRITO)
) || [];

const productosResumen = document.getElementById("productosResumen");
const subtotalCheckout = document.getElementById("subtotalCheckout");
const envioCheckout = document.getElementById("envioCheckout");
const totalCheckout = document.getElementById("totalCheckout");

const formularioCheckout = document.getElementById("formularioCheckout");
const datosEnvio = document.getElementById("datosEnvio");
const confirmacionPedido = document.getElementById("confirmacionPedido");
const numeroPedido = document.getElementById("numeroPedido");
const mensajeError = document.getElementById("mensajeError");
const enlaceWhatsApp = document.getElementById("enlaceWhatsApp");

/*
    Por ahora el envío no tiene costo fijo: retiro es gratis
    y el envío a domicilio se coordina por WhatsApp.
    Cuando haya tarifas, se cargan en el data-precio de cada
    opción en checkout.html.
*/

let costoEnvioSeleccionado = 0;


/*
    Textos de cada forma de entrega (resumen, mail del
    pedido y WhatsApp).
*/

const NOMBRES_ENVIO = {
    retiro: "Retiro gratis en showroom (dirección por privado)",
    domicilio: "Envío a domicilio (hasta 5 km del showroom)"
};


/* ===========================
   FORMATO DE PRECIOS
=========================== */

function formatearPrecio(precio) {

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(precio);

}


/* ===========================
   ESCAPAR TEXTO PARA HTML
=========================== */

function escaparHtml(texto) {

    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}


/* ===========================
   CALCULAR SUBTOTAL
=========================== */

function calcularSubtotal() {

    return carritoCheckout.reduce(
        (total, producto) =>
            total + producto.precio * producto.cantidad,
        0
    );

}


/* ===========================
   TOPE DE PEDIDO WEB
=========================== */

/*
    Devuelve la categoría de un ítem del carrito.
    Si un ítem no trae `categoria`, se intenta deducir
    por el nombre. Si tampoco se puede, devuelve null y
    ese ítem bloquea el pago online (ver calcularExcesosTope).
*/

function obtenerCategoriaItem(item) {

    const categoria = String(item.categoria || "")
        .trim()
        .toLowerCase();

    if (categoria) {
        return categoria;
    }

    const nombre = String(item.nombre || "").toLowerCase();

    if (nombre.includes("dona")) {
        return "donas";
    }

    if (nombre.includes("cuchar")) {
        return "cuchareables";
    }

    return null;

}


function obtenerUnidadesItem(item) {

    const categoria = obtenerCategoriaItem(item);

    const configuracion = TOPES_PEDIDO_WEB[categoria];

    const unidadesPorItem =
        Number(item.unidades_por_item) ||
        Number(configuracion?.unidadesPorItem) ||
        1;

    return Number(item.cantidad || 0) * unidadesPorItem;

}


/*
    Devuelve la lista de problemas que impiden pagar online:
    - categorías que superan su tope;
    - ítems cuya categoría no se puede saber (no se puede
      verificar el tope, así que se coordinan por WhatsApp/mail).
    Lista vacía = el pedido se puede pagar online.
    Cada problema trae `mensaje` para mostrar en el aviso.
*/

function calcularExcesosTope() {

    const unidadesPorCategoria = {};

    const itemsSinCategoria = [];

    carritoCheckout.forEach(item => {

        const categoria = obtenerCategoriaItem(item);

        if (!categoria) {
            itemsSinCategoria.push(item);
            return;
        }

        if (!TOPES_PEDIDO_WEB[categoria]) {
            return;
        }

        unidadesPorCategoria[categoria] =
            (unidadesPorCategoria[categoria] || 0) +
            obtenerUnidadesItem(item);

    });

    const excesos = Object.entries(unidadesPorCategoria)
        .filter(([categoria, unidades]) => {

            return unidades > TOPES_PEDIDO_WEB[categoria].maxUnidades;

        })
        .map(([categoria, unidades]) => {

            const nombre =
                TOPES_PEDIDO_WEB[categoria].nombre || categoria;

            const maxUnidades =
                TOPES_PEDIDO_WEB[categoria].maxUnidades;

            return {
                categoria,
                nombre,
                unidades,
                maxUnidades,
                mensaje:
                    `${nombre}: tenés ${unidades} unidades ` +
                    `y el máximo online es ${maxUnidades}.`
            };

        });

    itemsSinCategoria.forEach(item => {

        excesos.push({
            categoria: null,
            nombre: item.nombre || "Producto",
            unidades: Number(item.cantidad || 0),
            maxUnidades: 0,
            mensaje:
                `${item.nombre || "Un producto"}: no pudimos verificarlo ` +
                "para la compra online."
        });

    });

    return excesos;

}


function pedidoSuperaTope() {

    return calcularExcesosTope().length > 0;

}


function valorCampo(id) {

    return document.getElementById(id)?.value.trim() || "";

}


/*
    Texto con el detalle del pedido para WhatsApp / mail.
*/

function armarDetallePedidoGrande() {

    const lineasProductos = carritoCheckout.map(item => {

        const detalle = item.descripcion
            ? ` (${item.descripcion})`
            : "";

        return (
            `- ${item.cantidad} x ${item.nombre}${detalle}` +
            ` — ${formatearPrecio(item.precio * item.cantidad)}`
        );

    });

    const nombreCompleto =
        `${valorCampo("nombre")} ${valorCampo("apellido")}`.trim();

    const lineas = [
        "Hola MUSÉ TENTACIÓN! Quiero hacer este pedido:",
        "",
        ...lineasProductos,
        "",
        `Total productos: ${formatearPrecio(calcularSubtotal())}`
    ];

    if (nombreCompleto) {
        lineas.push(`Nombre: ${nombreCompleto}`);
    }

    if (valorCampo("telefono")) {
        lineas.push(`Teléfono: ${valorCampo("telefono")}`);
    }

    if (valorCampo("localidad")) {
        lineas.push(`Localidad: ${valorCampo("localidad")}`);
    }

    lineas.push("", "¿Me confirman disponibilidad y forma de pago?");

    return lineas.join("\n");

}


function construirUrlWhatsApp(texto) {

    if (CONTACTO_PEDIDOS.whatsapp.includes("[[")) {
        console.warn(
            "Falta definir CONTACTO_PEDIDOS.whatsapp en checkout.js"
        );
    }

    return (
        `https://wa.me/${CONTACTO_PEDIDOS.whatsapp}` +
        `?text=${encodeURIComponent(texto)}`
    );

}


function construirUrlMail(texto) {

    const asunto = "Pedido MUSÉ TENTACIÓN";

    return (
        `mailto:${CONTACTO_PEDIDOS.email}` +
        `?subject=${encodeURIComponent(asunto)}` +
        `&body=${encodeURIComponent(texto)}`
    );

}


/*
    Muestra (u oculta) el aviso de tope y bloquea el pago.
    Usa el contenedor #avisoTopePedido si existe en el HTML;
    si no, lo crea arriba del formulario.
*/

function actualizarAvisoTope() {

    const excesos = calcularExcesosTope();

    const botonConfirmar = formularioCheckout.querySelector(
        'button[type="submit"]'
    );

    let aviso = document.getElementById("avisoTopePedido");

    if (excesos.length === 0) {

        aviso?.setAttribute("hidden", "");

        if (botonConfirmar) {
            botonConfirmar.disabled = false;
        }

        return;

    }

    if (!aviso) {

        aviso = document.createElement("section");
        aviso.id = "avisoTopePedido";
        formularioCheckout.before(aviso);

    }

    aviso.className = "aviso-provisorio aviso-tope-pedido";
    aviso.setAttribute("role", "alert");
    aviso.removeAttribute("hidden");

    const detalleExcesos = excesos
        .map(exceso => `<li>${escaparHtml(exceso.mensaje)}</li>`)
        .join("");

    aviso.innerHTML = `
        <h2>Tu pedido es grande 🎉</h2>
        <p>
            Por la web podemos tomar pedidos chicos. Para este pedido
            escribinos y lo coordinamos personalmente:
        </p>
        <ul>${detalleExcesos}</ul>
        <div class="aviso-tope-acciones">
            <a
                id="avisoTopeWhatsApp"
                class="boton-whatsapp"
                href="#"
                target="_blank"
                rel="noopener noreferrer">
                Pedir por WhatsApp
            </a>
            <a
                id="avisoTopeMail"
                class="boton-mail-pedido"
                href="#">
                Pedir por mail
            </a>
        </div>
    `;

    /*
        Los links se arman al hacer clic, así incluyen
        los datos que el cliente ya haya completado.
    */

    aviso
        .querySelector("#avisoTopeWhatsApp")
        .addEventListener("click", evento => {

            evento.currentTarget.href =
                construirUrlWhatsApp(armarDetallePedidoGrande());

        });

    aviso
        .querySelector("#avisoTopeMail")
        .addEventListener("click", evento => {

            evento.currentTarget.href =
                construirUrlMail(armarDetallePedidoGrande());

        });

    if (botonConfirmar) {
        botonConfirmar.disabled = true;
    }

}


/* ===========================
   MERCADO PAGO (Checkout Pro)
=========================== */

/*
    Crear el pago necesita el Access Token de Mercado Pago, que
    es SECRETO: vive solo en la Edge Function de Supabase
    "crear-preferencia" (supabase/functions/crear-preferencia).

    Le mandamos los ítems (producto_id, variante_id, cantidad) y
    los datos del cliente. La función vuelve a leer los precios
    desde la base, revisa los topes y devuelve la URL de pago
    (init_point). Acá solo redirigimos.

    Si la función no responde, el pedido igual queda registrado
    por Formspree y el link de pago se manda a mano.
*/

const URL_CREAR_PREFERENCIA =
    "https://sawsneidzpovlqnnirti.supabase.co/functions/v1/crear-preferencia";

const CLAVE_PUBLICA_SUPABASE =
    "sb_publishable_kLWVNRFOTKld9A51sAWG-g_FVFScEia";

/*
    `pedido` = { codigo, items, cliente, envio }
    Devuelve la URL de pago de Mercado Pago.
*/

async function crearLinkMercadoPago(pedido) {

    if (pedidoSuperaTope()) {
        throw new Error("El pedido supera el tope de compra online.");
    }

    const respuesta = await fetch(URL_CREAR_PREFERENCIA, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: CLAVE_PUBLICA_SUPABASE
        },
        body: JSON.stringify({
            codigo: pedido.codigo,
            envio: pedido.envio,
            direccion: pedido.direccion,
            localidad: pedido.localidad,
            cliente: pedido.cliente,
            items: pedido.items.map(item => ({
                producto_id: item.producto_id,
                variante_id: item.variante_id ?? null,
                cantidad: item.cantidad
            }))
        })
    });

    const resultado = await respuesta.json().catch(() => null);

    if (!respuesta.ok || !resultado?.init_point) {
        throw new Error(
            resultado?.error || "No pudimos generar el link de pago."
        );
    }

    return resultado.init_point;

}


/*
    Cambia los textos de la pantalla de confirmación.
    Campos opcionales: etiqueta, icono, marca, detalle, texto.
*/

function configurarConfirmacion(textos) {

    const elementos = {
        etiqueta: ".confirmacion-etiqueta",
        icono: ".mp-icono",
        marca: ".mercado-pago-marca strong",
        detalle: ".mercado-pago-marca small",
        texto: ".instruccion-comprobante"
    };

    Object.entries(elementos).forEach(([clave, selector]) => {

        const elemento = confirmacionPedido?.querySelector(selector);

        if (elemento && textos[clave]) {
            elemento.textContent = textos[clave];
        }

    });

}


/*
    Cuando el cliente vuelve de Mercado Pago, la URL trae
    ?pago=aprobado|pendiente|rechazado&pedido=MT-...
    Mostramos el resultado. El carrito se vacía solo si el
    pago se aprobó o quedó pendiente.
*/

function mostrarResultadoPago() {

    const parametros = new URLSearchParams(window.location.search);

    const estado = parametros.get("pago");

    if (!estado) {
        return false;
    }

    const codigo = parametros.get("pedido") || "";

    if (estado === "rechazado") {

        mensajeError.textContent =
            "El pago no se pudo completar. Podés intentarlo de nuevo " +
            "o escribirnos por WhatsApp y lo resolvemos.";

        return false;

    }

    localStorage.removeItem(CLAVE_CARRITO);

    carritoCheckout.length = 0;

    formularioCheckout.style.display = "none";

    confirmacionPedido?.classList.add("visible");

    if (estado === "aprobado") {

        configurarConfirmacion({
            etiqueta: "PAGO APROBADO",
            detalle: "Pago aprobado",
            texto:
                "¡Listo! Recibimos tu pago. Te escribimos por WhatsApp " +
                "para coordinar la entrega o el retiro."
        });

    } else {

        configurarConfirmacion({
            etiqueta: "PAGO PENDIENTE",
            detalle: "Pago pendiente",
            texto:
                "Tu pago está en proceso. Cuando Mercado Pago lo confirme " +
                "te escribimos para coordinar la entrega o el retiro."
        });

    }

    if (numeroPedido && codigo) {
        numeroPedido.textContent = `Número de pedido: ${codigo}`;
    }

    if (enlaceWhatsApp) {

        enlaceWhatsApp.href = construirUrlWhatsApp(
            `Hola MUSÉ TENTACIÓN! Pagué el pedido ${codigo} ` +
            "por Mercado Pago. ¿Coordinamos la entrega?"
        );

    }

    return true;

}


/* ===========================
   MOSTRAR PRODUCTOS
=========================== */

function dibujarResumen() {

    productosResumen.innerHTML = "";

    if (carritoCheckout.length === 0) {

        productosResumen.innerHTML = `
            <p class="carrito-checkout-vacio">
                Tu carrito está vacío.
            </p>
        `;

    }

    carritoCheckout.forEach(producto => {

        const articulo = document.createElement("article");

        articulo.className = "producto-resumen";

        articulo.innerHTML = `

            <img
                src="${escaparHtml(producto.imagen)}"
                alt="${escaparHtml(producto.nombre)}">

            <div>

                <h3>
                    ${escaparHtml(producto.nombre)}
                </h3>

                <p>
                    ${
                        [
                            producto.descripcion,
                            `Cantidad: ${producto.cantidad}`
                        ]
                            .filter(Boolean)
                            .map(escaparHtml)
                            .join(" · ")
                    }
                </p>

            </div>

            <strong>
                ${formatearPrecio(
                    producto.precio * producto.cantidad
                )}
            </strong>

        `;

        productosResumen.appendChild(articulo);

    });

    actualizarTotales();

}


/* ===========================
   ACTUALIZAR TOTALES
=========================== */

function obtenerEnvioElegido() {

    return document.querySelector(
        'input[name="envio"]:checked'
    )?.value || "retiro";

}


function textoCostoEnvio() {

    if (costoEnvioSeleccionado > 0) {
        return formatearPrecio(costoEnvioSeleccionado);
    }

    return obtenerEnvioElegido() === "domicilio"
        ? "Calculalo abajo"
        : "Gratis";

}


function obtenerPagoElegido() {

    return document.querySelector(
        'input[name="pago"]:checked'
    )?.value || "mercadopago";

}


/*
    Descuento por transferencia, sobre los productos.
*/

function calcularDescuento() {

    if (obtenerPagoElegido() !== "transferencia") {
        return 0;
    }

    return Math.round(
        calcularSubtotal() *
        (Number(PAGO_TRANSFERENCIA.descuentoPorcentaje) || 0) / 100
    );

}


function actualizarTotales() {

    const subtotal = calcularSubtotal();

    const descuento = calcularDescuento();

    const total =
        subtotal - descuento + costoEnvioSeleccionado;

    const filaDescuento = document.getElementById("filaDescuento");

    if (filaDescuento) {

        filaDescuento.hidden = descuento === 0;

        document.getElementById("descuentoCheckout").textContent =
            `-${formatearPrecio(descuento)}`;

    }

    const montoTransferir = document.getElementById("montoTransferir");

    if (montoTransferir) {
        montoTransferir.textContent = formatearPrecio(total);
    }

    subtotalCheckout.textContent =
        formatearPrecio(subtotal);

    envioCheckout.textContent =
        textoCostoEnvio();

    totalCheckout.textContent =
        formatearPrecio(total);

}


/* ===========================
   MARCAR TARJETAS ELEGIDAS
=========================== */

function actualizarTarjetasSeleccionadas(nombreGrupo) {

    document
        .querySelectorAll(
            `input[name="${nombreGrupo}"]`
        )
        .forEach(input => {

            input
                .closest(".tarjeta-opcion")
                ?.classList.toggle(
                    "seleccionada",
                    input.checked
                );

        });

}


/* ===========================
   CAMBIO DE ENTREGA
=========================== */

/*
    Los campos de dirección solo se muestran
    si eligen envío a domicilio.
*/

function actualizarCamposEnvio() {

    if (!datosEnvio) {
        return;
    }

    datosEnvio.hidden =
        obtenerEnvioElegido() !== "domicilio";

}


document
    .querySelectorAll('input[name="envio"]')
    .forEach(input => {

        input.addEventListener("change", () => {

            costoEnvioSeleccionado =
                input.value === "domicilio"
                    ? Number(envioCalculado?.costo || 0)
                    : Number(input.dataset.precio || 0);

            actualizarTarjetasSeleccionadas("envio");

            actualizarCamposEnvio();

            actualizarTotales();

        });

    });


/* ===========================
   CALCULAR ENVÍO A DOMICILIO
=========================== */

/*
    La Edge Function "calcular-envio" geolocaliza la dirección,
    mide los km por calle desde el showroom y aplica la tarifa
    (las tarifas y el radio máximo están en esa función).
    envioCalculado = { direccion, localidad, km, costo } o null.
    Si el cliente cambia la dirección, hay que volver a calcular.
*/

const URL_CALCULAR_ENVIO =
    "https://sawsneidzpovlqnnirti.supabase.co/functions/v1/calcular-envio";

let envioCalculado = null;

const resultadoEnvio = document.getElementById("resultadoEnvio");
const botonCalcularEnvio = document.getElementById("botonCalcularEnvio");


function mostrarResultadoEnvio(html, esError = false) {

    if (!resultadoEnvio) {
        return;
    }

    resultadoEnvio.innerHTML = html;
    resultadoEnvio.classList.toggle("error", esError);

}


function envioSigueVigente() {

    return Boolean(
        envioCalculado &&
        envioCalculado.direccion === valorCampo("direccion") &&
        envioCalculado.localidad === valorCampo("localidad")
    );

}


function olvidarEnvioCalculado() {

    if (!envioCalculado) {
        return;
    }

    envioCalculado = null;

    if (obtenerEnvioElegido() === "domicilio") {
        costoEnvioSeleccionado = 0;
    }

    const precioOpcion = document.getElementById("precioOpcionDomicilio");

    if (precioOpcion) {
        precioOpcion.textContent = "Según km";
    }

    mostrarResultadoEnvio("Cambiaste la dirección: calculá el envío de nuevo.");

    actualizarTotales();

}


async function calcularEnvio() {

    const direccion = valorCampo("direccion");
    const localidad = valorCampo("localidad");

    if (!direccion || !localidad) {

        mostrarResultadoEnvio(
            "Completá la dirección y el barrio/localidad para calcular el envío.",
            true
        );

        return false;

    }

    if (botonCalcularEnvio) {
        botonCalcularEnvio.disabled = true;
        botonCalcularEnvio.textContent = "Calculando...";
    }

    mostrarResultadoEnvio("");

    try {

        const respuesta = await fetch(URL_CALCULAR_ENVIO, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: CLAVE_PUBLICA_SUPABASE
            },
            body: JSON.stringify({ direccion, localidad })
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok || !resultado) {
            throw new Error(resultado?.error || `Error ${respuesta.status}`);
        }

        if (!resultado.encontrada) {

            mostrarResultadoEnvio(
                escaparHtml(
                    resultado.error ||
                    "No encontramos esa dirección. Revisá calle, altura y localidad."
                ),
                true
            );

            return false;

        }

        if (!resultado.dentro_de_zona) {

            const urlWhatsApp = construirUrlWhatsApp(
                `Hola MUSÉ TENTACIÓN! Quiero un envío a ${direccion}, ${localidad} ` +
                `(${resultado.km} km). ¿Llegan hasta ahí?`
            );

            mostrarResultadoEnvio(
                `Tu dirección queda a <strong>${resultado.km} km</strong>, fuera de ` +
                `nuestra zona de envío por la web (hasta ${resultado.max_km} km). ` +
                "Podés elegir retiro gratis o " +
                `<a href="${urlWhatsApp}" target="_blank" rel="noopener noreferrer">` +
                "escribirnos por WhatsApp</a> y lo coordinamos.",
                true
            );

            return false;

        }

        envioCalculado = {
            direccion,
            localidad,
            km: resultado.km,
            costo: Number(resultado.costo)
        };

        costoEnvioSeleccionado = envioCalculado.costo;

        const precioOpcion = document.getElementById("precioOpcionDomicilio");

        if (precioOpcion) {
            precioOpcion.textContent = formatearPrecio(envioCalculado.costo);
        }

        mostrarResultadoEnvio(
            `Envío: <strong>${formatearPrecio(envioCalculado.costo)}</strong> ` +
            `(${envioCalculado.km} km). Ya lo sumamos al total.`
        );

        actualizarTotales();

        return true;

    } catch (error) {

        console.error("No se pudo calcular el envío:", error);

        mostrarResultadoEnvio(
            "No pudimos calcular el envío en este momento. Probá de nuevo " +
            "o escribinos por WhatsApp.",
            true
        );

        return false;

    } finally {

        if (botonCalcularEnvio) {
            botonCalcularEnvio.disabled = false;
            botonCalcularEnvio.textContent = "Calcular envío";
        }

    }

}


botonCalcularEnvio?.addEventListener("click", calcularEnvio);

["direccion", "localidad"].forEach(id => {

    const campo = document.getElementById(id);

    campo?.addEventListener("input", () => {

        if (envioCalculado && !envioSigueVigente()) {
            olvidarEnvioCalculado();
        }

    });

    /* Al salir de la localidad con la dirección completa, calcula solo. */
    if (id === "localidad") {

        campo?.addEventListener("change", () => {

            if (!envioSigueVigente() && valorCampo("direccion")) {
                calcularEnvio();
            }

        });

    }

});


/* ===========================
   CAMBIO DE FORMA DE PAGO
=========================== */

/*
    Muestra los datos bancarios y el campo del comprobante
    solo si eligen transferencia.
*/

function actualizarBloqueTransferencia() {

    const bloque = document.getElementById("bloqueTransferencia");

    if (!bloque) {
        return;
    }

    const esTransferencia = obtenerPagoElegido() === "transferencia";

    bloque.hidden = !esTransferencia;

    const comprobante = document.getElementById("comprobante");

    if (comprobante) {
        comprobante.required = esTransferencia;
    }

    const datos = {
        aliasTransferencia: PAGO_TRANSFERENCIA.alias,
        cbuTransferencia: PAGO_TRANSFERENCIA.cbu,
        bancoTransferencia: PAGO_TRANSFERENCIA.banco
    };

    Object.entries(datos).forEach(([id, valor]) => {

        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.textContent = valor;
        }

    });

    if (
        esTransferencia &&
        Object.values(datos).some(valor => String(valor).includes("[["))
    ) {
        console.warn(
            "Faltan los datos bancarios en PAGO_TRANSFERENCIA (checkout.js)."
        );
    }

}


/*
    Muestra "X% OFF" en la tarjeta de transferencia.
*/

const etiquetaDescuento = document.getElementById("etiquetaDescuentoTransferencia");

if (etiquetaDescuento) {

    const porcentaje = Number(PAGO_TRANSFERENCIA.descuentoPorcentaje) || 0;

    etiquetaDescuento.textContent = `${porcentaje}% OFF`;

    etiquetaDescuento.hidden = porcentaje === 0;

}


document
    .querySelectorAll('input[name="pago"]')
    .forEach(input => {

        input.addEventListener("change", () => {

            actualizarTarjetasSeleccionadas("pago");

            actualizarBloqueTransferencia();

            actualizarTotales();

        });

    });


/*
    Sube el comprobante al bucket privado "comprobantes".
    La clave pública solo puede SUBIR archivos ahí, no verlos
    ni borrarlos. Devuelve la ruta del archivo.
*/

const TIPOS_COMPROBANTE = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "application/pdf": "pdf"
};

const URL_PANEL_COMPROBANTES =
    "https://supabase.com/dashboard/project/sawsneidzpovlqnnirti/storage/buckets/comprobantes";

/*
    Link directo (firmado, válido 1 año) para ver el comprobante
    desde el mail. Si falla, se manda el link al panel de Supabase.
*/

const URL_FIRMAR_COMPROBANTE =
    "https://sawsneidzpovlqnnirti.supabase.co/functions/v1/firmar-comprobante";

async function obtenerLinkComprobante(ruta) {

    try {

        const respuesta = await fetch(URL_FIRMAR_COMPROBANTE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: CLAVE_PUBLICA_SUPABASE
            },
            body: JSON.stringify({ ruta })
        });

        const resultado = await respuesta.json().catch(() => null);

        if (respuesta.ok && resultado?.url) {
            return resultado.url;
        }

        console.warn("No se pudo firmar el comprobante:", resultado);

    } catch (error) {

        console.warn("No se pudo firmar el comprobante:", error);

    }

    return `${ruta} — verlo en: ${URL_PANEL_COMPROBANTES}`;

}


async function subirComprobante(archivo, codigoPedido) {

    const extension = TIPOS_COMPROBANTE[archivo?.type];

    if (!extension) {
        throw new Error("Formato de comprobante no permitido.");
    }

    const aleatorio = crypto.randomUUID().slice(0, 8);

    const ruta = `${codigoPedido}-${aleatorio}.${extension}`;

    const respuesta = await fetch(
        `https://sawsneidzpovlqnnirti.supabase.co/storage/v1/object/comprobantes/${ruta}`,
        {
            method: "POST",
            headers: {
                apikey: CLAVE_PUBLICA_SUPABASE,
                Authorization: `Bearer ${CLAVE_PUBLICA_SUPABASE}`,
                "Content-Type": archivo.type,
                "x-upsert": "false"
            },
            body: archivo
        }
    );

    if (!respuesta.ok) {

        const detalle = await respuesta.text().catch(() => "");

        throw new Error(
            `Storage respondió ${respuesta.status}: ${detalle}`
        );

    }

    return ruta;

}


/* ===========================
   VALIDAR FORMULARIO
=========================== */

function validarFormulario() {

    mensajeError.textContent = "";

    if (carritoCheckout.length === 0) {

        mensajeError.textContent =
            "Tu carrito está vacío. Agregá un producto antes de continuar.";

        return false;

    }

    const camposObligatorios = [
        "email",
        "nombre",
        "apellido",
        "telefono"
    ];

    if (obtenerEnvioElegido() === "domicilio") {

        camposObligatorios.push(
            "direccion",
            "localidad"
        );

    }

    const campoIncompleto =
        camposObligatorios.find(id => !valorCampo(id));

    if (campoIncompleto) {

        mensajeError.textContent =
            "Completá todos los datos obligatorios.";

        document
            .getElementById(campoIncompleto)
            ?.focus();

        return false;

    }

    if (obtenerEnvioElegido() === "domicilio" && !envioSigueVigente()) {

        mensajeError.textContent =
            "Calculá el costo del envío (botón “Calcular envío”) antes de confirmar.";

        botonCalcularEnvio?.focus();

        return false;

    }

    /*
        Email: algo@algo.algo
    */

    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!formatoEmail.test(valorCampo("email"))) {

        mensajeError.textContent =
            "Revisá el correo electrónico: tiene que tener el formato nombre@ejemplo.com.";

        document.getElementById("email")?.focus();

        return false;

    }

    /*
        Teléfono: se aceptan espacios, guiones, paréntesis
        y "+". Tiene que tener entre 8 y 15 dígitos
        (ej. 11 1234 5678 o +54 9 11 1234-5678).
    */

    const telefono = valorCampo("telefono");

    const digitosTelefono = telefono.replace(/\D/g, "");

    if (
        !/^[\d\s()+-]+$/.test(telefono) ||
        digitosTelefono.length < 8 ||
        digitosTelefono.length > 15
    ) {

        mensajeError.textContent =
            "Revisá el teléfono: escribilo con código de área, por ejemplo 11 1234 5678.";

        document.getElementById("telefono")?.focus();

        return false;

    }

    /*
        Transferencia: el comprobante es obligatorio.
    */

    if (obtenerPagoElegido() === "transferencia") {

        const campoComprobante = document.getElementById("comprobante");

        const archivo = campoComprobante?.files?.[0];

        if (!archivo) {

            mensajeError.textContent =
                "Subí el comprobante de la transferencia para confirmar el pedido.";

            campoComprobante?.focus();

            return false;

        }

        if (!TIPOS_COMPROBANTE[archivo.type]) {

            mensajeError.textContent =
                "El comprobante tiene que ser una foto (JPG, PNG, WEBP o HEIC) o un PDF.";

            campoComprobante.focus();

            return false;

        }

        if (archivo.size > MAX_MB_COMPROBANTE * 1024 * 1024) {

            mensajeError.textContent =
                `El comprobante pesa más de ${MAX_MB_COMPROBANTE} MB. ` +
                "Probá con una captura de pantalla.";

            campoComprobante.focus();

            return false;

        }

    }

    /*
        Términos y condiciones + política de privacidad:
        hay que aceptarlos para confirmar el pedido.
    */

    const casillaLegales = document.getElementById("aceptoLegales");

    if (casillaLegales && !casillaLegales.checked) {

        mensajeError.textContent =
            "Para confirmar el pedido tenés que aceptar los Términos y condiciones y la Política de privacidad.";

        document
            .getElementById("bloqueAceptoLegales")
            ?.classList.add("con-error");

        casillaLegales.focus();

        return false;

    }

    return true;

}


/* ===========================
   GENERAR NÚMERO DE PEDIDO
=========================== */

function generarNumeroPedido() {

    const fecha = new Date();

    const parteFecha =
        String(fecha.getFullYear()).slice(-2) +
        String(fecha.getMonth() + 1).padStart(2, "0") +
        String(fecha.getDate()).padStart(2, "0");

    const aleatorio = Math.floor(
        1000 + Math.random() * 9000
    );

    return `MT-${parteFecha}-${aleatorio}`;

}


/* ===========================
   ENVIAR PEDIDO A FORMSPREE
=========================== */

async function enviarPedidoAFormspree(datosPedido) {

    const respuesta = await fetch(
        "https://formspree.io/f/xoedqdgq",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify(datosPedido)
        }
    );

    if (!respuesta.ok) {

        const resultado = await respuesta.json().catch(() => null);

        console.error(
            "Error de Formspree:",
            resultado
        );

        throw new Error(
            "No pudimos registrar el pedido. Intentá nuevamente."
        );

    }

    return respuesta.json();

}


/* ===========================
   DETALLE DEL PEDIDO EN TEXTO
=========================== */

function armarDetalleProductos() {

    return carritoCheckout
        .map(producto => {

            const detalle = producto.descripcion
                ? ` (${producto.descripcion})`
                : "";

            return (
                `${producto.cantidad} x ${producto.nombre}${detalle}` +
                ` — ${formatearPrecio(producto.precio * producto.cantidad)}`
            );

        })
        .join("\n");

}


/* ===========================
   CONFIRMAR Y ENVIAR PEDIDO
=========================== */

formularioCheckout.addEventListener(
    "submit",
    async evento => {

        evento.preventDefault();

        if (pedidoSuperaTope()) {

            actualizarAvisoTope();

            mensajeError.textContent =
                "Este pedido supera el máximo de compra online. " +
                "Escribinos por WhatsApp o mail para coordinarlo.";

            document
                .getElementById("avisoTopePedido")
                ?.scrollIntoView({ behavior: "smooth" });

            return;

        }

        if (!validarFormulario()) {
            return;
        }

        const botonConfirmar = formularioCheckout.querySelector(
            'button[type="submit"]'
        );

        botonConfirmar.disabled = true;
        botonConfirmar.textContent = "Registrando pedido...";

        mensajeError.textContent = "";

        const codigoPedido = generarNumeroPedido();

        const envio = obtenerEnvioElegido();

        const pago = obtenerPagoElegido();

        const subtotal = calcularSubtotal();

        const descuento = calcularDescuento();

        const total =
            subtotal - descuento + costoEnvioSeleccionado;

        const nombre = valorCampo("nombre");
        const apellido = valorCampo("apellido");
        const email = valorCampo("email");
        const telefono = valorCampo("telefono");
        const direccion = valorCampo("direccion");
        const localidad = valorCampo("localidad");
        const indicaciones = valorCampo("indicaciones");

        const detalleProductos = armarDetalleProductos();

        const direccionCompleta =
            envio === "domicilio"
                ? `${direccion}, ${localidad}`
                : "Retira en el punto de retiro";

        /*
            Datos que llegan por mail vía Formspree.
        */

        const datosPedido = {

            _subject:
                `Nuevo pedido MUSÉ TENTACIÓN — ${codigoPedido}`,

            codigo_pedido: codigoPedido,

            cliente: `${nombre} ${apellido}`,

            email_cliente: email,

            telefono_cliente: telefono,

            productos: detalleProductos,

            subtotal: formatearPrecio(subtotal),

            descuento_transferencia: descuento
                ? `-${formatearPrecio(descuento)} (${PAGO_TRANSFERENCIA.descuentoPorcentaje}% OFF)`
                : "No aplica",

            metodo_envio: NOMBRES_ENVIO[envio],

            costo_envio:
                envio === "domicilio" && envioCalculado
                    ? `${formatearPrecio(envioCalculado.costo)} (${envioCalculado.km} km por calle)`
                    : textoCostoEnvio(),

            total: formatearPrecio(total),

            metodo_pago:
                pago === "transferencia"
                    ? "Transferencia bancaria (revisar el comprobante y que el monto coincida con el total)"
                    : "Mercado Pago online (si no figura el pago en Mercado Pago, mandar link al cliente)",

            direccion: direccionCompleta,

            indicaciones: indicaciones || "Sin indicaciones",

            acepto_terminos_y_privacidad:
                `Sí (versión del ${VERSION_LEGALES}, aceptado el ${new Date().toLocaleString("es-AR")})`,

            fecha: new Date().toLocaleString("es-AR")

        };

        /*
            Transferencia: primero subimos el comprobante, así el
            link va en el mail del pedido.
        */

        if (pago === "transferencia") {

            try {

                botonConfirmar.textContent = "Subiendo comprobante...";

                const ruta = await subirComprobante(
                    document.getElementById("comprobante").files[0],
                    codigoPedido
                );

                datosPedido.comprobante =
                    await obtenerLinkComprobante(ruta);

            } catch (errorComprobante) {

                console.error(errorComprobante);

                mensajeError.textContent =
                    "No pudimos subir el comprobante. Probá de nuevo " +
                    "(foto o PDF de hasta " +
                    `${MAX_MB_COMPROBANTE} MB) o escribinos por WhatsApp.`;

                botonConfirmar.disabled = false;
                botonConfirmar.textContent = "Confirmar pedido";

                return;

            }

            botonConfirmar.textContent = "Registrando pedido...";

        }

        try {

            /*
                1. El pedido siempre llega por mail (Formspree).
                   Si Formspree falla, no borramos el carrito.
            */

            await enviarPedidoAFormspree(datosPedido);

            localStorage.setItem(
                "ultimoPedidoMuse",
                JSON.stringify({
                    pedido: codigoPedido,
                    total,
                    pago,
                    envio,
                    cliente: `${nombre} ${apellido}`,
                    fecha: new Date().toISOString()
                })
            );

            /*
                2. Mercado Pago: vamos a pagar. El carrito se
                   vacía cuando el cliente vuelve con el pago
                   aprobado (ver mostrarResultadoPago).
                   Si no se puede generar el link, seguimos con
                   el aviso de "te mandamos el link".
            */

            if (pago === "mercadopago") try {

                botonConfirmar.textContent = "Yendo a Mercado Pago...";

                const urlPago = await crearLinkMercadoPago({
                    codigo: codigoPedido,
                    items: carritoCheckout,
                    cliente: { nombre, apellido, email, telefono },
                    envio,
                    direccion,
                    localidad
                });

                window.location.href = urlPago;

                return;

            } catch (errorPago) {

                console.warn(
                    "No se pudo abrir Mercado Pago, se envía link a mano:",
                    errorPago
                );

            }

            formularioCheckout.style.display = "none";

            document
                .getElementById("avisoTopePedido")
                ?.setAttribute("hidden", "");

            confirmacionPedido?.classList.add("visible");

            if (numeroPedido) {

                numeroPedido.textContent =
                    `Número de pedido: ${codigoPedido} · ` +
                    `Total: ${formatearPrecio(total)}`;

            }

            if (pago === "transferencia") {

                configurarConfirmacion({
                    etiqueta: "PEDIDO REGISTRADO",
                    icono: "$",
                    marca: "Transferencia",
                    detalle: "Comprobante recibido",
                    texto:
                        "Recibimos tu pedido y el comprobante. Lo revisamos " +
                        "y te escribimos por WhatsApp para coordinar la " +
                        "entrega o el retiro."
                });

            }

            const textoWhatsapp =
                `Hola MUSÉ TENTACIÓN! Hice el pedido ${codigoPedido}.\n\n` +
                `${detalleProductos}\n\n` +
                `Total: ${formatearPrecio(total)}\n` +
                `Entrega: ${NOMBRES_ENVIO[envio]}\n` +
                (
                    envio === "domicilio"
                        ? `Dirección: ${direccionCompleta}\n`
                        : ""
                ) +
                `Cliente: ${nombre} ${apellido}\n\n` +
                (
                    pago === "transferencia"
                        ? "Pagué por transferencia y subí el comprobante."
                        : "Quedo a la espera del link de pago de Mercado Pago."
                );

            if (enlaceWhatsApp) {

                enlaceWhatsApp.href =
                    construirUrlWhatsApp(textoWhatsapp);

            }

            /*
                Solo vaciamos el carrito después
                de que Formspree confirme el envío.
            */

            localStorage.removeItem(CLAVE_CARRITO);

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {

            console.error(error);

            mensajeError.textContent =
                "No pudimos registrar el pedido. " +
                "Revisá tu conexión e intentá nuevamente.";

            botonConfirmar.disabled = false;

            botonConfirmar.textContent =
                "Confirmar pedido";

        }

    }
);


/* ===========================
   INICIALIZAR
=========================== */

mostrarResultadoPago();

dibujarResumen();

actualizarAvisoTope();

actualizarTarjetasSeleccionadas("envio");

actualizarTarjetasSeleccionadas("pago");

actualizarCamposEnvio();

actualizarBloqueTransferencia();
