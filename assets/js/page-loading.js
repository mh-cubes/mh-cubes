const loadingScreen = document.getElementById("page-loading");


// =========================================
// HIDE LOADING SCREEN WHEN PAGE IS READY
// =========================================

window.addEventListener("load", function () {

    setTimeout(function () {

        if (loadingScreen) {
            loadingScreen.classList.add("hide");
        }

    }, 700);

});


// =========================================
// SHOW LOADING WHEN CLICKING A PAGE LINK
// =========================================

document.addEventListener("click", function (event) {

    const link = event.target.closest("a");

    if (!link || !loadingScreen) {
        return;
    }

    const href = link.getAttribute("href");

    if (!href) {
        return;
    }


    // Ignore special links

    if (
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.target === "_blank"
    ) {
        return;
    }


    // Ignore external websites

    if (
        link.hostname &&
        link.hostname !== window.location.hostname
    ) {
        return;
    }


    // Ignore same page

    if (
        href === window.location.pathname ||
        href === window.location.href
    ) {
        return;
    }


    event.preventDefault();


    // Show loading screen

    loadingScreen.classList.remove("hide");


    // Save that navigation is happening

    sessionStorage.setItem(
        "pageNavigating",
        "true"
    );


    // Navigate after 2.5 seconds

    setTimeout(function () {

        window.location.href = href;

    }, 2500);

});


// =========================================
// FIX BROWSER BACK / FORWARD BUTTON
// =========================================

window.addEventListener("pageshow", function (event) {

    /*
       pageshow also fires when the browser
       restores a page from its back/forward cache.
    */

    if (loadingScreen) {

        loadingScreen.classList.add("hide");

    }


    sessionStorage.removeItem(
        "pageNavigating"
    );

});


// =========================================
// EXTRA BACK BUTTON SAFETY
// =========================================

window.addEventListener("popstate", function () {

    if (loadingScreen) {

        loadingScreen.classList.add("hide");

    }

});
