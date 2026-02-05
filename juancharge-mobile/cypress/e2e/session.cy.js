describe("JuanCharge Charging Session", () => {
    beforeEach(() => {
        cy.login();

        // Direct navigate to a fake redemption state
        cy.intercept("GET", "**/api/kiosks/status/KIOSK-1", {
            success: true,
            is_online: true,
            ports: { "1": { status: "idle" } }
        });

        cy.goToScan();
        cy.openManualEntry();
        cy.get('input[placeholder*="KIOSK"]', { timeout: 10000 }).should('be.visible').type("KIOSK-1");
        cy.get('input[placeholder="1"]').type("1");
        cy.get("button").contains("Continue").click();
    });

    it("should start a session and allow cancellation", () => {
        cy.intercept("POST", "**/api/ports/activate", {
            success: true,
            session_id: "SESSION-123",
            message: "Session started"
        }).as("activateRequest");

        cy.intercept("POST", "**/api/charging/cancel", {
            success: true,
            message: "Session cancelled"
        }).as("cancelRequest");

        // Enter points
        cy.get(".key-item").contains("1").click();
        cy.get(".key-item").contains("0").click();
        cy.get("button").contains("Start Charging Session").click();

        cy.wait("@activateRequest");
        cy.contains("Charging in Progress").should("be.visible");
        cy.contains("00:10").should("be.visible"); // 10 minutes

        // Stop session
        cy.get("button").contains("End Session early").click();
        cy.get(".swal2-confirm").click(); // Confirm SweetAlert

        cy.wait("@cancelRequest");
        cy.contains("Session Ended").should("be.visible");
    });
});
