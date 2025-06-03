import { ref } from "vue";

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

const toasts = ref<ToastMessage[]>([]);
let toastId = 0;

export function useToast() {
  const showToast = (
    message: string,
    type: ToastMessage["type"] = "info",
    duration = 3000
  ) => {
    const id = toastId++;
    toasts.value.push({ id, message, type });

    // Auto-eliminar el toast después de la duración especificada
    setTimeout(() => {
      toasts.value = toasts.value.filter((toast) => toast.id !== id);
    }, duration);
  };

  // Función para eliminar un toast manualmente (por ejemplo, al hacer clic en él)
  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  };

  return {
    toasts, // El estado reactivo de todos los toasts
    success: (message: string, duration?: number) =>
      showToast(message, "success", duration),
    error: (message: string, duration?: number) =>
      showToast(message, "error", duration),
    info: (message: string, duration?: number) =>
      showToast(message, "info", duration),
    removeToast, // Función para eliminar toasts
  };
}
