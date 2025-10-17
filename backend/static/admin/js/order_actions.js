document.addEventListener('DOMContentLoaded', function() {
    // Обработчик для завершения заказа
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('complete-btn')) {
            e.preventDefault();
            const button = e.target;
            const orderId = button.dataset.orderId;
            const url = button.dataset.url;

            if (confirm('Вы уверены, что хотите завершить этот заказ?')) {
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert(data.message);
                            // Обновляем страницу или удаляем строку
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

    // Обработчик для добавления в корпоративные
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('corporate-btn')) {
            e.preventDefault();
            const button = e.target;
            const orderId = button.dataset.orderId;
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
});