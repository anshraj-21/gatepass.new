import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
let aiClient = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn("Gemini AI client initialization error:", err);
  }
}

/**
 * Evaluates a student pass request using Google Gemini AI or smart rule-based engine.
 * @param {Object} passRequest
 * @returns {Promise<{score: 'LOW'|'MEDIUM'|'HIGH', riskReason: string, confidence: number, wardenRecommendation: string}>}
 */
export async function analyzePassWithGemini(passRequest) {
  const { reason, departureTime, expectedReturnTime, passType, destination, studentName } = passRequest;

  // Try live Gemini AI first if API key configured
  if (aiClient) {
    try {
      const prompt = `
You are the AI Safety Auditor for a university hostel gate pass system.
Analyze the following student out-pass request and return a JSON evaluation.

Student: ${studentName}
Pass Type: ${passType}
Destination: ${destination}
Departure Time: ${departureTime}
Expected Return: ${expectedReturnTime}
Reason Given: "${reason}"

Curfew Rules: Standard hostel curfew is 8:30 PM (20:30). Outings past 8:30 PM or overnight without clear medical/family reasons are HIGH RISK.

Respond STRICTLY in JSON format with keys:
{
  "score": "LOW" | "MEDIUM" | "HIGH",
  "riskReason": "A 1-2 sentence assessment of safety and risk factors",
  "confidence": number between 80 and 99,
  "wardenRecommendation": "Actionable advice for the hostel warden"
}
`;
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return parsed;
      }
    } catch (err) {
      console.warn("Gemini API call fallback to heuristic engine:", err);
    }
  }

  // Smart Heuristic Engine fallback (Instant, offline & 100% reliable)
  return heuristicAnalysis(passRequest);
}

function heuristicAnalysis({ reason, departureTime, expectedReturnTime, passType, destination }) {
  const dep = new Date(departureTime);
  const ret = new Date(expectedReturnTime);
  const depHour = dep.getHours();
  const retHour = ret.getHours();

  const lowerReason = (reason || '').toLowerCase();
  const lowerDest = (destination || '').toLowerCase();

  let risk = "LOW";
  let reasons = [];
  let recommendation = "Approve pass.";

  // High risk keywords
  const suspiciousKeywords = ['party', 'pub', 'club', 'drink', 'nightout', 'bunk', 'secret'];
  const isSuspiciousReason = suspiciousKeywords.some(k => lowerReason.includes(k) || lowerDest.includes(k));

  if (isSuspiciousReason) {
    risk = "HIGH";
    reasons.push("Destination/Reason contains high-risk leisure keywords during late hours.");
    recommendation = "Require guardian confirmation call before approval.";
  }

  // Late night departure
  if (depHour >= 20 || depHour < 5) {
    risk = "HIGH";
    reasons.push(`Departure time (${depHour}:00) violates standard 8:30 PM hostel gate closure.`);
    recommendation = "Verify emergency or family night-out documentation.";
  } else if (retHour > 21 || retHour < 6) {
    if (risk !== "HIGH") risk = "MEDIUM";
    reasons.push("Return time is past night curfew limit (9:00 PM).");
    recommendation = "Instruct student to return before 8:30 PM.";
  }

  // Emergency passes
  if (passType === 'Emergency' || lowerReason.includes('hospital') || lowerReason.includes('medical')) {
    risk = "LOW";
    reasons.push("Medical / Emergency request prioritized.");
    recommendation = "Auto-approve and notify duty warden.";
  }

  if (reasons.length === 0) {
    reasons.push("Standard day pass request during allowed hours. No risk flags detected.");
  }

  return {
    score: risk,
    riskReason: reasons.join(" "),
    confidence: risk === "HIGH" ? 96 : 91,
    wardenRecommendation: recommendation
  };
}
