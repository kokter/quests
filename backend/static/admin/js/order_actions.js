document.addEventListener('DOMContentLoaded', function() {
    // --- Завершение заказа ---
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('complete-btn')) {
            e.preventDefault();
            const button = e.target;
            const url = button.dataset.url;

            if (confirm('Вы уверены, что хотите завершить этот заказ?')) {
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert(data.message);
                            location.reload();
                        } else {
                            alert('Ошибка: ' + data.message);
                        }
                    })
                    .catch(error => {
                        alert('Ошибка: ' + error);
                    });
            }
        }
    });

    // --- Добавление в корпоративные ---
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('corporate-btn')) {
            e.preventDefault();
            const button = e.target;
            const url = button.dataset.url;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert(data.message);
                    } else {
                        alert('Ошибка: ' + data.message);
                    }
                })
                .catch(error => {
                    alert('Ошибка: ' + error);
                });
        }
    });

    // --- Отмена заказа ---
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('cancel-btn')) {
            e.preventDefault();
            const button = e.target;
            const url = button.dataset.url;

            if (confirm('Вы уверены, что хотите отменить этот заказ?')) {
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert(data.message);
                        // Удаляем строку без перезагрузки (аккуратно)
                        const row = button.closest('tr');
                        if (row) row.remove();
                    } else {
                        alert('Ошибка: ' + data.message);
                    }
                })
                .catch(error => {
                    alert('Ошибка: ' + error);
                });
            }
        }
    });

    // --- Функция получения CSRF-токена ---
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
