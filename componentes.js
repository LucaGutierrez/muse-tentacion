/* ===========================
   CARGAR COMPONENTES
=========================== */

async function cargarComponente(selector, archivo) {

    const contenedor = document.querySelector(selector);

    if (!contenedor) {
        return;
    }

    try {

        const respuesta = await fetch(
            `${archivo}?v=${Date.now()}`,
            {
                cache: "no-store"
            }
        );

        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar ${archivo}`);
        }

        contenedor.innerHTML = await respuesta.text();

    } catch (error) {

        console.error(error);

        contenedor.innerHTML = `
            <p>No se pudo cargar esta sección.</p>
        `;

    }

}


/* ===========================
   MENÚ MOBILE
=========================== */


function iniciarMenuMobile() {

    const botonAbrir =
        document.getElementById("abrirMenuMobile");

    const botonCerrar =
        document.getElementById("cerrarMenuMobile");

    const menu =
        document.getElementById("menuMobile");

    const fondo =
        document.getElementById("fondoMenuMobile");


    if (!botonAbrir || !botonCerrar || !menu || !fondo) {

        console.error(
            "Faltan elementos del menú mobile en navbar.html"
        );

        return;

    }


    function abrirMenu() {

        menu.classList.add("abierto");
        fondo.classList.add("activo");

        document.body.classList.add(
            "menu-mobile-abierto"
        );

        menu.setAttribute(
            "aria-hidden",
            "false"
        );

        botonAbrir.setAttribute(
            "aria-expanded",
            "true"
        );

    }


    function cerrarMenu() {

        menu.classList.remove("abierto");
        fondo.classList.remove("activo");

        document.body.classList.remove(
            "menu-mobile-abierto"
        );

        menu.setAttribute(
            "aria-hidden",
            "true"
        );

        botonAbrir.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    botonAbrir.addEventListener(
        "click",
        abrirMenu
    );

    botonCerrar.addEventListener(
        "click",
        cerrarMenu
    );

    fondo.addEventListener(
        "click",
        cerrarMenu
    );


    /* SUBMENÚ DE PRODUCTOS */

    const botonesSubmenu =
        menu.querySelectorAll(
            ".boton-submenu-mobile"
        );

    botonesSubmenu.forEach((boton) => {

        boton.addEventListener("click", () => {

            const grupo = boton.closest(
                ".grupo-menu-mobile"
            );

            if (!grupo) {
                return;
            }

            const estaAbierto =
                grupo.classList.toggle("abierto");

            boton.setAttribute(
                "aria-expanded",
                String(estaAbierto)
            );

        });

    });


    /* CERRAR AL ENTRAR A UN ENLACE */

    menu.querySelectorAll("a").forEach((enlace) => {

        enlace.addEventListener(
            "click",
            cerrarMenu
        );

    });


    /* CERRAR CON ESCAPE */

    document.addEventListener(
        "keydown",
        (evento) => {

            if (evento.key === "Escape") {
                cerrarMenu();
            }

        }
    );

}


/* ===========================
   CARGAR SCRIPT PRINCIPAL
=========================== */

function cargarScriptPrincipal() {

    if (
        document.querySelector(
            'script[data-script-principal="true"]'
        )
    ) {
        return;
    }

    const script =
        document.createElement("script");

    script.src = "script.js";
    script.dataset.scriptPrincipal = "true";

    document.body.appendChild(script);

}


/* ===========================
   INICIAR TODO
=========================== */
function reconstruirContenidoMenuMobile() {

    const contenidoMenu =
        document.querySelector(
            "#menuMobile .menu-mobile-contenido"
        );

    if (!contenidoMenu) {
        console.error(
            "No se encontró .menu-mobile-contenido"
        );
        return;
    }

    contenidoMenu.innerHTML = `
        <a
            class="enlace-mobile-principal"
            href="index.html#inicio">
            Inicio
        </a>

        <div class="grupo-menu-mobile">

            <button
                class="boton-submenu-mobile"
                type="button"
                aria-expanded="false">

                <span>Productos</span>
                <span class="icono-desplegar">+</span>

            </button>

            <div class="submenu-mobile">

                <a href="catalogo.html">
                    Ver todo
                </a>

                <a href="catalogo.html?categoria=donas">
                    Donas de chocolate con frutas
                </a>

                <a href="catalogo.html?categoria=cuchareables">
                    Cuchareables
                </a>

                <a href="index.html#proximamente">
                    Próximamente
                </a>

            </div>

        </div>

        <a
            class="enlace-mobile-principal"
            href="como-comprar.html">
            Cómo comprar
        </a>
    `;
}
async function iniciarComponentes() {

    await Promise.all([
    cargarComponente(
        "#navbarCompartido",
        "componentes/navbar.html"
    ),

    cargarComponente(
        "#footerCompartido",
        "componentes/footer.html"
    )
]);

reconstruirContenidoMenuMobile();

iniciarMenuMobile();

cargarScriptPrincipal();
}


document.addEventListener(
    "DOMContentLoaded",
    iniciarComponentes
);