/* ===========================
   PROMOCIONES MUSÉ TENTACIÓN
=========================== */

/*
    Descuento por pagar con transferencia (en %).
    Es el ÚNICO lugar donde se cambia: lo usan el catálogo,
    la página de cada producto y el checkout.
    0 = sin promo (se oculta en toda la web).
*/

const DESCUENTO_TRANSFERENCIA = 10;


function precioConTransferencia(precio) {

    return Math.round(
        Number(precio || 0) * (100 - DESCUENTO_TRANSFERENCIA) / 100
    );

}


/*
    Texto de la promo para mostrar debajo de un precio.
    Devuelve "" si no hay descuento.
*/

function htmlPromoTransferencia(precio) {

    if (!DESCUENTO_TRANSFERENCIA || !Number(precio)) {
        return "";
    }

    const conDescuento = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(precioConTransferencia(precio));

    return (
        `<strong>${conDescuento}</strong> con transferencia ` +
        `<span class="promo-transferencia-etiqueta">${DESCUENTO_TRANSFERENCIA}% OFF</span>`
    );

}
