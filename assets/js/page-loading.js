/* =========================================
   MH CUBES PAGE LOADING SYSTEM
========================================= */

const loadingScreen = document.getElementById("page-loading");
const loadingText = document.querySelector("#page-loading p");
const loadingTitle = document.querySelector("#page-loading h2");


/* =========================================
   HIDE LOADING SCREEN WHEN PAGE OPENS
========================================= */

window.addEventListener("pageshow", function () {

    if (loadingScreen) {

        loadingScreen.classList.add("hide");

    }

});


/* =========================================
   SHOW LOADING SCREEN
========================================= */

function showPageLoading(title, message) {

    if (!loadingScreen) return;

    if (loadingTitle) {
        loadingTitle.textContent = title;
    }

    if (loadingText) {
        loadingText.textContent = message;
    }

    loadingScreen.classList.remove("hide");

}


/* =========================================
   PAGE NAVIGATION
========================================= */

document.addEventListener("click", function (event) {

    const link = event.target.closest("a");

    if (!link) return;

    const href = link.getAttribute("href");

    if (!href) return;


    /* Ignore special links */

    if (
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.target === "_blank"
    ) {
        return;
    }


    /* Ignore external websites */

    if (
        link.hostname &&
        link.hostname !== window.location.hostname
    ) {
        return;
    }


    /* Ignore same page */

    if (
        link.href === window.location.href
    ) {
        return;
    }


    event.preventDefault();


    /* =========================================
       DIFFERENT LOADING MESSAGES
    ========================================= */

    let title = "MH CUBES";
    let message = "Loading...";


    if (href.includes("my-orders")) {

        title = "MY ORDERS";
        message = "Fetching your orders...";

    }

    else if (href.includes("track-order")) {

        title = "TRACK ORDER";
        message = "Finding your order...";

    }

    else if (href.includes("settings")) {

        title = "SETTINGS";
        message = "Opening settings...";

    }

    else if (href.includes("cart")) {

        title = "YOUR CART";
        message = "Loading your cart...";

    }

    else if (href.includes("checkout")) {

        title = "CHECKOUT";
        message = "Preparing checkout...";

    }

    else if (href.includes("index")) {

        title = "MH CUBES";
        message = "Welcome back...";

    }


    showPageLoading(title, message);


    /* Navigate after 1.5 seconds */

    setTimeout(function () {

        window.location.href = href;

    }, 1500);

});


/* =========================================
   BACK / FORWARD BUTTON FIX
========================================= */

window.addEventListener("pageshow", function (event) {

    if (event.persisted) {

        if (loadingScreen) {

            loadingScreen.classList.add("hide");

        }

    }

});
