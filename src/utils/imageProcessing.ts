// Performance Issue: Synchronous image processing

export const processImage = async (imageUrl) => {
  // Simulating heavy image processing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Performance Issue: Creating data URLs for all images
  const canvas = {
    width: 1000,
    height: 1000,
    data: new Array(1000 * 1000 * 4).fill(0),
  };
  
  // Performance Issue: Pixel manipulation
  for (let i = 0; i < canvas.data.length; i += 4) {
    canvas.data[i] = Math.random() * 255;     // R
    canvas.data[i + 1] = Math.random() * 255; // G
    canvas.data[i + 2] = Math.random() * 255; // B
    canvas.data[i + 3] = 255;                 // A
  }
  
  // Performance Issue: Converting to base64
  const processedUrl = `data:image/png;base64,${btoa(canvas.data.slice(0, 1000).join(''))}`;
  
  return processedUrl;
};

export const generateThumbnail = async (imageUrl) => {
  // Performance Issue: Multiple processing steps
  const steps = ['resize', 'blur', 'sharpen', 'compress'];
  let result = imageUrl;
  
  for (const step of steps) {
    // Simulating processing delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Performance Issue: String concatenation in loop
    result += `_${step}`;
  }
  
  return result;
};