describe('JuanCharge Points Claiming', () => {
    beforeEach(() => {
        cy.login();
    });

    it('should show the scan landing page with instructions', () => {
        cy.goToScan();
        cy.contains('Scan to charge').should('be.visible');
        cy.contains('Ready to Scan').should('be.visible');
        cy.contains('Start Scanning').should('be.visible');
    });

    it('should open manual entry for kiosk ID', () => {
        cy.goToScan();
        cy.openManualEntry();
        cy.get('input[placeholder*="Kiosk Code"]').should('be.visible');
    });
});
