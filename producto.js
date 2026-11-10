/* ===========================
   PRODUCTO.JS — MUSÉ TENTACIÓN
=========================== */


/* ===========================
   ID DEL PRODUCTO
=========================== */

const parametrosProducto =
    new URLSearchParams(window.location.search);

const productoId =
    parametrosProducto.get("id");


/* ===========================
   ELEMENTOS DEL HTML
=========================== */

const paginaProducto =
    document.getElementById("paginaProducto");

const productoError =
    document.getElementById("productoError");

const nombreProducto =
    document.getElementById("nombreProducto");

const categoriaProducto =
    document.getElementById("categoriaProducto");

const materialProducto =
    document.getElementById("materialProducto");

const precioProducto =
    document.getElementById("precioProducto");

const descripcionProducto =
    document.getElementById("descripcionProducto");

const imagenPrincipalProducto =
    document.getElementById("imagenPrincipalProducto");

const productoMiniaturas =
    document.getElementById("productoMiniaturas");

const contenedorColores =
    document.getElementById("contenedorColores");

const opcionesColores =
    document.getElementById("opcionesColores");

const colorSeleccionadoTexto =
    document.getElementById("colorSeleccionado");

const contenedorTalles =
    document.getElementById("contenedorTalles");

const opcionesTalles =
    document.getElementById("opcionesTalles");

const talleSeleccionadoTexto =
    document.getElementById("talleSeleccionado");

const stockProducto =
    document.getElementById("stockProducto");

const cantidadProducto =
    document.getElementById("cantidadProducto");

const restarCantidad =
    document.getElementById("restarCantidad");

const sumarCantidad =
    document.getElementById("sumarCantidad");

const agregarProductoCarrito =
    document.getElementById("agregarProductoCarrito");

const bloqueIngredientes =
    document.getElementById("bloqueIngredientes");

const ingredientesProducto =
    document.getElementById("ingredientesProducto");

const bloqueAlergenos =
    document.getElementById("bloqueAlergenos");

const alergenosProducto =
    document.getElementById("alergenosProducto");

const codigoProducto =
    document.getElementById("codigoProducto");

const pesoProducto =
    document.getElementById("pesoProducto");


/* ===========================
   ESTADO DE LA PÁGINA
=========================== */

let productoActual = null;

let imagenesProducto = [];

let variantesProducto = [];

let colorElegido = null;

let talleElegido = null;

let varianteElegida = null;

let cantidadElegida = 1;


/* ===========================
   UTILIDADES
=========================== */

function formatearPrecio(precio) {

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(Number(precio) || 0);

}


function normalizarTexto(valor) {

    return String(valor ?? "")
        .trim()
        .toLowerCase();

}


function capitalizarTexto(valor) {

    const texto = String(valor ?? "").trim();

    if (!texto) {
        return "";
    }

    return (
        texto.charAt(0).toUpperCase() +
        texto.slice(1)
    );

}


function obtenerValoresUnicos(lista) {

    return [...new Set(
        lista.filter(valor => {

            return (
                valor !== null &&
                valor !== undefined &&
                String(valor).trim() !== ""
            );

        })
    )];

}


/*
    Escribe un texto en un elemento y lo oculta
    (clase "oculto") si el texto queda vacío.
    `bloque` es el contenedor a ocultar (por defecto,
    el mismo elemento).
*/

function mostrarTextoOpcional(elemento, texto, bloque = elemento) {

    const valor = String(texto ?? "").trim();

    if (elemento) {
        elemento.textContent = valor;
    }

    bloque?.classList.toggle("oculto", !valor);

}


/*
    Si Supabase no responde en este tiempo, se corta
    la consulta y se muestra el error.
*/

const TIEMPO_LIMITE_CONSULTA_MS = 8000;

const controlConsultas = new AbortController();


function mostrarErrorProducto(error = null) {

    if (error) {
        console.error(
            "Error al cargar el producto:",
            error
        );
    }

    paginaProducto?.classList.add("oculto");
    productoError?.classList.remove("oculto");

}


/* ===========================
   PRODUCTO PRINCIPAL
=========================== */

/*
    Nombres visibles de las categorías y textos
    por categoría (donas se venden en combos x2).
    El tope real del pedido se controla en el checkout.
*/

const nombresCategoriasProducto = {
    donas: "Donas de chocolate con frutas · Combo x2",
    cuchareables: "Cuchareables"
};

const textosTopeCategoria = {
    donas: "Por la web podés pedir hasta 10 combos (20 donas). ¿Querés más? Escribinos por WhatsApp o mail y lo coordinamos.",
    cuchareables: "Por la web podés pedir hasta 10 cuchareables. ¿Querés más? Escribinos por WhatsApp o mail y lo coordinamos."
};

function obtenerTextoUnidades(cantidad) {

    if (productoActual?.categoria === "donas") {
        return cantidad === 1
            ? "1 combo disponible"
            : `${cantidad} combos disponibles`;
    }

    return cantidad === 1
        ? "1 unidad disponible"
        : `${cantidad} unidades disponibles`;

}

function mostrarInformacionProducto() {

    nombreProducto.textContent =
        productoActual.nombre || "Producto";

    mostrarTextoOpcional(
        categoriaProducto,
        nombresCategoriasProducto[productoActual.categoria] ||
            productoActual.categoria
    );

    const etiquetaCantidad =
        document.getElementById("etiquetaCantidad");

    if (etiquetaCantidad) {
        etiquetaCantidad.textContent =
            productoActual.categoria === "donas"
                ? "Cantidad de combos"
                : "Cantidad";
    }

    const avisoTopeProducto =
        document.getElementById("avisoTopeProducto");

    mostrarTextoOpcional(
        avisoTopeProducto,
        textosTopeCategoria[productoActual.categoria]
    );

    materialProducto.textContent =
        productoActual.material || "";

    precioProducto.textContent =
        formatearPrecio(productoActual.precio);

    descripcionProducto.textContent =
        productoActual.descripcion || "";

    mostrarTextoOpcional(
        ingredientesProducto,
        productoActual.ingredientes,
        bloqueIngredientes
    );

    mostrarTextoOpcional(
        alergenosProducto,
        productoActual.alergenos
            ? `Contiene: ${String(productoActual.alergenos).replace(/^contiene:?\s*/i, "")}`
            : "",
        bloqueAlergenos
    );

    codigoProducto.textContent =
        productoActual.codigo || "Sin código";

    pesoProducto.textContent =
        productoActual.peso
            ? `${productoActual.peso} g`
            : "No especificado";

    imagenPrincipalProducto.src =
        productoActual.imagen || "";

    imagenPrincipalProducto.alt =
        productoActual.nombre || "Producto Musé Tentación";

    document.title =
        `${productoActual.nombre} | Musé Tentación`;

}


/* ===========================
   GALERÍA
=========================== */

function mostrarImagenPrincipal(imagen) {

    if (!imagen?.url) {
        return;
    }

    imagenPrincipalProducto.src = imagen.url;

    imagenPrincipalProducto.alt =
        imagen.alt ||
        productoActual.nombre ||
        "Producto Musé Tentación";


    const botonesMiniatura =
        productoMiniaturas.querySelectorAll(
            "button"
        );

    botonesMiniatura.forEach(boton => {

        boton.classList.toggle(
            "activa",
            boton.dataset.url === imagen.url
        );

    });

}


function mostrarGaleria() {

    productoMiniaturas.innerHTML = "";


    let imagenesFinales = [...imagenesProducto];


    if (
        imagenesFinales.length === 0 &&
        productoActual.imagen
    ) {

        imagenesFinales = [
            {
                url: productoActual.imagen,
                alt: productoActual.nombre,
                orden: 1
            }
        ];

    }


    imagenesFinales.sort((a, b) => {

        return (
            Number(a.orden || 0) -
            Number(b.orden || 0)
        );

    });


    imagenesFinales.forEach((imagen, indice) => {

        const boton =
            document.createElement("button");

        boton.type = "button";

        boton.dataset.url = imagen.url;

        boton.setAttribute(
            "aria-label",
            `Ver imagen ${indice + 1}`
        );


        const miniatura =
            document.createElement("img");

        miniatura.src = imagen.url;

        miniatura.alt =
            imagen.alt ||
            `${productoActual.nombre} - imagen ${indice + 1}`;

        boton.appendChild(miniatura);


        boton.addEventListener("click", () => {

            mostrarImagenPrincipal(imagen);

        });


        productoMiniaturas.appendChild(boton);

    });


    if (imagenesFinales[0]) {

        mostrarImagenPrincipal(
            imagenesFinales[0]
        );

    }

}


/* ===========================
   COLORES
=========================== */

function obtenerColoresDisponibles() {

    return obtenerValoresUnicos(
        variantesProducto.map(
            variante => variante.color
        )
    );

}


function mostrarColores() {

    opcionesColores.innerHTML = "";

    const colores =
        obtenerColoresDisponibles();


    if (colores.length === 0) {

        contenedorColores.classList.add(
            "oculto"
        );

        colorElegido = null;

        return;

    }


    contenedorColores.classList.remove(
        "oculto"
    );


    colores.forEach(color => {

        const boton =
            document.createElement("button");

        boton.type = "button";

        boton.className =
            "opcion-producto";

        boton.textContent =
            capitalizarTexto(color);

        boton.dataset.color = color;


        const tieneStock =
            variantesProducto.some(variante => {

                return (
                    normalizarTexto(
                        variante.color
                    ) === normalizarTexto(color) &&
                    Number(variante.stock) > 0
                );

            });


        if (!tieneStock) {

            boton.classList.add("sin-stock");
            boton.disabled = true;

        }


        boton.addEventListener("click", () => {

            seleccionarColor(color);

        });


        opcionesColores.appendChild(boton);

    });

}


function seleccionarColor(color) {

    colorElegido = color;

    talleElegido = null;

    varianteElegida = null;

    cantidadElegida = 1;

    cantidadProducto.textContent =
        cantidadElegida;

    colorSeleccionadoTexto.textContent =
        capitalizarTexto(color);

    talleSeleccionadoTexto.textContent =
        "Seleccioná un tamaño";


    opcionesColores
        .querySelectorAll("button")
        .forEach(boton => {

            boton.classList.toggle(
                "seleccionada",
                normalizarTexto(
                    boton.dataset.color
                ) === normalizarTexto(color)
            );

        });


    const varianteConImagen =
        variantesProducto.find(variante => {

            return (
                normalizarTexto(
                    variante.color
                ) === normalizarTexto(color) &&
                variante.imagen
            );

        });


    if (varianteConImagen?.imagen) {

        imagenPrincipalProducto.src =
            varianteConImagen.imagen;

        imagenPrincipalProducto.alt =
            `${productoActual.nombre} ${color}`;

    }


    mostrarTalles();

    actualizarEstadoCompra();

}


/* ===========================
   TALLES
=========================== */

function obtenerVariantesDelColor() {

    if (!colorElegido) {
        return [];
    }

    return variantesProducto.filter(
        variante => {

            return (
                normalizarTexto(
                    variante.color
                ) === normalizarTexto(
                    colorElegido
                )
            );

        }
    );

}


function mostrarTalles() {

    opcionesTalles.innerHTML = "";

    const variantesDelColor =
        obtenerVariantesDelColor();

    const talles =
        obtenerValoresUnicos(
            variantesDelColor.map(
                variante => variante.talle
            )
        );


    if (talles.length === 0) {

        contenedorTalles.classList.add(
            "oculto"
        );

        const unicaVariante =
            variantesDelColor[0];

        if (unicaVariante) {

            varianteElegida =
                unicaVariante;

        }

        actualizarEstadoCompra();

        return;

    }


    contenedorTalles.classList.remove(
        "oculto"
    );


    talles.forEach(talle => {

        const variante =
            variantesDelColor.find(item => {

                return (
                    normalizarTexto(
                        item.talle
                    ) === normalizarTexto(talle)
                );

            });


        const boton =
            document.createElement("button");

        boton.type = "button";

        boton.className =
            "opcion-producto";

        boton.textContent = talle;

        boton.dataset.talle = talle;


        if (
            !variante ||
            Number(variante.stock) <= 0
        ) {

            boton.classList.add("sin-stock");
            boton.disabled = true;

        }


        boton.addEventListener("click", () => {

            seleccionarTalle(
                talle,
                variante
            );

        });


        opcionesTalles.appendChild(boton);

    });

}


function seleccionarTalle(
    talle,
    variante
) {

    talleElegido = talle;

    varianteElegida = variante;

    cantidadElegida = 1;

    cantidadProducto.textContent =
        cantidadElegida;

    talleSeleccionadoTexto.textContent =
        talle;


    opcionesTalles
        .querySelectorAll("button")
        .forEach(boton => {

            boton.classList.toggle(
                "seleccionada",
                normalizarTexto(
                    boton.dataset.talle
                ) === normalizarTexto(talle)
            );

        });


    if (variante?.imagen) {

        imagenPrincipalProducto.src =
            variante.imagen;

        imagenPrincipalProducto.alt =
            `${productoActual.nombre} ${colorElegido} ${talle}`;

    }


    actualizarEstadoCompra();

}


/* ===========================
   STOCK Y PRECIO
=========================== */

function obtenerStockDisponible() {

    if (productoActual?.tiene_variantes) {

        return Number(
            varianteElegida?.stock || 0
        );

    }

    return Number(
        productoActual?.stock || 0
    );

}


function obtenerPrecioFinal() {

    if (
        varianteElegida?.precio !== null &&
        varianteElegida?.precio !== undefined
    ) {

        return Number(
            varianteElegida.precio
        );

    }

    return Number(
        productoActual?.precio || 0
    );

}


function actualizarEstadoCompra() {

    const tieneVariantes =
        Boolean(
            productoActual?.tiene_variantes
        );


    if (!tieneVariantes) {

        varianteElegida = null;

        const stock =
            obtenerStockDisponible();

        stockProducto.textContent =
            stock > 0
                ? obtenerTextoUnidades(stock)
                : "Sin stock";

        stockProducto.classList.toggle(
            "disponible",
            stock > 0
        );

        stockProducto.classList.toggle(
            "agotado",
            stock <= 0
        );

        agregarProductoCarrito.disabled =
            stock <= 0;

        agregarProductoCarrito.textContent =
            stock > 0
                ? "Agregar al carrito"
                : "Sin stock";

        precioProducto.textContent =
            formatearPrecio(
                productoActual.precio
            );

        return;

    }


    if (!colorElegido) {

        stockProducto.textContent =
            "Seleccioná una variedad";

        agregarProductoCarrito.disabled =
            true;

        agregarProductoCarrito.textContent =
            "Seleccioná las opciones";

        return;

    }


    const variantesDelColor =
        obtenerVariantesDelColor();

    const colorTieneTalles =
        variantesDelColor.some(variante => {

            return (
                variante.talle !== null &&
                variante.talle !== undefined &&
                String(variante.talle).trim() !== ""
            );

        });


    if (
        colorTieneTalles &&
        !talleElegido
    ) {

        stockProducto.textContent =
            "Seleccioná un tamaño";

        agregarProductoCarrito.disabled =
            true;

        agregarProductoCarrito.textContent =
            "Seleccioná las opciones";

        return;

    }


    if (!varianteElegida) {

        stockProducto.textContent =
            "Combinación no disponible";

        agregarProductoCarrito.disabled =
            true;

        agregarProductoCarrito.textContent =
            "No disponible";

        return;

    }


    const stock =
        obtenerStockDisponible();


    stockProducto.textContent =
        stock > 0
            ? obtenerTextoUnidades(stock)
            : "Sin stock";


    stockProducto.classList.toggle(
        "disponible",
        stock > 0
    );

    stockProducto.classList.toggle(
        "agotado",
        stock <= 0
    );


    precioProducto.textContent =
        formatearPrecio(
            obtenerPrecioFinal()
        );


    agregarProductoCarrito.disabled =
        stock <= 0;

    agregarProductoCarrito.textContent =
        stock > 0
            ? "Agregar al carrito"
            : "Sin stock";

}


/* ===========================
   CANTIDAD
=========================== */

restarCantidad.addEventListener(
    "click",
    () => {

        if (cantidadElegida <= 1) {
            return;
        }

        cantidadElegida -= 1;

        cantidadProducto.textContent =
            cantidadElegida;

    }
);


sumarCantidad.addEventListener(
    "click",
    () => {

        const stock =
            obtenerStockDisponible();

        if (
            stock <= 0 ||
            cantidadElegida >= stock
        ) {

            return;

        }

        cantidadElegida += 1;

        cantidadProducto.textContent =
            cantidadElegida;

    }
);


/* ===========================
   BOTÓN DEL CARRITO
=========================== */

agregarProductoCarrito.addEventListener(
    "click",
    () => {

        if (agregarProductoCarrito.disabled) {
            return;
        }


        /*
            Creamos un identificador único.

            Así el carrito distingue, por ejemplo:

            7-blanco-14
            7-blanco-15
            7-negro-14
        */

        const partesId = [
            productoActual.id,
            colorElegido || "sin-color",
            talleElegido || "sin-talle"
        ];


        const idCarrito = partesId
            .map(parte => normalizarTexto(parte))
            .join("-");


        /*
            Armamos la descripción que se verá
            debajo del nombre dentro del carrito.
        */

        const detallesSeleccionados = [];


        if (colorElegido) {

            detallesSeleccionados.push(
                `Variedad: ${capitalizarTexto(colorElegido)}`
            );

        }


        if (talleElegido) {

            detallesSeleccionados.push(
                `Tamaño: ${talleElegido}`
            );

        }


        const descripcionCarrito =
            detallesSeleccionados.length > 0
                ? detallesSeleccionados.join(" • ")
                : productoActual.material || "";


        /*
            Construimos el producto usando exactamente
            el formato que espera script.js.
        */

        const productoParaCarrito = {

            id: idCarrito,

            producto_id:
                Number(productoActual.id),

            variante_id:
                varianteElegida
                    ? Number(varianteElegida.id)
                    : null,

            nombre:
                productoActual.nombre,

            descripcion:
                descripcionCarrito,

            imagen:
                varianteElegida?.imagen ||
                imagenPrincipalProducto.src ||
                productoActual.imagen,

            precio:
                obtenerPrecioFinal(),

            cantidad:
                cantidadElegida,
            
            stock:
            obtenerStockDisponible(),

            color:
                colorElegido || null,

            talle:
                talleElegido || null,

            codigo:
                varianteElegida?.codigo ||
                productoActual.codigo ||
                null,

            categoria:
                productoActual.categoria || null,

            unidades_por_item:
                Number(productoActual.unidades_por_item) || 1

        };


        /*
            La función está creada en script.js
            y disponible mediante window.
        */

        if (
            typeof window.agregarAlCarrito !==
            "function"
        ) {

            console.error(
                "No se encontró la función agregarAlCarrito."
            );

            alert(
                "No pudimos agregar el producto al carrito."
            );

            return;

        }


        window.agregarAlCarrito(
            productoParaCarrito
        );


        /*
            Mensaje visual momentáneo.
        */

        const textoOriginal =
            "Agregar al carrito";

        agregarProductoCarrito.textContent =
            "Agregado al carrito";


        window.setTimeout(() => {

            agregarProductoCarrito.textContent =
                textoOriginal;

        }, 1400);

    }
);




/* ===========================
   CONSULTAS A SUPABASE
=========================== */

async function consultarProducto() {

    const { data, error } =
        await clienteSupabase
            .from("productos")
            .select("*")
            .eq("id", productoId)
            .eq("activo", true)
            .abortSignal(controlConsultas.signal)
            .single();

    if (error) {
        throw error;
    }

    return data;

}


async function consultarImagenes() {

    const { data, error } =
        await clienteSupabase
            .from("imagenes_producto")
            .select("*")
            .eq("producto_id", productoId)
            .order("orden", {
                ascending: true
            })
            .abortSignal(controlConsultas.signal);

    if (error) {

        console.error(
            "No se pudieron cargar las imágenes:",
            error
        );

        return [];

    }

    return data || [];

}


async function consultarVariantes() {

    const { data, error } =
        await clienteSupabase
            .from("variantes_producto")
            .select("*")
            .eq("producto_id", productoId)
            .eq("activo", true)
            .order("orden", {
                ascending: true
            })
            .order("id", {
                ascending: true
            })
            .abortSignal(controlConsultas.signal);

    if (error) {

        console.error(
            "No se pudieron cargar las variantes:",
            error
        );

        return [];

    }

    return data || [];

}


/* ===========================
   INICIO
=========================== */

async function iniciarPaginaProducto() {

    if (!productoId) {

        mostrarErrorProducto();
        return;

    }


    const temporizadorConsultas = window.setTimeout(
        () => controlConsultas.abort(),
        TIEMPO_LIMITE_CONSULTA_MS
    );

    try {

        const [
            producto,
            imagenes,
            variantes
        ] = await Promise.all([

            consultarProducto(),
            consultarImagenes(),
            consultarVariantes()

        ]);


        if (!producto) {

            mostrarErrorProducto();
            return;

        }


        productoActual = producto;

        imagenesProducto = imagenes;

        variantesProducto = variantes;


        mostrarInformacionProducto();

        mostrarGaleria();


        if (
            productoActual.tiene_variantes &&
            variantesProducto.length > 0
        ) {

            mostrarColores();

        } else {

            contenedorColores.classList.add(
                "oculto"
            );

            contenedorTalles.classList.add(
                "oculto"
            );

        }


        actualizarEstadoCompra();


    } catch (error) {

        mostrarErrorProducto(error);

    } finally {

        window.clearTimeout(temporizadorConsultas);

    }

}


iniciarPaginaProducto();