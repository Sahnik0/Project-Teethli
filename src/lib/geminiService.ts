export interface GeminiResponse {
  diagnosis: string;
  treatment: string;
}

export const generateDiagnosisAndTreatment = async (
  symptoms: string,
  diagnosisDescription: string,
  patientAge: number,
  patientSex: string
): Promise<GeminiResponse> => {
  try {
    // Using the API key from environment variables
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key not found in environment variables");
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `
      Acting as an expert medical professional, provide a detailed medical diagnosis and treatment plan based on the following information:
      
      Patient Information:
      - Age: ${patientAge}
      - Sex: ${patientSex}
      - Symptoms: ${symptoms}
      - Doctor's initial diagnosis description: ${diagnosisDescription}

      Format your response in JSON with two sections:
      1. "diagnosis": A professional, detailed explanation of the medical condition based on the provided information.
      2. "treatment": A comprehensive treatment plan including medications (with dosage), lifestyle recommendations, and follow-up care suggestions.

      Make your response concise yet professional. Use medical terminology appropriately but ensure it's still clear to patients. Do not include disclaimers or notes about being an AI - respond exactly as a medical professional would on a prescription.

      IMPORTANT: Structure your response as valid JSON with "diagnosis" and "treatment" keys only.
    `;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    console.log("Sending request to Gemini API...");

    // Make an actual call to the Gemini API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status}`, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const responseData = await response.json();
    
    if (!responseData.candidates || !responseData.candidates[0] || 
        !responseData.candidates[0].content || 
        !responseData.candidates[0].content.parts || 
        !responseData.candidates[0].content.parts[0].text) {
      console.error("Invalid response format from Gemini API:", responseData);
      throw new Error("Invalid response format from Gemini API");
    }
    
    const textResponse = responseData.candidates[0].content.parts[0].text;
    console.log("Raw Gemini response:", textResponse);
    
    try {
      // Parse the JSON response
      const jsonResponse = JSON.parse(textResponse);
      return {
        diagnosis: jsonResponse.diagnosis,
        treatment: jsonResponse.treatment,
      };
    } catch (error) {
      // If parsing fails, try to extract sections from text
      console.error("Error parsing Gemini response as JSON:", error);
      
      // Try to extract diagnosis and treatment sections from the text
      const diagnosisMatch = textResponse.match(/diagnosis[:\s]+([\s\S]+?)(?=treatment:|$)/i);
      const treatmentMatch = textResponse.match(/treatment[:\s]+([\s\S]+?)(?=$)/i);
      
      return {
        diagnosis: diagnosisMatch ? diagnosisMatch[1].trim() : 
          `Based on the symptoms described (${symptoms}) and the doctor's initial assessment, the patient is presenting with signs consistent with the condition mentioned in the diagnosis description.`,
        treatment: treatmentMatch ? treatmentMatch[1].trim() :
          `1. Rest and hydration as needed.\n2. Medication as prescribed by the doctor.\n3. Follow-up in 7-10 days or sooner if symptoms worsen.`
      };
    }
  } catch (error) {
    console.error("Error generating diagnosis and treatment:", error);
    throw new Error("Failed to generate diagnosis and treatment. Please try again.");
  }
};
