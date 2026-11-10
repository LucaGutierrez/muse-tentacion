/* ===========================
   CATÁLOGO MUSÉ TENTACIÓN + SUPABASE
=========================== */

const parametrosCatalogo =
    new URLSearchParams(window.location.search);

const categoriaActual =
    parametrosCatalogo.get("categoria");

const tituloCatalogo =
    document.getElementById("tituloCatalogo");

const cantidadCatalogo =
    document.getElementById("cantidadCatalogo");

const cantidadListado =
    document.getElementById("cantidadListado");

const grillaProductos =
    document.getElementById("grillaProductos");

const ordenProductos =
    document.getElementById("ordenProductos");


const nombresCategorias = {
    donas: "Donas de chocolate con frutas",
    cuchareables: "Cuchareables"
};


/*
    Etiqueta corta que se muestra sobre la foto
    de cada tarjeta, según la categoría.
*/

const etiquetasCategorias = {
    donas: "Combo x2",
    cuchareables: "Cuchareable"
};


let productosCargados = [];


/* ===========================
   FORMATEAR PRECIO
=========================== */

function formatearPrecioProducto(precio) {

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(precio);

}


/* ===========================
   CREAR TÍTULO
=========================== */

function obtenerTituloCatalogo() {

    const nombreCategoria =
        nombresCategorias[categoriaActual];

    if (categoriaActual) {
        return nombreCategoria || "Productos";
    }

    return "Todos los productos";

}


/* ===========================
   CREAR TARJETA
=========================== */

function obtenerStockReal(producto) {

    if (
        producto.tiene_variantes &&
        Array.isArray(producto.variantes_producto)
    ) {

        return producto.variantes_producto.reduce(
            (total, variante) => {

                if (!variante.activo) {
                    return total;
                }

                return total + Number(variante.stock || 0);

            },
            0
        );

    }

    return Number(producto.stock || 0);

}

function crearTarjetaProducto(producto) {

    const tarjeta =
        document.createElement("article");

    tarjeta.className = "producto-card";

    const stockReal =
    obtenerStockReal(producto);

const hayStock =
    stockReal > 0;

    const textoEtiqueta =
        etiquetasCategorias[producto.categoria] || "Musé Tentación";

    const textoUnidad =
        producto.categoria === "donas"
            ? "combos disponibles"
            : "unidades disponibles";


    tarjeta.innerHTML = `

<a
    href="producto.html?id=${producto.id}"
    class="producto-card-link">

    <div class="producto-card-imagen">

        <span class="producto-card-etiqueta">
            ${textoEtiqueta}
        </span>

        <img
            src="${producto.imagen}"
            alt="${producto.nombre}"
            loading="lazy">

    </div>

</a>

<div class="producto-card-info">

    <h2>

        <a
            href="producto.html?id=${producto.id}"
            class="producto-titulo-link">

            ${producto.nombre}

        </a>

    </h2>

    <p class="producto-card-material">
        ${producto.material || ""}
    </p>

    <p class="producto-card-descripcion">
        ${producto.descripcion || ""}
    </p>

    <strong class="producto-card-precio">
        ${formatearPrecioProducto(producto.precio)}
    </strong>

    <p class="producto-stock ${hayStock ? "" : "sin-stock"}">

        ${
            hayStock
                ? `${stockReal} ${textoUnidad}`
                : "Sin stock"
        }

    </p>

    <div class="producto-card-acciones">

        <a
            href="producto.html?id=${producto.id}"
            class="ver-detalle ${hayStock ? "" : "producto-agotado"}">

            ${
                hayStock
                    ? "Ver producto"
                    : "Sin stock"
            }

        </a>

    </div>

</div>
`;

    return tarjeta;

}


/* ===========================
   MOSTRAR PRODUCTOS
=========================== */

function mostrarProductos(productos) {

    grillaProductos.innerHTML = "";

    const cantidad =
        productos.length;

    const textoCantidad =
        cantidad === 1
            ? "1 producto"
            : `${cantidad} productos`;

    cantidadCatalogo.textContent =
        textoCantidad;

    cantidadListado.textContent =
        `Mostrando ${textoCantidad}`;


    if (cantidad === 0) {

        grillaProductos.innerHTML = `

            <div class="catalogo-vacio">

                <h2>
                    Muy pronto
                </h2>

                <p>
                    Estamos preparando nuevas tentaciones para esta categoría.
                </p>

                <a href="index.html#inicio">
                    Volver al inicio
                </a>

            </div>
        `;

        return;

    }


    productos.forEach(producto => {

        const tarjeta =
            crearTarjetaProducto(producto);

        grillaProductos.appendChild(tarjeta);

    });

}


/* ===========================
   CONSULTAR SUPABASE
=========================== */

async function cargarCatalogo() {

    const titulo =
        obtenerTituloCatalogo();

    tituloCatalogo.textContent =
        titulo;

    document.title =
        `${titulo} | Musé Tentación`;

    cantidadCatalogo.textContent =
        "Cargando productos...";

    cantidadListado.textContent =
        "Cargando productos...";

    grillaProductos.innerHTML = `
        <p>Cargando productos...</p>
    `;


   let consulta = clienteSupabase
    .from("productos")
    .select(`
        *,
        variantes_producto(
            id,
            stock,
            activo
        )
    `)
        .eq("activo", true)
        .order("id", {
            ascending: true
        });


    /*
        Si hay una categoría, filtra por ella.
    */

    if (categoriaActual) {

        consulta = consulta.eq(
            "categoria",
            categoriaActual
        );

    }


    /*
        Si Supabase no responde en 8 segundos, se corta
        la consulta y se muestra el mensaje de error.
    */

    const controlConsulta = new AbortController();

    const temporizadorConsulta = window.setTimeout(
        () => controlConsulta.abort(),
        8000
    );

    let productos = null;
    let error = null;

    try {

        const respuesta = await consulta.abortSignal(
            controlConsulta.signal
        );

        productos = respuesta.data;
        error = respuesta.error;

    } catch (errorConsulta) {

        error = errorConsulta;

    } finally {

        window.clearTimeout(temporizadorConsulta);

    }


    if (error) {

        console.error(
            "Error al consultar Supabase:",
            error
        );

        cantidadCatalogo.textContent =
            "Error al cargar productos";

        cantidadListado.textContent =
            "No se pudieron cargar los productos";

        grillaProductos.innerHTML = `

            <div class="catalogo-vacio">

                <h2>
                    No pudimos cargar el catálogo
                </h2>

                <p>
                    Recargá la página e intentá nuevamente.
                </p>

            </div>
        `;

        return;

    }


    productosCargados =
        productos || [];

    mostrarProductos(
        productosCargados
    );

}


/* ===========================
   ORDENAR PRODUCTOS
=========================== */

if (ordenProductos) {

    ordenProductos.addEventListener(
        "change",
        () => {

            const productosOrdenados =
                [...productosCargados];

            if (
                ordenProductos.value ===
                "menor-precio"
            ) {

                productosOrdenados.sort(
                    (a, b) =>
                        a.precio - b.precio
                );

            }


            if (
                ordenProductos.value ===
                "mayor-precio"
            ) {

                productosOrdenados.sort(
                    (a, b) =>
                        b.precio - a.precio
                );

            }


            if (
                ordenProductos.value ===
                "destacado"
            ) {

                productosOrdenados.sort(
                    (a, b) =>
                        a.id - b.id
                );

            }


            mostrarProductos(
                productosOrdenados
            );

        }
    );

}



/* ===========================
   INICIAR
=========================== */

cargarCatalogo();