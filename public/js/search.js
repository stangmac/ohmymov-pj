async function searchMovies() {
    let input = document.querySelector('.search-input').value.toLowerCase();
    let resultsContainer = document.getElementById('searchResults');

    if (input.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`/search?query=${input}`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            resultsContainer.innerHTML = `<div class="see-all">No results found</div>`;
        } else {
            resultsContainer.innerHTML = data.results.map((movie, index) => {
                let poster = movie.poster_url ? movie.poster_url : '/images/default-movie.png';
                return `
                <div class="result-item ${index === 0 ? 'selected' : ''}" onclick="goToMovieDetail('${movie.id}')">
                    <img src="${poster}" alt="${movie.title}" class="search-thumb">
                    <div class="result-text">
                        <span class="result-title">${movie.title}</span>
                        <span class="result-year">${movie.year || 'N/A'}</span>
                    </div>
                </div>
            `;
            }).join('') + `
                <div class="see-all" onclick="goToFullResult('${input}')">
                    See all results for "${input}"
                </div>
            `;
        }

        resultsContainer.style.display = 'block';
    } catch (error) {
        console.error("❌ Error fetching search results:", error);
        resultsContainer.innerHTML = `<div class="see-all">Error fetching results</div>`;
    }
}

// ✅ ไปหน้ารายละเอียดหนัง
function goToMovieDetail(movieId) {
    window.location.href = `/movie-detail?id=${movieId}`;
}

// ✅ ไปหน้าผลลัพธ์ทั้งหมด
function goToFullResult(query) {
    window.location.href = `/result-search?query=${encodeURIComponent(query)}`;
}

// ✅ แสดงผลลัพธ์เมื่อ Focus ที่ช่องค้นหา
function showResults() {
    if (document.querySelector('.search-input').value.length > 0) {
        document.getElementById('searchResults').style.display = 'block';
    }
}

// ✅ คลิกนอกพื้นที่ให้ปิดผลลัพธ์
document.addEventListener('click', function (event) {
    let searchContainer = document.querySelector('.search-container');
    if (!searchContainer.contains(event.target)) {
        document.getElementById('searchResults').style.display = 'none';
    }
});

// ✅ ใช้แป้นพิมพ์เลื่อนผลลัพธ์ (Arrow Up/Down) และเลือกหนัง (Enter)
document.addEventListener('keydown', function (event) {
    let resultsContainer = document.getElementById('searchResults');
    let items = document.querySelectorAll('.result-item');
    let selected = document.querySelector('.result-item.selected');

    if (!resultsContainer.style.display || resultsContainer.style.display === 'none') return;

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (selected) {
            let next = selected.nextElementSibling;
            if (next && next.classList.contains('result-item')) {
                selected.classList.remove('selected');
                next.classList.add('selected');
            }
        } else if (items.length > 0) {
            items[0].classList.add('selected');
        }
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (selected) {
            let prev = selected.previousElementSibling;
            if (prev && prev.classList.contains('result-item')) {
                selected.classList.remove('selected');
                prev.classList.add('selected');
            }
        }
    } else if (event.key === 'Enter' && selected) {
        goToMovieDetail(selected.getAttribute("onclick").match(/'([^']+)'/)[1]);
    }
});