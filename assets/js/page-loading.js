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
            message: "Opening sign in..."
        };

    }


    if (
        page === "" ||
        page === "index.html"
    ) {

        return {
            title: "MH CUBES",
            message: "Welcome back..."
        };

    }


    return {
        title: "MH CUBES",
        message: "Loading..."
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
   HIDE LOADING
========================================= */

function hidePageLoading() {

    if (!loadingScreen) return;

    loadingScreen.classList.add("hide");

}


/* =========================================
   INITIAL PAGE LOAD
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
           Browser history navigation
        */

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

    }
);
