import { useState, useCallback, useMemo } from 'react';

type SelectRowMap = Map<number, any[]>;

export default () => {
  const [selectRowMap, setSelectRowMap] = useState<SelectRowMap>(new Map<number, any[]>());

  const addRow = useCallback((modelId: number, data: any, succ: () => void, err: () => void) => {
    setSelectRowMap((prevMap) => {
      const newMap = new Map(prevMap);
      const arr = newMap.get(modelId) ?? [];
      const jsonS = JSON.stringify(data);
      if (arr.findIndex((it) => JSON.stringify(it) === jsonS) === -1) {
        newMap.set(modelId, [...arr, data]);
        succ();
      } else {
        err();
      }
      return newMap;
    });
  }, []);

  const deleteRow = useCallback((modelId: number, data: any) => {
    setSelectRowMap((prevMap) => {
      const newMap = new Map(prevMap);
      const arr = newMap.get(modelId);
      const jsonS = JSON.stringify(data);
      if (arr) {
        const newArr = arr.filter((it) => JSON.stringify(it) !== jsonS);
        newMap.set(modelId, newArr);
      }
      return newMap;
    });
  }, []);

  const removeAll = useCallback((modelId: number) => {
    setSelectRowMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(modelId, []);
      return newMap;
    });
  }, []);

  return { selectRowMap, addRow, deleteRow, removeAll };
};
