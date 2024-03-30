'use client'
import React, { useEffect, useState } from 'react';

function binToASCII(binaryString: string) {
    let asciiString = '';
    for (let i = 0; i < binaryString.length; i += 8) {
        let currBinary = '';
        for (let j = 0; j < 8; j++) {
            currBinary += binaryString[i + j];
        }
        asciiString += String.fromCharCode(parseInt(currBinary, 2));
    }

    return(asciiString);
}
function decodePNG(pixelData: Uint8ClampedArray, width: number, height: number) {
    let binaryString = '';

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (y * width + x < 4) continue; //not part of binary string according to instructions

            const index = (y * width + x) * 4;
            const sum = pixelData[index] + pixelData[index + 1] + pixelData[index + 2]; // sum of rgb values not including alpha
            const remainder = sum % 4; 

            let bits;
            switch (remainder) {
                case 0: 
                    bits = '00'; 
                    break;
                case 1: 
                    bits = '01'; 
                    break;
                case 2: 
                    bits = '10'; 
                    break;
                case 3: 
                    bits = '11'; 
                    break;
            }

            binaryString += bits;
        }
    }
    return binaryString;
}

async function base64ToBlob(image: string): Promise<string> {
    return new Promise((resolve, reject) => {

    const chars = atob(image); 

    const blobnums = new Array(chars.length);
    for (let i = 0; i < chars.length; i++) {
        blobnums[i] = chars.charCodeAt(i);
    }
    const blobArray = new Uint8Array(blobnums);
    const blob = new Blob([blobArray], { type: 'image/png' });
     const img = new Image();
     img.src = URL.createObjectURL(blob);
 
     img.onload = () => {
         const canvas = document.createElement('canvas');
         if (canvas) {
         const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                try {
                    const imageData = ctx.getImageData(0, 0, img.width, img.height);
                    resolve(decodePNG(imageData.data, img.width, img.height));
                } catch (error) {
                }
            }
        }
     };
     img.onerror = (error) => {
        reject(error);
    };
})
}

const Solution = () => {
    const [image, setImage] = useState<string | null>(null);
    const [story, setStory] = useState<string | null>(null);

    useEffect(() => {
        const fetchImg = async () => {
          try {
            const response = await fetch('https://mintlify-assets.b-cdn.net/interview/base64.txt');
            const encodedImage = await response.text();

            let binaryImg = await base64ToBlob(encodedImage)
            let message = binToASCII(binaryImg)
            setStory(message)
            setImage(encodedImage);

          } catch (error) {
            //TODO better error handling, think of cases
          }
        };

        fetchImg();
      }, []);
    
      return (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold mb-6">Base64 Image</h1>
          {image && (
            <img src={`data:image/png;base64,${image}`} alt="Image" />
          )}
          {story}
        </div>
      );
    };

    export default Solution; 