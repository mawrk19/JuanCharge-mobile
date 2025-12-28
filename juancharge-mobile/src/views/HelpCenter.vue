<template>
  <div class="help-page">
    <div class="header-nav">
      <button class="back-btn" @click="router.back()">
        <span class="material-icons">chevron_left</span>
        Back
      </button>
      <h1>Help Center</h1>
    </div>

    <div class="content">
      <div class="search-box">
        <span class="material-icons search-icon">search</span>
        <input type="text" placeholder="Search for help..." />
      </div>

      <div class="faq-section">
        <h3>Frequently Asked Questions</h3>

        <div class="faq-list">
          <div v-for="(faq, index) in faqs" :key="index" class="faq-item">
            <div class="faq-question" @click="toggleFaq(index)">
              <span>{{ faq.q }}</span>
              <span class="material-icons">{{
                activeFaq === index ? "expand_less" : "expand_more"
              }}</span>
            </div>
            <div v-if="activeFaq === index" class="faq-answer">
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>

      <div class="support-contact">
        <h3>Still need help?</h3>
        <div class="contact-card">
          <div class="contact-item">
            <span class="material-icons">mail</span>
            <div class="contact-info">
              <h4>Email Support</h4>
              <p>support@juancharge.ph</p>
            </div>
          </div>
          <div class="contact-item">
            <span class="material-icons">chat</span>
            <div class="contact-info">
              <h4>Chat with Us</h4>
              <p>Available 8 AM - 5 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const activeFaq = ref(null);

const faqs = [
  {
    q: "How do I earn points?",
    a: "You can earn points by depositing plastic bottles and aluminum cans into any JuanCharge kiosk. Ensure the items are empty and the labels are intact.",
  },
  {
    q: "How do I use my points for charging?",
    a: "Go to the 'Scan' tab, scan the QR code on the kiosk, then select the amount of points you want to redeem for charging time.",
  },
  {
    q: "What if the kiosk is full?",
    a: "If a kiosk is full, please visit the nearest available kiosk within the Map tab.",
  },
  {
    q: "Can I use the app offline?",
    a: "Yes, you can view your status and settings offline. However, transactions and syncing require an internet connection.",
  },
];

const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index;
};
</script>

<style scoped>
.help-page {
  padding: 20px;
  background-color: var(--bg-primary);
  min-height: 100vh;
  color: var(--text-primary);
  margin-bottom: 40px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.content {
  max-width: 480px;
  margin: 0 auto;
}

.search-box {
  position: relative;
  margin-bottom: 32px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.search-box input {
  width: 100%;
  padding: 14px 14px 14px 48px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-primary);
  outline: none;
  box-sizing: border-box;
}

.faq-section h3,
.support-contact h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.faq-question {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.faq-answer {
  padding: 0 16px 16px 16px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.support-contact {
  margin-top: 40px;
  padding-bottom: 40px;
}

.contact-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 8px 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item .material-icons {
  font-size: 24px;
  color: var(--accent-color);
}

.contact-info h4 {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
}

.contact-info p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 2px 0 0 0;
}
</style>
