// src/models/global.js

import { getDetail } from '@/services/model/http';
import { useState, useCallback } from 'react';

export default () => {
  const [model, setModel] = useState(new Map<number, API.Model>());
  // const setModels = useCallback((arr: API.Model[]) => {
  //   setModel(arr);
  // }, []);
  const addModels = useCallback((id: number, data: API.Model) => {
   
    setModel(()=>{
        const newModel = new Map<number, API.Model>(model)
        newModel.set(id,data)
        return newModel;
    });
  }, [model]);


  return { model, addModels };
};
