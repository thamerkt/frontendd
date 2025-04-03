import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../redux/store"; // Import the Redux store
import { removeImage } from "../redux/selfieSlice"; // Action to remove image
import { useSelector } from 'react-redux';

const ImageGallery = () => {
    const images = useSelector((state) => state.imageStore.images); // Correctly accessing the state using the Redux slice key

    return (
      <div>
        {images.length > 0 ? (
          images.map((image) => <img key={image.id} src={image.imageData} alt={`Selfie ${image.id}`} />)
        ) : (
          <p>No images available</p>
        )}
      </div>
    );
};

export default ImageGallery;
