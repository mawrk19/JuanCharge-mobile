describe("JuanCharge Mobile Authentication", () => {
    beforeEach(() => {
        cy.intercept("POST", "**/api/auth/login", {
            success: true,
            token: "mock-jwt-token",
            user: { id: 1, name: "Test User", points: 100 },
        }).as("loginRequest");
    });

    it("should login successfully and redirect to home", () => {
        cy.intercept("POST", "**/api/auth/otp/start", { success: true }).as("otpStart");
        cy.intercept("POST", "**/api/auth/otp/verify", {
            success: true,
            api_token: "mock-jwt-token",
            user: { id: 1, name: "Test User", points: 100 },
        }).as("otpVerify");
        cy.intercept("GET", "**/api/auth/me", { id: 1, name: "Test User", points: 100 });
        cy.intercept("GET", "**/api/dashboard/stats", { success: true, data: { total_points: 100 } });

        cy.visit("/login");
        cy.get('input[type="text"]').type("test@example.com");
        cy.get("button").contains("Continue").click();

        cy.wait("@otpStart");
        cy.get('input[placeholder="123456"]').type("123456");
        cy.get("button").contains("Verify & Login").click();

        cy.wait("@otpVerify");
        cy.url().should("include", "/home");
        cy.contains("Test User", { timeout: 10000 }).should("be.visible");
    });
});
