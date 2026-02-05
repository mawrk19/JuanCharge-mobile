Cypress.Commands.add("login", (identifier = "test@example.com", code = "123456") => {
    // Intercepts
    cy.intercept("POST", "**/api/auth/otp/start", { success: true }).as("otpStart");
    cy.intercept("POST", "**/api/auth/otp/verify", {
        success: true,
        api_token: "mock-jwt-token",
        user: { id: 1, name: "Test User", points: 100 },
    }).as("otpVerify");
    cy.intercept("GET", "**/api/auth/me", { id: 1, name: "Test User", points: 100 });
    cy.intercept("GET", "**/api/dashboard/stats", { success: true, data: { total_points: 100 } });
    cy.intercept("GET", "**/api/charging/active", { active: false });

    cy.visit("/login");

    // Step 1
    cy.get('input[placeholder*="name@email.com"]', { timeout: 15000 }).should('be.visible').type(identifier);
    cy.get("button").contains("Continue").click();
    cy.wait("@otpStart");

    // Step 2
    cy.get('input[placeholder="123456"]', { timeout: 10000 }).should('be.visible').type(code);
    cy.get("button").contains("Verify & Login").click();
    cy.wait("@otpVerify");

    cy.url({ timeout: 20000 }).should("include", "/home");
    cy.contains("Test User", { timeout: 20000 }).should("be.visible");
});

Cypress.Commands.add("goToScan", () => {
    cy.intercept("GET", "**/api/charging/active", { active: false });
    cy.get('a[href="/scan"]', { timeout: 25000 }).should('be.visible').click({ force: true });

    cy.url({ timeout: 20000 }).should("include", "/scan");
    cy.contains("Scan QR Code", { timeout: 20000 }).should("be.visible");
});

Cypress.Commands.add("openManualEntry", () => {
    cy.contains("Enter ID manually", { timeout: 20000 }).should('be.visible').click({ force: true });
    cy.get('.manual-field', { timeout: 20000 }).should('be.visible');
});
