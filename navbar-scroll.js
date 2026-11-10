/* =========================================================
   MUSÉ TENTACIÓN · NAVBAR FIJO
   Agrega clases al <html> para que style.css:
   - compense la altura del navbar fijo (con-navbar / con-hero),
   - lo compacte al bajar (navbar-compacto).
========================================================= */

(function () {

    "use strict";

    var html = document.documentElement;

    if (document.getElementById("navbarCompartido")) {
        html.classList.add("con-navbar");
    }

    if (document.querySelector("body > .hero")) {
        html.classList.add("con-hero");
    }

    var pendiente = false;

    function actualizar() {
        pendiente = false;
        html.classList.toggle("navbar-compacto", window.scrollY > 30);
    }

    window.addEventListener("scroll", function () {
        if (!pendiente) {
            pendiente = true;
            window.requestAnimationFrame(actualizar);
        }
    }, { passive: true });

    actualizar();

})();
