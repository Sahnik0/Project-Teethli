
import React from 'react';

// This component formats treatment text by converting bullet points and handling asterisks for bold text
interface FormattedTreatmentProps {
  treatmentText: string;
}

const FormattedTreatment: React.FC<FormattedTreatmentProps> = ({ treatmentText }) => {
  // Function to format the treatment text with bullet points and bold text
  const formatTreatmentText = () => {
    if (!treatmentText) return null;
    
    // Split the text by new lines to handle each line separately
    const lines = treatmentText.split('\n');
    
    return lines.map((line, index) => {
      if (!line.trim()) return <br key={`empty-${index}`} />;
      
      // Check if the line already starts with a bullet point
      const isBulletPoint = /^[•\-*]\s/.test(line.trim());
      const formattedLine = isBulletPoint ? line.trim().substring(2) : line.trim();
      
      // Process the line to replace text within asterisks with bold text
      const parts = [];
      let currentIndex = 0;
      let boldStart = formattedLine.indexOf('*');
      
      while (boldStart !== -1) {
        // Add the text before the asterisk
        if (boldStart > currentIndex) {
          parts.push(formattedLine.substring(currentIndex, boldStart));
        }
        
        // Find the closing asterisk
        const boldEnd = formattedLine.indexOf('*', boldStart + 1);
        if (boldEnd === -1) {
          // No closing asterisk found, just add the rest as normal text
          parts.push(formattedLine.substring(boldStart));
          break;
        }
        
        // Add the bold text
        const boldText = formattedLine.substring(boldStart + 1, boldEnd);
        if (boldText) {
          parts.push(<strong key={`bold-${boldStart}`} className="bold-text">{boldText}</strong>);
        }
        
        currentIndex = boldEnd + 1;
        boldStart = formattedLine.indexOf('*', currentIndex);
      }
      
      // Add any remaining text
      if (currentIndex < formattedLine.length) {
        parts.push(formattedLine.substring(currentIndex));
      }
      
      // Create a list item for bullet points or a paragraph for regular text
      return isBulletPoint ? (
        <li key={`line-${index}`}>{parts}</li>
      ) : (
        <p key={`line-${index}`}>{parts}</p>
      );
    });
  };
  
  // Check if there are any bullet points in the text
  const hasBulletPoints = treatmentText?.includes('• ') || treatmentText?.includes('- ') || treatmentText?.includes('* ');
  
  return (
    <div className="treatment-plan-content">
      {hasBulletPoints ? (
        <ul>{formatTreatmentText()}</ul>
      ) : (
        <div>{formatTreatmentText()}</div>
      )}
    </div>
  );
};

export default FormattedTreatment;