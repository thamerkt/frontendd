import { configureStore } from '@reduxjs/toolkit';
import selfieReducer from './selfieSlice';

const store = configureStore({
  reducer: {
    selfie: selfieReducer,
  },
});
export default store