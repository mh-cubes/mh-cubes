import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { db } from "../../firebase.js";


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


    // =========================================
    // SELECTED IMAGES
    // =========================================

    let selectedImages = [];


    // =========================================
    // STAR RATING
    // =========================================

    stars.forEach(function (star) {

        star.addEventListener("click", function () {

            const rating =
                Number(this.dataset.star);

            ratingInput.value = rating;


            stars.forEach(function (s) {

                if (
                    Number(s.dataset.star) <= rating
                ) {

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

        imageInput.addEventListener(
            "change",
            function () {

                const files =
                    Array.from(imageInput.files);


                // MAXIMUM 5 IMAGES

                if (
                    selectedImages.length +
                    files.length > 5
                ) {

                    showToast(
                        "⚠️ You can upload a maximum of 5 images."
                    );

                    imageInput.value = "";

                    return;

                }


                files.forEach(function (file) {

                    if (
                        !file.type.startsWith("image/")
                    ) {

                        return;

                    }


                    const reader =
                        new FileReader();


                    reader.onload =
                        function (event) {

                            const imageData =
                                event.target.result;


                            selectedImages.push(
                                imageData
                            );


                            if (imagePreview) {

                                const wrapper =
                                    document.createElement(
                                        "div"
                                    );


                                wrapper.className =
                                    "review-preview-wrapper";


                                const img =
                                    document.createElement(
                                        "img"
                                    );


                                img.src =
                                    imageData;

                                img.className =
                                    "review-preview-image";

                                img.alt =
                                    "Review image";


                                // CROSS BUTTON

                                const removeButton =
                                    document.createElement(
                                        "button"
                                    );


                                removeButton.type =
                                    "button";

                                removeButton.className =
                                    "remove-preview-image";

                                removeButton.innerHTML =
                                    "×";


                                // REMOVE IMAGE

                                removeButton.addEventListener(
                                    "click",
                                    function (event) {

                                        event.preventDefault();

                                        event.stopPropagation();


                                        const index =
                                            selectedImages.indexOf(
                                                imageData
                                            );


                                        if (index !== -1) {

                                            selectedImages.splice(
                                                index,
                                                1
                                            );

                                        }


                                        wrapper.remove();

                                    }
                                );


                                wrapper.appendChild(img);

                                wrapper.appendChild(
                                    removeButton
                                );

                                imagePreview.appendChild(
                                    wrapper
                                );

                            }

                        };


                    reader.readAsDataURL(file);

                });


                // Allow selecting the same file again

                imageInput.value = "";

            }
        );

    }


    // =========================================
    // SUBMIT REVIEW
    // =========================================

    submitButton.addEventListener(
        "click",
        async function () {

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


            try {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Submitting...";


                // =================================
                // SAVE REVIEW TO FIRESTORE
                // =================================

                const reviewData = {

                    product: productName,

                    name: name,

                    review: review,

                    rating: rating,

                    date:
                        new Date().toLocaleDateString(),

                    createdAt:
                        Date.now()

                };


                const reviewRef =
                    await addDoc(
                        collection(
                            db,
                            "reviews"
                        ),
                        reviewData
                    );


                // =================================
                // SAVE IMAGES LOCALLY
                // =================================

                if (selectedImages.length > 0) {

                    localStorage.setItem(
                        "review_images_" +
                        reviewRef.id,

                        JSON.stringify(
                            selectedImages
                        )
                    );

                }


                // =================================
                // CLEAR FORM
                // =================================

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


                stars.forEach(function (star) {

                    star.textContent = "☆";

                    star.classList.remove(
                        "selected"
                    );

                });


                showToast(
                    "✅ Review submitted successfully!"
                );


                await displayReviews();


            } catch (error) {

                console.error(
                    "Error submitting review:",
                    error
                );


                showToast(
                    "❌ Failed to submit review."
                );

            } finally {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Submit Review";

            }

        }
    );


    // =========================================
    // TOAST
    // =========================================

    function showToast(message) {

        if (!toast) {

            alert(message);

            return;

        }


        toast.textContent =
            message;

        toast.classList.add(
            "show"
        );


        setTimeout(function () {

            toast.classList.remove(
                "show"
            );

        }, 3000);

    }


    // =========================================
    // LOAD REVIEWS FROM FIRESTORE
    // =========================================

    async function displayReviews() {

        if (!reviewList) return;


        reviewList.innerHTML = `
            <p>Loading reviews...</p>
        `;


        try {

            const reviewsQuery =
                query(
                    collection(
                        db,
                        "reviews"
                    ),
                    where(
                        "product",
                        "==",
                        productName
                    )
                );


            const snapshot =
                await getDocs(
                    reviewsQuery
                );


            const reviews = [];


            snapshot.forEach(function (docSnapshot) {

                reviews.push({

                    id: docSnapshot.id,

                    ...docSnapshot.data()

                });

            });


            // NEWEST FIRST

            reviews.sort(function (a, b) {

                return (
                    (b.createdAt || 0) -
                    (a.createdAt || 0)
                );

            });


            reviewList.innerHTML = "";


            // NO REVIEWS

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


            // =================================
            // DISPLAY EACH REVIEW
            // =================================

            reviews.forEach(function (item) {

                let starsHTML = "";


                for (
                    let i = 1;
                    i <= 5;
                    i++
                ) {

                    starsHTML +=
                        i <= item.rating
                            ? "★"
                            : "☆";

                }


                // =================================
                // LOAD LOCAL IMAGES
                // =================================

                let reviewImages = [];


                try {

                    reviewImages =
                        JSON.parse(
                            localStorage.getItem(
                                "review_images_" +
                                item.id
                            )
                        ) || [];

                } catch (error) {

                    reviewImages = [];

                }


                let imagesHTML = "";


                if (
                    reviewImages.length > 0
                ) {

                    imagesHTML = `

                        <div class="review-images">

                            ${reviewImages.map(
                                function (image) {

                                    return `

                                        <img
                                            src="${image}"
                                            alt="Customer review image"
                                            class="review-image"
                                        >

                                    `;

                                }
                            ).join("")}

                        </div>

                    `;

                }


                // =================================
                // REVIEW CARD
                // =================================

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "review-card";


                card.innerHTML = `

                    <div class="review-header">

                        <div class="review-avatar">

                            ${escapeHTML(
                                item.name
                                    .charAt(0)
                                    .toUpperCase()
                            )}

                        </div>


                        <div class="review-user">

                            <h3>
                                ${escapeHTML(
                                    item.name
                                )}
                            </h3>

                            <div class="review-stars">
                                ${starsHTML}
                            </div>

                        </div>


                        <span class="review-date">

                            ${escapeHTML(
                                item.date || ""
                            )}

                        </span>


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


                    <p class="review-message">

                        ${escapeHTML(
                            item.review
                        )}

                    </p>


                    ${imagesHTML}

                `;


                // =================================
                // IMAGE VIEWER
                // =================================

                const reviewImagesElements =
                    card.querySelectorAll(
                        ".review-image"
                    );


                reviewImagesElements.forEach(
                    function (image) {

                        image.addEventListener(
                            "click",
                            function (event) {

                                event.stopPropagation();

                                openImageViewer(
                                    image.src
                                );

                            }
                        );

                    }
                );


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
                            .forEach(
                                function (otherMenu) {

                                    if (
                                        otherMenu !==
                                        menu
                                    ) {

                                        otherMenu.classList.remove(
                                            "show"
                                        );

                                    }

                                }
                            );


                        menu.classList.toggle(
                            "show"
                        );

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
                    async function (event) {

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


                        try {

                            await deleteDoc(
                                doc(
                                    db,
                                    "reviews",
                                    item.id
                                )
                            );


                            // Delete local images

                            localStorage.removeItem(
                                "review_images_" +
                                item.id
                            );


                            await displayReviews();


                            showToast(
                                "🗑️ Review deleted successfully."
                            );


                        } catch (error) {

                            console.error(
                                "Error deleting review:",
                                error
                            );


                            showToast(
                                "❌ Failed to delete review."
                            );

                        }

                    }
                );


                reviewList.appendChild(
                    card
                );

            });


        } catch (error) {

            console.error(
                "Error loading reviews:",
                error
            );


            reviewList.innerHTML = `

                <p>
                    ❌ Unable to load reviews.
                </p>

            `;

        }

    }


    // =========================================
    // IMAGE VIEWER
    // =========================================

    function openImageViewer(imageSrc) {

        const oldViewer =
            document.querySelector(
                ".review-image-viewer"
            );


        if (oldViewer) {

            oldViewer.remove();

        }


        const viewer =
            document.createElement(
                "div"
            );


        viewer.className =
            "review-image-viewer";


        const image =
            document.createElement(
                "img"
            );


        image.src =
            imageSrc;


        image.alt =
            "Enlarged customer review image";


        const closeButton =
            document.createElement(
                "button"
            );


        closeButton.className =
            "review-image-viewer-close";


        closeButton.type =
            "button";


        closeButton.innerHTML =
            "×";


        viewer.appendChild(
            image
        );


        viewer.appendChild(
            closeButton
        );


        document.body.appendChild(
            viewer
        );


        requestAnimationFrame(
            function () {

                viewer.classList.add(
                    "show"
                );

            }
        );


        closeButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                closeImageViewer();

            }
        );


        viewer.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    viewer
                ) {

                    closeImageViewer();

                }

            }
        );


        document.addEventListener(
            "keydown",
            imageViewerEscapeHandler
        );

    }


    // =========================================
    // CLOSE IMAGE VIEWER
    // =========================================

    function closeImageViewer() {

        const viewer =
            document.querySelector(
                ".review-image-viewer"
            );


        if (!viewer) return;


        viewer.classList.remove(
            "show"
        );


        setTimeout(
            function () {

                if (viewer) {

                    viewer.remove();

                }

            },
            250
        );


        document.removeEventListener(
            "keydown",
            imageViewerEscapeHandler
        );

    }


    // =========================================
    // ESC KEY
    // =========================================

    function imageViewerEscapeHandler(event) {

        if (
            event.key === "Escape"
        ) {

            closeImageViewer();

        }

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
                .forEach(
                    function (menu) {

                        menu.classList.remove(
                            "show"
                        );

                    }
                );

        }
    );


    // =========================================
    // SECURITY
    // =========================================

    function escapeHTML(text) {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            text;

        return div.innerHTML;

    }


    // =========================================
    // LOAD REVIEWS
    // =========================================

    displayReviews();

});
