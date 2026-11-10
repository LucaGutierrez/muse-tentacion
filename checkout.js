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
    Datos de contacto para pedidos grandes.
    whatsapp: solo números, con código de país y sin "+".
              Ej: "5491112345678"
*/

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
    domicilio: "Envío a domicilio (costo según kilómetros, a confirmar)"
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
   MERCADO PAGO (pendiente)
=========================== */

/*
    TODO: cobro con Mercado Pago (Checkout Pro).

    No se puede hacer solo desde el navegador: crear el pago
    necesita el Access Token de Mercado Pago, que es SECRETO
    y no puede estar en este archivo.

    Plan (ver supabase/LEEME.md):
    1. Una Supabase Edge Function "crear-preferencia" guarda
       el Access Token como secreto.
    2. Esta función le manda los ítems (producto_id,
       variante_id, cantidad) y los datos del cliente.
    3. La Edge Function vuelve a leer los precios desde la
       base (nunca confía en los precios del navegador),
       revisa los topes, crea la preferencia y devuelve
       la URL de pago (init_point).
    4. Acá redirigimos: window.location.href = init_point.

    `pedido` = { codigo, items, cliente, envio, total }
*/

async function iniciarPagoMercadoPago(pedido) {

    if (pedidoSuperaTope()) {
        throw new Error("El pedido supera el tope de compra online.");
    }

    // TODO: reemplazar por la llamada a la Edge Function, ej:
    // const { data, error } = await clienteSupabase.functions.invoke(
    //     "crear-preferencia",
    //     { body: pedido }
    // );
    // if (error) throw error;
    // window.location.href = data.init_point;

    console.warn(
        "Mercado Pago todavía no está conectado.",
        pedido
    );

    throw new Error("Mercado Pago todavía no está disponible.");

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
        ? "Según km"
        : "Gratis";

}


function actualizarTotales() {

    const subtotal = calcularSubtotal();

    const total =
        subtotal + costoEnvioSeleccionado;

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
                Number(input.dataset.precio || 0);

            actualizarTarjetasSeleccionadas("envio");

            actualizarCamposEnvio();

            actualizarTotales();

        });

    });


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
        "https://formspree.io/f/xlgqwagd",
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

        const subtotal = calcularSubtotal();

        const total =
            subtotal + costoEnvioSeleccionado;

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

            metodo_envio: NOMBRES_ENVIO[envio],

            costo_envio: textoCostoEnvio(),

            total: formatearPrecio(total),

            metodo_pago:
                "Mercado Pago (enviar link de pago al cliente)",

            direccion: direccionCompleta,

            indicaciones: indicaciones || "Sin indicaciones",

            fecha: new Date().toLocaleString("es-AR")

        };

        /*
            Gancho de Mercado Pago (pendiente).
            Cuando exista la Edge Function, acá se llama:

            await iniciarPagoMercadoPago({
                codigo: codigoPedido,
                items: carritoCheckout,
                cliente: { nombre, apellido, email, telefono },
                envio,
                total
            });
            return;

            Mientras tanto, el pedido se registra por Formspree
            y el link de pago se envía a mano.
        */

        try {

            /*
                Si Formspree falla, no borramos el carrito.
            */

            await enviarPedidoAFormspree(datosPedido);

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
                "Quedo a la espera del link de pago de Mercado Pago.";

            if (enlaceWhatsApp) {

                enlaceWhatsApp.href =
                    construirUrlWhatsApp(textoWhatsapp);

            }

            localStorage.setItem(
                "ultimoPedidoMuse",
                JSON.stringify({
                    pedido: codigoPedido,
                    total,
                    pago: "mercadopago",
                    envio,
                    cliente: `${nombre} ${apellido}`,
                    fecha: new Date().toISOString()
                })
            );

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

dibujarResumen();

actualizarAvisoTope();

actualizarTarjetasSeleccionadas("envio");

actualizarTarjetasSeleccionadas("pago");

actualizarCamposEnvio();
