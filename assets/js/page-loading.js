const loadingScreen =
    document.getElementById("page-loading");


/* Hide loading screen after page loads */

window.addEventListener("load", function () {

    setTimeout(function () {

        if (loadingScreen) {

            loadingScreen.classList.add("hide");

        }

    }, 700);

});


/* Show loading screen when navigating */

document.addEventListener("click", function (event) {

    const link =
        event.target.closest("a");

    if (!link) {
        return;
    }


    const href =
        link.getAttribute("href");


    if (!href) {
        return;
    }


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


    if (!loadingScreen) {
        return;
    }


    event.preventDefault();


    loadingScreen.classList.remove("hide");


    /*
       Keep loading screen visible
       for around 2.5 seconds
    */

    setTimeout(function () {

        window.location.href = href;

    }, 2500);

});
