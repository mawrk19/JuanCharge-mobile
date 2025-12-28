<template>
  <div class="fab-container" v-if="isActive">
    <div
      class="pill-wrapper shadow-lg"
      :class="{ expanded: isExpanded }"
      :style="{ '--timer-color': timerColor }"
    >
      <!-- Circular Progress (visible in both states but moves) -->
      <div class="progress-container" @click="toggleExpand">
        <svg class="progress-ring" width="48" height="48">
          <circle
            class="progress-ring-bg"
            stroke="rgba(255, 255, 255, 0.15)"
            stroke-width="3"
            fill="transparent"
            r="20"
            cx="24"
            cy="24"
          />
          <circle
            class="progress-ring-circle"
            :stroke="timerColor"
            stroke-width="3"
            stroke-linecap="round"
            fill="transparent"
            r="20"
            cx="24"
            cy="24"
            :style="{
              strokeDashoffset: progressOffset,
              strokeDasharray: circumference,
            }"
          />
        </svg>
        <div class="center-icon">
          <span class="material-icons" v-if="!isExpanded">bolt</span>
          <span class="material-icons" v-else>close</span>
        </div>
      </div>

      <!-- Expanded Content -->
      <transition name="fade">
        <div v-if="isExpanded" class="expanded-actions">
          <div class="time-block">
            <span class="time-val">{{ timeMinutes }}</span>
            <span class="time-unit">min left</span>
          </div>

          <div class="divider"></div>

          <button
            class="action-btn add-btn"
            @click="handleAddTime"
            :disabled="loading"
          >
            <span class="material-icons">add_circle</span>
            <span>Add</span>
          </button>

          <button
            class="action-btn end-btn"
            @click="handleEndSession"
            :disabled="loading"
          >
            <span class="material-icons">stop_circle</span>
            <span>Stop</span>
          </button>
        </div>
      </transition>

      <!-- Minimized Label (small time indicator below or inside) -->
      <div v-if="!isExpanded" class="mini-label">{{ timeMinutes }}m</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { sessionState, checkActiveSession } from "@/services/sessionState";
import { chargingService } from "@/services/apiServices";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const toast = useToast();
const isExpanded = ref(false);
const loading = ref(false);

const isActive = computed(() => !!sessionState.activeSession);
const circumference = 2 * Math.PI * 20;

const timeMinutes = computed(() => {
  return Math.floor(sessionState.remainingSeconds / 60);
});

const progressOffset = computed(() => {
  if (sessionState.totalSeconds === 0) return 0;
  const percent =
    (sessionState.remainingSeconds / sessionState.totalSeconds) * 100;
  return circumference - (percent / 100) * circumference;
});

const timerColor = computed(() => {
  const percent =
    sessionState.totalSeconds > 0
      ? (sessionState.remainingSeconds / sessionState.totalSeconds) * 100
      : 100;
  if (percent > 50) return "#4caf50";
  if (percent > 20) return "#ff9800";
  return "#f44336";
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const handleAddTime = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const portId =
      sessionState.activeSession.kiosk_id || sessionState.activeSession.port_id;
    await chargingService.redeemPoints(1, portId);
    toast.success("Time extended!");
    await checkActiveSession();
  } catch (err) {
    toast.error("Error extending time.");
  } finally {
    loading.value = false;
  }
};

const handleEndSession = async () => {
  if (loading.value) return;
  if (!confirm("Stop charging session?")) return;

  loading.value = true;
  try {
    const sessionId =
      sessionState.activeSession.active_session_id ||
      sessionState.activeSession.id;
    await chargingService.cancelSession(sessionId);
    toast.success("Session ended.");
    await checkActiveSession();
    isExpanded.value = false;
  } catch (err) {
    toast.error("Error ending session.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.fab-container {
  position: fixed;
  bottom: 85px; /* Above bottom nav */
  right: 16px;
  z-index: 9999;
}

.pill-wrapper {
  background: rgba(33, 33, 33, 0.95);
  backdrop-filter: blur(10px);
  height: 56px;
  width: 56px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.pill-wrapper.expanded {
  width: 280px;
  border-radius: 16px;
  background: #1a1a1a;
  padding-right: 8px;
}

.progress-container {
  min-width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  z-index: 2;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.35s, stroke 0.3s;
}

.center-icon {
  position: absolute;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-icon .material-icons {
  font-size: 20px;
}

/* Expanded Content */
.expanded-actions {
  display: flex;
  align-items: center;
  height: 100%;
  flex: 1;
  padding-left: 4px;
}

.time-block {
  display: flex;
  flex-direction: column;
  line-height: 1;
  min-width: 50px;
}

.time-val {
  font-size: 18px;
  font-weight: 800;
  color: white;
}

.time-unit {
  font-size: 9px;
  color: #aaa;
  text-transform: uppercase;
  font-weight: 600;
}

.divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 12px;
}

.action-btn {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: white;
  padding: 4px 8px;
  cursor: pointer;
  transition: opacity 0.2s;
  flex: 1;
}

.action-btn:active {
  opacity: 0.6;
}

.action-btn span {
  font-size: 10px;
  font-weight: 600;
}

.action-btn .material-icons {
  font-size: 22px;
}

.add-btn {
  color: #4caf50;
}

.end-btn {
  color: #f44336;
}

.mini-label {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  font-weight: 800;
  color: white;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.shadow-lg {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
</style>
