import api from "./api";

// Auth API calls - Mobile endpoints with persistent login
export const authService = {
  // Mobile-specific auth endpoints
  login(credentials) {
    return api.post("/auth/login", credentials);
  },

  autoLogin(deviceToken) {
    return api.post("/auth/auto-login", { device_token: deviceToken });
  },
  logout() {
    return api.post("/auth/logout");
  },
  refreshToken(deviceToken) {
    return api.post("/auth/refresh-token", {
      device_token: deviceToken,
    });
  },

  // Profile & Registration
  register(userData) {
    return api.post("/auth/register", userData);
  },
  me() {
    return api.get("/auth/me");
  },
  updateProfile(data) {
    return api.put("/auth/profile", data);
  },
  changePassword(data) {
    return api.post("/auth/change-password", data);
  },
  forgotPassword(email) {
    return api.post("/auth/forgot-password", { email });
  },
  resetPassword(data) {
    return api.post("/auth/reset-password", data);
  },

  // -- REAL OTP FLOW --
  startOtp(identifier) {
    return api.post("/auth/otp/start", { identifier });
  },

  verifyOtp(identifier, code) {
    return api.post("/auth/otp/verify", { identifier, code });
  },
};

// Dashboard API calls
export const dashboardService = {
  getStats() {
    return api.get("/patron/dashboard/stats");
  },
  getPointsBalance() {
    return api.get("/patron/points/balance");
  },
  getLeaderboard(params) {
    return api.get("/patron/leaderboard", { params });
  },
  getAchievements() {
    return api.get("/patron/achievements");
  },
};

// Kiosks/Stations API calls
export const kioskService = {
  getAll(params) {
    return api.get("/kiosks", { params });
  },
  getByCode(code) {
    return api.get(`/kiosks/${code}`);
  },
  getById(id) {
    return api.get(`/kiosks/id/${id}`);
  },
  getStatus(code) {
    return api.get(`/kiosks/status/${code}`);
  },
};

// Charging API calls
export const chargingService = {
  getActiveSession() {
    return api.get("/charging/active");
  },
  redeemPoints(points, kioskCode, portNumber, sessionId = null) {
    return api.post("/charging/redeem", {
      points,
      kiosk_code: kioskCode,
      port_number: portNumber,
      session_id: sessionId,
    });
  },
  cancelSession(sessionId) {
    return api.post("/charging/cancel", {
      session_id: sessionId,
    });
  },
  getHistory(params) {
    return api.get("/charging/history", { params });
  },
  activatePort(points, kioskCode, port) {
    return api.post("/ports/activate", {
      points,
      kiosk_code: kioskCode,
      port_number: port
    });
  },
};

// Points API calls
export const pointsService = {
  getBalance() {
    return api.get("/patron/points/balance");
  },
  getTransactions(params) {
    return api.get("/patron/points/transactions", { params });
  },
};
