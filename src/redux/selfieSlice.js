import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  image: null,
  imageId: null,
  isUploading: false,
  error: null,
};

const selfieSlice = createSlice({
  name: 'selfie',
  initialState,
  reducers: {
    setImage: (state, action) => {
      state.image = action.payload.image;
      state.imageId = action.payload.imageId;
    },
    removeImage: (state) => {
      state.image = null;
      state.imageId = null;
    },
    setUploading: (state, action) => {
      state.isUploading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setImage, removeImage, setUploading, setError } = selfieSlice.actions;
export default selfieSlice.reducer;