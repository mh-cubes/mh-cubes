document.addEventListener("DOMContentLoaded", function () {

    const nameInput = document.getElementById("review-name");
    const reviewInput = document.getElementById("review-text");
    const ratingInput = document.getElementById("rating");
    const submitButton = document.getElementById("submit-review");
    const reviewList = document.getElementById("reviews-list");
    const toast = document.getElementById("review-toast");
    const stars = document.querySelectorAll(".stars span");

    if (!nameInput || !reviewInput || !ratingInput || !submitButton) {
        console.error("Review elements missing!");
        return;
    }


    /* =========================
       PRODUCT NAME
    ========================= */

    let productName = document.title
        .split("-")[0]
        .trim();

    const storageKey = "reviews_" + productName;


    /* =========================
       STAR RATING
    ========================= */

    stars.forEach(function (star) {

        star.addEventListener("click", function () {

            const rating = Number(this.dataset.star);

            ratingInput.value = rating;

            stars.forEach(function (s) {

                if (Number(s.dataset.star) <= rating) {

                    s.textContent = "★";
                    s.classList.add("selected");

                } else {

                    s.textContent = "☆";
                    s.classList.remove("selected");

                }

            });

        });

    });


    /* =========================
       SUBMIT REVIEW
    ========================= */

    submitButton.addEventListener("click", function () {

        const name = nameInput.value.trim();
        const review = reviewInput.value.trim();
        const rating = Number(ratingInput.value);


        /* NAME */

        if (!name) {

            showToast("⚠️ Please enter your name.");

            nameInput.focus();

            return;
        }


        /* REVIEW */

        if (!review) {

            showToast("⚠️ Please write your review.");

            reviewInput.focus();

            return;
        }


        /* RATING */

        if (rating === 0) {

            showToast("⭐ Please select a star rating.");

            return;
        }


        /* LOAD REVIEWS */

        let reviews =
            JSON.parse(localStorage.getItem(storageKey)) || [];


        /* CREATE REVIEW */

        const newReview = {

            id: Date.now(),

            product: productName,

            name: name,

            review: review,

            rating: rating,

            images: [],

            date: new Date().toLocaleDateString()

        };


        /* SAVE */

        reviews.unshift(newReview);

        localStorage.setItem(
            storageKey,
            JSON.stringify(reviews)
        );


        /* CLEAR FORM */

        nameInput.value = "";

        reviewInput.value = "";

        ratingInput.value = "0";


        stars.forEach(function (star) {

            star.textContent = "☆";

            star.classList.remove("selected");

        });


        /* SUCCESS */

        showToast("✅ Review submitted successfully!");

        displayReviews();

    });


    /* =========================
       TOAST
    ========================= */

    function showToast(message) {

        if (!toast) {

            alert(message);

            return;

        }

        toast.textContent = message;

        toast.classList.add("show");


        setTimeout(function () {

            toast.classList.remove("show");

        }, 3000);

    }


    /* =========================
       DISPLAY REVIEWS
    ========================= */

    function displayReviews() {

        if (!reviewList) return;


        const reviews =
            JSON.parse(localStorage.getItem(storageKey)) || [];


        reviewList.innerHTML = "";


        /* NO REVIEWS */

        if (reviews.length === 0) {

            reviewList.innerHTML = `

                <div class="no-reviews">

                    <div class="no-reviews-icon">
                        ⭐
                    </div>

                    <h3>
                        No reviews yet
                    </h3>

                    <p>
                        Be the first customer to share
                        your experience!
                    </p>

                </div>

            `;

            return;

        }


        /* DISPLAY REVIEWS */

        reviews.forEach(function (item) {

            let starsHTML = "";


            /* STARS */

            for (let i = 1; i <= 5; i++) {

                starsHTML +=
                    i <= item.rating
                        ? "★"
                        : "☆";

            }


            const card =
                document.createElement("div");

            card.className = "review-card";


            card.innerHTML = `

                <div class="review-header">


                    <!-- AVATAR -->

                    <div class="review-avatar">

                        ${escapeHTML(
                            item.name
                                .charAt(0)
                                .toUpperCase()
                        )}

                    </div>


                    <!-- NAME + STARS -->

                    <div class="review-user">

                        <h3>
                            ${escapeHTML(item.name)}
                        </h3>

                        <div class="review-stars">

                            ${starsHTML}

                        </div>

                    </div>


                    <!-- DATE -->

                    <span class="review-date">

                        ${item.date}

                    </span>


                    <!-- THREE DOT MENU -->

                    <div class="review-menu">

                        <button
                            class="review-menu-btn"
                            type="button"
                            aria-label="Review options"
                        >
                            ⋮
                        </button>


                        <div class="review-menu-dropdown">

                            <button
                                class="delete-review-btn"
                                type="button"
                            >
                                🗑️ Delete Review
                            </button>

                        </div>

                    </div>


                </div>


                <!-- REVIEW TEXT -->

                <p class="review-message">

                    ${escapeHTML(item.review)}

                </p>

            `;


            /* =========================
               THREE DOT BUTTON
            ========================= */

            const menuButton =
                card.querySelector(".review-menu-btn");

            const menu =
                card.querySelector(".review-menu-dropdown");


            menuButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    /* Close other menus */

                    document
                        .querySelectorAll(
                            ".review-menu-dropdown"
                        )
                        .forEach(function (otherMenu) {

                            if (otherMenu !== menu) {

                                otherMenu.classList.remove(
                                    "show"
                                );

                            }

                        });


                    menu.classList.toggle("show");

                }
            );


            /* =========================
               DELETE REVIEW
            ========================= */

            const deleteButton =
                card.querySelector(".delete-review-btn");


            deleteButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    const confirmed =
                        confirm(
                            "Are you sure you want to delete this review?"
                        );


                    if (!confirmed) {

                        menu.classList.remove("show");

                        return;

                    }


                    /* Remove this review */

                    const updatedReviews =
                        reviews.filter(function (review) {

                            return review.id !== item.id;

                        });


                    /* Save */

                    localStorage.setItem(
                        storageKey,
                        JSON.stringify(updatedReviews)
                    );


                    /* Refresh */

                    displayReviews();


                    showToast(
                        "🗑️ Review deleted successfully."
                    );

                }
            );


            reviewList.appendChild(card);

        });

    }


    /* =========================
       CLOSE MENUS WHEN CLICKING
       OUTSIDE
    ========================= */

    document.addEventListener(
        "click",
        function () {

            document
                .querySelectorAll(
                    ".review-menu-dropdown"
                )
                .forEach(function (menu) {

                    menu.classList.remove("show");

                });

        }
    );


    /* =========================
       SECURITY
    ========================= */

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;

    }


    /* =========================
       LOAD REVIEWS
    ========================= */

    displayReviews();

});
