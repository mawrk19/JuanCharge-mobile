describe("JuanCharge Redemption Flow", () => {
    beforeEach(() => {
        cy.login();
        cy.goToScan();
    });

    it("should show KIOSK_OFFLINE error when kiosk is unreachable", () => {
        cy.intercept("GET", "**/api/kiosks/status/MOCK-KIOSK", {
            success: true,
            is_online: false,
        }).as("statusCheck");

        cy.openManualEntry();
        cy.get('input[placeholder*="Kiosk Code"]').type("MOCK-KIOSK");
        cy.get('input[placeholder*="Port Number"]').type("1");
        cy.get("button").contains("Continue").click();

        cy.wait("@statusCheck");
        cy.get(".swal2-title").should("contain", "Station Unavailable");
    });

    it("should show PORT_BUSY error when port is already in use", () => {
        cy.intercept("GET", "**/api/kiosks/status/MOCK-KIOSK", {
            success: true,
            is_online: true,
            ports: {
                1: { status: "active" }
            }
        }).as("statusCheck");

        cy.openManualEntry();
        cy.get('input[placeholder*="Kiosk Code"]').type("MOCK-KIOSK");
        cy.get('input[placeholder*="Port Number"]').type("1");
        cy.get("button").contains("Continue").click();

        cy.wait("@statusCheck");
        cy.get(".swal2-title").should("contain", "Station Unavailable");
        cy.get(".swal2-html-container").should("contain", "currently in use");
    });

    it("should proceed to redemption when kiosk is online and port is idle", () => {
        cy.intercept("GET", "**/api/kiosks/status/MOCK-KIOSK", {
            success: true,
            is_online: true,
            ports: {
                1: { status: "idle" }
            }
        }).as("statusCheck");

        cy.openManualEntry();
        cy.get('input[placeholder*="Kiosk Code"]').type("MOCK-KIOSK");
        cy.get('input[placeholder*="Port Number"]').type("1");
        cy.get("button").contains("Continue").click();

        cy.wait("@statusCheck");
        cy.contains("Activate Charging").should("be.visible");
        cy.contains("MOCK-KIOSK - Port 1").should("be.visible");
    });
});
