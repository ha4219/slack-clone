import { Dispatch, SetStateAction, useCallback, useState } from "react"

type ReturnTypes<T = any> = [T, (e: any) => void, Dispatch<SetStateAction<T>>];

const useInput = <T = any>(initialData: T): ReturnTypes => {
  const [value, setValue] = useState(initialData);
  const handler = useCallback(e => {
    setValue(e.target.value);
  }, []);
  return [value, setValue, handler];
};

export default useInput;