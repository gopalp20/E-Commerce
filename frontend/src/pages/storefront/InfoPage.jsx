import { Link, useLocation } from "react-router-dom";
const content = {
  "/about": {
    eyebrow: "THE FORME POINT OF VIEW",
    title: "Less noise. Good things.",
    intro:
      "The objects we live with shape our days. A comfortable chair, a cup that fits just right, a light that makes the room feel like yours.",
    sections: [
      [
        "Made for everyday life",
        "FORME brings a small collection of home, workspace and everyday objects together in one place. Warm materials, useful shapes and pieces you can imagine living with.",
      ],
      [
        "A place for independent sellers",
        "Our marketplace gives each seller a place to share their products. You can browse different studios, add their pieces to one bag and keep your orders together.",
      ],
      [
        "A project with a point of view",
        "FORME is a college project exploring how a considered marketplace can look and work. Products, studio names, prices and availability are sample data. Photography is illustrative; no goods are offered for real sale.",
      ],
    ],
    image: true,
  },
  "/delivery": {
    eyebrow: "THE PRACTICAL DETAILS",
    title: "Delivery & cancellations.",
    intro:
      "Clear costs, a saved address and a little room to change your mind.",
    sections: [
      [
        "Delivery within India",
        "Standard delivery is ₹149, or free when your item subtotal reaches ₹2,500. Express delivery is ₹299. The demo estimates are 5–7 business days for standard and 2–3 for express. No real shipment is dispatched.",
      ],
      [
        "Pay on delivery",
        "Checkout records a pay-on-delivery order. No card details are collected and no money is charged. Your final item and delivery totals are shown before you place the order.",
      ],
      [
        "Changing your mind",
        "You can cancel a pending or confirmed order from Your orders. Cancellation restores the items to available stock. Shipped and delivered orders cannot be cancelled. Returns, refunds and courier tracking are not available in this demo.",
      ],
    ],
  },
  "/privacy": {
    eyebrow: "YOUR INFORMATION",
    title: "A little clarity.",
    intro:
      "This is a local college demo. Please use sample details when trying it out.",
    sections: [
      [
        "What is saved",
        "Your name, email and a hashed password create your account. Your bag, orders and the delivery details you enter are saved in the project database. Sellers can view orders containing their products, and administrators can manage platform records.",
      ],
      [
        "On this device",
        "A sign-in token and account details are stored in your browser to keep you signed in. Your guest bag is stored locally until you sign in. Signing out removes your sign-in token from this browser.",
      ],
      [
        "A demonstration, not a live retailer",
        "Do not enter real payment information or sensitive personal data. This version does not send marketing emails or process online payments. Fonts are loaded from Google Fonts; catalogue photographs are served from this project.",
      ],
    ],
  },
};
export const InfoPage = () => {
  const { pathname } = useLocation();
  const page = content[pathname];
  return (
    <div className="wrap prose-page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>{pathname.slice(1)}</span>
      </div>
      <header className="page-heading">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
      </header>
      {page.image && (
        <img
          src="/images/forme-living.jpg"
          alt="A rust lounge chair in a sunlit corner"
        />
      )}
      {page.sections.map(([title, body]) => (
        <section key={title} style={{ marginBottom: 30 }}>
          <h2 style={{ fontFamily: "Manrope", fontSize: 23, marginBottom: 12 }}>
            {title}
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: "var(--muted)" }}>
            {body}
          </p>
        </section>
      ))}
    </div>
  );
};
