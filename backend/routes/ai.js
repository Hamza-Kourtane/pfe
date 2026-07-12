import express from "express";

const router = express.Router();

// Simple keyword-based replies - no API key needed
// This makes the chatbot work immediately without any setup
const getReply = (message) => {
  const text = message.toLowerCase();

  // Greetings
  if (text.includes("hello") || text.includes("hi ") || text.includes("hey")) {
    return "Hello! How can I help you today?";
  }

  // Pain / headache
  if (text.includes("headache") || text.includes("migraine")) {
    return "Headaches can have many causes. Make sure you're drinking enough water and resting. If the pain is severe or lasts a long time, please see a doctor.";
  }

  // Fever
  if (text.includes("fever") || text.includes("temperature") || text.includes("hot")) {
    return "If you have a fever, rest and drink plenty of fluids. If your temperature is very high or lasts more than 3 days, visit a doctor.";
  }

  // Cough / cold / flu
  if (text.includes("cough") || text.includes("cold") || text.includes("flu") || text.includes("sneeze")) {
    return "Rest, warm drinks, and plenty of sleep can help with cold symptoms. If you have a high fever or trouble breathing, see a doctor.";
  }

  // Stomach / nausea
  if (text.includes("stomach") || text.includes("nausea") || text.includes("vomit") || text.includes("diarrhea")) {
    return "Stomach issues often pass on their own. Drink small sips of water and eat light food. See a doctor if symptoms are severe or last more than 2 days.";
  }

  // Chest / heart
  if (text.includes("chest") || text.includes("heart") || text.includes("breathing")) {
    return "Chest pain or trouble breathing can be serious. Please see a doctor or go to the emergency room as soon as possible.";
  }

  // Back pain
  if (text.includes("back") || text.includes("spine") || text.includes("neck")) {
    return "Back pain is common. Try gentle stretching and avoid heavy lifting. If the pain does not improve after a few days, see a specialist.";
  }

  // Skin / allergy
  if (text.includes("skin") || text.includes("rash") || text.includes("allergy") || text.includes("itch")) {
    return "Skin rashes can be caused by many things. Avoid scratching and try a cold compress. If it spreads or gets worse, see a dermatologist.";
  }

  // Sleep
  if (text.includes("sleep") || text.includes("insomnia") || text.includes("tired")) {
    return "Good sleep is important for health. Try to keep a regular sleep schedule and avoid screens before bed. If you still have trouble, talk to a doctor.";
  }

  // Appointments
  if (text.includes("appointment") || text.includes("book") || text.includes("doctor") && text.includes("find")) {
    return "You can search for a doctor using the search form on our homepage. Select a specialty and location to find available doctors.";
  }

  // Medicine
  if (text.includes("medicine") || text.includes("medication") || text.includes("drug") || text.includes("pill")) {
    return "I cannot prescribe or recommend specific medicines. Please consult a doctor for the right treatment.";
  }

  // Emergency
  if (text.includes("emergency") || text.includes("urgent") || text.includes("accident") || text.includes("ambulance")) {
    return "If this is an emergency, please call emergency services immediately. Do not wait for an online response.";
  }

  // Age / children
  if (text.includes("baby") || text.includes("child") || text.includes("kid") || text.includes("infant")) {
    return "Children's health concerns should always be checked by a pediatrician. Please make an appointment with a children's doctor.";
  }

  // Thanks
  if (text.includes("thank") || text.includes("thanks")) {
    return "You're welcome! I'm here to help. Feel free to ask if you have more questions.";
  }

  // Default fallback
  return "Thank you for sharing. I can give general health guidance, but for medical advice please contact a doctor. Is there anything specific you'd like to ask about?";
};

// POST /ai/chat - receives a message and returns a reply
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "Please type a message." });
    }

    // Generate a reply based on keywords
    const reply = getReply(message);

    // Small delay to feel more natural (optional)
    await new Promise((r) => setTimeout(r, 300));

    res.json({ reply });

  } catch (error) {
    console.error("Chat error:", error);
    res.json({ reply: "Sorry, I couldn't respond right now. Please try again." });
  }
});

export default router;
