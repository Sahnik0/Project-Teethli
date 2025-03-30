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
    // Using the provided Gemini API key from environment variables
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key not found in environment variables");
    }
    
    // Use the correct API endpoint for Gemini 2.0 Flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Creating an optimized prompt for more effective and precise responses
    const prompt = `
      As an expert medical professional, analyze the following patient information and provide a concise, precise diagnosis and treatment plan:
      
      Patient Information:
      - Age: ${patientAge}
      - Sex: ${patientSex}
      - Symptoms: ${symptoms}
      - Doctor's initial diagnosis description: ${diagnosisDescription}

      Respond with exactly two sections:

      1. Start with "DIAGNOSIS:" followed by a clear, specific medical assessment based on the provided symptoms and description. Be precise and professional. (Maximum 200 words)

      2. Then provide "TREATMENT:" with exactly 3-4 bullet points that cover:
         - Medication recommendations with specific dosages where applicable
         - Key lifestyle modifications
         - Follow-up care instructions
         - Any critical warning signs to watch for

      IMPORTANT CONSTRAINTS:
      - The treatment section must NOT exceed 150 words total
      - Each bullet point should be 1-2 sentences maximum
      - Format bullet points with "•" symbols
      - Do not use *asterisks* in the entire response
      - Use medical terminology appropriately but ensure it remains understandable to patients
      - Be specific and actionable in your recommendations
      - Do not include disclaimers or AI-related statements
    `;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,  // Reduced for more consistency
        topP: 0.7,
        topK: 40,
        maxOutputTokens: 1024,
      }
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
    console.log("Raw Gemini API response:", responseData);
    
    if (!responseData.candidates || !responseData.candidates[0] || 
        !responseData.candidates[0].content || 
        !responseData.candidates[0].content.parts || 
        !responseData.candidates[0].content.parts[0].text) {
      console.error("Invalid response format from Gemini API:", responseData);
      throw new Error("Invalid response format from Gemini API");
    }
    
    const textResponse = responseData.candidates[0].content.parts[0].text;
    console.log("Text response from Gemini:", textResponse);
    
    // Extract diagnosis and treatment from the text response
    // using a more robust pattern matching approach
    const diagnosisMatch = textResponse.match(/DIAGNOSIS:\s*([\s\S]+?)(?=TREATMENT:|$)/i);
    const treatmentMatch = textResponse.match(/TREATMENT:\s*([\s\S]+?)(?=$)/i);
    
    const diagnosis = diagnosisMatch?.[1]?.trim() || "";
    const treatment = treatmentMatch?.[1]?.trim() || "";
    
    console.log("Extracted diagnosis:", diagnosis);
    console.log("Extracted treatment:", treatment);
    
    // Format treatment to ensure proper bullet points and formatting
    const formattedTreatment = treatment.replace(/^[-•*]\s*/gm, '• ').trim();
    
    return {
      diagnosis: diagnosis || 
        `Based on the symptoms described (${symptoms}) and the doctor's initial assessment, the patient is presenting with signs consistent with the condition mentioned in the diagnosis description.`,
      treatment: formattedTreatment || 
        `• Rest and hydration as needed.\n• Medication as prescribed by the doctor.\n• Follow-up in 7-10 days or sooner if symptoms worsen.`
    };
  } catch (error) {
    console.error("Error generating diagnosis and treatment:", error);
    // Provide a more reliable fallback
    return {
      diagnosis: `Based on the reported symptoms (${symptoms}) and the doctor's initial assessment, a preliminary diagnosis indicates a potential medical condition that requires further evaluation.`,
      treatment: `• Rest and adequate hydration.\n• Over-the-counter pain relief medication as needed for discomfort.\n• Monitor symptoms and return if condition worsens.\n• Follow-up appointment in 7-10 days to reassess.`
    };
  }
};