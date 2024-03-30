'use client'
import React, { useEffect, useState } from 'react';
/* The purpose of this Solution component is to ingest a base64 encoded image, display it, and then decode a message from the base64 string.
My strategy for this was to 
1. get the base64 image 
2. convert it to a binary blob 
3. get pixel data from the blob
4. decode the pixel data according to the instructions 
5. convert the decoded string to ASCII 
6. display the ASCII string.

The main challenge of this for me was figuring out how to retrieve the pixel data. 
After some scouring, I came across this thread https://stackoverflow.com/questions/3528299/get-pixel-color-of-base64-png-using-javascript, and used this strategy in my conversion function.
I was unfamiliar with the canvas element, so I initially tried to create the image and canvas with the base64 string. I kept getting errors indicating a request overload, so I tried converting to a blob and then using that to create an image, because I know that blobs are an efficient way to represent multimedia.
After that, it was just a matter of following the steps and converting to ASCII.  

Next steps:
1. split up the base64ToBinary function into its individual steps. I left it as one function for now because my initial strategy was to go direcrtly from base64 to the decoded image data so that's how I set it up, but now that I know I needed intermediate steps, I would refactor it.
2. more thorough error handling (faulty url, image too big, etc)
3. styling
*/

//Convert binary string to ascii, return ascii string
function binToASCII(binaryString: string): string {
    let asciiString = '';
    for (let i = 0; i < binaryString.length; i += 8) { //8bits for 1 ascii char
        let currBinary = '';
        for (let j = 0; j < 8; j++) {
            currBinary += binaryString[i + j]; //sum up the 8 bin bits
        }
        asciiString += String.fromCharCode(parseInt(currBinary, 2));
    }

    return(asciiString);
}

//Decode png according to instructions given an image with ImageData, widht, and height. Return decoded bin string
function decodePNG(imageData: Uint8ClampedArray, width: number, height: number): string {
    let binString = '';

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (y * width + x < 4) continue; //not part of binary string according to instructions

            const index = (y * width + x) * 4; //calculating the index by adding up all the previous pixels (y*width) + the current x position
            const sum = imageData[index] + imageData[index + 1] + imageData[index + 2]; // sum of rgb values not including alpha
            const remainder = sum % 4; 

            let bits;
            switch (remainder) { //conditions given in instruction
                case 0: 
                    bits = "00"; 
                    break;
                case 1: 
                    bits = "01"; 
                    break;
                case 2: 
                    bits = "10"; 
                    break;
                case 3: 
                    bits = "11"; 
                    break;
            }

            binString += bits;
        }
    }
    return binString;
}

//Async function that take a base64 string and converts it to a blob, collects imageData from it, and then runs it through the decoder and returns the decoded binary string
async function base64ToBinary(image: string): Promise<string> {
    return new Promise((resolve, reject) => {

    //Base64 to blob based on https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
    const chars = atob(image); //base64 to byte string

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

//Solution component
const Solution = () => {
    //Create states for the 2 things we need to display 
    const [image, setImage] = useState<string | null>(null);
    const [story, setStory] = useState<string | null>(null);

    //this useEffect fetches the image on render and does the conversions once fetched, else return error
    useEffect(() => {
        const fetchImg = async () => {
          try {
            const response = await fetch('https://mintlify-assets.b-cdn.net/interview/base64.txt');
            const encodedImage = await response.text();

            let binaryImg = await base64ToBinary(encodedImage)
            let message = binToASCII(binaryImg)
            setStory(message)
            setImage(encodedImage);

          } catch (error) {
                console.error(error);
          }
        };

        fetchImg();
      }, []);
    
      //render component
      return (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold mb-6">Tanzim's Collection of Fine Art</h1>
          {image && (
            <img src={`data:image/png;base64,${image}`} alt="Image" />
          )}
          {story}
        </div>
      );
    };

    export default Solution; 