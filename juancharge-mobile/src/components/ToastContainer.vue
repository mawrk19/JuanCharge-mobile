<template>
  <Teleport to="body">
    <div class="toast-wrapper">
      <TransitionGroup name="toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :class="toast.type"
        >
          <div class="toast-content">
            <div class="toast-icon">
              <span class="material-icons">{{ getIcon(toast.type) }}</span>
            </div>
            <div class="toast-text">
              <h4 v-if="toast.title">{{ toast.title }}</h4>
              <p>{{ toast.message }}</p>
            </div>
            <button class="toast-close" @click="removeToast(toast.id)">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from "@/composables/useToast";

const { toasts, removeToast } = useToast();

const getIcon = (type) => {
  const icons = {
    success: "check_circle",
    error: "error",
    warning: "warning",
    info: "info",
  };
  return icons[type] || "info";
};
</script>

<style scoped>
.toast-wrapper {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast-item {
  max-width: 400px;
  width: calc(100vw - 40px);
  pointer-events: auto;
}

.toast-content {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #2196f3;
}

.toast-item.success .toast-content {
  border-left-color: #4caf50;
}

.toast-item.error .toast-content {
  border-left-color: #f44336;
}

.toast-item.warning .toast-content {
  border-left-color: #ff9800;
}

.toast-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd;
  color: #2196f3;
}

.toast-item.success .toast-icon {
  background: #e8f5e9;
  color: #4caf50;
}

.toast-item.error .toast-icon {
  background: #ffebee;
  color: #f44336;
}

.toast-item.warning .toast-icon {
  background: #fff3e0;
  color: #ff9800;
}

.toast-text {
  flex: 1;
}

.toast-text h4 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: #333;
}

.toast-text p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  border-radius: 50%;
  transition: all 0.2s;
}

.toast-close:hover {
  background: #f5f5f5;
  color: #333;
}

.toast-close .material-icons {
  font-size: 18px;
}

/* Animations */
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.toast-list-move {
  transition: transform 0.3s ease;
}
</style>
