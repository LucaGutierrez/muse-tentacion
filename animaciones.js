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
       CHOCOLATE DERRETIDO VIVO (técnica "gooey")
       Una capa gruesa de chocolate pegada al navbar (empieza
       detrás de él, así nunca queda hueco) con borde ondulado,
       de la que nacen gotas orgánicas: base ancha que se funde
       con la capa, cuello fino y bulbo redondeado en la punta.
       Las formas simples (rect + elipses + círculos) se funden
       en una sola masa líquida con un filtro blur + umbral.
       Las gotas respiran, se estiran con el scroll (sin tapar
       nunca el título) y se desprenden, caen y salpican.
    =========================== */

    const CONFIG_CHOCO = TRANQUILO
        ? {
            banda: CELULAR ? 34 : 48,          // chocolate visible debajo del navbar
            densidad: CELULAR ? 0.55 : 0.6,    // menos gotas
            ciclo: [10, 16],
            respiracion: 0.1,
            scroll: 0.35,
            gravedad: 600,
            entrada: 1,
            fps: 24,
            sombra: false
        }
        : {
            banda: CELULAR ? 36 : 52,
            densidad: 1,
            ciclo: [3.5, 7.5],
            respiracion: 0.22,
            scroll: 0.75,
            gravedad: 1500,
            entrada: 2,
            fps: CELULAR ? 30 : 40,
            sombra: !CELULAR
        };

    function suavizar(t) {
        t = Math.max(0, Math.min(1, t));
        return t * t * (3 - 2 * t);
    }

    function suavizarSalida(t) {
        const c1 = 1.3;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    function caminoLagrima(r) {
        return (
            `M0 ${n(-r * 1.7)}` +
            `C${n(r * 0.35)} ${n(-r * 1.15)} ${n(r)} ${n(-r * 0.55)} ${n(r)} 0` +
            `A${n(r)} ${n(r)} 0 0 1 ${n(-r)} 0` +
            `C${n(-r)} ${n(-r * 0.55)} ${n(-r * 0.35)} ${n(-r * 1.15)} 0 ${n(-r * 1.7)}Z`
        );
    }

    function crearChocolateVivo(hero) {

        const goteo = document.createElement("div");
        goteo.className = "hero-goteo";
        goteo.setAttribute("aria-hidden", "true");

        let estado = null;
        let corriendo = false;
        let ultimoTiempo = 0;
        let acumuladoCuadro = 0;
        let tiempoTotal = 0;

        function altoNavbarHero() {
            const valor = parseFloat(
                getComputedStyle(document.documentElement).getPropertyValue("--alto-navbar-hero")
            );
            return isNaN(valor) ? 80 : valor;
        }

        // ---------- Construcción ----------
        function construir() {

            const ancho = hero.clientWidth || window.innerWidth;
            const altoHero = hero.offsetHeight;
            const raiz = altoNavbarHero() + CONFIG_CHOCO.banda;   // borde inferior de la capa
            const altoGoo = Math.min(altoHero, raiz + (CELULAR ? 300 : 380));
            const piso = altoHero - 70;

            const svg = crearSvg("svg", {
                viewBox: `0 0 ${n(ancho)} ${n(altoHero)}`,
                width: n(ancho),
                height: n(altoHero),
                "aria-hidden": "true",
                focusable: "false"
            });

            const defs = crearSvg("defs", {});
            const sombra = CONFIG_CHOCO.sombra
                ? `<feGaussianBlur in="goo" stdDeviation="5" result="sb"/>
                   <feOffset in="sb" dy="7" result="so"/>
                   <feFlood flood-color="#2a0f06" flood-opacity=".32"/>
                   <feComposite in2="so" operator="in" result="sombra"/>
                   <feMerge><feMergeNode in="sombra"/><feMergeNode in="goo"/></feMerge>`
                : "";

            defs.innerHTML = `
                <linearGradient id="chocoLeche" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${n(altoGoo)}">
                    <stop offset="0" stop-color="#4a1f12"/>
                    <stop offset="${n((raiz - CONFIG_CHOCO.banda) / altoGoo * 100) / 100}" stop-color="#7a3a22"/>
                    <stop offset="${n(raiz / altoGoo * 100) / 100}" stop-color="#6a2f1b"/>
                    <stop offset="1" stop-color="#4a1f12"/>
                </linearGradient>
                <linearGradient id="chocoReflejoCapa" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
                    <stop offset=".5" stop-color="#fff" stop-opacity=".42"/>
                    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
                </linearGradient>
                <filter id="chocoGoo" filterUnits="userSpaceOnUse" x="0" y="0" width="${n(ancho)}" height="${n(altoGoo)}" color-interpolation-filters="sRGB">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="${CELULAR ? 7 : 10}" result="b"/>
                    <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" result="goo"/>
                    ${sombra}
                </filter>`;
            svg.appendChild(defs);

            const masa = crearSvg("g", { filter: "url(#chocoGoo)", fill: "url(#chocoLeche)" });

            // Capa superior (empieza detrás del navbar: nunca queda hueco)
            masa.appendChild(crearSvg("rect", { x: -20, y: -20, width: n(ancho + 40), height: n(raiz + 20) }));

            // Borde inferior ondulado e irregular
            let xb = -40;
            while (xb < ancho + 40) {
                const rx = azar(CELULAR ? 30 : 45, CELULAR ? 70 : 120);
                masa.appendChild(crearSvg("ellipse", {
                    cx: n(xb + rx),
                    cy: n(raiz - azar(2, 6)),
                    rx: n(rx),
                    ry: n(azar(8, CELULAR ? 16 : 22))
                }));
                xb += rx * azar(1.2, 1.9);
            }

            // Gotas repartidas de forma pareja: una por "casillero" con
            // posición semi-aleatoria dentro (así nunca se amontonan).
            // En escritorio, a veces una gemela pegada.
            const gotas = [];
            const separacion = (CELULAR ? 58 : 92) / CONFIG_CHOCO.densidad;
            const casilleros = Math.max(4, Math.round(ancho / separacion));
            const paso = ancho / casilleros;

            for (let i = 0; i < casilleros; i++) {

                const tipo = Math.random();
                const w = azar(CELULAR ? 16 : 22, CELULAR ? 32 : 62);
                const largo = tipo < 0.25
                    ? azar(6, 18)                                       // apenas un bulto
                    : tipo < 0.6
                        ? azar(CELULAR ? 30 : 40, CELULAR ? 70 : 100)   // medianas
                        : azar(CELULAR ? 70 : 100, CELULAR ? 150 : 230); // largas

                const x = paso * (i + 0.5) + azar(-paso * 0.22, paso * 0.22);

                agregarGota(x, w, largo);

                if (!CELULAR && Math.random() < 0.2) {
                    const w2 = w * azar(0.55, 0.85);
                    agregarGota(x + (w + w2) * 0.42, w2, largo * azar(0.35, 0.7));
                }
            }

            function agregarGota(gx, w, largo) {

                const base = crearSvg("ellipse", {});
                const cuello = crearSvg("ellipse", {});
                const bulbo = crearSvg("circle", {});

                masa.appendChild(base);
                masa.appendChild(cuello);
                masa.appendChild(bulbo);

                gotas.push({
                    x: gx,
                    w: w,
                    largo: largo,
                    gotea: largo > 30,
                    amplitud: w * CONFIG_CHOCO.respiracion * azar(0.6, 1.4),
                    periodo: azar(2.6, 5.5) * (TRANQUILO ? 1.8 : 1),
                    fase: azar(0, Math.PI * 2),
                    ondula: azar(0.5, 2),
                    factorScroll: largo > 30 ? azar(0.3, 1.2) : azar(0.05, 0.2),
                    estiramiento: 0,
                    progreso: azar(0, 0.6),
                    duracionCiclo: azar(CONFIG_CHOCO.ciclo[0], CONFIG_CHOCO.ciclo[1]),
                    rebote: 0,
                    velocidadRebote: 0,
                    demora: azar(0.1, TRANQUILO ? 0.4 : 1.1),
                    entrada: 0,
                    base: base,
                    cuello: cuello,
                    bulbo: bulbo
                });
            }

            // Brillos (sin filtro, encima de la masa)
            const brillos = crearSvg("g", { fill: "none", stroke: "#fff", "stroke-linecap": "round" });

            // Reflejos de la capa: 2-3 curvas suaves y anchas que se
            // desvanecen en las puntas (degradé de opacidad)
            const cantidadReflejos = CELULAR ? 2 : 3;
            for (let i = 0; i < cantidadReflejos; i++) {
                const largoR = ancho * azar(CELULAR ? 0.28 : 0.16, CELULAR ? 0.38 : 0.24);
                const x0 = (ancho / cantidadReflejos) * (i + azar(0.1, 0.9)) - largoR / 2;
                const y0 = raiz - CONFIG_CHOCO.banda * azar(0.45, 0.62);
                const curva = azar(8, 14);
                const grosor = CELULAR ? 7 : 11;
                brillos.appendChild(crearSvg("path", {
                    d: `M${n(x0)} ${n(y0)}Q${n(x0 + largoR / 2)} ${n(y0 - curva)} ${n(x0 + largoR)} ${n(y0)}` +
                       `Q${n(x0 + largoR / 2)} ${n(y0 - curva + grosor)} ${n(x0)} ${n(y0)}Z`,
                    fill: "url(#chocoReflejoCapa)",
                    stroke: "none"
                }));
            }

            gotas.forEach(function (g) {
                g.reflejo = crearSvg("path", { "stroke-opacity": ".5", "stroke-width": n(Math.max(1.6, g.w * 0.07)) });
                g.punto = crearSvg("circle", { fill: "#fff", stroke: "none", "fill-opacity": ".75" });
                brillos.appendChild(g.reflejo);
                if (!CELULAR) {
                    brillos.appendChild(g.punto);
                }
            });

            const libres = crearSvg("g", {});     // gotas que ya salieron del área del filtro

            svg.appendChild(masa);
            svg.appendChild(brillos);
            svg.appendChild(libres);

            return {
                svg: svg, ancho: ancho, raiz: raiz, altoGoo: altoGoo, piso: piso,
                masa: masa, libres: libres, gotas: gotas,
                cayendo: [], salpicaduras: []
            };
        }

        // Zona del título: las gotas que pasan por arriba de él
        // nunca llegan a taparlo; las de los costados pueden bajar más.
        function zonaTitulo() {
            const titulo = hero.querySelector("h1");
            const libre = estado.altoGoo - 40;
            if (!titulo) {
                return { izq: 0, der: 0, arriba: libre, libre: libre };
            }
            const r = titulo.getBoundingClientRect();
            const h = goteo.getBoundingClientRect();   // coordenadas del SVG
            const margen = CELULAR ? 16 : 40;
            return {
                izq: r.left - h.left - margen,
                der: r.right - h.left + margen,
                arriba: Math.min(libre, r.top - h.top - 18),
                libre: libre
            };
        }

        // ---------- Gotas que se desprenden ----------
        function desprender(x, y, r) {
            // Elipse + colita: dentro del filtro se ven como una lágrima líquida
            const cuerpo = crearSvg("ellipse", { cx: n(x), cy: n(y), rx: n(r), ry: n(r * 1.15) });
            const cola = crearSvg("circle", { cx: n(x), cy: n(y - r), r: n(r * 0.5) });
            estado.masa.appendChild(cuerpo);
            estado.masa.appendChild(cola);
            estado.cayendo.push({ el: cuerpo, cola: cola, x: x, y: y, r: r, vy: 20, enGoo: true });
        }

        function pasarAFuera(c) {
            // Sale del área del filtro: se convierte en una lágrima nítida
            c.el.remove();
            c.cola.remove();
            const grupo = crearSvg("g", {});
            grupo.appendChild(crearSvg("path", { d: caminoLagrima(c.r * 0.85), fill: "url(#chocoLeche)" }));
            grupo.appendChild(crearSvg("path", {
                d: `M${n(-c.r * 0.42)} ${n(-c.r * 0.7)}Q${n(-c.r * 0.6)} ${n(-c.r * 0.1)} ${n(-c.r * 0.35)} ${n(c.r * 0.35)}`,
                fill: "none", stroke: "#fff", "stroke-opacity": ".55",
                "stroke-width": n(Math.max(1.4, c.r * 0.14)), "stroke-linecap": "round"
            }));
            estado.libres.appendChild(grupo);
            c.el = grupo;
            c.enGoo = false;
        }

        function salpicar(x, y, r) {
            // Coronita sutil de 3-4 gotitas que se abre y se desvanece
            const grupo = crearSvg("g", { fill: "#6a2f1b" });
            const cantidad = 3 + Math.round(Math.random());
            for (let i = 0; i < cantidad; i++) {
                const a = Math.PI * (0.15 + 0.7 * (i + 0.5) / cantidad);
                grupo.appendChild(crearSvg("circle", {
                    cx: n(-Math.cos(a) * r * 1.3),
                    cy: n(-Math.sin(a) * r * 1.4),
                    r: n(Math.max(1.2, r * 0.12))
                }));
            }
            estado.libres.appendChild(grupo);
            estado.salpicaduras.push({ el: grupo, x: x, y: y, t: 0 });
        }

        // ---------- Animación ----------
        function cuadro(tiempo) {

            const dtReal = Math.min(0.1, (tiempo - ultimoTiempo) / 1000 || 0.016);
            ultimoTiempo = tiempo;

            const scroll = Math.max(0, window.scrollY);
            const altoHero = hero.offsetHeight;
            const visible = scroll < altoHero && !document.hidden;

            if (!visible) {
                corriendo = false;
                return;
            }

            window.requestAnimationFrame(cuadro);

            // Limita los cuadros por segundo (el filtro es lo que cuesta)
            acumuladoCuadro += dtReal;
            if (acumuladoCuadro < 1 / CONFIG_CHOCO.fps) {
                return;
            }
            const dt = Math.min(0.1, acumuladoCuadro);
            acumuladoCuadro = 0;
            tiempoTotal += dt;

            const raiz = estado.raiz;

            // El chocolate baja con vos (mismo parallax que el título)
            goteo.style.transform = TRANQUILO
                ? ""
                : `translate3d(0, ${n(Math.min(scroll, altoHero) * 0.35)}px, 0)`;

            const zona = zonaTitulo();
            const empuje = Math.min(scroll, altoHero) * CONFIG_CHOCO.scroll;
            const apuro = 1 + Math.min(scroll, altoHero) / (TRANQUILO ? 900 : 320);

            estado.gotas.forEach(function (g) {

                if (tiempoTotal > g.demora && g.entrada < 1) {
                    g.entrada = Math.min(1, g.entrada + dt / CONFIG_CHOCO.entrada);
                }
                const aparicion = g.entrada < 1 ? Math.max(0, suavizarSalida(g.entrada)) : 1;

                // Estiramiento por scroll, suave y con retroceso
                const objetivo = empuje * g.factorScroll;
                g.estiramiento += (objetivo - g.estiramiento) * Math.min(1, dt * 3);

                // Ciclo: el bulbo engorda y baja, el cuello se afina, se suelta
                let p = 0;
                // Las gotas que están sobre el título no se sueltan
                // (así nada cae por encima del texto)
                const sobreTitulo = g.x + g.w > zona.izq && g.x - g.w < zona.der;

                if (g.gotea && g.entrada >= 1 && !sobreTitulo) {
                    g.progreso += (dt / g.duracionCiclo) * apuro;
                    p = Math.min(1, g.progreso);
                } else if (g.progreso > 0) {
                    g.progreso = Math.max(0, g.progreso - dt * 0.25);
                    p = Math.min(1, g.progreso);
                }

                g.velocidadRebote += (-g.rebote * 55 - g.velocidadRebote * 6.5) * dt;
                g.rebote += g.velocidadRebote * dt;

                const respira = g.amplitud * Math.sin((tiempoTotal / g.periodo) * Math.PI * 2 + g.fase);
                const formando = suavizar(p / 0.12);
                const radioBulbo = g.w * (0.3 + 0.12 * formando + 0.16 * suavizar(p));

                let largo = (g.largo + respira + g.estiramiento + g.w * 1.3 * p * p) * aparicion + g.rebote;

                // Nunca sobre el título
                const limite = sobreTitulo ? zona.arriba : zona.libre;
                const maximo = limite - raiz - radioBulbo * 1.2;
                largo = Math.max(4, Math.min(largo, Math.max(8, maximo)));

                const ondula = Math.sin(tiempoTotal * 0.9 + g.fase) * g.ondula;
                const yPunta = raiz + largo;

                // Base ancha (menisco), cuello que se afina y bulbo
                g.base.setAttribute("cx", n(g.x));
                g.base.setAttribute("cy", n(raiz + Math.min(largo, g.w) * 0.25));
                g.base.setAttribute("rx", n(g.w * 0.55));
                g.base.setAttribute("ry", n(Math.min(largo, g.w) * 0.55 + 6));

                // Cuello: nunca tan fino como para que el filtro lo borre,
                // salvo justo antes de soltar la gota
                const afinar = suavizar((p - 0.6) / 0.4);
                const anchoCuello = Math.max(CELULAR ? 8 : 10, g.w * 0.42) * (1 - 0.6 * afinar);
                g.cuello.setAttribute("cx", n(g.x + ondula * 0.5));
                g.cuello.setAttribute("cy", n(raiz + largo * 0.5));
                g.cuello.setAttribute("rx", n(anchoCuello));
                g.cuello.setAttribute("ry", n(largo * 0.5 + 2));

                g.bulbo.setAttribute("cx", n(g.x + ondula));
                g.bulbo.setAttribute("cy", n(yPunta));
                g.bulbo.setAttribute("r", n(radioBulbo * Math.min(1, aparicion + 0.3)));

                // Brillo especular fino y alargado + punto en la punta
                if (largo > 60 && anchoCuello >= 9) {
                    const xr = g.x - anchoCuello * 0.3;
                    g.reflejo.setAttribute(
                        "d",
                        `M${n(xr)} ${n(raiz + g.w * 0.45)}Q${n(xr - g.w * 0.03)} ${n(raiz + largo * 0.55)} ${n(g.x - radioBulbo * 0.5 + ondula)} ${n(yPunta - radioBulbo * 0.15)}`
                    );
                    g.reflejo.setAttribute("stroke-opacity", ".45");
                } else {
                    g.reflejo.setAttribute("stroke-opacity", "0");
                }

                g.punto.setAttribute("cx", n(g.x + ondula - radioBulbo * 0.38));
                g.punto.setAttribute("cy", n(yPunta - radioBulbo * 0.1));
                g.punto.setAttribute("r", largo > 20 ? n(Math.max(1.2, radioBulbo * 0.13)) : 0);

                // Se desprende: un círculo sigue bajando y el filtro hace el cuello
                if (g.gotea && g.progreso >= 1) {
                    desprender(g.x + ondula, yPunta + radioBulbo * 0.3, radioBulbo * 0.95);
                    g.progreso = 0;
                    g.duracionCiclo = azar(CONFIG_CHOCO.ciclo[0], CONFIG_CHOCO.ciclo[1]);
                    g.rebote = -g.w * 0.45;
                    g.velocidadRebote = 0;
                }
            });

            // Gotas cayendo
            for (let i = estado.cayendo.length - 1; i >= 0; i--) {

                const c = estado.cayendo[i];
                c.vy += CONFIG_CHOCO.gravedad * dt;
                c.y += c.vy * dt;

                if (c.enGoo) {
                    c.el.setAttribute("cy", n(c.y));
                    c.el.setAttribute("ry", n(c.r * (1.15 + Math.min(c.vy / 2500, 0.3))));
                    c.cola.setAttribute("cy", n(c.y - c.r * (1.05 + Math.min(c.vy / 1500, 0.5))));
                    if (c.y > estado.altoGoo - c.r * 2.5) {
                        pasarAFuera(c);
                    }
                }

                if (!c.enGoo) {
                    const estirar = 1 + Math.min(c.vy / 2200, 0.35);
                    c.el.setAttribute(
                        "transform",
                        `translate(${n(c.x)} ${n(c.y)}) scale(${n(100 / Math.sqrt(estirar)) / 100} ${n(estirar * 100) / 100})`
                    );
                }

                if (c.y + c.r >= estado.piso) {
                    c.el.remove();
                    if (c.cola) c.cola.remove();
                    estado.cayendo.splice(i, 1);
                    salpicar(c.x, estado.piso, c.r);
                }
            }

            // Salpicaduras
            for (let i = estado.salpicaduras.length - 1; i >= 0; i--) {
                const s = estado.salpicaduras[i];
                s.t += dt / 0.35;
                if (s.t >= 1) {
                    s.el.remove();
                    estado.salpicaduras.splice(i, 1);
                    continue;
                }
                const k = 0.4 + 0.6 * suavizar(s.t * 1.6);
                s.el.setAttribute("transform", `translate(${n(s.x)} ${n(s.y)}) scale(${n(k * 100) / 100})`);
                s.el.setAttribute("opacity", n((1 - s.t) * 100) / 100);
            }
        }

        function arrancar() {
            if (!corriendo && estado) {
                corriendo = true;
                ultimoTiempo = performance.now();
                window.requestAnimationFrame(cuadro);
            }
        }

        function montar(conEntrada) {
            const nuevo = construir();
            if (!conEntrada) {
                nuevo.gotas.forEach(function (g) { g.entrada = 1; });
            }
            if (estado) {
                goteo.replaceChild(nuevo.svg, estado.svg);
            } else {
                goteo.appendChild(nuevo.svg);
            }
            estado = nuevo;
        }

        window.requestAnimationFrame(function () {
            montar(true);
            arrancar();
        });

        window.addEventListener("scroll", arrancar, { passive: true });
        document.addEventListener("visibilitychange", arrancar);

        let espera = null;
        window.addEventListener("resize", function () {
            clearTimeout(espera);
            espera = setTimeout(function () {
                if (!estado) return;
                if (Math.abs(hero.clientWidth - estado.ancho) < 40) return;
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
