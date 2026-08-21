/* =========================================
   MH CUBES PAGE LOADING SYSTEM
========================================= */

const loadingScreen =
    document.getElementById("page-loading");

const loadingText =
    document.querySelector("#page-loading p");

const loadingTitle =
    document.querySelector("#page-loading h2");


/* =========================================
   INITIAL PAGE LOAD
   KEEP LOADING FOR 3 SECONDS
========================================= */

window.addEventListener("load", function () {

    if (!loadingScreen) return;

    setTimeout(function () {

        loadingScreen.classList.add("hide");

    }, 3000);

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

    const link =
        event.target.closest("a");

    if (!link) return;


    const href =
        link.getAttribute("href");

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


    /*
       IMPORTANT:
       Do not run navigation loading
       when browser back/forward is being used.
    */

    event.preventDefault();


    /* =========================================
       LOADING TEXT
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

    else if (href.includes("customer-account")) {

        title = "MY ACCOUNT";

        message = "Opening your account...";

    }

    else if (href.includes("customer-login")) {

        title = "SIGN IN";

        message = "Opening your account...";

    }

    else if (href.includes("cart")) {

        title = "YOUR CART";

        message = "Loading your cart...";

    }

    else if (href.includes("checkout")) {

        title = "CHECKOUT";

        message = "Preparing checkout...";

    }

    else if (
        href === "/" ||
        href.includes("index")
    ) {

        title = "MH CUBES";

        message = "Welcome back...";

    }


    /* =========================================
       SHOW LOADING
    ========================================= */

    showPageLoading(
        title,
        message
    );


    /* =========================================
       NAVIGATE AFTER 3 SECONDS
    ========================================= */

    setTimeout(function () {

        window.location.href = href;

    }, 3000);

});


/* =========================================
   BACK / FORWARD BUTTON FIX
========================================= */

window.addEventListener(
    "pageshow",
    function (event) {

        if (!loadingScreen) return;


        /*
           If page came from browser cache,
           immediately hide the loader.
        */

        if (event.persisted) {

            loadingScreen.classList.add("hide");

        }

    }
);
