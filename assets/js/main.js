// === Common JS for Weavers Colony Youth Force ===

// 1) Auto-update year wherever #year or #yearSpan exists
(function () {
    const y1 = document.getElementById("year");
    const y2 = document.getElementById("yearSpan");
    const yearValue = new Date().getFullYear();

    if (y1) y1.textContent = yearValue;
    if (y2) y2.textContent = yearValue;
})();

// 2) WhatsApp share helper function (reusable anywhere)
function shareOnWhatsApp(text) {
    const url = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(url, "_blank");
}
