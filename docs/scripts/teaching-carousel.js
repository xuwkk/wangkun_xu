(() => {
  const initialiseCarousel = (carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    const previousButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    const controls = carousel.querySelector(".teaching-carousel-controls");
    const status = carousel.querySelector("[data-carousel-status]");
    const slides = Array.from(track?.querySelectorAll("figure") ?? []);

    if (!track || !previousButton || !nextButton || slides.length === 0) return;

    if (controls) controls.hidden = false;

    let currentIndex = 0;
    let scrollFrame;

    slides.forEach((slide, index) => {
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", `${index + 1} of ${slides.length}`);
    });

    const nearestSlideIndex = () => {
      const trackCentre = track.scrollLeft + track.clientWidth / 2;

      return slides.reduce((nearest, slide, index) => {
        const slideCentre = slide.offsetLeft + slide.offsetWidth / 2;
        const nearestCentre = slides[nearest].offsetLeft + slides[nearest].offsetWidth / 2;
        return Math.abs(slideCentre - trackCentre) < Math.abs(nearestCentre - trackCentre)
          ? index
          : nearest;
      }, 0);
    };

    const updateControls = (index = nearestSlideIndex()) => {
      currentIndex = index;
      previousButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === slides.length - 1;

      slides.forEach((slide, slideIndex) => {
        if (slideIndex === currentIndex) slide.setAttribute("aria-current", "true");
        else slide.removeAttribute("aria-current");
      });

      if (status) {
        const caption = slides[currentIndex].querySelector("figcaption")?.textContent?.trim();
        status.textContent = `Photograph ${currentIndex + 1} of ${slides.length}${caption ? `: ${caption}` : ""}`;
      }
    };

    const moveTo = (index) => {
      const targetIndex = Math.max(0, Math.min(index, slides.length - 1));
      const slide = slides[targetIndex];
      const maximumScroll = track.scrollWidth - track.clientWidth;
      const centredPosition = slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2;
      const left = Math.max(0, Math.min(centredPosition, maximumScroll));
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      updateControls(targetIndex);
      track.scrollTo({ left, behavior: reducedMotion ? "auto" : "smooth" });
    };

    previousButton.addEventListener("click", () => moveTo(currentIndex - 1));
    nextButton.addEventListener("click", () => moveTo(currentIndex + 1));

    track.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveTo(currentIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveTo(currentIndex + 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        moveTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        moveTo(slides.length - 1);
      }
    });

    track.addEventListener(
      "scroll",
      () => {
        window.cancelAnimationFrame(scrollFrame);
        scrollFrame = window.requestAnimationFrame(() => updateControls());
      },
      { passive: true }
    );

    window.addEventListener("resize", () => updateControls(), { passive: true });
    updateControls(0);
  };

  const initialiseAll = () => {
    document.querySelectorAll("[data-teaching-carousel]").forEach(initialiseCarousel);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseAll, { once: true });
  } else {
    initialiseAll();
  }
})();
