import { ref } from "vue";

const toasts = ref([]);
let idCounter = 0;

export function useToast() {
  const showToast = ({ message, title, type = "info", duration = 3000 }) => {
    const id = idCounter++;
    const toast = {
      id,
      message,
      title,
      type,
      duration,
      show: true,
    };

    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (message, title = "Success") => {
    return showToast({ message, title, type: "success" });
  };

  const error = (message, title = "Error") => {
    return showToast({ message, title, type: "error" });
  };

  const warning = (message, title = "Warning") => {
    return showToast({ message, title, type: "warning" });
  };

  const info = (message, title = "") => {
    return showToast({ message, title, type: "info" });
  };

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
