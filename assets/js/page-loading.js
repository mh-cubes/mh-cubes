/* =========================================
   MH CUBES — SINGLE PAGE LOADING SYSTEM
========================================= */

const loadingScreen = document.getElementById("page-loading");
const loadingText = document.querySelector("#page-loading p");
const loadingTitle = document.querySelector("#page-loading h2");


/* =========================================
   PAGE INFORMATION
========================================= */

function getPageLoadingInfo(page) {

    page = page.toLowerCase();

    /* MY ACCOUNT */

    if (page === "customer-account.html") {
        return {
            title: "MY ACCOUNT",
            message: "Opening your account..."
        };
    }


    /* MY ORDERS */

    if (
        page === "my-orders.html" ||
        page === "orders.html"
    ) {
        return {
            title: "MY ORDERS",
            message: "Fetching your orders..."
        };
    }


    /* TRACK ORDER */

    if (page === "track-order.html") {
        return {
            title: "TRACK ORDER",
            message: "Finding your order..."
        };
    }


    /* SETTINGS */

    if (page === "settings.html") {
        return {
            title: "SETTINGS",
            message: "Opening settings..."
        };
    }


    /* CART */

    if (page === "cart.html") {
        return {
            title: "YOUR CART",
            message: "Loading your cart..."
        };
    }


    /* CHECKOUT */

    if (page === "checkout.html") {
        return {
            title: "CHECKOUT",
            message: "Preparing checkout..."
        };
    }


    /* CUSTOMER LOGIN */

    if (page === "customer-login.html") {
        return {
            title: "SIGN IN",
            message: "Opening sign in..."
        };
    }


    /* HOMEPAGE */

    if (
        page === "index.html" ||
        page === ""
    ) {
        return {
            title: "MH CUBES",
            message: "Loading..."
        };
    }


    /* DEFAULT */

    return {
        title: "MH CUBES",
        message: "Loading page..."
    };

}


/* =========================================
   SET LOADING TEXT
========================================= */

function setLoadingText(title, message) {

    if (loadingTitle) {
        loadingTitle.textContent = title;
    }

    if (loadingText) {
        loadingText.textContent = message;
    }

}


/* =========================================
   HIDE LOADING SCREEN
========================================= */

function hidePageLoading() {

    if (!loadingScreen) return;

    loadingScreen.classList.add("hide");

}


/* =========================================
   INITIAL PAGE LOAD
========================================= */

window.addEventListener("load", function () {

    if (!loadingScreen) return;


    const page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const info =
        getPageLoadingInfo(page);


    setLoadingText(
        info.title,
        info.message
    );


    /*
       Hide the loader after
       the page has completely loaded.
    */

    setTimeout(function () {

        hidePageLoading();

    }, 1200);

});


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


    /* =====================================
       IGNORE SPECIAL LINKS
    ===================================== */

    if (
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.target === "_blank"
    ) {
        return;
    }


    /* =====================================
       IGNORE EXTERNAL WEBSITES
    ===================================== */

    if (
        link.hostname &&
        link.hostname !==
        window.location.hostname
    ) {
        return;
    }


    /* =====================================
       IGNORE SAME PAGE
    ===================================== */

    if (
        link.href ===
        window.location.href
    ) {
        return;
    }


    /* =====================================
       DESTINATION PAGE
    ===================================== */

    const destination =
        new URL(
            link.href,
            window.location.href
        );


    const page =
        destination.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const info =
        getPageLoadingInfo(page);


    /* =====================================
       SHOW LOADER
    ===================================== */

    if (loadingScreen) {

        setLoadingText(
            info.title,
            info.message
        );


        loadingScreen.classList.remove("hide");

    }


    /* =====================================
       NAVIGATE IMMEDIATELY
    ===================================== */

    event.preventDefault();


    window.location.href =
        link.href;

});


/* =========================================
   BACK / FORWARD FIX
========================================= */

window.addEventListener("pageshow", function (event) {

    if (!loadingScreen) return;


    /* Browser back/forward cache */

    if (event.persisted) {

        hidePageLoading();

    }


    /* Normal back/forward navigation */

    const navigation =
        performance.getEntriesByType(
            "navigation"
        )[0];


    if (
        navigation &&
        navigation.type === "back_forward"
    ) {

        hidePageLoading();

    }

});
