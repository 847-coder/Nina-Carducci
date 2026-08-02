(function ($) {
    $.fn.mauGallery = function (options) {
        options = $.extend({}, $.fn.mauGallery.defaults, options);

        return this.each(function () {
            const gallery = $(this);
            const tagsCollection = [];

            $.fn.mauGallery.methods.createRowWrapper(gallery);

            if (options.lightBox) {
                $.fn.mauGallery.methods.createLightBox(
                    gallery,
                    options.lightboxId,
                    options.navigation
                );
            }

            gallery.children(".gallery-item").each(function () {
                const image = $(this);

                $.fn.mauGallery.methods.responsiveImageItem(image);
                $.fn.mauGallery.methods.moveItemInRowWrapper(image, gallery);
                $.fn.mauGallery.methods.wrapItemInColumn(
                    image,
                    options.columns
                );

                const tag = image.data("gallery-tag");

                if (
                    options.showTags &&
                    tag !== undefined &&
                    !tagsCollection.includes(tag)
                ) {
                    tagsCollection.push(tag);
                }
            });

            if (options.showTags) {
                $.fn.mauGallery.methods.showItemTags(
                    gallery,
                    options.tagsPosition,
                    tagsCollection
                );
            }

            $.fn.mauGallery.listeners(gallery, options);

            gallery.show();
        });
    };

    $.fn.mauGallery.defaults = {
        columns: 3,
        lightBox: true,
        lightboxId: "galleryLightbox",
        showTags: true,
        tagsPosition: "bottom",
        navigation: true
    };

    $.fn.mauGallery.listeners = function (gallery, options) {
        gallery.on("click", ".gallery-item", function () {
            if (
                options.lightBox &&
                $(this).prop("tagName") === "IMG"
            ) {
                $.fn.mauGallery.methods.openLightBox(
                    $(this),
                    options.lightboxId
                );
            }
        });

        gallery.on(
            "click",
            ".nav-link",
            $.fn.mauGallery.methods.filterByTag
        );

        gallery.on("click", ".mg-prev", function () {
            $.fn.mauGallery.methods.changeImage(
                gallery,
                options.lightboxId,
                -1
            );
        });

        gallery.on("click", ".mg-next", function () {
            $.fn.mauGallery.methods.changeImage(
                gallery,
                options.lightboxId,
                1
            );
        });
    };

    $.fn.mauGallery.methods = {
        createRowWrapper(gallery) {
            if (!gallery.children().first().hasClass("gallery-items-row")) {
                gallery.append(
                    '<div class="gallery-items-row row"></div>'
                );
            }
        },

        wrapItemInColumn(element, columns) {
            if (typeof columns === "number") {
                element.wrap(
                    `<div class="item-column mb-4 col-${Math.ceil(
                        12 / columns
                    )}"></div>`
                );

                return;
            }

            if (typeof columns === "object") {
                let columnClasses = "";

                if (columns.xs) {
                    columnClasses += ` col-${Math.ceil(
                        12 / columns.xs
                    )}`;
                }

                if (columns.sm) {
                    columnClasses += ` col-sm-${Math.ceil(
                        12 / columns.sm
                    )}`;
                }

                if (columns.md) {
                    columnClasses += ` col-md-${Math.ceil(
                        12 / columns.md
                    )}`;
                }

                if (columns.lg) {
                    columnClasses += ` col-lg-${Math.ceil(
                        12 / columns.lg
                    )}`;
                }

                if (columns.xl) {
                    columnClasses += ` col-xl-${Math.ceil(
                        12 / columns.xl
                    )}`;
                }

                element.wrap(
                    `<div class="item-column mb-4${columnClasses}"></div>`
                );

                return;
            }

            console.error(
                "La propriété columns doit être un nombre ou un objet."
            );
        },

        moveItemInRowWrapper(element, gallery) {
            element.appendTo(gallery.find(".gallery-items-row"));
        },

        responsiveImageItem(element) {
            if (element.prop("tagName") === "IMG") {
                element.addClass("img-fluid");
            }
        },

        openLightBox(element, lightboxId) {
            const lightbox = document.getElementById(lightboxId);

            if (!lightbox) {
                console.error(
                    `La modale ${lightboxId} est introuvable.`
                );
                return;
            }

            $(lightbox)
                .find(".lightboxImage")
                .attr("src", element.attr("src"))
                .attr("alt", element.attr("alt") || "Photographie agrandie");

            /*
             * Bootstrap 5 n'utilise plus la méthode jQuery .modal().
             * On utilise donc l'API JavaScript de Bootstrap.
             */
            const modal = bootstrap.Modal.getOrCreateInstance(lightbox);
            modal.show();
        },

        getVisibleImages(gallery) {
            return gallery
                .find(".item-column:visible img.gallery-item")
                .toArray();
        },

        changeImage(gallery, lightboxId, direction) {
            const lightbox = $(`#${lightboxId}`);
            const currentSource = lightbox
                .find(".lightboxImage")
                .attr("src");

            const visibleImages =
                $.fn.mauGallery.methods.getVisibleImages(gallery);

            if (visibleImages.length === 0) {
                return;
            }

            let currentIndex = visibleImages.findIndex(function (image) {
                return $(image).attr("src") === currentSource;
            });

            if (currentIndex === -1) {
                currentIndex = 0;
            }

            let newIndex = currentIndex + direction;

            if (newIndex < 0) {
                newIndex = visibleImages.length - 1;
            }

            if (newIndex >= visibleImages.length) {
                newIndex = 0;
            }

            const newImage = $(visibleImages[newIndex]);

            lightbox
                .find(".lightboxImage")
                .attr("src", newImage.attr("src"))
                .attr(
                    "alt",
                    newImage.attr("alt") || "Photographie agrandie"
                );
        },

        createLightBox(gallery, lightboxId, navigation) {
            const id = lightboxId || "galleryLightbox";

            if (document.getElementById(id)) {
                return;
            }

            const previousButton = navigation
                ? `
                    <button
                        type="button"
                        class="mg-prev"
                        aria-label="Afficher l'image précédente"
                    >
                        &lt;
                    </button>
                `
                : "";

            const nextButton = navigation
                ? `
                    <button
                        type="button"
                        class="mg-next"
                        aria-label="Afficher l'image suivante"
                    >
                        &gt;
                    </button>
                `
                : "";

            gallery.append(`
                <div
                    class="modal fade"
                    id="${id}"
                    tabindex="-1"
                    aria-hidden="true"
                >
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">

                            <div class="modal-header">
                                <button
                                    type="button"
                                    class="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Fermer"
                                ></button>
                            </div>

                            <div class="modal-body position-relative">

                                ${previousButton}

                                <img
                                    class="lightboxImage img-fluid"
                                    src=""
                                    alt="Photographie agrandie"
                                >

                                ${nextButton}

                            </div>

                        </div>
                    </div>
                </div>
            `);
        },

        showItemTags(gallery, position, tags) {
            let tagItems = `
                <li class="nav-item">
                    <button
                        type="button"
                        class="nav-link active active-tag"
                        data-images-toggle="all"
                    >
                        Tous
                    </button>
                </li>
            `;

            $.each(tags, function (_, value) {
                tagItems += `
                    <li class="nav-item">
                        <button
                            type="button"
                            class="nav-link"
                            data-images-toggle="${value}"
                        >
                            ${value}
                        </button>
                    </li>
                `;
            });

            const tagsRow = `
                <ul class="my-4 tags-bar nav nav-pills">
                    ${tagItems}
                </ul>
            `;

            if (position === "bottom") {
                gallery.append(tagsRow);
            } else if (position === "top") {
                gallery.prepend(tagsRow);
            } else {
                console.error(
                    `Position des filtres inconnue : ${position}`
                );
            }
        },

        filterByTag() {
            const button = $(this);
            const gallery = button.closest(".gallery");

            if (button.hasClass("active-tag")) {
                return;
            }

            gallery
                .find(".active-tag")
                .removeClass("active active-tag");

            button.addClass("active active-tag");

            const tag = button.data("images-toggle");

            gallery.find(".gallery-item").each(function () {
                const image = $(this);
                const column = image.closest(".item-column");

                if (
                    tag === "all" ||
                    image.data("gallery-tag") === tag
                ) {
                    column.show(300);
                } else {
                    column.hide();
                }
            });
        }
    };
})(jQuery);