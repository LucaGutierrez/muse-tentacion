/* =========================================================
   MUSÉ TENTACIÓN · ANIMACIONES DEL INICIO
   - Chocolate derretido brillante que chorrea desde el navbar:
     las gotas respiran, se estiran con el scroll y se desprenden
     como gotas reales que caen y salpican.
   - Parallax suave del título.
   - Al scrollear caen cosas dulces: mini donas, frutillas,
     arándanos, gotas y trocitos de chocolate, corazones.
   - Secciones que aparecen al entrar en pantalla.

   Con "reducir movimiento" activado en el sistema NO se apaga
   todo: se arma una versión tranquila (menos elementos, más
   lentos, sin parallax; el chocolate se dibuja con una
   animación corta).

   Todo lo decorativo se crea desde acá y no bloquea clics
   (pointer-events: none). Solo se animan transform/opacity.
========================================================= */

(function () {

    "use strict";

    const TRANQUILO =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const CELULAR =
        window.matchMedia("(max-width: 700px)").matches;

    const SVG_NS = "http://www.w3.org/2000/svg";

    if (TRANQUILO) {
        document.documentElement.classList.add("movimiento-tranquilo");
    }


    /* ===========================
       FORMAS (SVG) DE LO QUE CAE
       Generadas a partir de las donas reales de la marca.
    =========================== */

    const FORMAS = {
        "dona0": "<svg viewBox=\"0 0 100 100\"><defs>\n    <radialGradient id=\"mtd0blanco\" cx=\"40%\" cy=\"35%\" r=\"75%\">\n      <stop offset=\"0\" stop-color=\"#fffdf8\"/><stop offset=\".7\" stop-color=\"#f7ecdc\"/><stop offset=\"1\" stop-color=\"#e9d6bd\"/>\n    </radialGradient>\n    <radialGradient id=\"mtd0pulpa\" cx=\"50%\" cy=\"45%\" r=\"60%\">\n      <stop offset=\"0\" stop-color=\"#ffd0cc\"/><stop offset=\".45\" stop-color=\"#ff7d7d\"/><stop offset=\"1\" stop-color=\"#e3313e\"/>\n    </radialGradient>\n    <radialGradient id=\"mtd0arandano\" cx=\"35%\" cy=\"30%\" r=\"75%\">\n      <stop offset=\"0\" stop-color=\"#5c6a9e\"/><stop offset=\".5\" stop-color=\"#262f5a\"/><stop offset=\"1\" stop-color=\"#11152b\"/>\n    </radialGradient>\n    <linearGradient id=\"mtd0oro\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#fff2b0\"/><stop offset=\".45\" stop-color=\"#e7bf4d\"/><stop offset=\"1\" stop-color=\"#b8862a\"/>\n    </linearGradient>\n    <radialGradient id=\"mtd0bolita\" cx=\"38%\" cy=\"32%\" r=\"70%\">\n      <stop offset=\"0\" stop-color=\"#b47a50\"/><stop offset=\".55\" stop-color=\"#7b4426\"/><stop offset=\"1\" stop-color=\"#4a2414\"/>\n    </radialGradient>\n    <radialGradient id=\"mtd0aro\" gradientUnits=\"userSpaceOnUse\" cx=\"50\" cy=\"50\" r=\"46\">\n      <stop offset=\"0.3\" stop-color=\"#4f2614\"/>\n      <stop offset=\"0.4\" stop-color=\"#9a6038\"/>\n      <stop offset=\".6\" stop-color=\"#c48d62\"/>\n      <stop offset=\".84\" stop-color=\"#9c6440\"/>\n      <stop offset=\".96\" stop-color=\"#6e3b21\"/>\n      <stop offset=\"1\" stop-color=\"#4f2614\"/>\n    </radialGradient>\n    <linearGradient id=\"mtd0luz\" gradientUnits=\"userSpaceOnUse\" x1=\"4\" y1=\"4\" x2=\"96\" y2=\"96\">\n      <stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\".32\"/>\n      <stop offset=\".45\" stop-color=\"#fff\" stop-opacity=\"0\"/>\n      <stop offset=\"1\" stop-color=\"#2a0f06\" stop-opacity=\".38\"/>\n    </linearGradient>\n    <clipPath id=\"mtd0clip\">\n      <path clip-rule=\"evenodd\" d=\"M4 50a46 46 0 1 0 92 0a46 46 0 1 0 -92 0ZM36.2 50a13.8 13.8 0 1 1 27.6 0a13.8 13.8 0 1 1 -27.6 0Z\"/>\n    </clipPath></defs><path fill-rule=\"evenodd\" d=\"M4 50a46 46 0 1 0 92 0a46 46 0 1 0 -92 0ZM36.2 50a13.8 13.8 0 1 1 27.6 0a13.8 13.8 0 1 1 -27.6 0Z\" fill=\"url(#mtd0aro)\"/>\n    <g clip-path=\"url(#mtd0clip)\">\n      <path d=\"M15 35C18.1 35.2 21.3 39.7 24.3 42.3C27.3 44.9 30.9 46.7 32.9 50.7C34.9 54.7 36.3 61.5 36.3 66.5C36.3 71.5 35.1 79.1 32.7 80.5C30.3 81.9 25.2 76.4 22 74.8C18.9 73.1 15.7 73.2 13.8 70.3C11.9 67.5 11.9 62.6 10.6 57.6C9.3 52.7 5.5 44.7 6.2 40.9C6.9 37.1 12 34.8 15 35Z M61.2 25.3C61 28.5 57.1 33.4 54.1 34.8C51 36.1 46 34.6 42.9 33.6C39.8 32.6 38.2 30.8 35.6 28.9C33 27 27.7 24.6 27.4 22C27.1 19.5 31.7 16.1 33.8 13.7C36 11.4 37.7 8.8 40.4 7.9C43.1 7 47.4 7 49.8 8.3C52.2 9.6 53 13 54.9 15.8C56.8 18.6 61.3 22.2 61.2 25.3Z M84.5 60.5C81.1 61.2 76.8 59.6 73.3 57.6C69.9 55.7 65.4 52.7 63.8 49C62.1 45.3 62.4 39.2 63.3 35.5C64.2 31.8 66.9 30 69.4 26.9C71.8 23.8 74.4 17.1 78 16.6C81.6 16.1 87.9 20.2 91 24C94.1 27.7 96.3 34.3 96.7 39.2C97.2 44.1 95.8 49.6 93.7 53.2C91.7 56.7 87.9 59.7 84.5 60.5Z M47.5 92.5C45.9 90.1 47 85.6 47.2 81.9C47.3 78.2 46.1 73.2 48.2 70.4C50.3 67.5 55.8 66.6 59.7 64.7C63.6 62.7 68.6 58.4 71.8 58.7C74.9 59 78.7 63.3 78.7 66.5C78.6 69.8 73.4 74.9 71.4 78.2C69.5 81.6 69.5 83.5 67.2 86.5C64.8 89.6 60.5 95.6 57.2 96.6C54 97.6 49.2 95 47.5 92.5Z\" fill=\"#3a1608\" opacity=\".25\" transform=\"translate(1.2 1.4)\"/>\n      <path d=\"M15 35C18.1 35.2 21.3 39.7 24.3 42.3C27.3 44.9 30.9 46.7 32.9 50.7C34.9 54.7 36.3 61.5 36.3 66.5C36.3 71.5 35.1 79.1 32.7 80.5C30.3 81.9 25.2 76.4 22 74.8C18.9 73.1 15.7 73.2 13.8 70.3C11.9 67.5 11.9 62.6 10.6 57.6C9.3 52.7 5.5 44.7 6.2 40.9C6.9 37.1 12 34.8 15 35Z M61.2 25.3C61 28.5 57.1 33.4 54.1 34.8C51 36.1 46 34.6 42.9 33.6C39.8 32.6 38.2 30.8 35.6 28.9C33 27 27.7 24.6 27.4 22C27.1 19.5 31.7 16.1 33.8 13.7C36 11.4 37.7 8.8 40.4 7.9C43.1 7 47.4 7 49.8 8.3C52.2 9.6 53 13 54.9 15.8C56.8 18.6 61.3 22.2 61.2 25.3Z M84.5 60.5C81.1 61.2 76.8 59.6 73.3 57.6C69.9 55.7 65.4 52.7 63.8 49C62.1 45.3 62.4 39.2 63.3 35.5C64.2 31.8 66.9 30 69.4 26.9C71.8 23.8 74.4 17.1 78 16.6C81.6 16.1 87.9 20.2 91 24C94.1 27.7 96.3 34.3 96.7 39.2C97.2 44.1 95.8 49.6 93.7 53.2C91.7 56.7 87.9 59.7 84.5 60.5Z M47.5 92.5C45.9 90.1 47 85.6 47.2 81.9C47.3 78.2 46.1 73.2 48.2 70.4C50.3 67.5 55.8 66.6 59.7 64.7C63.6 62.7 68.6 58.4 71.8 58.7C74.9 59 78.7 63.3 78.7 66.5C78.6 69.8 73.4 74.9 71.4 78.2C69.5 81.6 69.5 83.5 67.2 86.5C64.8 89.6 60.5 95.6 57.2 96.6C54 97.6 49.2 95 47.5 92.5Z\" fill=\"url(#mtd0blanco)\"/>\n    </g>\n    <path fill-rule=\"evenodd\" d=\"M4 50a46 46 0 1 0 92 0a46 46 0 1 0 -92 0ZM36.2 50a13.8 13.8 0 1 1 27.6 0a13.8 13.8 0 1 1 -27.6 0Z\" fill=\"url(#mtd0luz)\"/>\n    <circle cx=\"50\" cy=\"50\" r=\"13.8\" fill=\"#3a1a0d\"/>\n    <circle cx=\"50.7\" cy=\"50.8\" r=\"11.3\" fill=\"url(#mtd0bolita)\"/>\n    <ellipse cx=\"46.5\" cy=\"46.1\" rx=\"3\" ry=\"1.8\" fill=\"#fff\" fill-opacity=\".5\" transform=\"rotate(-35 46.5 46.1)\"/>\n    <g transform=\"translate(20.8 41.3) rotate(229.6)\">\n      <path d=\"M0 -15.1C11.5 -17 17 -5.5 13.7 3.3C10.4 12.3 3.3 18.6 0 19.7C-3.3 18.6 -10.4 12.3 -13.7 3.3C-17 -5.5 -11.5 -17 0 -15.1Z\" fill=\"#c81d2b\"/>\n      <path d=\"M0 -15.1C11.5 -17 17 -5.5 13.7 3.3C10.4 12.3 3.3 18.6 0 19.7C-3.3 18.6 -10.4 12.3 -13.7 3.3C-17 -5.5 -11.5 -17 0 -15.1Z\" fill=\"url(#mtd0pulpa)\" transform=\"scale(.9) translate(0 0.5)\"/>\n      <path d=\"M0 -10.4C2.7 -2.7 2.2 6.8 0 13.7C-2.2 6.8 -2.7 -2.7 0 -10.4Z\" fill=\"#fff\" fill-opacity=\".55\"/>\n      <g fill=\"#fff3c4\" fill-opacity=\".9\"><ellipse cx=\"9.8\" cy=\"-8.2\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-7.3\" cy=\"-4.7\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"3.9\" cy=\"-1.1\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-0\" cy=\"2.5\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-3.9\" cy=\"6\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"7.3\" cy=\"9.6\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-9.8\" cy=\"13.1\" rx=\"0.7\" ry=\"1.1\"/></g>\n      <path d=\"M-8.2 -11.5C-4.1 -14.2 1.4 -15.1 5.5 -13.7\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".6\" stroke-width=\"1.4\" stroke-linecap=\"round\"/>\n    </g>\n    <g transform=\"translate(79.5 57.8) rotate(345.5)\">\n      <path d=\"M0 -15.1C11.5 -17 17 -5.5 13.7 3.3C10.4 12.3 3.3 18.6 0 19.7C-3.3 18.6 -10.4 12.3 -13.7 3.3C-17 -5.5 -11.5 -17 0 -15.1Z\" fill=\"#c81d2b\"/>\n      <path d=\"M0 -15.1C11.5 -17 17 -5.5 13.7 3.3C10.4 12.3 3.3 18.6 0 19.7C-3.3 18.6 -10.4 12.3 -13.7 3.3C-17 -5.5 -11.5 -17 0 -15.1Z\" fill=\"url(#mtd0pulpa)\" transform=\"scale(.9) translate(0 0.5)\"/>\n      <path d=\"M0 -10.4C2.7 -2.7 2.2 6.8 0 13.7C-2.2 6.8 -2.7 -2.7 0 -10.4Z\" fill=\"#fff\" fill-opacity=\".55\"/>\n      <g fill=\"#fff3c4\" fill-opacity=\".9\"><ellipse cx=\"9.8\" cy=\"-8.2\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-7.3\" cy=\"-4.7\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"3.9\" cy=\"-1.1\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-0\" cy=\"2.5\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-3.9\" cy=\"6\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"7.3\" cy=\"9.6\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-9.8\" cy=\"13.1\" rx=\"0.7\" ry=\"1.1\"/></g>\n      <path d=\"M-8.2 -11.5C-4.1 -14.2 1.4 -15.1 5.5 -13.7\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".6\" stroke-width=\"1.4\" stroke-linecap=\"round\"/>\n    </g>\n    <circle cx=\"47.6\" cy=\"20.2\" r=\"7.1\" fill=\"url(#mtd0arandano)\"/>\n      <g stroke=\"#0b0e1f\" stroke-width=\"0.6\" stroke-linecap=\"round\"><line x1=\"46.2\" y1=\"18.4\" x2=\"46.2\" y2=\"16.9\"/><line x1=\"46.2\" y1=\"18.4\" x2=\"47.6\" y2=\"17.9\"/><line x1=\"46.2\" y1=\"18.4\" x2=\"47.1\" y2=\"19.7\"/><line x1=\"46.2\" y1=\"18.4\" x2=\"45.2\" y2=\"19.7\"/><line x1=\"46.2\" y1=\"18.4\" x2=\"44.7\" y2=\"17.9\"/></g>\n      <ellipse cx=\"44.9\" cy=\"17.2\" rx=\"1.6\" ry=\"0.9\" fill=\"#fff\" fill-opacity=\".55\" transform=\"rotate(-35 44.9 17.2)\"/>\n    <polygon points=\"72.7,28.2 72,29.8 67.1,30.5 67.3,28.3 68.4,26.1 71.6,25.8\" fill=\"url(#mtd0oro)\" stroke=\"#fff6cf\" stroke-width=\"0.3\" stroke-opacity=\".7\"/>\n    <path d=\"M12.8 36.5A39.6 39.6 0 0 1 36.5 12.8\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".55\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n    <circle cx=\"44.5\" cy=\"10.8\" r=\"1.3\" fill=\"#fff\" fill-opacity=\".6\"/></svg>",
        "dona1": "<svg viewBox=\"0 0 100 100\"><defs>\n    <radialGradient id=\"mtd1blanco\" cx=\"40%\" cy=\"35%\" r=\"75%\">\n      <stop offset=\"0\" stop-color=\"#fffdf8\"/><stop offset=\".7\" stop-color=\"#f7ecdc\"/><stop offset=\"1\" stop-color=\"#e9d6bd\"/>\n    </radialGradient>\n    <radialGradient id=\"mtd1pulpa\" cx=\"50%\" cy=\"45%\" r=\"60%\">\n      <stop offset=\"0\" stop-color=\"#ffd0cc\"/><stop offset=\".45\" stop-color=\"#ff7d7d\"/><stop offset=\"1\" stop-color=\"#e3313e\"/>\n    </radialGradient>\n    <radialGradient id=\"mtd1arandano\" cx=\"35%\" cy=\"30%\" r=\"75%\">\n      <stop offset=\"0\" stop-color=\"#5c6a9e\"/><stop offset=\".5\" stop-color=\"#262f5a\"/><stop offset=\"1\" stop-color=\"#11152b\"/>\n    </radialGradient>\n    <linearGradient id=\"mtd1oro\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#fff2b0\"/><stop offset=\".45\" stop-color=\"#e7bf4d\"/><stop offset=\"1\" stop-color=\"#b8862a\"/>\n    </linearGradient>\n    <radialGradient id=\"mtd1bolita\" cx=\"38%\" cy=\"32%\" r=\"70%\">\n      <stop offset=\"0\" stop-color=\"#b47a50\"/><stop offset=\".55\" stop-color=\"#7b4426\"/><stop offset=\"1\" stop-color=\"#4a2414\"/>\n    </radialGradient>\n    <radialGradient id=\"mtd1aro\" gradientUnits=\"userSpaceOnUse\" cx=\"50\" cy=\"50\" r=\"46\">\n      <stop offset=\"0.3\" stop-color=\"#4f2614\"/>\n      <stop offset=\"0.4\" stop-color=\"#9a6038\"/>\n      <stop offset=\".6\" stop-color=\"#c48d62\"/>\n      <stop offset=\".84\" stop-color=\"#9c6440\"/>\n      <stop offset=\".96\" stop-color=\"#6e3b21\"/>\n      <stop offset=\"1\" stop-color=\"#4f2614\"/>\n    </radialGradient>\n    <linearGradient id=\"mtd1luz\" gradientUnits=\"userSpaceOnUse\" x1=\"4\" y1=\"4\" x2=\"96\" y2=\"96\">\n      <stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\".32\"/>\n      <stop offset=\".45\" stop-color=\"#fff\" stop-opacity=\"0\"/>\n      <stop offset=\"1\" stop-color=\"#2a0f06\" stop-opacity=\".38\"/>\n    </linearGradient>\n    <clipPath id=\"mtd1clip\">\n      <path clip-rule=\"evenodd\" d=\"M4 50a46 46 0 1 0 92 0a46 46 0 1 0 -92 0ZM36.2 50a13.8 13.8 0 1 1 27.6 0a13.8 13.8 0 1 1 -27.6 0Z\"/>\n    </clipPath></defs><path fill-rule=\"evenodd\" d=\"M4 50a46 46 0 1 0 92 0a46 46 0 1 0 -92 0ZM36.2 50a13.8 13.8 0 1 1 27.6 0a13.8 13.8 0 1 1 -27.6 0Z\" fill=\"url(#mtd1aro)\"/>\n    <g clip-path=\"url(#mtd1clip)\">\n      <path d=\"M45 90.5C42.5 89.3 38.6 86.7 38.9 83.5C39.1 80.2 43.3 74.5 46.6 71C50 67.6 55.4 63.5 58.9 62.7C62.4 61.9 64.8 65.1 67.5 66.2C70.1 67.4 74.3 67.5 74.8 69.8C75.3 72.1 72.5 77 70.5 79.9C68.5 82.9 65.4 85.8 62.6 87.6C59.9 89.3 56.8 90.1 53.8 90.6C50.9 91 47.5 91.6 45 90.5Z M22.9 30.4C25.9 31.3 28.1 39.1 30.1 43.1C32 47.1 33.8 49.9 34.5 54.3C35.2 58.8 35.6 65.5 34 70C32.4 74.5 28.5 79.3 24.9 81.3C21.4 83.2 16.2 83.8 12.7 81.8C9.2 79.8 4.4 74.1 3.9 69.3C3.4 64.5 8.3 58.2 9.6 52.9C11 47.7 9.7 41.5 12 37.7C14.2 33.9 19.9 29.5 22.9 30.4Z M65.1 19.7C65.3 22.8 70.7 26.7 69 29C67.2 31.4 59.3 33.7 54.5 34.1C49.7 34.4 43.6 32.6 40.1 30.9C36.7 29.3 35.8 26.7 33.6 24.2C31.4 21.6 26.1 18.2 27.1 15.8C28 13.3 35 11.4 39.4 9.7C43.8 8 49 5.7 53.7 5.8C58.4 5.9 65.8 8.2 67.7 10.5C69.6 12.8 64.9 16.6 65.1 19.7Z M82.1 62.8C79.3 63 76.8 63.1 73.8 61.6C70.9 60.1 65 57.1 64.3 53.8C63.7 50.5 68.1 45 69.8 41.9C71.4 38.7 72.2 37.2 74.2 34.9C76.3 32.5 79.5 27.3 82 27.8C84.4 28.3 87 34.2 89.1 37.6C91.1 41.1 94 44.9 94.2 48.7C94.5 52.5 92.8 58 90.7 60.3C88.7 62.7 85 62.5 82.1 62.8Z\" fill=\"#3a1608\" opacity=\".25\" transform=\"translate(1.2 1.4)\"/>\n      <path d=\"M45 90.5C42.5 89.3 38.6 86.7 38.9 83.5C39.1 80.2 43.3 74.5 46.6 71C50 67.6 55.4 63.5 58.9 62.7C62.4 61.9 64.8 65.1 67.5 66.2C70.1 67.4 74.3 67.5 74.8 69.8C75.3 72.1 72.5 77 70.5 79.9C68.5 82.9 65.4 85.8 62.6 87.6C59.9 89.3 56.8 90.1 53.8 90.6C50.9 91 47.5 91.6 45 90.5Z M22.9 30.4C25.9 31.3 28.1 39.1 30.1 43.1C32 47.1 33.8 49.9 34.5 54.3C35.2 58.8 35.6 65.5 34 70C32.4 74.5 28.5 79.3 24.9 81.3C21.4 83.2 16.2 83.8 12.7 81.8C9.2 79.8 4.4 74.1 3.9 69.3C3.4 64.5 8.3 58.2 9.6 52.9C11 47.7 9.7 41.5 12 37.7C14.2 33.9 19.9 29.5 22.9 30.4Z M65.1 19.7C65.3 22.8 70.7 26.7 69 29C67.2 31.4 59.3 33.7 54.5 34.1C49.7 34.4 43.6 32.6 40.1 30.9C36.7 29.3 35.8 26.7 33.6 24.2C31.4 21.6 26.1 18.2 27.1 15.8C28 13.3 35 11.4 39.4 9.7C43.8 8 49 5.7 53.7 5.8C58.4 5.9 65.8 8.2 67.7 10.5C69.6 12.8 64.9 16.6 65.1 19.7Z M82.1 62.8C79.3 63 76.8 63.1 73.8 61.6C70.9 60.1 65 57.1 64.3 53.8C63.7 50.5 68.1 45 69.8 41.9C71.4 38.7 72.2 37.2 74.2 34.9C76.3 32.5 79.5 27.3 82 27.8C84.4 28.3 87 34.2 89.1 37.6C91.1 41.1 94 44.9 94.2 48.7C94.5 52.5 92.8 58 90.7 60.3C88.7 62.7 85 62.5 82.1 62.8Z\" fill=\"url(#mtd1blanco)\"/>\n    </g>\n    <path fill-rule=\"evenodd\" d=\"M4 50a46 46 0 1 0 92 0a46 46 0 1 0 -92 0ZM36.2 50a13.8 13.8 0 1 1 27.6 0a13.8 13.8 0 1 1 -27.6 0Z\" fill=\"url(#mtd1luz)\"/>\n    <circle cx=\"50\" cy=\"50\" r=\"13.8\" fill=\"#3a1a0d\"/>\n    <circle cx=\"50.7\" cy=\"50.8\" r=\"11.3\" fill=\"url(#mtd1bolita)\"/>\n    <ellipse cx=\"46.5\" cy=\"46.1\" rx=\"3\" ry=\"1.8\" fill=\"#fff\" fill-opacity=\".5\" transform=\"rotate(-35 46.5 46.1)\"/>\n    <g transform=\"translate(36.7 77.5) rotate(149.9)\">\n      <path d=\"M0 -15.1C11.5 -17 17 -5.5 13.7 3.3C10.4 12.3 3.3 18.6 0 19.7C-3.3 18.6 -10.4 12.3 -13.7 3.3C-17 -5.5 -11.5 -17 0 -15.1Z\" fill=\"#c81d2b\"/>\n      <path d=\"M0 -15.1C11.5 -17 17 -5.5 13.7 3.3C10.4 12.3 3.3 18.6 0 19.7C-3.3 18.6 -10.4 12.3 -13.7 3.3C-17 -5.5 -11.5 -17 0 -15.1Z\" fill=\"url(#mtd1pulpa)\" transform=\"scale(.9) translate(0 0.5)\"/>\n      <path d=\"M0 -10.4C2.7 -2.7 2.2 6.8 0 13.7C-2.2 6.8 -2.7 -2.7 0 -10.4Z\" fill=\"#fff\" fill-opacity=\".55\"/>\n      <g fill=\"#fff3c4\" fill-opacity=\".9\"><ellipse cx=\"9.8\" cy=\"-8.2\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-7.3\" cy=\"-4.7\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"3.9\" cy=\"-1.1\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-0\" cy=\"2.5\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-3.9\" cy=\"6\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"7.3\" cy=\"9.6\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-9.8\" cy=\"13.1\" rx=\"0.7\" ry=\"1.1\"/></g>\n      <path d=\"M-8.2 -11.5C-4.1 -14.2 1.4 -15.1 5.5 -13.7\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".6\" stroke-width=\"1.4\" stroke-linecap=\"round\"/>\n    </g>\n    <g transform=\"translate(61.6 21.8) rotate(286.4)\">\n      <path d=\"M0 -15.1C11.5 -17 17 -5.5 13.7 3.3C10.4 12.3 3.3 18.6 0 19.7C-3.3 18.6 -10.4 12.3 -13.7 3.3C-17 -5.5 -11.5 -17 0 -15.1Z\" fill=\"#c81d2b\"/>\n      <path d=\"M0 -15.1C11.5 -17 17 -5.5 13.7 3.3C10.4 12.3 3.3 18.6 0 19.7C-3.3 18.6 -10.4 12.3 -13.7 3.3C-17 -5.5 -11.5 -17 0 -15.1Z\" fill=\"url(#mtd1pulpa)\" transform=\"scale(.9) translate(0 0.5)\"/>\n      <path d=\"M0 -10.4C2.7 -2.7 2.2 6.8 0 13.7C-2.2 6.8 -2.7 -2.7 0 -10.4Z\" fill=\"#fff\" fill-opacity=\".55\"/>\n      <g fill=\"#fff3c4\" fill-opacity=\".9\"><ellipse cx=\"9.8\" cy=\"-8.2\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-7.3\" cy=\"-4.7\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"3.9\" cy=\"-1.1\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-0\" cy=\"2.5\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-3.9\" cy=\"6\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"7.3\" cy=\"9.6\" rx=\"0.7\" ry=\"1.1\"/><ellipse cx=\"-9.8\" cy=\"13.1\" rx=\"0.7\" ry=\"1.1\"/></g>\n      <path d=\"M-8.2 -11.5C-4.1 -14.2 1.4 -15.1 5.5 -13.7\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".6\" stroke-width=\"1.4\" stroke-linecap=\"round\"/>\n    </g>\n    <circle cx=\"20.1\" cy=\"49.9\" r=\"7.1\" fill=\"url(#mtd1arandano)\"/>\n      <g stroke=\"#0b0e1f\" stroke-width=\"0.6\" stroke-linecap=\"round\"><line x1=\"18.7\" y1=\"48.2\" x2=\"18.7\" y2=\"46.6\"/><line x1=\"18.7\" y1=\"48.2\" x2=\"20.2\" y2=\"47.7\"/><line x1=\"18.7\" y1=\"48.2\" x2=\"19.6\" y2=\"49.4\"/><line x1=\"18.7\" y1=\"48.2\" x2=\"17.8\" y2=\"49.4\"/><line x1=\"18.7\" y1=\"48.2\" x2=\"17.2\" y2=\"47.7\"/></g>\n      <ellipse cx=\"17.4\" cy=\"47\" rx=\"1.6\" ry=\"0.9\" fill=\"#fff\" fill-opacity=\".55\" transform=\"rotate(-35 17.4 47)\"/>\n    <polygon points=\"35.2,26 34.7,29.1 31,29 30.1,25.3 30.5,23.9 34.7,23\" fill=\"url(#mtd1oro)\" stroke=\"#fff6cf\" stroke-width=\"0.3\" stroke-opacity=\".7\"/>\n    <path d=\"M12.8 36.5A39.6 39.6 0 0 1 36.5 12.8\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".55\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n    <circle cx=\"44.5\" cy=\"10.8\" r=\"1.3\" fill=\"#fff\" fill-opacity=\".6\"/></svg>",
        "gota": "<svg viewBox=\"0 0 60 80\"><defs>\n<radialGradient id=\"mtgota\" cx=\"38%\" cy=\"58%\" r=\"65%\"><stop offset=\"0\" stop-color=\"#8a4a2c\"/><stop offset=\".55\" stop-color=\"#5a2617\"/><stop offset=\"1\" stop-color=\"#2e0f07\"/></radialGradient></defs>\n<path d=\"M30 2C30 2 6 36 6 52a24 24 0 0 0 48 0C54 36 30 2 30 2Z\" fill=\"url(#mtgota)\"/>\n<path d=\"M19 50c1-9 6-18 10-25-1 8-3 17-4 25-1 5-7 5-6 0Z\" fill=\"#fff\" fill-opacity=\".55\"/>\n<ellipse cx=\"40\" cy=\"60\" rx=\"4\" ry=\"2.6\" fill=\"#fff\" fill-opacity=\".35\" transform=\"rotate(-30 40 60)\"/></svg>",
        "frutilla": "<svg viewBox=\"-50 -50 100 100\"><defs>\n    <radialGradient id=\"mtfblanco\" cx=\"40%\" cy=\"35%\" r=\"75%\">\n      <stop offset=\"0\" stop-color=\"#fffdf8\"/><stop offset=\".7\" stop-color=\"#f7ecdc\"/><stop offset=\"1\" stop-color=\"#e9d6bd\"/>\n    </radialGradient>\n    <radialGradient id=\"mtfpulpa\" cx=\"50%\" cy=\"45%\" r=\"60%\">\n      <stop offset=\"0\" stop-color=\"#ffd0cc\"/><stop offset=\".45\" stop-color=\"#ff7d7d\"/><stop offset=\"1\" stop-color=\"#e3313e\"/>\n    </radialGradient>\n    <radialGradient id=\"mtfarandano\" cx=\"35%\" cy=\"30%\" r=\"75%\">\n      <stop offset=\"0\" stop-color=\"#5c6a9e\"/><stop offset=\".5\" stop-color=\"#262f5a\"/><stop offset=\"1\" stop-color=\"#11152b\"/>\n    </radialGradient>\n    <linearGradient id=\"mtforo\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#fff2b0\"/><stop offset=\".45\" stop-color=\"#e7bf4d\"/><stop offset=\"1\" stop-color=\"#b8862a\"/>\n    </linearGradient>\n    <radialGradient id=\"mtfbolita\" cx=\"38%\" cy=\"32%\" r=\"70%\">\n      <stop offset=\"0\" stop-color=\"#b47a50\"/><stop offset=\".55\" stop-color=\"#7b4426\"/><stop offset=\"1\" stop-color=\"#4a2414\"/>\n    </radialGradient></defs><g transform=\"translate(0 -6) rotate(0)\">\n      <path d=\"M0 -44C33.6 -49.6 49.6 -16 40 9.6C30.4 36 9.6 54.4 0 57.6C-9.6 54.4 -30.4 36 -40 9.6C-49.6 -16 -33.6 -49.6 0 -44Z\" fill=\"#c81d2b\"/>\n      <path d=\"M0 -44C33.6 -49.6 49.6 -16 40 9.6C30.4 36 9.6 54.4 0 57.6C-9.6 54.4 -30.4 36 -40 9.6C-49.6 -16 -33.6 -49.6 0 -44Z\" fill=\"url(#mtfpulpa)\" transform=\"scale(.9) translate(0 1.6)\"/>\n      <path d=\"M0 -30.4C8 -8 6.4 20 0 40C-6.4 20 -8 -8 0 -30.4Z\" fill=\"#fff\" fill-opacity=\".55\"/>\n      <g fill=\"#fff3c4\" fill-opacity=\".9\"><ellipse cx=\"28.5\" cy=\"-24\" rx=\"2\" ry=\"3.2\"/><ellipse cx=\"-21.4\" cy=\"-13.6\" rx=\"2\" ry=\"3.2\"/><ellipse cx=\"11.5\" cy=\"-3.2\" rx=\"2\" ry=\"3.2\"/><ellipse cx=\"-0\" cy=\"7.2\" rx=\"2\" ry=\"3.2\"/><ellipse cx=\"-11.5\" cy=\"17.6\" rx=\"2\" ry=\"3.2\"/><ellipse cx=\"21.4\" cy=\"28\" rx=\"2\" ry=\"3.2\"/><ellipse cx=\"-28.5\" cy=\"38.4\" rx=\"2\" ry=\"3.2\"/></g>\n      <path d=\"M-24 -33.6C-12 -41.6 4 -44 16 -40\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".6\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n    </g></svg>",
        "arandano": "<svg viewBox=\"-50 -50 100 100\"><defs>\n    <radialGradient id=\"mtablanco\" cx=\"40%\" cy=\"35%\" r=\"75%\">\n      <stop offset=\"0\" stop-color=\"#fffdf8\"/><stop offset=\".7\" stop-color=\"#f7ecdc\"/><stop offset=\"1\" stop-color=\"#e9d6bd\"/>\n    </radialGradient>\n    <radialGradient id=\"mtapulpa\" cx=\"50%\" cy=\"45%\" r=\"60%\">\n      <stop offset=\"0\" stop-color=\"#ffd0cc\"/><stop offset=\".45\" stop-color=\"#ff7d7d\"/><stop offset=\"1\" stop-color=\"#e3313e\"/>\n    </radialGradient>\n    <radialGradient id=\"mtaarandano\" cx=\"35%\" cy=\"30%\" r=\"75%\">\n      <stop offset=\"0\" stop-color=\"#5c6a9e\"/><stop offset=\".5\" stop-color=\"#262f5a\"/><stop offset=\"1\" stop-color=\"#11152b\"/>\n    </radialGradient>\n    <linearGradient id=\"mtaoro\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#fff2b0\"/><stop offset=\".45\" stop-color=\"#e7bf4d\"/><stop offset=\"1\" stop-color=\"#b8862a\"/>\n    </linearGradient>\n    <radialGradient id=\"mtabolita\" cx=\"38%\" cy=\"32%\" r=\"70%\">\n      <stop offset=\"0\" stop-color=\"#b47a50\"/><stop offset=\".55\" stop-color=\"#7b4426\"/><stop offset=\"1\" stop-color=\"#4a2414\"/>\n    </radialGradient></defs><circle cx=\"0\" cy=\"0\" r=\"44\" fill=\"url(#mtaarandano)\"/>\n      <g stroke=\"#0b0e1f\" stroke-width=\"4\" stroke-linecap=\"round\"><line x1=\"-8.8\" y1=\"-11\" x2=\"-8.8\" y2=\"-20.7\"/><line x1=\"-8.8\" y1=\"-11\" x2=\"0.4\" y2=\"-14\"/><line x1=\"-8.8\" y1=\"-11\" x2=\"-3.1\" y2=\"-3.2\"/><line x1=\"-8.8\" y1=\"-11\" x2=\"-14.5\" y2=\"-3.2\"/><line x1=\"-8.8\" y1=\"-11\" x2=\"-18\" y2=\"-14\"/></g>\n      <ellipse cx=\"-16.7\" cy=\"-18.5\" rx=\"9.7\" ry=\"5.7\" fill=\"#fff\" fill-opacity=\".55\" transform=\"rotate(-35 -16.7 -18.5)\"/></svg>",
        "corazon": "<svg viewBox=\"-1.15 -0.85 2.3 2\"><defs>\n<radialGradient id=\"mtcor\" cx=\"35%\" cy=\"25%\" r=\"85%\"><stop offset=\"0\" stop-color=\"#ffc2cf\"/><stop offset=\".5\" stop-color=\"#ef8199\"/><stop offset=\"1\" stop-color=\"#c9476a\"/></radialGradient></defs>\n<path fill=\"url(#mtcor)\" d=\"M0 -0.3C-0.18 -0.72 -1 -0.72 -1 -0.12C-1 0.32 -0.45 0.6 0 1C0.45 0.6 1 0.32 1 -0.12C1 -0.72 0.18 -0.72 0 -0.3Z\"/>\n<path d=\"M-0.72 -0.25C-0.7 -0.48 -0.48 -0.56 -0.3 -0.45\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".75\" stroke-width=\".09\" stroke-linecap=\"round\"/></svg>",
        "trozo": "<svg viewBox=\"0 0 60 60\"><defs>\n<linearGradient id=\"mttro\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#8b4f30\"/><stop offset=\"1\" stop-color=\"#3d180d\"/></linearGradient></defs>\n<path d=\"M8 14 40 6 54 30 42 54 12 50 4 30Z\" fill=\"url(#mttro)\"/>\n<path d=\"M8 14 40 6 44 14 14 22Z\" fill=\"#fff\" fill-opacity=\".22\"/>\n<path d=\"M14 22 44 14 48 32 20 38Z\" fill=\"#000\" fill-opacity=\".08\"/></svg>"
    };


    /* ===========================
       UTILIDADES
    =========================== */

    function azar(min, max) {
        return min + Math.random() * (max - min);
    }

    function n(valor) {
        return Math.round(valor * 10) / 10;
    }

    function crearSvg(etiqueta, atributos) {
        const el = document.createElementNS(SVG_NS, etiqueta);
        for (const clave in atributos) {
            el.setAttribute(clave, atributos[clave]);
        }
        return el;
    }


    /* ===========================
       CHOCOLATE DERRETIDO VIVO
       Una franja de chocolate brillante de la que cuelgan gotas.
       Cada gota "respira", se estira, se afina en el cuello y se
       desprende como gota que cae (acelera, se estira y salpica
       al llegar abajo). La punta se vuelve a formar y repite.
       Con el scroll, las gotas se alargan y gotean más; al volver
       arriba se retraen suavemente.
       Todo se dibuja con un único SVG cuyos paths se recalculan
       con requestAnimationFrame (solo mientras el hero se ve).
    =========================== */

    const CONFIG_CHOCO = TRANQUILO
        ? {
            banda: CELULAR ? 36 : 52,
            separacion: CELULAR ? 90 : 130,     // menos gotas
            ciclo: [9, 15],                      // segundos hasta desprenderse
            respiracion: 0.12,
            estiramientoScroll: 0.5,
            gravedad: 650,
            introduccion: 0.9
        }
        : {
            banda: CELULAR ? 38 : 56,
            separacion: CELULAR ? 64 : 100,
            ciclo: [3.2, 7],
            respiracion: 0.28,
            estiramientoScroll: 1,
            gravedad: 1500,
            introduccion: 2.2
        };

    function suavizarSalida(t) {
        // easeOutBack: llega con un pequeño rebote
        const c1 = 1.4;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    function suavizar(t) {
        return t * t * (3 - 2 * t);
    }

    // Path de una gota colgante: columna + cuello + bulbo redondeado
    function caminoGota(c, largo, radioBulbo, anchoCuello, banda) {

        const x = c.x;
        const izq = x - c.w / 2;
        const der = x + c.w / 2;
        const ensanche = c.w * 0.7;
        const arriba = banda - 16;
        const inicio = banda + 4;

        const finColumna = Math.max(inicio + 2, banda + largo);
        const largoCuello = Math.max(0, (c.w - anchoCuello) * 0.9);
        const yCuello = finColumna + largoCuello;
        const yBulbo = yCuello + radioBulbo * 0.85;
        const mc = anchoCuello / 2;
        const rb = radioBulbo;

        return (
            `M${n(izq - ensanche)} ${n(arriba)}` +
            `C${n(izq - ensanche * 0.25)} ${n(arriba)} ${n(izq)} ${n(inicio - 8)} ${n(izq)} ${n(inicio + 4)}` +
            `L${n(izq)} ${n(finColumna)}` +
            `C${n(izq)} ${n(finColumna + largoCuello * 0.5)} ${n(x - mc)} ${n(yCuello - largoCuello * 0.3)} ${n(x - mc)} ${n(yCuello)}` +
            `C${n(x - mc)} ${n(yCuello + rb * 0.2)} ${n(x - rb)} ${n(yBulbo - rb * 0.6)} ${n(x - rb)} ${n(yBulbo)}` +
            `A${n(rb)} ${n(rb)} 0 0 0 ${n(x + rb)} ${n(yBulbo)}` +
            `C${n(x + rb)} ${n(yBulbo - rb * 0.6)} ${n(x + mc)} ${n(yCuello + rb * 0.2)} ${n(x + mc)} ${n(yCuello)}` +
            `C${n(x + mc)} ${n(yCuello - largoCuello * 0.3)} ${n(der)} ${n(finColumna + largoCuello * 0.5)} ${n(der)} ${n(finColumna)}` +
            `L${n(der)} ${n(inicio + 4)}` +
            `C${n(der)} ${n(inicio - 8)} ${n(der + ensanche * 0.25)} ${n(arriba)} ${n(der + ensanche)} ${n(arriba)}Z`
        );
    }

    // Gota suelta (forma de lágrima) centrada en 0,0
    function caminoLagrima(r) {
        return (
            `M0 ${n(-r * 1.7)}` +
            `C${n(r * 0.35)} ${n(-r * 1.15)} ${n(r)} ${n(-r * 0.55)} ${n(r)} 0` +
            `A${n(r)} ${n(r)} 0 0 1 ${n(-r)} 0` +
            `C${n(-r)} ${n(-r * 0.55)} ${n(-r * 0.35)} ${n(-r * 1.15)} 0 ${n(-r * 1.7)}Z`
        );
    }

    function bordeOndulado(puntos, dy, invertido) {
        let d = "";
        const lista = invertido ? puntos.slice().reverse() : puntos;
        for (let i = 0; i < lista.length - 1; i++) {
            const a = lista[i];
            const b = lista[i + 1];
            const medio = (a[0] + b[0]) / 2;
            d += `C${n(medio)} ${n(a[1] + dy)} ${n(medio)} ${n(b[1] + dy)} ${n(b[0])} ${n(b[1] + dy)}`;
        }
        return d;
    }

    function crearChocolateVivo(hero) {

        const goteo = document.createElement("div");
        goteo.className = "hero-goteo";
        goteo.setAttribute("aria-hidden", "true");

        let estado = null;
        let corriendo = false;
        let ultimoTiempo = 0;
        let tiempoTotal = 0;

        // ---------- Construcción ----------
        function construir() {

            const ancho = hero.clientWidth || window.innerWidth;
            const arribaEnHero = goteo.offsetTop || 0;
            const alto = Math.max(300, hero.offsetHeight - arribaEnHero);
            const banda = CONFIG_CHOCO.banda;
            const cantidad = Math.max(4, Math.round(ancho / CONFIG_CHOCO.separacion));
            const paso = ancho / cantidad;

            const svg = crearSvg("svg", {
                viewBox: `0 0 ${n(ancho)} ${n(alto)}`,
                width: n(ancho),
                height: n(alto),
                "aria-hidden": "true",
                focusable: "false"
            });

            const defs = crearSvg("defs", {});
            defs.innerHTML = `
                <linearGradient id="chocoBase" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${n(alto)}">
                    <stop offset="0" stop-color="#431a10"/>
                    <stop offset="${n(banda / alto * 100) / 100}" stop-color="#55241a"/>
                    <stop offset="${n(Math.min(0.9, (banda + 260) / alto) * 100) / 100}" stop-color="#6d2f1c"/>
                    <stop offset="1" stop-color="#7a3622"/>
                </linearGradient>
                <linearGradient id="chocoVolumen" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stop-color="#1c0703" stop-opacity=".55"/>
                    <stop offset=".22" stop-color="#1c0703" stop-opacity="0"/>
                    <stop offset=".45" stop-color="#c7836a" stop-opacity=".22"/>
                    <stop offset=".7" stop-color="#1c0703" stop-opacity="0"/>
                    <stop offset="1" stop-color="#1c0703" stop-opacity=".6"/>
                </linearGradient>
                <linearGradient id="chocoBrilloBanda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
                    <stop offset=".55" stop-color="#fff" stop-opacity=".12"/>
                    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
                </linearGradient>`;
            svg.appendChild(defs);

            // Gotas: posiciones, grosores, largos y ritmos variados
            const gotas = [];

            for (let i = 0; i < cantidad; i++) {

                const corta = Math.random() < 0.28;
                const w = azar(CELULAR ? 20 : 30, CELULAR ? 34 : 58);

                gotas.push({
                    x: paso * (i + 0.5) + azar(-paso * 0.18, paso * 0.18),
                    w: w,
                    base: corta
                        ? azar(CELULAR ? 12 : 18, CELULAR ? 26 : 40)
                        : azar(CELULAR ? 36 : 56, CELULAR ? 95 : 160),
                    gotea: !corta,
                    // respiración
                    amplitud: w * CONFIG_CHOCO.respiracion * azar(0.6, 1.4),
                    periodo: azar(2.4, 5.2) * (TRANQUILO ? 1.8 : 1),
                    fase: azar(0, Math.PI * 2),
                    // scroll
                    factorScroll: corta ? azar(0.05, 0.25) : azar(0.35, 1.5),
                    estiramiento: 0,
                    // ciclo de goteo
                    progreso: azar(0, 0.7),
                    duracionCiclo: azar(CONFIG_CHOCO.ciclo[0], CONFIG_CHOCO.ciclo[1]),
                    rebote: 0,
                    velocidadRebote: 0,
                    // entrada
                    demora: azar(0.2, TRANQUILO ? 0.5 : 1.2),
                    entrada: 0
                });
            }

            // Franja superior con borde ondulado
            const puntos = [[0, banda - 4]];
            gotas.forEach(function (g, i) {
                puntos.push([g.x, banda + 6]);
                if (gotas[i + 1]) {
                    puntos.push([(g.x + gotas[i + 1].x) / 2, banda - azar(8, 16)]);
                }
            });
            puntos.push([ancho, banda - 4]);

            const dBanda = `M0 -2H${n(ancho)}V${n(banda - 4)}` + bordeOndulado(puntos, 0, true) + "Z";

            const grupoBanda = crearSvg("g", { class: "choco-banda" });
            grupoBanda.appendChild(crearSvg("path", { d: dBanda, fill: "#3d1811", "fill-opacity": ".22", transform: "translate(0 5)" }));
            grupoBanda.appendChild(crearSvg("path", { d: dBanda, fill: "url(#chocoBase)" }));
            grupoBanda.appendChild(crearSvg("path", { d: dBanda, fill: "url(#chocoBrilloBanda)" }));
            grupoBanda.appendChild(crearSvg("path", {
                d: `M0 ${n(banda - 14)}` + bordeOndulado(puntos, -10, false),
                fill: "none",
                stroke: "#fff",
                "stroke-opacity": ".35",
                "stroke-width": CELULAR ? 2.5 : 3.5,
                "stroke-linecap": "round",
                "stroke-dasharray": CELULAR ? "60 50 12 40" : "120 70 18 60"
            }));

            // Capa de gotas (debajo de la franja para que el empalme no se note)
            const capaGotas = crearSvg("g", {});
            const capaSueltas = crearSvg("g", {});

            gotas.forEach(function (g, i) {

                const id = `chocoGota${i}`;
                const forma = crearSvg("path", { id: id });
                defs.appendChild(forma);

                const grupo = crearSvg("g", {});
                grupo.appendChild(crearSvg("use", { href: `#${id}`, fill: "#3d1811", "fill-opacity": ".2", transform: "translate(2 6)" }));
                grupo.appendChild(crearSvg("use", { href: `#${id}`, fill: "url(#chocoBase)" }));
                grupo.appendChild(crearSvg("use", { href: `#${id}`, fill: "url(#chocoVolumen)" }));

                const brillo = crearSvg("path", {
                    fill: "none",
                    stroke: "#fff",
                    "stroke-opacity": ".5",
                    "stroke-width": n(g.w * 0.14),
                    "stroke-linecap": "round"
                });

                const reflejo = crearSvg("ellipse", {
                    rx: n(g.w * 0.12),
                    ry: n(g.w * 0.07),
                    fill: "#fff",
                    "fill-opacity": ".45"
                });

                grupo.appendChild(brillo);
                grupo.appendChild(reflejo);
                capaGotas.appendChild(grupo);

                g.forma = forma;
                g.brillo = brillo;
                g.reflejo = reflejo;
            });

            svg.appendChild(capaGotas);
            svg.appendChild(grupoBanda);
            svg.appendChild(capaSueltas);

            return {
                svg: svg,
                ancho: ancho,
                alto: alto,
                banda: banda,
                gotas: gotas,
                sueltas: [],
                salpicaduras: [],
                capaSueltas: capaSueltas,
                piso: alto - 70,
                estiramientoMax: alto - banda - 120
            };
        }

        // ---------- Desprender una gota ----------
        function soltar(g, x, y, r) {

            const grupo = crearSvg("g", {});
            grupo.appendChild(crearSvg("path", { d: caminoLagrima(r), fill: "url(#chocoBase)" }));
            grupo.appendChild(crearSvg("ellipse", {
                cx: n(-r * 0.35), cy: n(-r * 0.25), rx: n(r * 0.22), ry: n(r * 0.36),
                fill: "#fff", "fill-opacity": ".45",
                transform: `rotate(20 ${n(-r * 0.35)} ${n(-r * 0.25)})`
            }));
            estado.capaSueltas.appendChild(grupo);

            estado.sueltas.push({ el: grupo, x: x, y: y, r: r, vy: 30 });
        }

        function salpicar(x, y, r) {

            const grupo = crearSvg("g", {});
            grupo.appendChild(crearSvg("ellipse", { cx: 0, cy: 0, rx: n(r * 2.2), ry: n(r * 0.55), fill: "url(#chocoBase)" }));
            for (let i = 0; i < 3; i++) {
                grupo.appendChild(crearSvg("circle", {
                    cx: n(azar(-r * 2.6, r * 2.6)),
                    cy: n(-azar(r * 0.6, r * 1.6)),
                    r: n(azar(r * 0.18, r * 0.35)),
                    fill: "#55241a"
                }));
            }
            estado.capaSueltas.appendChild(grupo);
            estado.salpicaduras.push({ el: grupo, x: x, y: y, t: 0 });
        }

        // ---------- Un cuadro de animación ----------
        function cuadro(tiempo) {

            const dt = Math.min(0.05, (tiempo - ultimoTiempo) / 1000 || 0.016);
            ultimoTiempo = tiempo;
            tiempoTotal += dt;

            const scroll = Math.max(0, window.scrollY);
            const altoHero = hero.offsetHeight;
            const objetivoScroll = Math.min(scroll, altoHero) * CONFIG_CHOCO.estiramientoScroll;
            const aceleracion = 1 + Math.min(scroll, altoHero) / (TRANQUILO ? 900 : 350);
            const banda = estado.banda;

            estado.gotas.forEach(function (g) {

                // Entrada
                if (g.entrada < 1) {
                    if (tiempoTotal > g.demora) {
                        g.entrada = Math.min(1, g.entrada + dt / CONFIG_CHOCO.introduccion);
                    }
                }

                const factorEntrada = g.entrada < 1 ? suavizarSalida(g.entrada) : 1;

                // Estiramiento por scroll (se retrae suave al volver)
                const objetivo = Math.min(objetivoScroll * g.factorScroll, estado.estiramientoMax - g.base);
                g.estiramiento += (objetivo - g.estiramiento) * Math.min(1, dt * 3.5);

                // Ciclo de goteo
                let radio = g.w / 2;
                let cuello = g.w;
                let crecimiento = 0;

                if (g.gotea && g.entrada >= 1) {

                    g.progreso += (dt / g.duracionCiclo) * aceleracion;

                    const p = Math.min(1, g.progreso);
                    const formando = Math.min(1, p / 0.1);   // la punta se vuelve a formar

                    radio = (g.w / 2) * (0.6 + 0.4 * suavizar(formando)) * (1 + 0.5 * suavizar(p));
                    cuello = p < 0.55 ? g.w : g.w * (1 - 0.94 * suavizar((p - 0.55) / 0.45));
                    crecimiento = g.w * 1.6 * p * p;
                }

                // Rebote elástico después de soltar la gota
                g.velocidadRebote += (-g.rebote * 60 - g.velocidadRebote * 7) * dt;
                g.rebote += g.velocidadRebote * dt;

                const respiracion = g.amplitud * Math.sin((tiempoTotal / g.periodo) * Math.PI * 2 + g.fase);
                const largo = (g.base + respiracion + g.estiramiento + crecimiento) * factorEntrada + g.rebote;

                g.forma.setAttribute("d", caminoGota(g, largo, radio, cuello, banda));

                // Brillo largo del lado izquierdo y reflejo en la punta
                const finColumna = banda + Math.max(6, largo);
                const xb = g.x - g.w * 0.2;
                if (largo > 26) {
                    g.brillo.setAttribute(
                        "d",
                        `M${n(xb)} ${n(banda + 10)}Q${n(xb - g.w * 0.06)} ${n((banda + finColumna) / 2)} ${n(xb + g.w * 0.02)} ${n(finColumna - g.w * 0.1)}`
                    );
                    g.brillo.setAttribute("stroke-opacity", ".5");
                } else {
                    g.brillo.setAttribute("stroke-opacity", "0");
                }

                const largoCuello = Math.max(0, (g.w - cuello) * 0.9);
                const yBulbo = finColumna + largoCuello + radio * 0.85;
                const rx = g.x + radio * 0.38;
                const ry = yBulbo + radio * 0.42;
                g.reflejo.setAttribute("cx", n(rx));
                g.reflejo.setAttribute("cy", n(ry));
                g.reflejo.setAttribute("transform", `rotate(-30 ${n(rx)} ${n(ry)})`);

                // ¡Se desprende!
                if (g.gotea && g.progreso >= 1) {
                    soltar(g, g.x, yBulbo, radio * 0.92);
                    g.progreso = 0;
                    g.duracionCiclo = azar(CONFIG_CHOCO.ciclo[0], CONFIG_CHOCO.ciclo[1]);
                    g.rebote = -g.w * 0.5;
                    g.velocidadRebote = 0;
                }
            });

            // Gotas sueltas: caen acelerando y se estiran
            const limiteVista = scroll + window.innerHeight - (hero.offsetTop + goteo.offsetTop);

            for (let i = estado.sueltas.length - 1; i >= 0; i--) {

                const s = estado.sueltas[i];
                s.vy += CONFIG_CHOCO.gravedad * dt;
                s.y += s.vy * dt;

                const estirar = 1 + Math.min(s.vy / 2200, 0.35);

                s.el.setAttribute(
                    "transform",
                    `translate(${n(s.x)} ${n(s.y)}) scale(${n(1 / Math.sqrt(estirar) * 100) / 100} ${n(estirar * 100) / 100})`
                );

                if (s.y + s.r >= estado.piso) {
                    s.el.remove();
                    estado.sueltas.splice(i, 1);
                    salpicar(s.x, estado.piso, s.r);
                } else if (s.y - s.r * 2 > limiteVista) {
                    s.el.remove();
                    estado.sueltas.splice(i, 1);
                }
            }

            // Salpicaduras: se abren y se desvanecen
            for (let i = estado.salpicaduras.length - 1; i >= 0; i--) {

                const s = estado.salpicaduras[i];
                s.t += dt / 0.55;

                if (s.t >= 1) {
                    s.el.remove();
                    estado.salpicaduras.splice(i, 1);
                    continue;
                }

                const k = 0.4 + 0.6 * suavizar(Math.min(1, s.t * 1.6));
                s.el.setAttribute("transform", `translate(${n(s.x)} ${n(s.y)}) scale(${n(k * 100) / 100} ${n(k * 100) / 100})`);
                s.el.setAttribute("opacity", n((1 - s.t) * 100) / 100);
            }

            // Seguir solo si el hero se ve y la pestaña está activa
            const visible = scroll < hero.offsetTop + altoHero && !document.hidden;

            if (visible) {
                window.requestAnimationFrame(cuadro);
            } else {
                corriendo = false;
            }
        }

        function arrancar() {
            if (!corriendo && estado) {
                corriendo = true;
                ultimoTiempo = performance.now();
                window.requestAnimationFrame(cuadro);
            }
        }

        function montar(animarEntrada) {
            const nuevo = construir();
            if (!animarEntrada) {
                nuevo.gotas.forEach(function (g) { g.entrada = 1; });
                goteo.classList.add("sin-animar");
            }
            if (estado) {
                goteo.replaceChild(nuevo.svg, estado.svg);
            } else {
                goteo.appendChild(nuevo.svg);
            }
            estado = nuevo;
        }

        // Se arma cuando el contenedor ya está en el DOM (para medir)
        window.requestAnimationFrame(function () {
            montar(true);
            arrancar();
        });

        window.addEventListener("scroll", arrancar, { passive: true });
        document.addEventListener("visibilitychange", arrancar);

        let anchoActual = 0;
        let espera = null;

        window.addEventListener("resize", function () {
            clearTimeout(espera);
            espera = setTimeout(function () {
                if (!estado) return;
                const nuevoAncho = hero.clientWidth;
                if (Math.abs(nuevoAncho - (anchoActual || estado.ancho)) < 40 &&
                    Math.abs(hero.offsetHeight - goteo.offsetTop - estado.alto) < 60) {
                    return;
                }
                anchoActual = nuevoAncho;
                montar(false);
                arrancar();
            }, 200);
        });

        return goteo;
    }


    /* ===========================
       HERO: PREPARAR
    =========================== */

    function prepararHero(hero) {

        // Envuelve el contenido existente para moverlo con parallax
        const capa = document.createElement("div");
        capa.className = "hero-capa";

        while (hero.firstChild) {
            capa.appendChild(hero.firstChild);
        }

        hero.appendChild(capa);
        hero.appendChild(crearChocolateVivo(hero));

        // Botón para bajar a la siguiente sección
        const destino =
            document.querySelector(".contenido") ||
            document.querySelector(".catalogo");

        if (destino) {

            const bajar = document.createElement("button");
            bajar.type = "button";
            bajar.className = "hero-bajar";
            bajar.setAttribute("aria-label", "Ver productos");
            bajar.innerHTML =
                '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

            bajar.addEventListener("click", function () {

                const navbar = document.querySelector(".navbar");
                const altoNavbar = navbar ? navbar.offsetHeight : 0;

                window.scrollTo({
                    top: destino.getBoundingClientRect().top + window.scrollY - altoNavbar,
                    behavior: TRANQUILO ? "auto" : "smooth"
                });
            });

            hero.appendChild(bajar);
        }

        return capa;
    }


    /* ===========================
       PARALLAX DEL TÍTULO (solo versión completa)
    =========================== */

    function activarParallax(hero, capa) {

        let pendiente = false;

        function actualizar() {

            pendiente = false;

            const alto = hero.offsetHeight || window.innerHeight;
            const scroll = Math.min(window.scrollY, alto);

            capa.style.transform =
                `translate3d(0, ${n(scroll * 0.35)}px, 0)`;

            capa.style.opacity =
                Math.max(0, 1 - scroll / (alto * 0.75)).toFixed(3);
        }

        window.addEventListener("scroll", function () {
            if (!pendiente) {
                pendiente = true;
                window.requestAnimationFrame(actualizar);
            }
        }, { passive: true });

        actualizar();
    }


    /* ===========================
       LLUVIA DULCE AL SCROLLEAR
       Cada tantos píxeles scrolleados nace un dulce arriba de
       la pantalla y cae con gravedad, balanceo y giro.
    =========================== */

    function activarLluviaDulce() {

        const config = TRANQUILO
            ? {
                maximo: CELULAR ? 6 : 10,
                cadaPx: CELULAR ? 260 : 220,
                rafagaInicial: 2,
                tam: CELULAR ? [26, 38] : [32, 48],
                velocidad: [35, 60],
                gravedad: 25,
                velocidadMax: 110,
                vaiven: [0, 6],
                giro: [-15, 15]
            }
            : {
                maximo: CELULAR ? 18 : 34,
                cadaPx: CELULAR ? 70 : 55,
                rafagaInicial: CELULAR ? 5 : 8,
                tam: CELULAR ? [30, 48] : [34, 62],
                velocidad: [80, 170],
                gravedad: 340,
                velocidadMax: 620,
                vaiven: [8, 30],
                giro: [-160, 160]
            };

        // Proporción de cada tipo (las donas son las protagonistas)
        const tipos = [
            "dona0", "dona1", "dona0", "dona1",
            "frutilla", "frutilla", "frutilla",
            "arandano", "arandano",
            "gota", "gota",
            "corazon", "corazon",
            "trozo"
        ];

        const capa = document.createElement("div");
        capa.className = "capa-dulces";
        capa.setAttribute("aria-hidden", "true");
        document.body.appendChild(capa);

        const activos = [];
        let ultimoScroll = window.scrollY;
        let acumulado = 0;
        let primeraVez = true;
        let animando = false;
        let ultimoTiempo = 0;

        function crearDulce() {

            if (activos.length >= config.maximo) {
                return;
            }

            const tipo = tipos[Math.floor(Math.random() * tipos.length)];
            let tam = azar(config.tam[0], config.tam[1]);
            if (tipo === "dona0" || tipo === "dona1") tam *= 1.15;
            if (tipo === "arandano") tam *= 0.6;
            if (tipo === "trozo" || tipo === "corazon") tam *= 0.75;

            const el = document.createElement("span");
            el.className = "dulce dulce-" + tipo;
            el.innerHTML = FORMAS[tipo];
            el.style.width = `${n(tam)}px`;
            el.style.height = `${n(tam)}px`;

            capa.appendChild(el);

            activos.push({
                el: el,
                x: azar(0.03, 0.97) * window.innerWidth - tam / 2,
                y: -tam - azar(0, 80),
                vy: azar(config.velocidad[0], config.velocidad[1]),
                tam: tam,
                giro: azar(0, 360),
                vgiro: azar(config.giro[0], config.giro[1]),
                vaiven: azar(config.vaiven[0], config.vaiven[1]),
                frecuencia: azar(1.2, 2.6),
                fase: azar(0, Math.PI * 2),
                t: 0
            });
        }

        function cuadro(tiempo) {

            const dt = Math.min(0.05, (tiempo - ultimoTiempo) / 1000 || 0.016);
            ultimoTiempo = tiempo;

            const altoVentana = window.innerHeight;

            for (let i = activos.length - 1; i >= 0; i--) {

                const d = activos[i];

                d.t += dt;
                d.vy = Math.min(config.velocidadMax, d.vy + config.gravedad * dt);
                d.y += d.vy * dt;
                d.giro += d.vgiro * dt;

                const x = d.x + Math.sin(d.t * d.frecuencia + d.fase) * d.vaiven;

                d.el.style.transform =
                    `translate3d(${n(x)}px, ${n(d.y)}px, 0) rotate(${n(d.giro)}deg)`;

                if (d.y > altoVentana + 40) {
                    d.el.remove();
                    activos.splice(i, 1);
                }
            }

            if (activos.length) {
                window.requestAnimationFrame(cuadro);
            } else {
                animando = false;
            }
        }

        function arrancar() {
            if (!animando && activos.length) {
                animando = true;
                ultimoTiempo = performance.now();
                window.requestAnimationFrame(cuadro);
            }
        }

        window.addEventListener("scroll", function () {

            const scroll = window.scrollY;
            const delta = Math.abs(scroll - ultimoScroll);
            ultimoScroll = scroll;

            if (primeraVez && delta > 0) {
                primeraVez = false;
                for (let i = 0; i < config.rafagaInicial; i++) {
                    crearDulce();
                }
            }

            acumulado += delta;

            while (acumulado >= config.cadaPx) {
                acumulado -= config.cadaPx;
                crearDulce();
            }

            arrancar();

        }, { passive: true });
    }


    /* ===========================
       APARICIÓN AL ENTRAR EN PANTALLA
    =========================== */

    const SELECTORES_REVELAR = [
        ".contenido .categoria",
        ".catalogo-encabezado",
        ".tarjeta-catalogo",
        ".footer-columna",
        ".footer-info",
        ".paso-compra",
        ".beneficio"
    ].join(",");

    let observador = null;

    function marcarParaRevelar() {

        document.querySelectorAll(SELECTORES_REVELAR).forEach(function (elemento) {

            if (elemento.dataset.revelado) {
                return;
            }

            elemento.dataset.revelado = "1";

            const posicion = elemento.parentElement
                ? Array.prototype.indexOf.call(elemento.parentElement.children, elemento)
                : 0;

            elemento.style.setProperty(
                "--retraso",
                `${Math.min(posicion * 0.12, 0.48).toFixed(2)}s`
            );

            elemento.classList.add("revelar");

            observador.observe(elemento);
        });
    }

    function activarRevelado() {

        if (!("IntersectionObserver" in window)) {
            return;
        }

        observador = new IntersectionObserver(function (entradas) {

            entradas.forEach(function (entrada) {

                if (!entrada.isIntersecting) {
                    return;
                }

                const elemento = entrada.target;

                elemento.classList.add("visible");
                observador.unobserve(elemento);

                // Al terminar se quitan las clases para recuperar
                // las transiciones propias (hover de tarjetas, etc.)
                setTimeout(function () {
                    elemento.classList.remove("revelar", "visible");
                    elemento.style.removeProperty("--retraso");
                }, 1400);
            });

        }, {
            rootMargin: "0px 0px -8% 0px",
            threshold: 0.12
        });

        marcarParaRevelar();

        // El navbar y el footer llegan después (componentes.js)
        if ("MutationObserver" in window) {

            let espera = null;

            const mutaciones = new MutationObserver(function () {
                clearTimeout(espera);
                espera = setTimeout(marcarParaRevelar, 60);
            });

            mutaciones.observe(document.body, { childList: true, subtree: true });

            setTimeout(function () {
                mutaciones.disconnect();
            }, 8000);
        }
    }


    /* ===========================
       INICIO
    =========================== */

    function iniciar() {

        const hero = document.querySelector(".hero");

        if (hero) {

            const capa = prepararHero(hero);

            if (!TRANQUILO) {
                activarParallax(hero, capa);
            }
        }

        activarLluviaDulce();
        activarRevelado();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

})();
