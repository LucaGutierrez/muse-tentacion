/* ===========================
   CARRUSEL DEL CATÁLOGO
=========================== */

const carrusel = document.getElementById("carruselCatalogo");
const flechaIzquierda = document.getElementById("flechaIzquierda");
const flechaDerecha = document.getElementById("flechaDerecha");

function obtenerDistanciaDeMovimiento() {

    if (!carrusel) {
        return 0;
    }

    const primeraTarjeta = carrusel.querySelector(".tarjeta-catalogo");

    if (!primeraTarjeta) {
        return 0;
    }

    const estilosCarrusel = window.getComputedStyle(carrusel);
    const espacioEntreTarjetas = parseFloat(estilosCarrusel.gap) || 0;

    return primeraTarjeta.offsetWidth + espacioEntreTarjetas;
}

function actualizarFlechas() {

    if (!carrusel || !flechaIzquierda || !flechaDerecha) {
        return;
    }

    const estaAlInicio = carrusel.scrollLeft <= 5;

    const estaAlFinal =
        carrusel.scrollLeft + carrusel.clientWidth >=
        carrusel.scrollWidth - 5;

    flechaIzquierda.disabled = estaAlInicio;
    flechaDerecha.disabled = estaAlFinal;
}

if (flechaDerecha) {

    flechaDerecha.addEventListener("click", () => {

        carrusel.scrollBy({
            left: obtenerDistanciaDeMovimiento(),
            behavior: "smooth"
        });

    });

}

if (flechaIzquierda) {

    flechaIzquierda.addEventListener("click", () => {

        carrusel.scrollBy({
            left: -obtenerDistanciaDeMovimiento(),
            behavior: "smooth"
        });

    });

}

if (carrusel) {
    carrusel.addEventListener("scroll", actualizarFlechas);
}

window.addEventListener("resize", actualizarFlechas);
window.addEventListener("load", actualizarFlechas);


/* ===========================
   BUSCADOR
=========================== */

const formularioBusqueda = document.getElementById("formularioBusqueda");

if (formularioBusqueda) {

    formularioBusqueda.addEventListener("submit", (evento) => {

        evento.preventDefault();

        const campoBusqueda = document.getElementById("campoBusqueda");

        const busqueda = campoBusqueda
            ? campoBusqueda.value.trim()
            : "";

        console.log("El usuario buscó:", busqueda);

    });

}


/* ===========================
   CARRITO DE COMPRAS
=========================== */

const abrirCarrito = document.getElementById("abrirCarrito");
const cerrarCarrito = document.getElementById("cerrarCarrito");
const fondoCarrito = document.getElementById("fondoCarrito");
const carritoLateral = document.getElementById("carritoLateral");
const seguirComprando = document.getElementById("seguirComprando");

const carritoProductos = document.getElementById("carritoProductos");
const carritoVacio = document.getElementById("carritoVacio");
const carritoResumen = document.getElementById("carritoResumen");

const contadorCarrito = document.getElementById("contadorCarrito");
const precioTotalCarrito = document.getElementById("precioTotalCarrito");

const iniciarCompra = document.getElementById("iniciarCompra");


/*
    Recuperamos el carrito guardado.

    Si todavía no existe, comienza como una lista vacía.
*/

/*
    Clave nueva (MUSÉ TENTACIÓN): los carritos guardados por la
    web anterior ("carritoMuse") quedan descartados.
    checkout.js usa la misma clave.
*/

const CLAVE_CARRITO = "carritoMuseTentacion";

let carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];

localStorage.removeItem("carritoMuse");


function abrirPanelCarrito() {

    if (!carritoLateral || !fondoCarrito) {
        return;
    }

    carritoLateral.classList.add("abierto");
    fondoCarrito.classList.add("activo");

    carritoLateral.setAttribute("aria-hidden", "false");

    document.body.classList.add("carrito-abierto");
}


function cerrarPanelCarrito() {

    if (!carritoLateral || !fondoCarrito) {
        return;
    }

    carritoLateral.classList.remove("abierto");
    fondoCarrito.classList.remove("activo");

    carritoLateral.setAttribute("aria-hidden", "true");

    document.body.classList.remove("carrito-abierto");
}


/*
    El botón del carrito está dentro del navbar compartido,
    que se carga después. Por eso usamos delegación de eventos.
*/

document.addEventListener("click", (evento) => {

    const botonAbrirCarrito =
        evento.target.closest("#abrirCarrito");

    if (!botonAbrirCarrito) {
        return;
    }

    abrirPanelCarrito();

});

if (cerrarCarrito) {
    cerrarCarrito.addEventListener("click", cerrarPanelCarrito);
}

if (fondoCarrito) {
    fondoCarrito.addEventListener("click", cerrarPanelCarrito);
}

if (seguirComprando) {
    seguirComprando.addEventListener("click", cerrarPanelCarrito);
}


/* Cerrar con la tecla Escape */

document.addEventListener("keydown", (evento) => {

    if (evento.key === "Escape") {
        cerrarPanelCarrito();
    }

});


function guardarCarrito() {

    localStorage.setItem(
        CLAVE_CARRITO,
        JSON.stringify(carrito)
    );

}


function formatearPrecio(precio) {

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(precio);

}


function calcularCantidadTotal() {

    return carrito.reduce(
        (total, producto) => total + producto.cantidad,
        0
    );

}


function calcularPrecioTotal() {

    return carrito.reduce(
        (total, producto) =>
            total + producto.precio * producto.cantidad,
        0
    );

}


function actualizarCarrito() {

    if (
        !carritoProductos ||
        !carritoVacio ||
        !carritoResumen
    ) {
        return;
    }

    const cantidadTotal = calcularCantidadTotal();

    /*
        El contador pertenece al navbar compartido.
        Puede tardar un poco más en aparecer.
    */

    const contadorActual =
        document.getElementById("contadorCarrito");

    if (contadorActual) {
        contadorActual.textContent = cantidadTotal;
    }

    carritoProductos.innerHTML = "";

    if (carrito.length === 0) {

        carritoVacio.classList.remove("oculto");
        carritoProductos.classList.add("oculto");
        carritoResumen.classList.add("oculto");

        return;
    }

    carritoVacio.classList.add("oculto");
    carritoProductos.classList.remove("oculto");
    carritoResumen.classList.remove("oculto");


    carrito.forEach((producto) => {

        const elementoProducto = document.createElement("article");

        elementoProducto.className = "producto-carrito";

        elementoProducto.innerHTML = `

            <img
                src="${producto.imagen}"
                alt="${producto.nombre}">

            <div class="informacion-producto-carrito">

                <h3>
                    ${producto.nombre}
                </h3>

                <p>
                    ${producto.descripcion || ""}
                </p>

                <span class="precio-producto-carrito">
                    ${formatearPrecio(producto.precio)}
                </span>

                <div class="controles-cantidad">

                    <button
                        type="button"
                        data-accion="restar"
                        data-id="${producto.id}"
                        aria-label="Restar una unidad">

                        −

                    </button>

                    <span>
                        ${producto.cantidad}
                    </span>

                    <button
                        type="button"
                        data-accion="sumar"
                        data-id="${producto.id}"
                        aria-label="Sumar una unidad">

                        +

                    </button>

                </div>

            </div>

            <button
                class="eliminar-producto"
                type="button"
                data-accion="eliminar"
                data-id="${producto.id}"
                aria-label="Eliminar producto">

                ×

            </button>

        `;

        carritoProductos.appendChild(elementoProducto);

    });


    const precioTotalActual =
    document.getElementById("precioTotalCarrito");

if (precioTotalActual) {

    precioTotalActual.textContent =
        formatearPrecio(
            calcularPrecioTotal()
        );

}

    guardarCarrito();

}


function agregarAlCarrito(productoNuevo) {

    const productoExistente = carrito.find(
        producto => producto.id === productoNuevo.id
    );


    if (productoExistente) {

        const nuevaCantidad =
            productoExistente.cantidad +
            (productoNuevo.cantidad || 1);

        const stockDisponible =
            Number(productoNuevo.stock || productoExistente.stock || 0);


        if (
            stockDisponible > 0 &&
            nuevaCantidad > stockDisponible
        ) {

            productoExistente.cantidad =
                stockDisponible;

            alert(
                `Solo hay ${stockDisponible} unidades disponibles.`
            );

        } else {

            productoExistente.cantidad =
                nuevaCantidad;

        }


        productoExistente.stock =
            stockDisponible;

    } else {

        const cantidadInicial =
            productoNuevo.cantidad || 1;

        const stockDisponible =
            Number(productoNuevo.stock || 0);


        carrito.push({

            ...productoNuevo,

            cantidad:
                stockDisponible > 0
                    ? Math.min(
                        cantidadInicial,
                        stockDisponible
                    )
                    : cantidadInicial

        });

    }


    guardarCarrito();
    actualizarCarrito();
    abrirPanelCarrito();

}


window.agregarAlCarrito = agregarAlCarrito;


/* Botones de sumar, restar y eliminar */

if (carritoProductos) {

    carritoProductos.addEventListener("click", (evento) => {

        const boton = evento.target.closest("[data-accion]");

        if (!boton) {
            return;
        }

        const idProducto = boton.dataset.id;
        const accion = boton.dataset.accion;

        const producto = carrito.find(
            (item) => item.id === idProducto
        );

        if (!producto) {
            return;
        }

        if (accion === "sumar") {

        const stockDisponible =
        Number(producto.stock || 0);


        if (
          stockDisponible > 0 &&
         producto.cantidad >= stockDisponible
        ) {

            alert(
          `Solo hay ${stockDisponible} unidades disponibles.`
         );

         return;

    }


    producto.cantidad += 1;

}

        if (accion === "restar") {

            producto.cantidad -= 1;

            if (producto.cantidad <= 0) {

                carrito = carrito.filter(
                    (item) => item.id !== idProducto
                );

            }

        }

        if (accion === "eliminar") {

            carrito = carrito.filter(
                (item) => item.id !== idProducto
            );

        }

        guardarCarrito();
        actualizarCarrito();

    });

}


if (iniciarCompra) {

    iniciarCompra.addEventListener("click", () => {

        if (carrito.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        window.location.href = "checkout.html";

    });

}


/* Mostrar el carrito guardado al cargar la página */

actualizarCarrito();

window.setTimeout(() => {

    actualizarCarrito();

}, 300);