// Keep browser tests isolated from the real Supabase project.
beforeEach(() => {
  cy.intercept("GET", "**/api/ideas", {
    statusCode: 200,
    body: {
      data: [
        {
          id: "idea-1",
          title: "Community cooking night",
          description: "Cook together and share recipes.",
          category: "Community",
          status: "approved",
          vote_count: 3,
          created_at: "2026-10-10T00:00:00.000Z",
        },
      ],
    },
  }).as("getIdeas");

  cy.intercept("GET", "**/api/moments", {
    statusCode: 200,
    body: {
      data: [
        {
          id: "moment-1",
          title_sv: "Gemenskapsträff",
          title_so: "Kulankii Bulshada",
          description_sv: "En gemenskapsträff.",
          description_so: "Kulan bulsho.",
          image_url: null,
          event_date: "2026-10-01",
          location: "Gothenburg",
          category: "Meetups",
        },
      ],
    },
  }).as("getMoments");
});
