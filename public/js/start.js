const buttons = document.querySelectorAll('.genre-btn');
        const hiddenInput = document.getElementById('selectedGenres');
        const form = document.getElementById('genreForm');
    
        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            btn.classList.toggle('active');
          });
        });
    
        form.addEventListener('submit', function (e) {
          const selected = [...document.querySelectorAll('.genre-btn.active')].map(btn => btn.dataset.genre);
          if (selected.length < 3) {
            alert('กรุณาเลือกอย่างน้อย 3 หมวดหมู่');
            e.preventDefault();
            return;
          }
          hiddenInput.value = JSON.stringify(selected);
        });