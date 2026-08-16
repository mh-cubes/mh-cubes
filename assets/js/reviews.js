document.addEventListener("DOMContentLoaded", function () {

    const nameInput = document.getElementById("review-name");
    const reviewInput = document.getElementById("review-text");
    const ratingInput = document.getElementById("rating");
    const submitButton = document.getElementById("submit-review");
    const reviewList = document.getElementById("reviews-list");
    const toast = document.getElementById("review-toast");
    const stars = document.querySelectorAll(".stars span");

    const imageInput = document.getElementById("review-images");
    const imagePreview = document.getElementById("image-preview");

    if (!nameInput || !reviewInput || !ratingInput || !submitButton) {
        console.error("Review elements missing!");
        return;
    }


    // =========================================
    // PRODUCT NAME
    // =========================================

    const productName = document.title
        .split("-")[0]
        .trim();

    const storageKey = "reviews_" + productName;


    // =========================================
    // SELECTED IMAGES
    // =========================================

    let selectedImages = [];


    // =========================================
    // STAR RATING
    // =========================================

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


    // =========================================
    // IMAGE UPLOAD
    // =========================================

    if (imageInput) {

        imageInput.addEventListener("change", function () {

            selectedImages = [];

            if (imagePreview) {
                imagePreview.innerHTML = "";
            }


            const files =
                Array.from(imageInput.files);


            files.forEach(function (file) {

                if (!file.type.startsWith("image/")) {
                    return;
                }


                const reader =
                    new FileReader();


                reader.onload = function (event) {

                    selectedImages.push(
                        event.target.result
                    );


                    if (imagePreview) {

                        const img =
                            document.createElement("img");

                        img.src =
                            event.target.result;

                        img.className =
                            "review-preview-image";

                        imagePreview.appendChild(img);

                    }

                };


                reader.readAsDataURL(file);

            });

        });

    }


    // =========================================
    // SUBMIT REVIEW
    // =========================================

    submitButton.addEventListener("click", function () {

        const name =
            nameInput.value.trim();

        const review =
            reviewInput.value.trim();

        const rating =
            Number(ratingInput.value);


        // NAME
        if (!name) {

            showToast(
                "⚠️ Please enter your name."
            );

            nameInput.focus();

            return;
        }


        // REVIEW
        if (!review) {

            showToast(
                "⚠️ Please write your review."
            );

            reviewInput.focus();

            return;
        }


        // RATING
        if (rating === 0) {

            showToast(
                "⭐ Please select a star rating."
            );

            return;
        }


        // =====================================
        // LOAD REVIEWS
        // =====================================

        let reviews =
            JSON.parse(
                localStorage.getItem(storageKey)
            ) || [];


        // =====================================
        // CREATE REVIEW
        // =====================================

        const newReview = {

            id: Date.now(),

            product: productName,

            name: name,

            review: review,

            rating: rating,

            images: selectedImages,

            date: new Date().toLocaleDateString()

        };


        // =====================================
        // SAVE
        // =====================================

        reviews.unshift(newReview);


        localStorage.setItem(
            storageKey,
            JSON.stringify(reviews)
        );


        // =====================================
        // CLEAR FORM
        // =====================================

        nameInput.value = "";

        reviewInput.value = "";

        ratingInput.value = "0";


        selectedImages = [];


        if (imagePreview) {
            imagePreview.innerHTML = "";
        }


        if (imageInput) {
            imageInput.value = "";
        }


        // RESET STARS
        stars.forEach(function (star) {

            star.textContent = "☆";

            star.classList.remove("selected");

        });


        // SUCCESS
        showToast(
            "✅ Review submitted successfully!"
        );


        displayReviews();

    });


    // =========================================
    // TOAST
    // =========================================

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


    // =========================================
    // DISPLAY REVIEWS
    // =========================================

    function displayReviews() {

        if (!reviewList) return;


        const reviews =
            JSON.parse(
                localStorage.getItem(storageKey)
            ) || [];


        reviewList.innerHTML = "";


        // =====================================
        // NO REVIEWS
        // =====================================

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


        // =====================================
        // EACH REVIEW
        // =====================================

        reviews.forEach(function (item) {

            let starsHTML = "";


            // STARS
            for (let i = 1; i <= 5; i++) {

                starsHTML +=
                    i <= item.rating
                        ? "★"
                        : "☆";

            }


            // =================================
            // REVIEW IMAGES
            // =================================

            let imagesHTML = "";


            if (
                item.images &&
                item.images.length > 0
            ) {

                imagesHTML = `

                    <div class="review-images">

                        ${item.images.map(function (image) {

                            return `

                                <img
                                    src="${image}"
                                    alt="Customer review image"
                                    class="review-image"
                                >

                            `;

                        }).join("")}

                    </div>

                `;

            }


            // =================================
            // REVIEW CARD
            // =================================

            const card =
                document.createElement("div");


            card.className =
                "review-card";


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


                <!-- REVIEW IMAGES -->

                ${imagesHTML}

            `;


            // =================================
            // THREE DOT MENU
            // =================================

            const menuButton =
                card.querySelector(
                    ".review-menu-btn"
                );


            const menu =
                card.querySelector(
                    ".review-menu-dropdown"
                );


            menuButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


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


            // =================================
            // DELETE REVIEW
            // =================================

            const deleteButton =
                card.querySelector(
                    ".delete-review-btn"
                );


            deleteButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    const confirmed =
                        confirm(
                            "Are you sure you want to delete this review?"
                        );


                    if (!confirmed) {

                        menu.classList.remove(
                            "show"
                        );

                        return;

                    }


                    // REMOVE REVIEW

                    const updatedReviews =
                        reviews.filter(function (review) {

                            return review.id !== item.id;

                        });


                    // SAVE

                    localStorage.setItem(
                        storageKey,
                        JSON.stringify(updatedReviews)
                    );


                    // REFRESH

                    displayReviews();


                    showToast(
                        "🗑️ Review deleted successfully."
                    );

                }
            );


            // ADD CARD

            reviewList.appendChild(card);

        });

    }


    // =========================================
    // CLOSE MENUS
    // =========================================

    document.addEventListener(
        "click",
        function () {

            document
                .querySelectorAll(
                    ".review-menu-dropdown"
                )
                .forEach(function (menu) {

                    menu.classList.remove(
                        "show"
                    );

                });

        }
    );


    // =========================================
    // SECURITY
    // =========================================

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;

    }


    // =========================================
    // LOAD REVIEWS
    // =========================================

    displayReviews();

});
