'use client'
import React, { useEffect, useState } from 'react';

const Solution = () => {
    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchImg = async () => {
          try {
            const response = await fetch('https://mintlify-assets.b-cdn.net/interview/base64.txt');
            const encodedImage = await response.text();
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
            <img src={`data:image/png;base64,${image}`} alt="Image" className="object-contain" />
          )}
        </div>
      );
    };

    export default Solution; 