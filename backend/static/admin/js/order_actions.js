document.addEventListener("DOMContentLoaded", function () {
  injectNotificationStyles();

  document.addEventListener("click", async function (e) {
    if (e.target.classList.contains("complete-btn")) {
      e.preventDefault();
      const button = e.target;
      const url = button.dataset.url;

      const confirmed = await showConfirm("Подтвердить закрытие заказа?");
      if (!confirmed) return;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          showNotification(data.message, "success");
          setTimeout(() => location.reload(), 800);
        } else {
          showNotification("Ошибка: " + (data.message || "Не удалось выполнить действие"), "error");
        }
      } catch (error) {
        showNotification("Ошибка: " + error, "error");
      }
    }
  });

  document.addEventListener("click", async function (e) {
    if (e.target.classList.contains("corporate-btn")) {
      e.preventDefault();
      const url = e.target.dataset.url;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          showNotification(data.message, "success");
        } else {
          showNotification("Ошибка: " + (data.message || "Не удалось выполнить действие"), "error");
        }
      } catch (error) {
        showNotification("Ошибка: " + error, "error");
      }
    }
  });

  document.addEventListener("click", async function (e) {
    if (e.target.classList.contains("cancel-btn")) {
      e.preventDefault();
      const button = e.target;
      const url = button.dataset.url;

      const confirmed = await showConfirm("Подтвердить отмену заказа?");
      if (!confirmed) return;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "X-CSRFToken": getCookie("csrftoken"),
          },
        });
        const data = await response.json();
        if (data.success) {
          showNotification(data.message, "success");
          const row = button.closest("tr");
          if (row) row.remove();
        } else {
          showNotification("Ошибка: " + (data.message || "Не удалось выполнить действие"), "error");
        }
      } catch (error) {
        showNotification("Ошибка: " + error, "error");
      }
    }
  });

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  function injectNotificationStyles() {
    if (document.getElementById("custom-admin-styles")) return;
    const style = document.createElement("style");
    style.id = "custom-admin-styles";
    style.textContent = `
      .admin-toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 4000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .admin-toast {
        min-width: 280px;
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        color: #fff;
        font-size: 14px;
        animation: fade-in 0.15s ease-out;
      }
      .admin-toast--success { background: #3f9142; }
      .admin-toast--error { background: #bb1f1f; }
      .admin-toast--info { background: #2f6fad; }
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .admin-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3999;
      }
      .admin-modal {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        width: 90%;
        max-width: 360px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        text-align: center;
      }
      .admin-modal h4 {
        margin: 0 0 12px;
        font-size: 18px;
      }
      .admin-modal p {
        margin: 0 0 16px;
        color: #333;
      }
      .admin-modal button {
        margin: 0 6px;
        padding: 8px 14px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .admin-modal button.confirm {
        background: #bb1f1f;
        color: #fff;
      }
      .admin-modal button.cancel {
        background: #e0e0e0;
      }
    `;
    document.head.appendChild(style);
  }

  function showNotification(message, type = "info") {
    let container = document.querySelector(".admin-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "admin-toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `admin-toast admin-toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  }

  function showConfirm(message) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "admin-modal-overlay";

      const modal = document.createElement("div");
      modal.className = "admin-modal";
      modal.innerHTML = `
        <h4>Подтверждение</h4>
        <p>${message}</p>
        <div>
          <button class="confirm">Подтвердить</button>
          <button class="cancel">Отмена</button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      const cleanup = (result) => {
        overlay.remove();
        resolve(result);
      };

      modal.querySelector(".confirm").addEventListener("click", () => cleanup(true));
      modal.querySelector(".cancel").addEventListener("click", () => cleanup(false));
    });
  }
});
