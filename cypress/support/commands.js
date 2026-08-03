// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Custom login command
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/');
  cy.get('input[type="text"]').type(username);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Custom command to add activity via FAB
Cypress.Commands.add('addActivity', (activityName, category, note) => {
  cy.get('.global-entry-fab').click();
  cy.get('[role="tab"]').first().click(); // Activity tab
  cy.get('input[name="activity_type_name"]').type(activityName);
  cy.get('select[name="category"]').select(category);
  if (note) {
    cy.get('textarea[name="note"]').type(note);
  }
  cy.get('button[type="submit"]').click();
});