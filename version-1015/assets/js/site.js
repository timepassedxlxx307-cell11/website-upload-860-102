document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        var setSlide = function (nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        };

        var start = function () {
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5600);
        };

        var restart = function () {
            window.clearInterval(timer);
            start();
        };

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                setSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                setSlide(index + 1);
                restart();
            });
        }

        if (slides.length > 1) {
            start();
        }
    }

    document.querySelectorAll("[data-scroll-target]").forEach(function (button) {
        button.addEventListener("click", function () {
            var target = document.getElementById(button.getAttribute("data-scroll-target"));
            var direction = button.getAttribute("data-scroll-direction") === "left" ? -1 : 1;
            if (target) {
                target.scrollBy({
                    left: direction * Math.round(target.clientWidth * 0.85),
                    behavior: "smooth"
                });
            }
        });
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
        var keywordInput = panel.querySelector("[data-filter-keyword]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var grid = panel.parentElement.querySelector("[data-filter-grid]");

        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

        var applyFilter = function () {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year")
                ].join(" ").toLowerCase();
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesType = !type || card.getAttribute("data-type") === type;
                var matchesYear = !year || card.getAttribute("data-year") === year;
                card.classList.toggle("is-filter-hidden", !(matchesKeyword && matchesType && matchesYear));
            });
        };

        [keywordInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
    });
});
