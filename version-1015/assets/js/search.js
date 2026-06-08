document.addEventListener("DOMContentLoaded", function () {
    var movies = window.__SEARCH_MOVIES__ || [];
    var input = document.getElementById("searchInput");
    var typeSelect = document.getElementById("searchType");
    var yearSelect = document.getElementById("searchYear");
    var results = document.getElementById("searchResults");
    var title = document.getElementById("searchTitle");

    if (!input || !typeSelect || !yearSelect || !results) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    Array.from(new Set(movies.map(function (movie) { return movie.type; }).filter(Boolean))).sort().forEach(function (type) {
        var option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });

    Array.from(new Set(movies.map(function (movie) { return movie.year; }).filter(Boolean))).sort().reverse().slice(0, 40).forEach(function (year) {
        var option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    var escapeText = function (value) {
        return String(value || "").replace(/[&<>"']/g, function (item) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[item];
        });
    };

    var card = function (movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeText(tag) + "</span>";
        }).join("");

        return [
            "<article class=\"movie-card\">",
            "<a href=\"" + escapeText(movie.url) + "\" class=\"movie-card-link\">",
            "<div class=\"poster-wrap\">",
            "<img src=\"./" + escapeText(movie.cover) + ".jpg\" alt=\"" + escapeText(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-badge\">" + escapeText(movie.type || movie.category) + "</span>",
            "<span class=\"poster-score\">" + escapeText(movie.score) + "</span>",
            "</div>",
            "<div class=\"movie-card-body\">",
            "<h3>" + escapeText(movie.title) + "</h3>",
            "<p class=\"movie-meta\">" + escapeText(movie.year) + " · " + escapeText(movie.region) + " · " + escapeText(movie.genre) + "</p>",
            "<p class=\"movie-desc\">" + escapeText(movie.oneLine || movie.summary) + "</p>",
            "<div class=\"tag-list compact\">" + tags + "</div>",
            "</div>",
            "</a>",
            "</article>"
        ].join("");
    };

    var render = function () {
        var keyword = input.value.trim().toLowerCase();
        var type = typeSelect.value;
        var year = yearSelect.value;

        var filtered = movies.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                (movie.tags || []).join(" "),
                movie.oneLine,
                movie.summary
            ].join(" ").toLowerCase();
            var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchesType = !type || movie.type === type;
            var matchesYear = !year || movie.year === year;
            return matchesKeyword && matchesType && matchesYear;
        });

        var visible = filtered.slice(0, 96);
        title.textContent = keyword || type || year ? "搜索结果" : "热门影视";
        results.innerHTML = visible.length ? visible.map(card).join("") : "<div class=\"empty-results\">暂无匹配影片，请尝试其他关键词</div>";
    };

    input.addEventListener("input", render);
    typeSelect.addEventListener("change", render);
    yearSelect.addEventListener("change", render);
    render();
});
