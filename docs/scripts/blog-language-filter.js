(() => {
  const initialiseLanguageFilter = () => {
    const filter = document.querySelector("[data-blog-language-filter]");
    if (!filter) return;

    const buttons = Array.from(filter.querySelectorAll("[data-blog-language]"));
    const status = document.querySelector("[data-blog-language-status]");
    const listing = window["quarto-listings"]?.["listing-listing"];

    if (buttons.length === 0 || !listing) return;

    const languageValues = new Set(buttons.map((button) => button.dataset.blogLanguage));

    const selectedCategory = () => {
      const parameters = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      return parameters.get("category") || "";
    };

    const selectedLanguage = () => {
      const category = selectedCategory();
      return languageValues.has(category) ? category : "";
    };

    const setPressed = (language) => {
      buttons.forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.blogLanguage === language)
        );
      });
    };

    const updateStatus = () => {
      if (!status) return;
      const language = selectedLanguage();
      const count = listing.visibleItems.length;
      const scope = language || "all languages";
      status.textContent = `${count} blog post${count === 1 ? "" : "s"} shown for ${scope}.`;
    };

    const encodeCategory = (category) => window.btoa(window.encodeURIComponent(category));

    const decodeCategories = (encodedCategories) => {
      if (!encodedCategories) return [];

      try {
        return window
          .decodeURIComponent(window.atob(encodedCategories))
          .split(",")
          .filter(Boolean);
      } catch (_error) {
        return [];
      }
    };

    const setCategoryHash = (language) => {
      const nextUrl = language
        ? `#category=${window.encodeURIComponent(language)}`
        : `${window.location.pathname}${window.location.search}`;
      window.history.pushState(null, "", nextUrl);
    };

    const setSidebarActive = (language) => {
      document
        .querySelectorAll(".quarto-listing-category .category.active")
        .forEach((category) => category.classList.remove("active"));

      const encodedLanguage = encodeCategory(language);
      document
        .querySelectorAll(".quarto-listing-category .category")
        .forEach((category) => {
          if (category.dataset.category === encodedLanguage) {
            category.classList.add("active");
          }
        });
    };

    const filterByLanguage = (language) => {
      if (!language) {
        listing.filter();
      } else {
        listing.filter((item) =>
          decodeCategories(item.values().categories).includes(language)
        );
      }

      setSidebarActive(language);
      setCategoryHash(language);
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const language = button.dataset.blogLanguage || "";
        filterByLanguage(language);
        setPressed(language);
        window.setTimeout(updateStatus, 0);
      });
    });

    document.querySelectorAll(".quarto-listing-category .category").forEach((category) => {
      category.addEventListener("click", () => {
        window.setTimeout(() => {
          setPressed(selectedLanguage());
          updateStatus();
        });
      });
    });

    listing.on("updated", updateStatus);
    window.addEventListener("hashchange", () => {
      setPressed(selectedLanguage());
      updateStatus();
    });

    filter.hidden = false;
    setPressed(selectedLanguage());
    updateStatus();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseLanguageFilter, { once: true });
  } else {
    initialiseLanguageFilter();
  }
})();
