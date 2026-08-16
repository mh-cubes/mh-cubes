
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

        star.style.cursor = "pointer";

        star.addEventListener("click", function (event) {

            event.preventDefault();
            event.stopPropagation();

            const rating = Number(this.dataset.star);

            if (!rating) {
                return;
            }

            ratingInput.value = String(rating);

            stars.forEach(function (s) {

                const starNumber = Number(s.dataset.star);

                if (starNumber <= rating) {

                    s.textContent = "★";
                    s.classList.add("selected");

                } else {

                    s.textContent = "☆";
                    s.classList.remove("selected");

                }

            });

            console.log("Selected rating:", rating);

        });

    });


    // =========================================
    // IMAGE COMPRESSION
    // =========================================

    function compressImage(file) {

        return new Promise(function (resolve, reject) {

            const reader = new FileReader();

            reader.onload = function (event) {

                const img = new Image();

                img.onload = function () {

                    const maxWidth = 900;
                    const maxHeight = 900;

                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth || height > maxHeight) {

                        const widthRatio = maxWidth / width;
                        const heightRatio = maxHeight / height;

                        const ratio = Math.min(
                            widthRatio,
                            heightRatio
                        );

                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);

                    }

                    const canvas =
                        document.createElement("canvas");

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

                    const compressedImage =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.65
                        );

                    resolve(compressedImage);

                };

                img.onerror = function () {

                    reject(
                        new Error("Could not load image.")
                    );

                };

                img.src = event.target.result;

            };

            reader.onerror = function () {

                reject(
                    new Error("Could not read image.")
                );

            };

            reader.readAsDataURL(file);

        });

    }


    // =========================================
    // IMAGE PREVIEW
    // =========================================

    function createImagePreview(imageData) {

        if (!imagePreview) {
            return;
        }

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "review-preview-wrapper";


        const img =
            document.createElement("img");

        img.src = imageData;
        img.className = "review-preview-image";
        img.alt = "Review image";


        const removeButton =
            document.createElement("button");

        removeButton.type = "button";
        removeButton.className = "remove-preview-image";
        removeButton.textContent = "×";
        removeButton.setAttribute(
            "aria-label",
            "Remove image"
        );


        removeButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                const index =
                    selectedImages.indexOf(imageData);

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
        wrapper.appendChild(removeButton);

        imagePreview.appendChild(wrapper);

    }


    // =========================================
    // IMAGE UPLOAD
    // =========================================

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            async function () {

                const files =
                    Array.from(imageInput.files);


                if (
                    selectedImages.length +
                    files.length > 5
                ) {

                    showToast(
                        "Maximum 5 images allowed."
                    );

                    imageInput.value = "";

                    return;

                }


                for (const file of files) {

                    if (!file.type.startsWith("image/")) {

                        showToast(
                            "Please select image files only."
                        );

                        continue;

                    }


                    try {

                        showToast(
                            "Processing image..."
                        );


                        const imageData =
                            await compressImage(file);


                        selectedImages.push(
                            imageData
                        );


                        createImagePreview(
                            imageData
                        );


                    } catch (error) {

                        console.error(
                            "Image processing error:",
                            error
                        );

                        showToast(
                            "Failed to process image."
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

            if (rating < 1 || rating > 5) {

                showToast(
                    "Please select a star rating."
                );

                return;

            }


            try {

                submitButton.disabled = true;
                submitButton.textContent = "Submitting...";


                const reviewData = {

                    product: productName,

                    name: name,

                    review: review,

                    rating: rating,

                    images: selectedImages,

                    date: new Date().toLocaleDateString(),

                    createdAt: Date.now()

                };


                await addDoc(
                    collection(db, "reviews"),
                    reviewData
                );


                // CLEAR FORM

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


                showToast(
                    "Review submitted successfully!"
                );


                await displayReviews();


            } catch (error) {

                console.error(
                    "Error submitting review:",
                    error
                );

                showToast(
                    "Failed to submit review."
                );


            } finally {

                submitButton.disabled = false;
                submitButton.textContent = "Submit Review";

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

        toast.textContent = message;

        toast.classList.add("show");


        setTimeout(function () {

            toast.classList.remove("show");

        }, 3000);

    }


    // =========================================
    // LOAD REVIEWS
    // =========================================

    async function displayReviews() {

        if (!reviewList) {
            return;
        }


        reviewList.innerHTML =
            "<p>Loading reviews...</p>";


        try {

            const reviewsQuery =
                query(
                    collection(db, "reviews"),
                    where(
                        "product",
                        "==",
                        productName
                    )
                );


            const snapshot =
                await getDocs(reviewsQuery);


            const reviews = [];


            snapshot.forEach(function (docSnapshot) {

                reviews.push({

                    id: docSnapshot.id,

                    ...docSnapshot.data()

                });

            });


            reviews.sort(function (a, b) {

                return (
                    (b.createdAt || 0) -
                    (a.createdAt || 0)
                );

            });


            reviewList.innerHTML = "";


            if (reviews.length === 0) {

                const noReviews =
                    document.createElement("div");

                noReviews.className =
                    "no-reviews";

                noReviews.innerHTML =
                    "<div class='no-reviews-icon'>⭐</div>" +
                    "<h3>No reviews yet</h3>" +
                    "<p>Be the first customer to share your experience!</p>";

                reviewList.appendChild(noReviews);

                return;

            }


            // =================================
            // DISPLAY EACH REVIEW
            // =================================

            reviews.forEach(function (item) {

                const card =
                    document.createElement("div");

                card.className =
                    "review-card";


                // STARS

                let starsHTML = "";

                for (let i = 1; i <= 5; i++) {

                    if (i <= Number(item.rating)) {

                        starsHTML += "★";

                    } else {

                        starsHTML += "☆";

                    }

                }


                // CARD HTML

                const header =
                    document.createElement("div");

                header.className =
                    "review-header";


                const avatar =
                    document.createElement("div");

                avatar.className =
                    "review-avatar";

                avatar.textContent =
                    String(item.name || "?")
                        .charAt(0)
                        .toUpperCase();


                const user =
                    document.createElement("div");

                user.className =
                    "review-user";


                const username =
                    document.createElement("h3");

                username.textContent =
                    item.name || "Customer";


                const reviewStars =
                    document.createElement("div");

                reviewStars.className =
                    "review-stars";

                reviewStars.textContent =
                    starsHTML;


                user.appendChild(username);
                user.appendChild(reviewStars);


                const date =
                    document.createElement("span");

                date.className =
                    "review-date";

                date.textContent =
                    item.date || "";


                const menuContainer =
                    document.createElement("div");

                menuContainer.className =
                    "review-menu";


                const menuButton =
                    document.createElement("button");

                menuButton.className =
                    "review-menu-btn";

                menuButton.type =
                    "button";

                menuButton.textContent =
                    "⋮";

                menuButton.setAttribute(
                    "aria-label",
                    "Review options"
                );


                const menu =
                    document.createElement("div");

                menu.className =
                    "review-menu-dropdown";


                const deleteButton =
                    document.createElement("button");

                deleteButton.className =
                    "delete-review-btn";

                deleteButton.type =
                    "button";

                deleteButton.textContent =
                    "Delete Review";


                menu.appendChild(deleteButton);

                menuContainer.appendChild(menuButton);
                menuContainer.appendChild(menu);


                header.appendChild(avatar);
                header.appendChild(user);
                header.appendChild(date);
                header.appendChild(menuContainer);


                // REVIEW TEXT

                const message =
                    document.createElement("p");

                message.className =
                    "review-message";

                message.textContent =
                    item.review || "";


                card.appendChild(header);
                card.appendChild(message);


                // =================================
                // REVIEW IMAGES
                // =================================

                const reviewImages =
                    Array.isArray(item.images)
                        ? item.images
                        : [];


                if (reviewImages.length > 0) {

                    const imagesContainer =
                        document.createElement("div");

                    imagesContainer.className =
                        "review-images";


                    reviewImages.forEach(function (imageSrc) {

                        const image =
                            document.createElement("img");

                        image.src = imageSrc;

                        image.alt =
                            "Customer review image";

                        image.className =
                            "review-image";


                        image.addEventListener(
                            "click",
                            function (event) {

                                event.stopPropagation();

                                openImageViewer(
                                    imageSrc
                                );

                            }
                        );


                        imagesContainer.appendChild(image);

                    });


                    card.appendChild(
                        imagesContainer
                    );

                }


                // =================================
                // THREE DOT MENU
                // =================================

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


                            menu.classList.remove(
                                "show"
                            );


                            showToast(
                                "Review deleted successfully."
                            );


                            await displayReviews();


                        } catch (error) {

                            console.error(
                                "Error deleting review:",
                                error
                            );


                            showToast(
                                "Failed to delete review."
                            );

                        }

                    }
                );


                reviewList.appendChild(card);

            });


        } catch (error) {

            console.error(
                "Error loading reviews:",
                error
            );


            reviewList.innerHTML =
                "<p>Unable to load reviews.</p>";

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
            document.createElement("div");

        viewer.className =
            "review-image-viewer";


        const image =
            document.createElement("img");

        image.src =
            imageSrc;

        image.alt =
            "Enlarged customer review image";


        const closeButton =
            document.createElement("button");

        closeButton.className =
            "review-image-viewer-close";

        closeButton.type =
            "button";

        closeButton.textContent =
            "×";


        viewer.appendChild(image);
        viewer.appendChild(closeButton);

        document.body.appendChild(viewer);


        requestAnimationFrame(function () {

            viewer.classList.add("show");

        });


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

                if (event.target === viewer) {

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


        if (!viewer) {
            return;
        }


        viewer.classList.remove("show");


        setTimeout(function () {

            if (viewer) {

                viewer.remove();

            }

        }, 250);


        document.removeEventListener(
            "keydown",
            imageViewerEscapeHandler
        );

    }


    // =========================================
    // ESC KEY
    // =========================================

    function imageViewerEscapeHandler(event) {

        if (event.key === "Escape") {

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
                .forEach(function (menu) {

                    menu.classList.remove("show");

                });

        }
    );


    // =========================================
    // START
    // =========================================

    displayReviews();

});

