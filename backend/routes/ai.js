import express from "express";
import pool from "../db.js";

const router = express.Router();

// Maps symptom keywords to doctor specialties
const symptomToSpecialty = (text) => {
  if (text.includes("headache") || text.includes("migraine") || text.includes("brain") || text.includes("dizzy")) {
    return "Neurologist";
  }
  if (text.includes("skin") || text.includes("rash") || text.includes("allergy") || text.includes("itch") || text.includes("acne")) {
    return "Dermatologist";
  }
  if (text.includes("back") || text.includes("spine") || text.includes("neck") || text.includes("joint") || text.includes("bone")) {
    return "Chiropractor";
  }
  if (text.includes("tooth") || text.includes("teeth") || text.includes("gum") || text.includes("dental") || text.includes("mouth")) {
    return "Dentist";
  }
  if (text.includes("heart") || text.includes("chest") || text.includes("blood") || text.includes("pressure")) {
    return "Cardiologist";
  }
  if (text.includes("baby") || text.includes("child") || text.includes("kid") || text.includes("infant") || text.includes("pediatric")) {
    return "Pediatrician";
  }
  if (text.includes("ear") || text.includes("eye") || text.includes("nose") || text.includes("throat") || text.includes("vision")) {
    return "ENT Specialist";
  }
  if (text.includes("stomach") || text.includes("nausea") || text.includes("vomit") || text.includes("diarrhea") || text.includes("digest")) {
    return "Gastroenterologist";
  }
  if (text.includes("cough") || text.includes("cold") || text.includes("flu") || text.includes("sneeze") || text.includes("lung") || text.includes("breathing") || text.includes("fever")) {
    return "General Practitioner";
  }
  return null;
};

// Simple keyword-based replies
const getReply = (message) => {
  const text = message.toLowerCase();

  if (text.includes("hello") || text.includes("hi ") || text.includes("hey")) {
    return "Hello! How can I help you today? Tell me what you're feeling and I can recommend a doctor.";
  }

  if (text.includes("headache") || text.includes("migraine")) {
    return "Headaches can have many causes. Make sure you're drinking enough water and resting. If the pain is severe or lasts a long time, you should see a neurologist.";
  }

  if (text.includes("fever") || text.includes("temperature")) {
    return "If you have a fever, rest and drink plenty of fluids. If your temperature is very high or lasts more than 3 days, visit a general practitioner.";
  }

  if (text.includes("cough") || text.includes("cold") || text.includes("flu") || text.includes("sneeze")) {
    return "Rest, warm drinks, and plenty of sleep can help with cold symptoms. If you have a high fever or trouble breathing, see a general practitioner.";
  }

  if (text.includes("stomach") || text.includes("nausea") || text.includes("vomit") || text.includes("diarrhea")) {
    return "Stomach issues often pass on their own. Drink small sips of water and eat light food. If symptoms are severe or last more than 2 days, see a gastroenterologist.";
  }

  if (text.includes("chest") || text.includes("heart") || text.includes("breathing")) {
    return "Chest pain or trouble breathing can be serious. Please see a cardiologist or go to the emergency room as soon as possible.";
  }

  if (text.includes("back") || text.includes("spine") || text.includes("neck") || text.includes("joint")) {
    return "Back pain is common. Try gentle stretching and avoid heavy lifting. If the pain does not improve after a few days, see a chiropractor.";
  }

  if (text.includes("skin") || text.includes("rash") || text.includes("allergy") || text.includes("itch") || text.includes("acne")) {
    return "Skin problems can be treated by a dermatologist. Avoid scratching and try a cold compress in the meantime.";
  }

  if (text.includes("tooth") || text.includes("teeth") || text.includes("gum") || text.includes("dental") || text.includes("mouth")) {
    return "Dental issues should be checked by a dentist. Please book an appointment for a proper examination.";
  }

  if (text.includes("sleep") || text.includes("insomnia") || text.includes("tired")) {
    return "Good sleep is important for health. Try to keep a regular sleep schedule and avoid screens before bed. If you still have trouble, talk to a doctor.";
  }

  if (text.includes("appointment") || text.includes("book") || text.includes("doctor")) {
    return "You can search for any doctor using the search form on our homepage. Just tell me your symptoms and I can recommend the right specialist!";
  }

  if (text.includes("medicine") || text.includes("medication") || text.includes("drug") || text.includes("pill")) {
    return "I cannot prescribe or recommend specific medicines. Please consult a doctor for the right treatment.";
  }

  if (text.includes("emergency") || text.includes("urgent") || text.includes("accident") || text.includes("ambulance")) {
    return "If this is an emergency, please call emergency services immediately. Do not wait for an online response.";
  }

  if (text.includes("baby") || text.includes("child") || text.includes("kid") || text.includes("infant")) {
    return "Children's health concerns should always be checked by a pediatrician. Please make an appointment with a children's doctor.";
  }

  if (text.includes("eye") || text.includes("vision") || text.includes("ear") || text.includes("hearing")) {
    return "Eye and ear issues should be checked by a specialist. An ENT or ophthalmologist can help diagnose the problem.";
  }

  if (text.includes("thank") || text.includes("thanks")) {
    return "You're welcome! I'm here to help. Feel free to ask if you have more questions.";
  }

  return "Thank you for sharing. Tell me more about your symptoms and I can recommend the right type of doctor for you.";
};

// POST /ai/chat - receives a message and returns a reply + doctors if relevant
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "Please type a message.", doctors: [] });
    }

    const text = message.toLowerCase();

    // Get the reply text
    const reply = getReply(message);

    // Check if we can recommend a specialty
    const specialty = symptomToSpecialty(text);

    let doctors = [];

    if (specialty) {
      // Find doctors with this specialty in the database
      const result = await pool.query(
        `SELECT id, COALESCE(name, fullname) as name, specialty, location, experience
         FROM doctors
         WHERE LOWER(specialty) LIKE LOWER($1)
         LIMIT 3`,
        [`%${specialty}%`]
      );
      doctors = result.rows;
    }

    // Small delay to feel natural
    await new Promise((r) => setTimeout(r, 400));

    res.json({ reply, doctors });

  } catch (error) {
    console.error("Chat error:", error);
    res.json({ reply: "Sorry, I couldn't respond right now. Please try again.", doctors: [] });
  }
});

export default router;
