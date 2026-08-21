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
   PAGE LOADING INFORMATION
========================================= */

function getPageLoadingInfo() {

    const page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (page === "customer-account.html") {

        return {
            title: "MY ACCOUNT",
            message: "Opening your account..."
        };

    }


    if (page === "my-orders.html") {

        return {
            title: "MY ORDERS",
            message: "Fetching your orders..."
        };

    }


    if (page === "track-order.html") {

        return {
            title: "TRACK ORDER",
            message: "Finding your order..."
        };

    }


    if (page === "settings.html") {

        return {
            title: "SETTINGS",
            message: "Opening settings..."
        };

    }


    if (page === "cart.html") {

        return {
            title: "YOUR CART",
            message: "Loading your cart..."
        };

    }


    if (page === "checkout.html") {

        return {
            title: "CHECKOUT",
            message: "Preparing checkout..."
        };

    }


    if (page === "customer-login.html") {

        return {
            title: "SIGN IN",
            message: "Opening your account..."
        };

    }


    return {
        title: "MH CUBES",
        message: "Welcome back..."
    };

}


/* =========================================
   SET LOADING TEXT
========================================= */

function setLoadingText(title, message) {

    if (loadingTitle) {

        loadingTitle.textContent =
            title;

    }


    if (loadingText) {

        loadingText.textContent =
            message;

    }

}


/* =========================================
   HIDE LOADING
========================================= */

function hidePageLoading() {

    if (!loadingScreen) return;

    loadingScreen.classList.add("hide");

}


/* =========================================
   SHOW LOADING
========================================= */

function showPageLoading(title, message) {

    if (!loadingScreen) return;


    setLoadingText(
        title,
        message
    );


    loadingScreen.classList.remove("hide");

}


/* =========================================
   INITIAL PAGE LOAD
   KEEP LOADING FOR 3 SECONDS
========================================= */

window.addEventListener(
    "load",
    function () {

        if (!loadingScreen) return;


        const pageInfo =
            getPageLoadingInfo();


        setLoadingText(
            pageInfo.title,
            pageInfo.message
        );


        setTimeout(
            function () {

                hidePageLoading();

            },
            3000
        );

    }
);


/* =========================================
   PAGE NAVIGATION
========================================= */

document.addEventListener(
    "click",
    function (event) {

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
            link.hostname !==
                window.location.hostname
        ) {

            return;

        }


        /* Ignore same page */

        if (
            link.href ===
            window.location.href
        ) {

            return;

        }


        /*
           Stop normal navigation
           temporarily.
        */

        event.preventDefault();


        /* =========================================
           DETECT DESTINATION
        ========================================= */

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


        let title = "MH CUBES";

        let message = "Loading...";


        if (
            page ===
            "customer-account.html"
        ) {

            title = "MY ACCOUNT";

            message =
                "Opening your account...";

        }


        else if (
            page ===
            "my-orders.html"
        ) {

            title = "MY ORDERS";

            message =
                "Fetching your orders...";

        }


        else if (
            page ===
            "track-order.html"
        ) {

            title = "TRACK ORDER";

            message =
                "Finding your order...";

        }


        else if (
            page ===
            "settings.html"
        ) {

            title = "SETTINGS";

            message =
                "Opening settings...";

        }


        else if (
            page ===
            "cart.html"
        ) {

            title = "YOUR CART";

            message =
                "Loading your cart...";

        }


        else if (
            page ===
            "checkout.html"
        ) {

            title = "CHECKOUT";

            message =
                "Preparing checkout...";

        }


        else if (
            page ===
            "customer-login.html"
        ) {

            title = "SIGN IN";

            message =
                "Opening your account...";

        }


        else if (
            page ===
            "" ||
            page ===
            "index.html"
        ) {

            title = "MH CUBES";

            message =
                "Welcome back...";

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

        setTimeout(
            function () {

                window.location.href =
                    link.href;

            },
            3000
        );

    }
);


/* =========================================
   BACK / FORWARD BUTTON FIX
========================================= */

window.addEventListener(
    "pageshow",
    function (event) {

        if (!loadingScreen) return;


        /*
           Browser restored this page
           from history/cache.
        */

        if (event.persisted) {

            hidePageLoading();

            return;

        }


        /*
           If page was opened through
           browser history, don't leave
           an old loader visible.
        */

        if (
            performance.getEntriesByType(
                "navigation"
            )[0]?.type === "back_forward"
        ) {

            hidePageLoading();

        }

    }
);
