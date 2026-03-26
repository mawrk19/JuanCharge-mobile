<template>
  <div class="account-setup-page">
    <div class="setup-container">
      <!-- Welcome Header -->
      <div class="setup-header">
        <div class="icon-wrapper">
          <span class="material-icons setup-icon">person_add</span>
        </div>
        <h1>Complete Your Profile</h1>
        <p>Welcome to JuanCharge! Please tell us a bit more about yourself to get started.</p>
      </div>

      <!-- Setup Form -->
      <div class="form-card">
        <form @submit.prevent="handleSetup">
          <div class="form-section">
            <label>First Name</label>
            <div class="input-wrapper">
              <span class="material-icons field-icon">person_outline</span>
              <input
                v-model="form.first_name"
                type="text"
                placeholder="Enter your first name"
                required
                :disabled="loading"
              />
            </div>
          </div>

          <div class="form-section">
            <label>Last Name</label>
            <div class="input-wrapper">
              <span class="material-icons field-icon">person</span>
              <input
                v-model="form.last_name"
                type="text"
                placeholder="Enter your last name"
                required
                :disabled="loading"
              />
            </div>
          </div>



          <!-- Terms and Agreement Checkbox -->
          <div class="form-section terms-section">
            <label class="checkbox-container">
              <input type="checkbox" v-model="form.accepted_terms" required />
              <span class="checkmark"></span>
              <span class="terms-text">
                I agree to the <a href="#" @click.prevent="showTerms">Terms of Service</a> and <a href="#" @click.prevent="showPrivacy">Privacy Policy</a>
              </span>
            </label>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button type="submit" class="submit-btn" :disabled="loading || !form.accepted_terms">
            <span v-if="loading" class="material-icons spin">refresh</span>
            <span v-else>Finish Setup</span>
          </button>
        </form>
      </div>

      <!-- Skip / Logout Option -->
      <div class="footer-actions">
        <button class="logout-link" @click="handleLogout">
          Not you? Sign out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/apiServices";
import { secureStorage } from "@/services/secureStorage";
import { normalizeAuthUser } from "@/services/authUser";
import Swal from "sweetalert2";

const router = useRouter();
const loading = ref(false);
const error = ref(null);

const form = reactive({
  first_name: "",
  last_name: "",
  phone: "",
  accepted_terms: false,
});

onMounted(async () => {
    // Pre-fill if some data already exists
    const userData = await secureStorage.getUserData();
    if (userData) {
        form.first_name = userData.first_name || "";
        form.last_name = userData.last_name || "";
        form.phone = userData.phone || userData.phone_number || "";
    }
});

const showTerms = () => {
  Swal.fire({
    title: "Terms of Service",
    html: `
      <div style="text-align: left; max-height: 400px; overflow-y: auto; font-size: 14px; line-height: 1.6; padding: 0 5px;">
        <p><strong>Last Updated: March 26, 2026</strong></p>
        <p>Welcome to JuanCharge. These Terms of Service ("Terms") govern your use of the JuanCharge mobile application and the associated IoT-integrated smart kiosks (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.</p>
        
        <h4>1. Acceptance of Terms</h4>
        <p>By creating an account or using a JuanCharge kiosk, you confirm that you have read, understood, and agree to these Terms. If you do not agree, please do not use the Service.</p>
        
        <h4>2. Description of Service</h4>
        <p>JuanCharge provides an automated recycling and charging solution. Users may deposit eligible plastic bottles or aluminum cans into designated kiosks to receive mobile charging credits or other incentives as defined within the app.</p>
        
        <h4>3. User Accounts</h4>
        <ul>
            <li><strong>Registration:</strong> You must provide accurate and complete information when creating an account.</li>
            <li><strong>Security:</strong> You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</li>
            <li><strong>Eligibility:</strong> You must be at least 13 years of age to use this Service.</li>
        </ul>

        <h4>4. Proper Use of Kiosks</h4>
        <ul>
            <li><strong>Eligible Materials:</strong> Only empty, uncrushed plastic bottles and aluminum cans are accepted.</li>
            <li><strong>Prohibited Items:</strong> Users must not attempt to deposit glass, paper, liquids, hazardous materials, or any items not explicitly supported by the kiosk.</li>
            <li><strong>Vandalism:</strong> Any attempt to tamper with, damage, or bypass the hardware/software of a JuanCharge kiosk is strictly prohibited and may result in legal action.</li>
        </ul>

        <h4>5. Incentive Credits</h4>
        <ul>
            <li><strong>Earning:</strong> Credits are issued based on the successful validation of recycled materials by the IoT system.</li>
            <li><strong>Redemption:</strong> Credits are non-transferable and have no cash value outside of the JuanCharge ecosystem.</li>
            <li><strong>Expiration:</strong> We reserve the right to set expiration dates on promotional credits, which will be communicated via the app.</li>
        </ul>

        <h4>6. Privacy & Data Collection</h4>
        <p>Your use of the Service is also governed by our Privacy Policy. We collect data necessary for the functionality of the smart kiosks, including recycling history and charging sessions, to improve our environmental impact reporting.</p>

        <h4>7. Limitation of Liability</h4>
        <p>JuanCharge and its development team (JuanThugs) shall not be liable for:</p>
        <ul>
            <li>Damage to mobile devices resulting from faulty user cables or improper connection to the kiosk.</li>
            <li>Loss of credits due to unauthorized account access.</li>
            <li>Service interruptions caused by kiosk maintenance or connectivity issues.</li>
        </ul>

        <h4>8. Termination</h4>
        <p>We reserve the right to suspend or terminate your access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or the Service itself.</p>

        <h4>9. Changes to Terms</h4>
        <p>We may update these Terms from time to time. We will notify you of any changes by posting the new Terms within the mobile application. Your continued use of the app after such changes constitutes acceptance of the new Terms.</p>

        <h4>10. Contact Information</h4>
        <p>If you have any questions regarding these Terms, please contact the JuanCharge support team through the "Help" section of the mobile app. Leo.</p>
      </div>
    `,
    confirmButtonColor: "#42b883",
  });
};

const showPrivacy = () => {
  Swal.fire({
    title: "Privacy Policy",
    html: `
      <div style="text-align: left; max-height: 300px; overflow-y: auto; font-size: 14px;">
        <p>We value your privacy. Your data is used only to provide and improve our services.</p>
        <p>We collect location data to help you find charging stations near you.</p>
        <p>Your payment information is securely processed through licensed third-party providers (PayMongo, etc.).</p>
      </div>
    `,
    confirmButtonColor: "#42b883",
  });
};

const handleSetup = async () => {
  if (!form.first_name || !form.last_name) {
    error.value = "Please enter your full name";
    return;
  }

  if (!form.accepted_terms) {
    error.value = "You must agree to the Terms of Service and Privacy Policy";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await authService.updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone
    });
    
    // Update local user data
    const currentUser = await secureStorage.getUserData() || {};
    const updatedUser = { 
        ...currentUser, 
        ...form,
        // Ensure backend returned data is preferred if provided
        ...(response.data.user || response.data.data || {})
    };
    await secureStorage.setUserData(
      normalizeAuthUser(updatedUser, response.data)
    );

    await Swal.fire({
      title: "Success!",
      text: "Your profile is all set!",
      icon: "success",
      confirmButtonColor: "#42b883",
      timer: 2000,
    });

    router.push("/home");
  } catch (err) {
    error.value = err.response?.data?.message || err.message || "Failed to update profile";
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  try {
    await authService.logout();
    await secureStorage.clearAll();
    router.push("/login");
  } catch (err) {
    console.error("Logout error:", err);
    await secureStorage.clearAll();
    router.push("/login");
  }
};
</script>

<style scoped>
.account-setup-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 40px 20px;
  font-family: "Inter", sans-serif;
  box-sizing: border-box;
}

.setup-container {
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.setup-header {
  text-align: center;
  margin-bottom: 32px;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  background: rgba(66, 184, 131, 0.1);
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.setup-icon {
  font-size: 40px;
  color: #42b883;
}

h1 {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 12px;
}

.setup-header p {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
}

.form-card {
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: var(--shadow-md);
  margin-bottom: 24px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
}

input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  background: var(--bg-tertiary);
  border: 1px solid transparent;
  border-radius: 12px;
  font-size: 16px;
  color: var(--text-primary);
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;
}

input:focus {
  background: var(--bg-secondary);
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.field-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: 22px;
}

.submit-btn {
  width: 100%;
  padding: 18px;
  background: #2b2b2b;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 12px;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #999;
}

.error-message {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

/* Checkbox Styles */
.terms-section {
  margin-bottom: 24px;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  position: relative;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  display: inline-block;
  height: 22px;
  width: 22px;
  background-color: white;
  border-radius: 6px;
  flex-shrink: 0;
  transition: all 0.2s;
  border: 2px solid #ced4da;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
  margin-top: 3px;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: var(--bg-tertiary);
  border-color: #42b883;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #42b883;
  border-color: #42b883;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 7px;
  top: 3px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.terms-text {
  color: var(--text-secondary);
  line-height: 1.5;
}

.terms-text a {
  color: #42b883;
  text-decoration: none;
  font-weight: 700;
}

.footer-actions {
  text-align: center;
  margin-top: 20px;
}

.logout-link {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

[data-theme="dark"] .submit-btn {
  background: #42b883;
}
</style>
