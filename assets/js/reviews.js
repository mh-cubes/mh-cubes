import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { db } from "./firebase.js";


document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // ELEMENTS
    // =========================================

    const nameInput = document.getElementById("review-name");
    const reviewInput = document.getElementById("review-text");
    const ratingInput = document.getElementById("rating");
    const submitButton = document.getElementById("submit-review");
    const reviewList = document.getElementById("reviews-list");
    const toast = document.getElementById("review-toast");

    const stars = document.querySelectorAll(".stars span");

    const imageInput = document.getElementById("review-images");
    const imagePreview = document.getElementById("image-preview");


    if (
        !nameInput ||
        !reviewInput ||
        !ratingInput ||
        !submitButton
    ) {
        console.error("Review elements are missing.");
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

    stars.forEach((star) => {

        star.addEventListener("click", (event) => {

            event.preventDefault();

            const rating =
                Number(star.dataset.star);

            if (!rating) return;

            ratingInput.value =
                String(rating);


            stars.forEach((s) => {

                const number =
                    Number(s.dataset.star);

                if (number <= rating) {

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
    // IMAGE COMPRESSION
    // =========================================

    function compressImage(file) {

        return new Promise((resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = (event) => {

                const img =
                    new Image();


                img.onload = () => {

                    const maxWidth = 700;
                    const maxHeight = 700;

                    let width = img.width;
                    let height = img.height;


                    if (
                        width > maxWidth ||
                        height > maxHeight
                    ) {

                        const ratio =
                            Math.min(
                                maxWidth / width,
                                maxHeight / height
                            );

                        width =
                            Math.round(width * ratio);

                        height =
                            Math.round(height * ratio);

                    }


                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    canvas.width = width;
                    canvas.height = height;


                    const context =
                        canvas.getContext("2d");


                    context.drawImage(
                        img,
                        0,
                        0,
                        width,
                        height
                    );


                    const compressed =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.45
                        );


                    resolve(compressed);

                };


                img.onerror = () => {

                    reject(
                        new Error(
                            "Unable to load image."
                        )
                    );

                };


                img.src =
                    event.target.result;

            };


            reader.onerror = () => {

                reject(
                    new Error(
                        "Unable to read image."
                    )
                );

            };


            reader.readAsDataURL(file);

        });

    }


    // =========================================
    // CREATE IMAGE PREVIEW
    // =========================================

    function createImagePreview(imageData) {

        if (!imagePreview) return;


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "review-preview-wrapper";


        const image =
            document.createElement("img");

        image.src = imageData;

        image.alt =
            "Selected review image";

        image.className =
            "review-preview-image";


        const removeButton =
            document.createElement("button");

        removeButton.type = "button";

        removeButton.className =
            "remove-preview-image";

        removeButton.textContent = "×";

        removeButton.setAttribute(
            "aria-label",
            "Remove image"
        );


        removeButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

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


        wrapper.appendChild(image);

        wrapper.appendChild(removeButton);

        imagePreview.appendChild(wrapper);

    }


    // =========================================
    // IMAGE UPLOAD
    // =========================================

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            async () => {

                const files =
                    Array.from(
                        imageInput.files
                    );


                if (!files.length) {
                    return;
                }


                if (
                    selectedImages.length +
                    files.length > 3
                ) {

                    showToast(
                        "Maximum 3 pictures allowed."
                    );

                    imageInput.value = "";

                    return;

                }


                for (const file of files) {

                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {

                        showToast(
                            "Please select image files only."
                        );

                        continue;

                    }


                    try {

                        showToast(
                            "Processing picture..."
                        );


                        const imageData =
                            await compressImage(
                                file
                            );


                        /*
                         * Extra safety check.
                         * Firestore documents have a size limit.
                         */

                        if (
                            imageData.length >
                            350000
                        ) {

                            showToast(
                                "Picture is too large. Please choose another."
                            );

                            continue;

                        }


                        selectedImages.push(
                            imageData
                        );


                        createImagePreview(
                            imageData
                        );


                    } catch (error) {

                        console.error(
                            "Image error:",
                            error
                        );

                        showToast(
                            "Failed to process picture."
                        );

                    }

                }


                imageInput.value = "";

            }
        );

    }


    // =========================================
    // SUBMIT REVIEW
    // =========================================

    submitButton.addEventListener(
        "click",
        async () => {

            const name =
                nameInput.value.trim();

            const review =
                reviewInput.value.trim();

            const rating =
                Number(ratingInput.value);


            // NAME

            if (!name) {

                showToast(
                    "Please enter your name."
                );

                nameInput.focus();

                return;

            }


            // REVIEW

            if (!review) {

                showToast(
                    "Please write your review."
                );

                reviewInput.focus();

                return;

            }


            // RATING

            if (
                rating < 1 ||
                rating > 5
            ) {

                showToast(
                    "Please select a star rating."
                );

                return;

            }


            try {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Submitting...";


                const reviewData = {

                    product:
                        productName,

                    name:
                        name,

                    review:
                        review,

                    rating:
                        rating,

                    images:
                        selectedImages,

                    date:
                        new Date()
                            .toLocaleDateString(),

                    createdAt:
                        Date.now()

                };


                // =================================
                // SAVE TO FIRESTORE
                // =================================

                await addDoc(
                    collection(
                        db,
                        "reviews"
                    ),
                    reviewData
                );


                // =================================
                // CLEAR FORM
                // =================================

                nameInput.value = "";

                reviewInput.value = "";

                ratingInput.value = "0";

                selectedImages = [];


                if (imagePreview) {

                    imagePreview.innerHTML =
                        "";

                }


                if (imageInput) {

                    imageInput.value =
                        "";

                }


                // RESET STARS

                stars.forEach((star) => {

                    star.textContent =
                        "☆";

                    star.classList.remove(
                        "selected"
                    );

                });


                showToast(
                    "Review submitted successfully! ⭐"
                );


                await displayReviews();


            } catch (error) {

                console.error(
                    "FULL FIRESTORE REVIEW ERROR:",
                    error
                );


                /*
                 * Show the actual Firebase error
                 * in console for debugging.
                 */

                showToast(
                    "Failed to submit review."
                );


            } finally {

                submitButton.disabled =
                    false;

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

        toast.classList.add("show");


        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3000);

    }


    // =========================================
    // LOAD REVIEWS
    // =========================================

    async function displayReviews() {

        if (!reviewList) return;


        reviewList.innerHTML =
            "<p>Loading reviews...</p>";


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


            snapshot.forEach(
                (reviewDoc) => {

                    reviews.push({

                        id:
                            reviewDoc.id,

                        ...reviewDoc.data()

                    });

                }
            );


            reviews.sort(
                (a, b) => {

                    return (
                        (b.createdAt || 0) -
                        (a.createdAt || 0)
                    );

                }
            );


            reviewList.innerHTML =
                "";


            // =================================
            // NO REVIEWS
            // =================================

            if (!reviews.length) {

                const noReviews =
                    document.createElement(
                        "div"
                    );

                noReviews.className =
                    "no-reviews";


                noReviews.innerHTML = `
                    <div class="no-reviews-icon">
                        ⭐
                    </div>

                    <h3>
                        No reviews yet
                    </h3>

                    <p>
                        Be the first customer to share your experience!
                    </p>
                `;


                reviewList.appendChild(
                    noReviews
                );

                return;

            }


            // =================================
            // DISPLAY REVIEWS
            // =================================

            reviews.forEach((item) => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "review-card";


                // =================================
                // HEADER
                // =================================

                const header =
                    document.createElement(
                        "div"
                    );

                header.className =
                    "review-header";


                // AVATAR

                const avatar =
                    document.createElement(
                        "div"
                    );

                avatar.className =
                    "review-avatar";


                avatar.textContent =
                    String(
                        item.name || "?"
                    )
                        .charAt(0)
                        .toUpperCase();


                // USER

                const user =
                    document.createElement(
                        "div"
                    );

                user.className =
                    "review-user";


                const username =
                    document.createElement(
                        "h3"
                    );

                username.textContent =
                    item.name ||
                    "Customer";


                // STARS

                const reviewStars =
                    document.createElement(
                        "div"
                    );

                reviewStars.className =
                    "review-stars";


                let starsHTML = "";


                for (
                    let i = 1;
                    i <= 5;
                    i++
                ) {

                    starsHTML +=
                        i <=
                        Number(item.rating)
                            ? "★"
                            : "☆";

                }


                reviewStars.textContent =
                    starsHTML;


                user.appendChild(
                    username
                );

                user.appendChild(
                    reviewStars
                );


                // DATE

                const date =
                    document.createElement(
                        "span"
                    );

                date.className =
                    "review-date";

                date.textContent =
                    item.date || "";


                // =================================
                // ADMIN MENU
                // =================================

                const menuContainer =
                    document.createElement(
                        "div"
                    );

                menuContainer.className =
                    "review-menu";


                const isAdmin =
                    localStorage.getItem(
                        "adminAccess"
                    ) === "granted";


                if (isAdmin) {

                    const menuButton =
                        document.createElement(
                            "button"
                        );

                    menuButton.type =
                        "button";

                    menuButton.className =
                        "review-menu-btn";

                    menuButton.textContent =
                        "⋮";


                    const menu =
                        document.createElement(
                            "div"
                        );

                    menu.className =
                        "review-menu-dropdown";


                    const deleteButton =
                        document.createElement(
                            "button"
                        );

                    deleteButton.type =
                        "button";

                    deleteButton.className =
                        "delete-review-btn";

                    deleteButton.textContent =
                        "Delete Review";


                    menu.appendChild(
                        deleteButton
                    );


                    menuContainer.appendChild(
                        menuButton
                    );

                    menuContainer.appendChild(
                        menu
                    );


                    // OPEN MENU

                    menuButton.addEventListener(
                        "click",
                        (event) => {

                            event.stopPropagation();


                            document
                                .querySelectorAll(
                                    ".review-menu-dropdown"
                                )
                                .forEach(
                                    (otherMenu) => {

                                        if (
                                            otherMenu !==
                                            menu
                                        ) {

                                            otherMenu
                                                .classList
                                                .remove(
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


                    // DELETE REVIEW

                    deleteButton.addEventListener(
                        "click",
                        async (event) => {

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


                                menu.classList.remove(
                                    "show"
                                );


                                showToast(
                                    "Review deleted successfully."
                                );


                                await displayReviews();


                            } catch (error) {

                                console.error(
                                    "Delete review error:",
                                    error
                                );


                                showToast(
                                    "Failed to delete review."
                                );

                            }

                        }
                    );

                }


                // HEADER

                header.appendChild(
                    avatar
                );

                header.appendChild(
                    user
                );

                header.appendChild(
                    date
                );

                header.appendChild(
                    menuContainer
                );


                // =================================
                // REVIEW MESSAGE
                // =================================

                const message =
                    document.createElement(
                        "p"
                    );

                message.className =
                    "review-message";

                message.textContent =
                    item.review || "";


                card.appendChild(
                    header
                );

                card.appendChild(
                    message
                );


                // =================================
                // REVIEW IMAGES
                // =================================

                const images =
                    Array.isArray(item.images)
                        ? item.images
                        : [];


                if (images.length > 0) {

                    const imagesContainer =
                        document.createElement(
                            "div"
                        );

                    imagesContainer.className =
                        "review-images";


                    images.forEach(
                        (imageSrc) => {

                            const image =
                                document.createElement(
                                    "img"
                                );

                            image.src =
                                imageSrc;

                            image.alt =
                                "Customer review picture";

                            image.className =
                                "review-image";


                            image.addEventListener(
                                "click",
                                () => {

                                    openImageViewer(
                                        imageSrc
                                    );

                                }
                            );


                            imagesContainer.appendChild(
                                image
                            );

                        }
                    );


                    card.appendChild(
                        imagesContainer
                    );

                }


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
                <p class="reviews-error">
                    Unable to load reviews.
                </p>
            `;

        }

    }


    // =========================================
    // IMAGE FULLSCREEN VIEWER
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
            "Customer review picture";


        const closeButton =
            document.createElement(
                "button"
            );

        closeButton.type =
            "button";

        closeButton.className =
            "review-image-viewer-close";

        closeButton.textContent =
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


        requestAnimationFrame(() => {

            viewer.classList.add(
                "show"
            );

        });


        closeButton.addEventListener(
            "click",
            () => {

                closeImageViewer();

            }
        );


        viewer.addEventListener(
            "click",
            (event) => {

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


        setTimeout(() => {

            viewer.remove();

        }, 250);


        document.removeEventListener(
            "keydown",
            imageViewerEscapeHandler
        );

    }


    // =========================================
    // ESC KEY
    // =========================================

    function imageViewerEscapeHandler(
        event
    ) {

        if (event.key === "Escape") {

            closeImageViewer();

        }

    }


    // =========================================
    // CLOSE MENUS
    // =========================================

    document.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(
                    ".review-menu-dropdown"
                )
                .forEach(
                    (menu) => {

                        menu.classList.remove(
                            "show"
                        );

                    }
                );

        }
    );


    // =========================================
    // START
    // =========================================

    displayReviews();

});
