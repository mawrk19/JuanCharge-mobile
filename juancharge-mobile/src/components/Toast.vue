<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" class="toast-container" :class="type">
        <div class="toast-content">
          <div class="toast-icon">
            <span class="material-icons">{{ icon }}</span>
          </div>
          <div class="toast-text">
            <h4 v-if="title">{{ title }}</h4>
            <p>{{ message }}</p>
          </div>
          <button class="toast-close" @click="close">
            <span class="material-icons">close</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  message: String,
  title: String,
  type: {
    type: String,
    default: "info", // success, error, warning, info
  },
  duration: {
    type: Number,
    default: 3000,
  },
  show: Boolean,
});

const emit = defineEmits(["close"]);

const visible = ref(props.show);
let timeout = null;

const icon = computed(() => {
  const icons = {
    success: "check_circle",
    error: "error",
    warning: "warning",
    info: "info",
  };
  return icons[props.type] || "info";
});

watch(
  () => props.show,
  (newVal) => {
    visible.value = newVal;
    if (newVal && props.duration > 0) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        close();
      }, props.duration);
    }
  }
);

const close = () => {
  visible.value = false;
  emit("close");
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  max-width: 400px;
  width: calc(100% - 40px);
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

.toast-container.success .toast-content {
  border-left-color: #4caf50;
}

.toast-container.error .toast-content {
  border-left-color: #f44336;
}

.toast-container.warning .toast-content {
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

.toast-container.success .toast-icon {
  background: #e8f5e9;
  color: #4caf50;
}

.toast-container.error .toast-icon {
  background: #ffebee;
  color: #f44336;
}

.toast-container.warning .toast-icon {
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
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
