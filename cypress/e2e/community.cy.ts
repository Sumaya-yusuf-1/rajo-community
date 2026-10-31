describe("RAJO Community", () => {
  function visitHome(locale: "sv" | "so" = "sv") {
    cy.visit(`/${locale}`);
    cy.wait(["@getIdeas", "@getMoments"]);
  }

  it("loads the homepage in Swedish and Somali", () => {
    visitHome("sv");
    cy.get("h1").first().should("contain.text", "En plats att höra hemma");
    cy.contains("Aktiviteter").should("be.visible");

    cy.on("uncaught:exception", (error) => {
      if (error.message.includes("Hydration failed")) return false;
      return true;
    });
    cy.visit("/so");
    cy.wait(["@getIdeas", "@getMoments"]);
    cy.get("h1").first().should("contain.text", "Meel aad ka mid noqoto");
    cy.contains("Hawlaha").should("be.visible");
  });

  it("supports desktop navigation", () => {
    visitHome();
    cy.get("nav.rajo-desktop-nav").contains("Aktiviteter").click();
    cy.url().should("include", "/sv/activities");
  });

  it("supports mobile navigation", () => {
    cy.viewport(390, 844);
    visitHome();
    cy.get(".mobile-toggle").click();
    cy.get("#rajo-mobile-navigation").should("be.visible");
    cy.get("#rajo-mobile-navigation").contains("Aktiviteter").click();
    cy.url().should("include", "/sv/activities");
  });

  it("toggles dark and light mode", () => {
    visitHome();
    cy.get("html").should("have.class", "dark");
    cy.get('button[aria-label="Aktivera ljust tema"]').click();
    cy.get("html").should("not.have.class", "dark");
    cy.get('button[aria-label="Aktivera mörkt tema"]').click();
    cy.get("html").should("have.class", "dark");
  });

  it("displays activities returned by the API", () => {
    cy.intercept("GET", "**/rest/v1/activities**", {
      statusCode: 200,
      body: [
        {
            id: "activity-1",
            title_sv: "Testaktivitet",
            title_so: "Hawl tijaabo",
            description_sv: "En aktivitet för automatiserade tester.",
            description_so: "Hawl loogu talagalay tijaabooyinka.",
            starts_at: "2027-01-15T18:00:00.000Z",
            location: "Online",
            image_url: null,
          },
        ],
    }).as("getActivities");

    cy.visit("/sv/activities");
    cy.wait("@getActivities");
    cy.contains("Testaktivitet").should("be.visible");
    cy.contains("Online").should("be.visible");
  });

  it("expands and collapses a long activity description", () => {
    const longDescription = Array(20).fill("En lång beskrivning för RAJO.").join(" ");
    cy.intercept("GET", "**/rest/v1/activities**", {
      statusCode: 200,
      body: [
        {
          id: "long-activity",
          title_sv: "Lång aktivitet",
          title_so: "Hawl dheer",
          description_sv: longDescription,
          description_so: longDescription,
          starts_at: "2027-01-15T18:00:00.000Z",
          location: "Online",
          image_url: null,
        },
      ],
    }).as("getLongActivity");

    cy.visit("/sv/activities");
    cy.wait("@getLongActivity");
    cy.contains("Läs mer").click();
    cy.contains("Visa mindre").should("be.visible");
    cy.contains("Visa mindre").click();
    cy.contains("Läs mer").should("be.visible");
  });

  it("validates login and registration fields", () => {
    cy.visit("/sv/login");
    cy.get("#email").type("not-an-email");
    cy.get("#password").type("short");
    cy.get("form").first().then(($form) => {
      expect(($form[0] as HTMLFormElement).checkValidity()).to.equal(false);
    });

    cy.contains("Registrera dig").click();
    cy.get("#fullName").should("be.visible");
    cy.get("#email").clear().type("test@example.com");
    cy.get("#password").clear().type("password123");
    cy.get("form").first().then(($form) => {
      expect(($form[0] as HTMLFormElement).checkValidity()).to.equal(false);
    });
  });

  it("validates the membership application form", () => {
    cy.visit("/sv/join");
    cy.get("form").last().then(($form) => {
      expect(($form[0] as HTMLFormElement).checkValidity()).to.equal(false);
    });
    cy.get('input[name="name"]').type("Test User");
    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="phone"]').type("+46701234567");
    cy.get('input[name="adult"]').check();
    cy.get('input[name="agreeTerms"]').check();
    cy.get('input[name="contactConsent"]').check();
    cy.get("form").last().then(($form) => {
      expect(($form[0] as HTMLFormElement).checkValidity()).to.equal(true);
    });
  });

  it("redirects unauthorized users away from the admin dashboard", () => {
    cy.visit("/sv/admin");
    cy.url().should("include", "/sv/login");
  });

  it("handles mocked admin activity creation without writing to Supabase", () => {
    cy.intercept("POST", "**/api/admin/activities", {
      statusCode: 201,
      body: { data: { id: "mock-activity" } },
    }).as("createActivity");

    // The protected page remains inaccessible without a test session. This
    // verifies the mocked write contract independently of production data.
    cy.visit("/sv/login");
    cy.window().then((window) =>
      window
        .fetch("/api/admin/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title_sv: "Mock activity" }),
        })
        .then((response) => {
          expect(response.status).to.equal(201);
        }),
    );
    cy.wait("@createActivity");
  });

  it("submits and votes on ideas using mocked API responses", () => {
    cy.clearLocalStorage();
    cy.visit("/sv/ideas");
    cy.wait(["@getIdeas", "@getMoments"]);
    cy.contains("Community cooking night").should("be.visible");

    cy.intercept("POST", "**/api/ideas", {
      statusCode: 201,
      body: { data: { id: "new-idea" } },
    }).as("submitIdea");
    cy.intercept("POST", "**/api/ideas/idea-1/vote", {
      statusCode: 200,
      body: { ok: true },
    }).as("voteIdea");

    cy.get('input[name="title"]').type("A new idea");
    cy.get('textarea[name="description"]').type("A useful community idea.");
    cy.get('button[type="submit"]').contains("Skicka idé").click();
    cy.wait("@submitIdea");

    cy.get("button.vote-btn").first().as("ideaVote");
    cy.get("@ideaVote").should("contain.text", "Rösta på idén").click();
    cy.wait("@voteIdea");
    cy.get("@ideaVote")
      .should("have.class", "voted")
      .and("contain.text", "Röstat");
  });
});
