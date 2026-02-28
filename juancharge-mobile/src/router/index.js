import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Map from "../views/Map.vue";
import ScanQR from "../views/ScanQR.vue";
import Achievements from "../views/Achievements.vue";
import Settings from "../views/Settings.vue";
import Login from "../views/Login.vue";
import Leaderboards from "../views/Leaderboards.vue";
import EditProfile from "../views/EditProfile.vue";
import HelpCenter from "../views/HelpCenter.vue";
import About from "../views/About.vue";
import History from "../views/History.vue";

import Splash from "../views/Splash.vue";
import GetStarted from "../views/GetStarted.vue";
import AccountSetup from "../views/AccountSetup.vue";
import { secureStorage } from "../services/secureStorage";

const routes = [
  {
    path: "/",
    name: "Splash",
    component: Splash,
    meta: { title: "Loading..." },
  },
  {
    path: "/get-started",
    name: "GetStarted",
    component: GetStarted,
    meta: { title: "Get Started", requiresGuest: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { title: "Login", requiresGuest: true },
  },
  {
    path: "/account-setup",
    name: "AccountSetup",
    component: AccountSetup,
    meta: { title: "Complete Profile", requiresAuth: true },
  },

  {
    path: "/home",
    name: "Home",
    component: Home,
    meta: { title: "Home", requiresAuth: true },
  },
  {
    path: "/map",
    name: "Map",
    component: Map,
    meta: { title: "Map", requiresAuth: true },
  },
  {
    path: "/scan",
    name: "Scan",
    component: ScanQR,
    meta: { title: "Scan QR", requiresAuth: true },
  },
  {
    path: "/achievements",
    name: "Achievements",
    component: Achievements,
    meta: { title: "Achievements", requiresAuth: true },
  },
  {
    path: "/leaderboards",
    name: "Leaderboards",
    component: Leaderboards,
    meta: { title: "Leaderboards", requiresAuth: true },
  },
  {
    path: "/history",
    name: "History",
    component: History,
    meta: { title: "History", requiresAuth: true },
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    meta: { title: "Settings", requiresAuth: true },
  },
  {
    path: "/settings/edit-profile",
    name: "EditProfile",
    component: EditProfile,
    meta: { title: "Edit Profile", requiresAuth: true },
  },
  {
    path: "/help",
    name: "HelpCenter",
    component: HelpCenter,
    meta: { title: "Help Center", requiresAuth: true },
  },
  {
    path: "/about",
    name: "About",
    component: About,
    meta: { title: "About JuanCharge", requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication using secure storage
router.beforeEach(async (to, from, next) => {
  // Allow access to splash screen without checks
  if (to.path === "/") {
    next();
    return;
  }

  const apiToken = await secureStorage.getApiToken();
  const userData = await secureStorage.getUserData();

  // Check if route requires authentication
  if (to.meta.requiresAuth && !apiToken) {
    next("/login");
  }
  // Check if route requires guest (already logged in users shouldn't access)
  else if (to.meta.requiresGuest && apiToken) {
    // If logged in, ensure profile is complete
    if (!userData?.first_name || !userData?.last_name) {
      next("/account-setup");
    } else {
      next("/home");
    }
  } 
  // Redirect to account setup if profile is incomplete and user is authenticated
  else if (apiToken && !userData?.first_name && to.path !== "/account-setup" && to.meta.requiresAuth) {
    next("/account-setup");
  }
  else {
    next();
  }
});

export default router;
