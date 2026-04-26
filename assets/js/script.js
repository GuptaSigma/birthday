const revealItems = document.querySelectorAll(".reveal");
const secretButton = document.querySelector("[data-secret-button]");
const secretMessage = document.querySelector("[data-secret-message]");
const introScreen = document.querySelector("#intro-screen");
const introTitles = document.querySelectorAll("[data-intro-step]");
const introTimer = document.querySelector("[data-intro-timer]");
const skipIntroButton = document.querySelector("[data-skip-intro]");
const birthdayAudio = document.querySelector("#birthday-audio");
const pageVideos = document.querySelectorAll("video");
const smoothLinks = document.querySelectorAll('a[href^="#"]');

if (introScreen) {
  document.body.classList.add("intro-active");
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealItems.forEach((item) => observer.observe(item));

if (secretButton && secretMessage) {
  secretButton.addEventListener("click", () => {
    const isHidden = secretMessage.hasAttribute("hidden");

    if (isHidden) {
      secretMessage.removeAttribute("hidden");
      requestAnimationFrame(() => {
        secretMessage.classList.add("is-visible");
      });
      secretButton.textContent = "Secret Opened";
    } else {
      secretMessage.setAttribute("hidden", "");
      secretMessage.classList.remove("is-visible");
      secretButton.textContent = "Open Secret";
    }
  });
}

let introFinished = false;
let introSecondsRemaining = 10;
let introTimerId = null;
let birthdayAudioStopTimerId = null;

const stopBirthdayAudio = () => {
  if (!birthdayAudio) {
    return;
  }

  if (birthdayAudioStopTimerId) {
    window.clearTimeout(birthdayAudioStopTimerId);
    birthdayAudioStopTimerId = null;
  }

  birthdayAudio.pause();
  birthdayAudio.currentTime = 0;
};

const scheduleBirthdayAudioStop = () => {
  if (!birthdayAudio) {
    return;
  }

  if (birthdayAudioStopTimerId) {
    window.clearTimeout(birthdayAudioStopTimerId);
  }

  birthdayAudioStopTimerId = window.setTimeout(() => {
    stopBirthdayAudio();
  }, 30000);
};

const tryPlayBirthdayAudio = () => {
  if (!birthdayAudio) {
    return Promise.resolve();
  }

  birthdayAudio.muted = false;
  birthdayAudio.volume = 1;
  return birthdayAudio.play();
};

const setupVideoAudio = () => {
  if (!pageVideos.length) {
    return;
  }

  pageVideos.forEach((video) => {
    video.defaultMuted = false;
    video.muted = false;

    video.addEventListener("play", () => {
      video.muted = false;
      video.volume = 1;

      if (birthdayAudio && !birthdayAudio.paused) {
        birthdayAudio.pause();
      }
    });
  });
};

const startBirthdayAudio = () => {
  if (!birthdayAudio) {
    return;
  }

  const playPromise = tryPlayBirthdayAudio();

  if (!playPromise || typeof playPromise.then !== "function") {
    scheduleBirthdayAudioStop();
    return;
  }

  playPromise
    .then(() => {
      scheduleBirthdayAudioStop();
    })
    .catch(() => {
      // autoplay blocked by browser, fallback handled on first interaction
    });
};

const unlockBirthdayAudioOnFirstInteraction = () => {
  const unlockAudio = () => {
    const playPromise = tryPlayBirthdayAudio();

    if (!playPromise || typeof playPromise.then !== "function") {
      scheduleBirthdayAudioStop();
      return;
    }

    playPromise
      .then(() => {
        scheduleBirthdayAudioStop();
      })
      .catch(() => {});
  };

  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("keydown", unlockAudio, { once: true });
};

const updateIntroTimer = () => {
  if (introTimer) {
    introTimer.textContent = String(introSecondsRemaining);
  }
};

const finishIntro = () => {
  if (!introScreen || introFinished) {
    return;
  }

  introFinished = true;
  introScreen.classList.add("is-hidden");
  document.body.classList.remove("intro-active");

  if (introTimerId) {
    window.clearInterval(introTimerId);
    introTimerId = null;
  }

  window.setTimeout(() => {
    introScreen.setAttribute("hidden", "");
  }, 800);
};

if (introScreen && introTitles.length) {
  startBirthdayAudio();
  unlockBirthdayAudioOnFirstInteraction();
  updateIntroTimer();

  introTimerId = window.setInterval(() => {
    introSecondsRemaining -= 1;
    updateIntroTimer();

    if (introSecondsRemaining <= 0) {
      finishIntro();
    }
  }, 1000);

  window.setTimeout(() => {
    introTitles[0].classList.remove("is-active");
    if (introTitles[1]) {
      introTitles[1].classList.add("is-active");
    }
  }, 1800);

  window.setTimeout(() => {
    if (!introFinished) {
      finishIntro();
    }
  }, 10000);
}

if (skipIntroButton) {
  skipIntroButton.addEventListener("click", finishIntro);
}

setupVideoAudio();

smoothLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();

    const top = target.getBoundingClientRect().top + window.scrollY - 24;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  });
});
