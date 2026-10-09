/* =============================================================
   A2Z RIDERS HUB — Global site configuration
   -------------------------------------------------------------
   Contact details, social profiles and the WhatsApp / tel /
   maps helpers. Everything else on the site is static HTML.

   >>> REPLACE THE CONTACT BLOCK BELOW WITH REAL DETAILS <<<
   Header, footer, WhatsApp buttons and the enquiry form all
   read from this file.
   ============================================================= */

window.SITE = (function () {
  /* ---------------------------------------------------------
     CONTACT — edit these five values and the whole site updates
     --------------------------------------------------------- */
  const CONTACT = {
    brand: "A2Z Riders Hub",
    tagline: "Motorcycle Gear & Riding Equipment",
    phoneDisplay: "+977 981-0000000", // TODO: real phone
    phoneDial: "+9779810000000", // TODO: real phone (digits only)
    whatsapp: "9779810000000", // TODO: real WhatsApp number (country code + number, digits only)
    whatsappDisplay: "+977 981-0000000", // TODO: pretty version shown in the footer
    email: "info@a2zridershub.com", // TODO: real email
    street: "Biratnagar", // TODO: add street / landmark
    city: "Biratnagar",
    region: "Koshi Province",
    country: "Nepal",
    countryCode: "NP",
    postal: "", // TODO: postal code if any
    hours: "Sun–Fri, 10:00 – 19:00 (NPT)",
    mapQuery: "Biratnagar,Koshi,Nepal",
  };

  /* Full postal address as one line */
  const ADDRESS =
    `${CONTACT.street}, ${CONTACT.city}, ${CONTACT.region}, ${CONTACT.country}`
      .replace(/,\s*,/g, ",")
      .replace(/^,\s*/, "");

  CONTACT.address = ADDRESS;

  /* ---------------------------------------------------------
     SOCIAL
     --------------------------------------------------------- */
  const SOCIAL = [
    { label: "Facebook", icon: "facebook", url: "https://facebook.com/" }, // TODO
    { label: "Instagram", icon: "instagram", url: "https://instagram.com/" }, // TODO
    { label: "YouTube", icon: "youtube", url: "https://youtube.com/" }, // TODO
    { label: "TikTok", icon: "tiktok", url: "https://tiktok.com/" }, // TODO
  ];

  /* ---------------------------------------------------------
     WHATSAPP / ENQUIRY LINKS
     --------------------------------------------------------- */
  function waLink(message) {
    const msg = encodeURIComponent(
      `Hello A2Z Riders Hub, I would like details about: ${message}`,
    );
    return `https://wa.me/${CONTACT.whatsapp}?text=${msg}`;
  }

  function telLink() {
    return `tel:${CONTACT.phoneDial}`;
  }

  function mapLink() {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      CONTACT.mapQuery,
    )}`;
  }

  return {
    CONTACT,
    ADDRESS,
    SOCIAL,
    waLink,
    telLink,
    mapLink,
    logo: "assets/images/logo.png",
    logoAlt: "A2Z Riders Hub logo",
  };
})();
