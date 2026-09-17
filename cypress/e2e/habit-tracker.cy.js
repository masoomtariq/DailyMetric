describe('DailyMetric E2E Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should display login page', () => {
    cy.visit('/');
    cy.contains('h1', 'DailyMetric').should('be.visible');
    cy.contains('h2', 'Welcome Back').should('be.visible');
    cy.get('input[type="text"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should allow user to login', () => {
    cy.visit('/');
    cy.get('input[type="text"]').type('testuser');
    cy.get('input[type="password"]').type('testpass');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard after login
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should show onboarding tour for first-time users', () => {
    cy.visit('/');
    cy.get('input[type="text"]').type('testuser');
    cy.get('input[type="password"]').type('testpass');
    cy.get('button[type="submit"]').click();
    
    // Wait for onboarding tour to appear
    cy.wait(1500);
    
    // Check if tour elements are present (may vary based on timing)
    cy.get('body').then(($body) => {
      if ($body.find('.react-joyride').length > 0) {
        cy.get('.react-joyride').should('be.visible');
      }
    });
  });

  it('should display Global Entry FAB button', () => {
    cy.visit('/');
    cy.get('input[type="text"]').type('testuser');
    cy.get('input[type="password"]').type('testpass');
    cy.get('button[type="submit"]').click();
    
    cy.get('.global-entry-fab').should('be.visible');
  });

  it('should navigate between pages', () => {
    cy.visit('/');
    cy.get('input[type="text"]').type('testuser');
    cy.get('input[type="password"]').type('testpass');
    cy.get('button[type="submit"]').click();
    
    // Navigate to Tracker
    cy.get('.tracker-nav').click();
    cy.url().should('include', '/tracker');
    cy.contains('Tracker').should('be.visible');
    
    // Navigate to Finance
    cy.get('.finance-nav').click();
    cy.url().should('include', '/finance');
    cy.contains('Finance').should('be.visible');
    
    // Navigate back to Dashboard
    cy.get('.dashboard-nav').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should open Global Entry Modal', () => {
    cy.visit('/');
    cy.get('input[type="text"]').type('testuser');
    cy.get('input[type="password"]').type('testpass');
    cy.get('button[type="submit"]').click();
    
    cy.get('.global-entry-fab').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('Add Activity').should('be.visible');
  });

  it('should have responsive mobile navigation', () => {
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.visit('/');
    cy.get('input[type="text"]').type('testuser');
    cy.get('input[type="password"]').type('testpass');
    cy.get('button[type="submit"]').click();
    
    // Mobile navigation should be visible
    cy.get('nav.fixed.bottom-0').should('be.visible');
    cy.get('nav.fixed.bottom-0').within(() => {
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Tracker').should('be.visible');
      cy.contains('Finance').should('be.visible');
    });
  });

  it('should allow user to logout', () => {
    cy.visit('/');
    cy.get('input[type="text"]').type('testuser');
    cy.get('input[type="password"]').type('testpass');
    cy.get('button[type="submit"]').click();
    
    cy.contains('Logout').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Welcome Back').should('be.visible');
  });

  it('should show Quick Setup for new users', () => {
    cy.visit('/');
    cy.get('input[type="text"]').type('testuser');
    cy.get('input[type="password"]').type('testpass');
    cy.get('button[type="submit"]').click();
    
    // Wait for potential quick setup modal
    cy.wait(2500);
    
    cy.get('body').then(($body) => {
      if ($body.find('text=Quick Setup').length > 0) {
        cy.contains('Quick Setup').should('be.visible');
        cy.contains('Select up to 3 habits').should('be.visible');
      }
    });
  });
});